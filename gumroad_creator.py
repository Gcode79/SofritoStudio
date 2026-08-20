"""Sofrito Studio — Bulk Gumroad Product Creator.

Creates all product shells on Gumroad via the API (name, price, custom slug,
description) so the site's Buy buttons go live. You then attach the actual PDF
content files in the Gumroad UI.

The price is passed in CENTS (Gumroad API: `price` = cents).

IMPORTANT:
  - Run with --dry-run first to review the list (creates nothing).
  - Then run WITHOUT --dry-run to create the products.
  - Already-live products (cmfkg/razabs/dodbtn) are skipped.

Usage:
    python gumroad_creator.py --dry-run
    python gumroad_creator.py
"""

import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "config"))
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent / "config" / ".env")
except Exception:
    pass

import requests

GUMROAD_API = "https://api.gumroad.com/v2/products"

# ---- Products to create: slug -> (name, price_cents) ----
# Prices match the site's product pages. Skip the 3 already live.
PRODUCTS = [
    # Individual guides
    ("boricua-breakfasts", "Boricua Breakfasts", 799),
    ("comida-callejera", "Comida Callejera", 999),
    ("postres-boricuas", "Postres Boricuas", 799),
    ("sofrito-masterclass", "Sofrito Master Class", 1299),
    ("boricua-meal-prep", "Boricua Meal Prep", 1299),
    ("air-fryer-boricua", "Air Fryer Boricua", 999),
    ("pernil-playbook", "The Pernil Playbook", 1499),
    # Bundles
    ("breakfast-bundle", "Breakfast Bundle", 1699),
    ("street-food-bundle", "Street Food Bundle", 1699),
    ("holiday-bundle", "Holiday Bundle", 1799),
    ("complete-kitchen", "The Complete Kitchen", 5900),
    # Seasonal
    ("thanksgiving-boricua", "Thanksgiving Boricua", 1499),
    ("navidad-boricua", "Navidad Boricua", 1999),
    ("coquito-guide", "The Coquito Guide", 1499),
    ("holiday-coquito-addon", "Holiday & Coquito Add-On", 1200),
    # Entry / standalone / course / membership
    ("sofrito-starter-kit", "Sofrito Starter Kit", 900),
    ("boricua-weeknights", "Boricua Weeknights", 2700),
    ("mofongo-course", "Mofongo & More", 19700),
    ("membership-monthly", "Membership Monthly", 999),
    ("membership-yearly", "Membership Yearly", 9900),
]

# Products already live on the account (verified via API)
LIVE_SLUGS = {"cmfkg", "razabs", "dodbtn"}

# Map slug -> friendly description for the Gumroad product
DESCRIPTIONS = {
    "boricua-breakfasts": "15 authentic Puerto Rican breakfast recipes — mallorcas, quesitos, café con leche, and more. Bilingual, instant download.",
    "comida-callejera": "20 Puerto Rican street food recipes — alcapurrias, bacalaítos, empanadillas, and pinchos. Bilingual, instant download.",
    "postres-boricuas": "15 Puerto Rican dessert recipes — flan, tembleque, quesitos, arroz con dulce. Bilingual, instant download.",
    "sofrito-masterclass": "Master the flavor base — recaíto, sazón, and adobo from scratch. Bilingual, instant download.",
    "boricua-meal-prep": "25 Puerto Rican meal prep recipes, 5 weekly plans, freezer guides, and shopping lists. Bilingual.",
    "air-fryer-boricua": "20 air fryer Puerto Rican recipes — tostones, pollo, yuca, and more. Bilingual, instant download.",
    "pernil-playbook": "The ultimate guide to Puerto Rican pork — 12 pernil recipes. Bilingual, instant download.",
    "breakfast-bundle": "Breakfast Bundle: Boricua Breakfasts + Sofrito Master Class. Save when you bundle.",
    "street-food-bundle": "Street Food Bundle: Comida Callejera + Air Fryer Boricua. Save when you bundle.",
    "holiday-bundle": "Holiday Bundle: Postres Boricuas + The Pernil Playbook + Holiday Cheat Sheet.",
    "complete-kitchen": "All 7 individual guides — every recipe, every technique. The ultimate boricua kitchen library.",
    "thanksgiving-boricua": "Boricua Thanksgiving — pasteles workflow, pernil timing, and Puerto Rican sides for the big day.",
    "navidad-boricua": "Navidad Boricua — full Nochebuena menu planner, printable shopping lists, and timeline.",
    "coquito-guide": "The Coquito Guide — classic coquito from scratch plus 3 flavor variations and gift tags.",
    "holiday-coquito-addon": "Boricua Holiday & Coquito Guide — the essential companion to a stress-free Nochebuena. Add to any order.",
    "sofrito-starter-kit": "The 5 essential Puerto Rican recipes — sofrito, arroz con pollo, pernil, tostones, and flan. Bilingual.",
    "boricua-weeknights": "50 no-recipe 30-minute Puerto Rican dinners — the 6-step planning-to-table workflow.",
    "mofongo-course": "Master plantain cookery in 6 weeks — video lessons, bilingual workbooks, and community. Mofongo, tostones, alcapurrias.",
    "membership-monthly": "Sofrito Studio membership — new recipes monthly, meal plans, community, and 20% off products.",
    "membership-yearly": "Sofrito Studio yearly membership — everything in Monthly plus full archive and 2 months free.",
}


