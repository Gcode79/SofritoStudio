"""
Sofrito Studio — Webhook Server (FastAPI)

Listens for Gumroad sale webhooks and automatically:
  1. Adds the buyer to Buttondown (POST /v1/subscribers)
  2. Applies tags/metadata (customer, product:<slug>, lang:es/en)
  3. Sends a bilingual post-purchase email

Gumroad setup:
  Gumroad Settings > Advanced > Webhooks
  URL: https://your-app.com/gumroad/webhook
  Event: Sale

Run locally:
  pip install -r requirements.txt
  uvicorn main:app --reload --port 5000

Deploy: any host that can run FastAPI (Render, Railway, Fly.io, VPS).

Security: set GUMROAD_WEBHOOK_SECRET and verify the signature if you enable
signed webhooks in Gumroad.
"""

import os
import re
import sys
import logging
import datetime
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel, Field
import requests
from dotenv import load_dotenv

# Gmail/Resend transactional sender (renders templates + sends one-off emails)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from mailer.gmail_sender import send_email, render  # noqa: E402

# Load secrets from config/.env (one level up from webhook_server/).
# Falls back to a local .env if present. Always works when keys live in config/.
ENV_PATH = Path(__file__).resolve().parent.parent / "config" / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    load_dotenv()

app = FastAPI(title="Sofrito Studio Webhook Server")
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("webhook")

# --- Config ---
BUTTONDOWN_API_KEY = os.getenv("BUTTONDOWN_API_KEY", "")
BUTTONDOWN_API = "https://api.buttondown.com/v1"
GUMROAD_WEBHOOK_SECRET = os.getenv("GUMROAD_WEBHOOK_SECRET", "")


# ------------------------------------------------------------------
# Models
# ------------------------------------------------------------------
class CustomField(BaseModel):
    name: str = ""
    value: str = ""


class SaleData(BaseModel):
    email: str | None = None
    buyer_email: str | None = None
    product_name: str = "unknown"
    price: float | None = 0.0  # in cents
    custom_fields: list[CustomField] | dict = Field(default_factory=dict)


class WebhookPayload(BaseModel):
    resource: str = ""
    data: SaleData | None = None
    custom_fields: list[CustomField] | dict = Field(default_factory=dict)


# ------------------------------------------------------------------
# Buttondown helpers
# ------------------------------------------------------------------
def _buttondown_headers() -> dict:
    if not BUTTONDOWN_API_KEY:
        raise RuntimeError("BUTTONDOWN_API_KEY not set")
    # Buttondown expects: Authorization: Token <key>
    return {"Authorization": f"Token {BUTTONDOWN_API_KEY}", "Content-Type": "application/json"}


def _add_subscriber(email: str, tags: list[str], notes: str, metadata: dict) -> None:
    """Add a subscriber with metadata (works on every plan) and tags.

    Buttondown's metadata field is available on ALL plans and is what our
    automations read for personalization. Tags require the Basic plan
    (403 feature_disabled on free) — we try with tags and gracefully fall
    back to a tag-less add, keeping the metadata so nothing is lost. Once
    the account is on Basic+, tags are applied automatically.
    """
    body = {"email_address": email, "tags": tags, "notes": notes, "metadata": metadata}
    resp = requests.post(f"{BUTTONDOWN_API}/subscribers", json=body, headers=_buttondown_headers())
    if resp.status_code in (200, 201):
        return

    # Fallback: tags require a paid plan — retry without them, keep metadata
    if resp.status_code == 403:
        log.warning("Tags rejected (likely free plan) — adding %s without tags", email)
        body_no_tags = {"email_address": email, "notes": notes, "metadata": metadata}
        resp2 = requests.post(f"{BUTTONDOWN_API}/subscribers", json=body_no_tags, headers=_buttondown_headers())
        if resp2.status_code in (200, 201):
            return
        raise RuntimeError(f"Buttondown add subscriber (no tags) failed: {resp2.status_code} {resp2.text}")

    raise RuntimeError(f"Buttondown add subscriber failed: {resp.status_code} {resp.text}")


def _slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s or "product"


# Offer-tier mapping: product keyword -> tier tag (used for segmentation)
# Tiers: tripwire ($9), core ($47), bundle ($97), addon, seasonal, membership
TIER_KEYWORDS = {
    "tripwire": ["starter", "breakfast", "breakfasts"],
    "core": ["la mesa", "mesa", "cookbook"],
    "bundle": ["full table", "kitchen bundle", "complete", "bundle"],
    "addon": ["add-on", "addon", "holiday & coquito"],
    "seasonal": ["thanksgiving", "navidad", "coquito guide", "holiday"],
    "membership": ["membership"],
    "course": ["mofongo", "course"],
}


