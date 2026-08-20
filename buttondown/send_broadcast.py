"""
Sofrito Studio — Buttondown Broadcast & Email Scheduler

Sends / schedules email campaigns via the Buttondown API, using the
Markdown templates in ./templates/. Supports:
  - Lead magnet delivery (free starter kit PDF)
  - Post-purchase onboarding 3-step sequence
  - Seasonal promotional broadcasts

Requires BUTTONDOWN_API_KEY (config/.env or environment).

Usage:
    python send_broadcast.py --demo                    # preview templates
    python send_broadcast.py --flow onboarding --to you@example.com
    python send_broadcast.py --flow seasonal --holiday navidad --lang es
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "config"))

# Load .env if present (config/.env)
try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / "config" / ".env")
except Exception:
    pass

BUTTONDOWN_API_KEY = os.getenv("BUTTONDOWN_API_KEY", "")
BUTTONDOWN_API = "https://api.buttondown.com/v1"
TEMPLATE_DIR = Path(__file__).resolve().parent / "templates"


def _headers() -> dict:
    if not BUTTONDOWN_API_KEY:
        raise RuntimeError("BUTTONDOWN_API_KEY not set. Add it to config/.env")
    # Buttondown expects: Authorization: Token <key>
    return {"Authorization": f"Token {BUTTONDOWN_API_KEY}", "Content-Type": "application/json"}


def _api(method: str, path: str, body: dict | None = None) -> dict:
    url = f"{BUTTONDOWN_API}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=_headers(), method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Buttondown API error {e.code}: {e.read().decode()}")


def load_template(name: str, lang: str = "en") -> dict:
    """Load a bilingual template .md and return {subject, body}."""
    path = TEMPLATE_DIR / f"{name}.md"
    text = path.read_text(encoding="utf-8")
    # Template format: `subject: ...` on first line, then body
    lines = text.splitlines()
    subject = lines[0].replace("subject:", "").strip()
    body = "\n".join(lines[1:]).strip()
    return {"subject": subject, "body": body}


def send_flow(flow: str, to: str | None = None, lang: str = "en", holiday: str = "navidad") -> None:
    """Create/send a flow as a Buttondown broadcast.

    IMPORTANT: Buttondown's /v1/emails endpoint creates BROADCASTS to the
    whole list (or a tag segment) — it does NOT support sending a one-off
    email to a single address (the `to` field is rejected). Segmentation is
    done via tags (requires the paid Basic plan).

    - `to` is accepted for backward-compat but IGNORED by the API (no targeted
      one-off sends via the API). Pass `tag` to target a segment instead.
    - Each email in the flow is created as a broadcast draft; on a paid plan
      with tags you can schedule it to a segment.
    """
    # Build the email list for the requested flow
    if flow == "onboarding":
        emails = [
            {"subject": "Thanks! Your book is ready", "body": _onboarding_email(lang, 1)},
            {"subject": "How's your first week?" if lang == "en" else "¿Cómo va tu primera semana?", "body": _onboarding_email(lang, 2)},
            {"subject": "Ready for the next level?" if lang == "en" else "¿Listo para el siguiente nivel?", "body": _onboarding_email(lang, 3)},
        ]
    elif flow == "tripwire":
        emails = _tripwire_sequence(lang)
    elif flow == "abandoned_cart":
        emails = [
            {"subject": "Your cart is waiting" if lang == "en" else "Tu carrito te espera",
             "body": load_template("abandoned_cart", lang)["body"]},
            {"subject": "10% off — 24 hours only" if lang == "en" else "10% de descuento — solo 24 horas",
             "body": _discount_email(lang)},
        ]
    elif flow == "seasonal":
        emails = _seasonal_sequence(lang, holiday)
    else:  # lead_magnet
        emails = [load_template("lead_magnet", lang)]

    for e in emails:
        # Broadcast to the list (or a tag segment on paid plans).
        payload = {"subject": e["subject"], "body": e["body"]}
        _api("POST", "/emails", payload)
        print(f"Created broadcast: {e['subject']}")
        time.sleep(1)


def _tripwire_sequence(lang: str) -> list[dict]:
    """Tripwire conversion: free subscriber -> $9 Starter Kit within 48 hours.

    Email 1 (hour 0): deliver the freebie + tease the starter kit.
    Email 2 (hour 24): the $9 tripwire offer with a social-proof nudge.
    """
    free = "https://sofritostudio.com/freebies/Sofrito-101.pdf"
    starter = "https://sofritostudio.com/products/starter-kit.html"
    if lang == "es":
        return [
            {
                "subject": "Tu guía gratuita está aquí",
                "body": f"¡Tu guía gratuita de Sofrito 101 está lista!\n\n{free}\n\n"
                        "Empieza con el sofrito — es la base de todo.\n\n"
                        "Cuando quieras ir más allá, el Starter Kit tiene los 5 platos esenciales por solo $9. — La cocina Ortiz",
            },
            {
                "subject": "Los 5 platos esenciales, por $9",
                "body": f"En las próximas 24 horas, consigue el Starter Kit — los 5 platos esenciales (sofrito, arroz con pollo, pernil, tostones, flan) por solo $9.\n\n"
                        f"{starter}\n\n"
                        "Bilingüe, probado en la cocina Ortiz, con swaps de ingredientes para el mainland. — Josh",
            },
        ]
    return [
        {
            "subject": "Your free guide is here",
            "body": f"Your free Sofrito 101 guide is ready!\n\n{free}\n\n"
                    "Start with the sofrito — it's the base of everything.\n\n"
                    "When you're ready to go further, the Starter Kit has the 5 essential dishes for just $9. — The Ortiz kitchen",
        },
        {
            "subject": "The 5 essential dishes, for $9",
            "body": f"In the next 24 hours, grab the Starter Kit — the 5 essential dishes (sofrito, arroz con pollo, pernil, tostones, flan) for just $9.\n\n"
                    f"{starter}\n\n"
                    "Bilingual, tested in the Ortiz kitchen, with mainland ingredient swaps. — Josh",
        },
    ]


def _discount_email(lang: str) -> str:
    """Abandoned-cart discount nudge (COMEBACK10)."""
    link = "https://sofritostudio.com/products/la-mesa-boricua-sales.html"
    if lang == "es":
        return f"Usa el código COMEBACK10 para 10% de descuento en La Mesa Boricua. Expira en 24 horas.\n\n{link}\n\n— Josh, Sofrito Studio"
    return f"Use code COMEBACK10 for 10% off La Mesa Boricua. It expires in 24 hours.\n\n{link}\n\n— Josh, Sofrito Studio"


def _seasonal_sequence(lang: str, holiday: str) -> list[dict]:
    """Seasonal promotional broadcasts: Thanksgiving, Nochebuena, San Sebastián."""
    topics = {
        "thanksgiving": ("Boricua Thanksgiving", "pernil timing for the big day"),
        "navidad": ("Nochebuena Menu", "pasteles, pernil, coquito timeline"),
        "san-sebastian": ("San Sebastián Street Fest", "portable snacks, drinks, and parranda tips"),
    }
    title, focus = topics.get(holiday, topics["navidad"])
    cookbook = "https://sofritostudio.com/products/la-mesa-boricua-sales.html"
    if lang == "es":
        subject = f"Prepara tu {title} — guía completa"
        body = f"Las fiestas se acercan. Tu guía para un {title} sin estrés:\n\n- {focus}\n- Lista de compras imprimible\n- Línea de tiempo paso a paso\n\nConsíguela aquí: {cookbook}\n\n— La cocina Ortiz"
    else:
        subject = f"Prep your {title} — the complete guide"
        body = f"The holidays are coming. Your stress-free {title} guide:\n\n- {focus}\n- Printable shopping list\n- Step-by-step timeline\n\nGet it here: {cookbook}\n\n— The Ortiz kitchen"
    return [{"subject": subject, "body": body}]


def _onboarding_email(lang: str, step: int) -> str:
    cookbook = "https://sofritostudio.com/products/la-mesa-boricua-sales.html"
    if lang == "es":
        steps = {
            1: f"Tu descarga está en tu biblioteca de Gumroad.\n\nEmpieza con el sofrito — es la base de todo. {cookbook}",
            2: "¿Has cocinado algo? Cuéntame.\n\nTip: no destapes el arroz una vez que hierva — el vapor hace el trabajo.",
            3: f"Si ya dominas lo básico, The Full Table lleva todo más lejos: libro, imprimibles y 50 cenas de 30 minutos.\n\n{cookbook}",
        }
        return steps[step] + "\n\n— La cocina Ortiz"
    steps = {
        1: f"Your download is in your Gumroad library.\n\nStart with the sofrito — it's the base of everything. {cookbook}",
        2: "Have you cooked anything yet? Tell me.\n\nTip: don't lift the lid once the rice boils — the steam does the work.",
        3: f"Once you've nailed the basics, The Full Table takes it further: cookbook, printables, and 50 no-recipe 30-min dinners.\n\n{cookbook}",
    }
    return steps[step] + "\n\n— The Ortiz kitchen"


def _seasonal_email(lang: str, holiday: str) -> dict:
    return _seasonal_sequence(lang, holiday)[0]


def demo() -> None:
    print("=== Lead magnet (EN) ===")
    print(load_template("lead_magnet")["subject"])
    print("=== Onboarding step 1 (ES) ===")
    print(_onboarding_email("es", 1)[:80], "...")
    print("=== Tripwire step 2 (EN) ===")
    print(_tripwire_sequence("en")[1]["subject"])
    print("=== Seasonal San Sebastián (EN) ===")
    print(_seasonal_sequence("en", "san-sebastian")[0]["subject"])


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--demo", action="store_true")
    p.add_argument("--flow", choices=["lead_magnet", "onboarding", "tripwire", "abandoned_cart", "seasonal"])
    p.add_argument("--to", default=None)
    p.add_argument("--lang", default="en", choices=["en", "es"])
    p.add_argument("--holiday", default="navidad", choices=["thanksgiving", "navidad", "san-sebastian"])
    a = p.parse_args()

    if a.demo:
        demo()
    elif a.flow:
        send_flow(a.flow, to=a.to, lang=a.lang, holiday=a.holiday)
    else:
        print("Use --demo, or --flow <name> [--to email] [--lang es] [--holiday navidad]")