def create_product(token: str, slug: str, name: str, price_cents: int) -> dict:
    """Create a Gumroad product shell. Returns the API response.

    Retries on empty/non-JSON responses (rate limiting) with a short backoff.
    """
    payload = {
        "access_token": token,
        "name": name,
        "price": str(price_cents),           # Gumroad API expects cents
        "custom_permalink": slug,            # sets the /l/<slug> URL
        "description": DESCRIPTIONS.get(slug, ""),
    }
    for attempt in range(3):
        try:
            resp = requests.post(GUMROAD_API, data=payload, timeout=30)
            if resp.status_code == 429:
                wait = 5 * (attempt + 1)
                print(f"  ...rate limited, waiting {wait}s")
                time.sleep(wait)
                continue
            return resp.json()
        except ValueError:
            # Non-JSON response — likely rate limited. Wait and retry.
            wait = 4 * (attempt + 1)
            print(f"  ...empty response (rate limit?), waiting {wait}s")
            time.sleep(wait)
        except Exception as e:
            print(f"  ...request error: {str(e)[:60]}, retrying")
            time.sleep(3)
    return {"success": False, "message": "exhausted retries"}


def main() -> None:
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true", help="Review the list without creating anything")
    args = p.parse_args()

    token = os.getenv("GUMROAD_ACCESS_TOKEN", "")
    if not token:
        sys.exit("GUMROAD_ACCESS_TOKEN not set. Add it to config/.env")

    # Fetch what already exists so we only create the missing ones
    existing = set()
    try:
        r = requests.get(GUMROAD_API, params={"access_token": token}, timeout=30)
        for p in r.json().get("products", []):
            su = p.get("short_url", "")
            if su:
                existing.add(su.rstrip('/').split('/')[-1])
    except Exception:
        pass

    to_create = [pr for pr in PRODUCTS if pr[0] not in LIVE_SLUGS and pr[0] not in existing]
    skipped = [pr[0] for pr in PRODUCTS if pr[0] in existing or pr[0] in LIVE_SLUGS]
    print(f"To create: {len(to_create)} | Already exist (skipped): {len(skipped)}")
    print("=" * 60)

    if args.dry_run:
        for slug, name, price in to_create:
            print(f"  [dry-run] {name:28s} ${price/100:>7.2f}  /l/{slug}")
        print("\nNo products created (dry-run). Run without --dry-run to create them.")
        return

    print("Creating products on Gumroad...")
    created, failed = 0, 0
    for slug, name, price in to_create:
        try:
            d = create_product(token, slug, name, price)
            if d.get("success"):
                prod = d.get("product", {})
                print(f"  OK  {name:28s} -> {prod.get('short_url', '/l/'+slug)}")
                created += 1
            else:
                print(f"  ERR {name:28s} -> {d.get('message', 'unknown')}")
                failed += 1
            time.sleep(2)  # be gentle with the API / avoid rate limiting
        except Exception as e:
            print(f"  EXC {name:28s} -> {str(e)[:100]}")
            failed += 1

    print(f"\nDone: {created} created, {failed} failed")
    print("Next step: log into Gumroad and attach the PDF content file to each product.")


if __name__ == "__main__":
    main()