def _tier_for_product(product_name: str) -> str:
    """Map a product name to an offer tier tag (e.g. customer:tripwire)."""
    name = product_name.lower()
    for tier, keywords in TIER_KEYWORDS.items():
        if any(k in name for k in keywords):
            return tier
    return "product"


def _build_tags(product_name: str, lang: str) -> list[str]:
    """Build Buttondown tags per the brand spec:
    customer:<tier>, product:<slug>, lang:<lang>.
    """
    tier = _tier_for_product(product_name)
    return [f"customer:{tier}", f"product:{_slugify(product_name)}", f"lang:{lang}"]


def _detect_language(payload: WebhookPayload, sale: SaleData) -> str:
    """Detect language from custom_fields (top-level or nested in data)."""
    for cf in (payload.custom_fields, sale.custom_fields):
        if isinstance(cf, dict):
            if str(cf.get("language", "")).lower().startswith("es"):
                return "es"
        elif isinstance(cf, list):
            for f in cf:
                if f.name.lower() == "language" and f.value.lower().startswith("es"):
                    return "es"
    return "en"


# Product "start here" guidance per offer tier (EN/ES) — used in the
# post-purchase email so every buyer knows where to begin.
START_HERE = {
    "tripwire": {
        "en": "Batch the sofrito first — one batch is a month of flavor in the freezer, and it makes every dish easier.",
        "es": "Haz un lote de sofrito primero — un lote es un mes de sabor en el congelador y hace cada plato más fácil.",
    },
    "core": {
        "en": "Start with the sofrito, then arroz con gandules — the two dishes that anchor every Puerto Rican table.",
        "es": "Empieza con el sofrito y luego el arroz con gandules — los dos platos que anclan toda mesa boricua.",
    },
    "bundle": {
        "en": "Start with the sofrito, then arroz con pollo — your first no-fail weeknight dinner.",
        "es": "Empieza con el sofrito y luego el arroz con pollo — tu primera cena infalible de entre semana.",
    },
    "addon": {
        "en": "Start with the sofrito and the coquito — toast your spices first for the deepest holiday flavor.",
        "es": "Empieza con el sofrito y el coquito — tuesta las especias primero para el mejor sabor navideño.",
    },
    "seasonal": {
        "en": "Start with the sofrito and the pernil timeline — everything else on the table follows from there.",
        "es": "Empieza con el sofrito y la línea de tiempo del pernil — todo lo demás en la mesa sigue desde ahí.",
    },
    "course": {
        "en": "Start with the sofrito and fried green plantains — mofongo is all about the mash technique.",
        "es": "Empieza con el sofrito y los plátanos verdes fritos — el mofongo es todo técnica de machacar.",
    },
    "membership": {
        "en": "Welcome to the club — start with the sofrito, then cook this month's featured recipe.",
        "es": "Bienvenido al club — empieza con el sofrito y luego cocina la receta destacada del mes.",
    },
    "product": {
        "en": "Start with the sofrito — it's the base of everything. Master it once and every dish gets a step easier.",
        "es": "Empieza con el sofrito — es la base de todo. Domínalo una vez y cada plato se vuelve un paso más fácil.",
    },
}

# What's included, per tier — shown in the post-purchase email.
CONTENTS = {
    "tripwire": {
        "en": "5 essential dishes, bilingual, with mainland ingredient swaps.",
        "es": "5 platos esenciales, bilingüe, con swaps de ingredientes para el mainland.",
    },
    "core": {
        "en": "30 bilingual recipes, ingredient swaps, holiday menus, and a full Nochebuena timeline.",
        "es": "30 recetas bilingües, swaps de ingredientes, menús navideños y una línea de tiempo completa de Nochebuena.",
    },
    "bundle": {
        "en": "The complete cookbook plus every printable — pantry lists, timelines, and cheat sheets.",
        "es": "El libro completo más todos los imprimibles — listas de despensa, líneas de tiempo y guías rápidas.",
    },
    "addon": {
        "en": "The holiday companion — menus, timelines, and the coquito guide.",
        "es": "El compañero navideño — menús, líneas de tiempo y la guía del coquito.",
    },
    "seasonal": {
        "en": "A full holiday menu with step-by-step timeline and printable shopping list.",
        "es": "Un menú navideño completo con línea de tiempo paso a paso y lista de compras imprimible.",
    },
    "course": {
        "en": "The complete video course with recipes and techniques, plus the cookbook.",
        "es": "El curso completo en video con recetas y técnicas, más el libro.",
    },
    "membership": {
        "en": "Member-only recipes and printables, plus every new release.",
        "es": "Recetas e imprimibles solo para miembros, más cada nuevo lanzamiento.",
    },
    "product": {
        "en": "Your new download, ready in your Gumroad library.",
        "es": "Tu nueva descarga, lista en tu biblioteca de Gumroad.",
    },
}


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


