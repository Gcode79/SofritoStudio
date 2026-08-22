"""
Sofrito Studio — package follow-up sequences runner.

Queries Gumroad sales from the last 10 days and sends the package-specific
Day-2 / Day-7 follow-up email for each purchase (skipping refunds).

Runs from .github/workflows/package-sequences.yml (daily) and locally.
Uses mailer (Resend-preferred) + mailer/package_sequences.py content.

Requires env: GUMROAD_ACCESS_TOKEN, RESEND_API_KEY (or Gmail creds fallback).
"""

import os
import sys
import json
import datetime
import urllib.request
import urllib.error
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from mailer.gmail_sender import send_email  # noqa: E402
from mailer.package_sequences import tier_for_product, sequence_email  # noqa: E402

DAYS_BACK = 16
SEND_DAYS = {2, 7, 14}  # Day-2 / Day-7 / Day-14 follow-ups


def sale_language(sale) -> str:
    """Detect ES buyers from Gumroad custom_fields (name 'language')."""
    for cf in sale.get("custom_fields") or []:
        if isinstance(cf, dict):
            if str(cf.get("name", "")).lower() == "language" and str(cf.get("value", "")).lower().startswith("es"):
                return "es"
    return "en"


def fetch_sales(token: str, after: str, before: str) -> list:
    url = (f"https://api.gumroad.com/v2/sales?access_token={token}"
           f"&after={after}&before={before}")
    sales = []
    page = 1
    while True:
        u = url + f"&page={page}"
        req = urllib.request.Request(u)
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.load(r)
        if not data.get("success"):
            raise RuntimeError(f"Gumroad API error: {data.get('message')}")
        batch = data.get("sales", [])
        sales.extend(batch)
        if len(batch) < 50:  # gumroad returns up to 50/page; no next-page signal
            break
        page += 1
    return sales


def main() -> None:
    token = os.getenv("GUMROAD_ACCESS_TOKEN", "")
    if not token:
        print("GUMROAD_ACCESS_TOKEN not set; skipping.")
        return

    today = datetime.date.today()
    after = (today - datetime.timedelta(days=DAYS_BACK)).isoformat()
    before = today.isoformat()
    sales = fetch_sales(token, after, before)
    print(f"sales since {after}: {len(sales)}")

    sent = 0
    for s in sales:
        if s.get("refunded"):
            continue
        created = s.get("created_at", "")[:10]
        try:
            age = (today - datetime.date.fromisoformat(created)).days
        except Exception:
            continue
        if age not in SEND_DAYS:
            continue
        email = s.get("email", "")
        product = s.get("product_name", "unknown")
        if not email:
            continue
        tier = tier_for_product(product)
        lang = sale_language(s)
        subj, body = sequence_email(tier, age, lang, product)
        try:
            send_email(email, subj, body)
            print(f"sent d{age} [{tier}/{lang}] -> {email} ({product})")
            sent += 1
        except Exception as e:
            print(f"  ! failed d{age} [{tier}/{lang}] -> {email}: {str(e)[:100]}")

    print(f"done. emails sent: {sent}")


if __name__ == "__main__":
    main()