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
import logging
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel, Field
import requests
from dotenv import load_dotenv

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


def _add_subscriber(email: str, tags: list[str], notes: str) -> None:
    """Add a subscriber, storing tags when the account plan supports them.

    Free Buttondown plans reject the `tags` field (403 feature_disabled). To
    keep capturing leads/customers on any plan, we first try with tags and
    gracefully fall back to a tag-less add — logging a warning. Once the
    account upgrades to Basic+, tags are applied automatically.
    """
    body = {"email_address": email, "tags": tags, "notes": notes}
    resp = requests.post(f"{BUTTONDOWN_API}/subscribers", json=body, headers=_buttondown_headers())
    if resp.status_code in (200, 201):
        return

    # Fallback: tags require a paid plan — retry without them so we don't lose the subscriber
    if resp.status_code == 403:
        log.warning("Tags rejected (likely free plan) — adding %s without tags", email)
        body_no_tags = {"email_address": email, "notes": notes}
        resp2 = requests.post(f"{BUTTONDOWN_API}/subscribers", json=body_no_tags, headers=_buttondown_headers())
        if resp2.status_code in (200, 201):
            return
        raise RuntimeError(f"Buttondown add subscriber (no tags) failed: {resp2.status_code} {resp2.text}")

    raise RuntimeError(f"Buttondown add subscriber failed: {resp.status_code} {resp.text}")


def _send_email(to: str, subject: str, body: str) -> None:
    payload = {"subject": subject, "body": body, "to": [to]}
    resp = requests.post(f"{BUTTONDOWN_API}/emails", json=payload, headers=_buttondown_headers())
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"Buttondown send email failed: {resp.status_code} {resp.text}")


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


def _post_purchase_email(product_name: str, lang: str) -> tuple[str, str]:
    if lang == "es":
        return (
            "¡Gracias por tu compra!",
            f"¡Gracias por comprar {product_name}!\n\nTu descarga está lista en tu cuenta de Gumroad.\n\n"
            "Empieza con el sofrito — es la base de todo. Buen provecho.\n\n— La cocina Ortiz, Sofrito Studio",
        )
    return (
        "Thanks for your purchase!",
        f"Thanks for buying {product_name}!\n\nYour download is ready in your Gumroad library.\n\n"
        "Start with the sofrito — it's the base of everything. Buen provecho.\n\n— The Ortiz kitchen, Sofrito Studio",
    )


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
    try:
        _add_subscriber(payload.email, tags, f"Lead magnet: {payload.source}")
        log.info("Added lead %s (tags=%s)", payload.email, tags)
    except Exception as e:
        log.error("Lead add failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
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

    tags = _build_tags(product_name, lang)
    notes = f"Purchased: {product_name} @ ${price:.2f}"

    try:
        _add_subscriber(email, tags, notes)
        log.info("Added subscriber %s (tags=%s)", email, tags)
    except Exception as e:
        log.error("Subscriber add failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    try:
        subject, body = _post_purchase_email(product_name, lang)
        _send_email(email, subject, body)
    except Exception as e:
        log.error("Post-purchase email failed: %s", e)

    return {"status": "ok", "subscribed": True}