class LeadPayload(BaseModel):
    email: str
    lang: str = "en"
    source: str = "sofrito-101"  # lead magnet id


@app.post("/lead/webhook")
async def lead_webhook(payload: LeadPayload):
    """Capture a free lead-magnet signup and tag it for segmentation.

    Wire the site's freebie form here (instead of the Buttondown embed) to
    tag leads as `lead:sofrito-101`, `lang:<lang>` — feeding the tripwire
    conversion sequence.
    """
    if not payload.email or "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Invalid email")

    tags = [f"lead:{_slugify(payload.source)}", f"lang:{payload.lang}"]
    metadata = {"source": payload.source, "lang": payload.lang, "flow": "welcome"}
    try:
        _add_subscriber(payload.email, tags, f"Lead magnet: {payload.source}", metadata)
        log.info("Added lead %s (tags=%s)", payload.email, tags)
    except Exception as e:
        log.error("Lead add failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    # Instant welcome email from Gmail
    try:
        subject, body = render("welcome", payload.lang)
        send_email(payload.email, subject, body)
        log.info("Sent welcome email -> %s", payload.email)
    except Exception as e:
        log.warning("Welcome email not sent (%s): %s", payload.email, e)

    return {"status": "ok", "tagged": True}


@app.post("/gumroad/webhook")
async def gumroad_webhook(request: Request):
    # Optional signature verification
    if GUMROAD_WEBHOOK_SECRET:
        sig = request.headers.get("X-Gumroad-Signature", "")
        # Implement hmac verification per Gumroad's scheme before trusting this.
        # Placeholder — replace with real verification in production.
        if not sig:
            raise HTTPException(status_code=401, detail="Missing signature")

    payload = WebhookPayload(**await request.json())
    if payload.resource != "sale":
        return {"status": "ignored", "reason": f"resource={payload.resource}"}

    sale = payload.data or SaleData()
    email = sale.email or sale.buyer_email
    if not email:
        raise HTTPException(status_code=400, detail="No email in payload")

    product_name = sale.product_name
    price = (sale.price or 0) / 100.0  # cents -> USD
    lang = _detect_language(payload, sale)
    tier = _tier_for_product(product_name)

    tags = _build_tags(product_name, lang)
    if f"customer:{tier}" not in tags:
        tags.append(f"customer:{tier}")
    tags.append("customer")  # meta tag the purchase automation filters on
    notes = f"Purchased: {product_name} @ ${price:.2f}"
    metadata = {
        "product": product_name,
        "tier": tier,
        "price": price,
        "lang": lang,
        "tip": START_HERE.get(tier, START_HERE["product"])[lang],
        "contents": CONTENTS.get(tier, CONTENTS["product"])[lang],
        "flow": "post_purchase",
        "purchased_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    try:
        _add_subscriber(email, tags, notes, metadata)
        log.info("Added subscriber %s (tags=%s)", email, tags)
    except Exception as e:
        log.error("Subscriber add failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    # Instant personalized post-purchase email from Gmail. Buttondown is the
    # list-capture layer (metadata + tags); Gmail handles the transactional
    # send because the Buttondown API has no one-off email endpoint.
    try:
        subject, body = render(
            "post_purchase", lang,
            product_name=product_name,
            tip=START_HERE.get(tier, START_HERE["product"])[lang],
            contents=CONTENTS.get(tier, CONTENTS["product"])[lang],
        )
        send_email(email, subject, body)
        log.info("Sent post-purchase email -> %s (%s)", email, product_name)
    except Exception as e:
        log.warning("Post-purchase email not sent (%s): %s", email, e)

    return {"status": "ok", "subscribed": True}
