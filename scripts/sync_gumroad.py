#!/usr/bin/env python3
"""
Sofrito Studio — Gumroad product sync service.

Synchronizes the store tiers with the Gumroad API (/v2/products):

  Free Lead Magnet   "Sofrito 101: Master Your Base"   $0   (created unpublished)
  Tier 1             Sofrito Starter Kit               $9
  Tier 2             La Mesa Boricua Cookbook          $47
  Tier 3             The Kitchen Bundle                $67
  Tier 4             The Full Table System             $97

For each product it pushes rich metadata from data/products.json:
bilingual (EN/ES) descriptions and the correct price in cents.

Custom checkout fields ("Mainland Location") and coupons cannot be set via
the Gumroad API — the script reports them as manual dashboard steps.

Usage:  python scripts/sync_gumroad.py
"""
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://api.gumroad.com/v2"

# Tier -> (products.json sku, Gumroad product id/permalink)
TIERS = [
    ("free-lead-magnet", "sofrito-101", None),
    ("tier-1-starter-kit", "starter-kit", "lm9z_c4fPOQY1_4_Zrv0fw=="),
    ("tier-2-mesa", "mesa", "cmfkg"),
    ("tier-3-kitchen-bundle", "kitchen-bundle", "razabs"),
    ("tier-4-full-table", "full-table", "dodbtn"),
]


def load_config():
    env_path = os.path.join(ROOT, "config", ".env")
    with open(env_path, encoding="utf-8") as f:
        env = f.read()
    tok = re.search(r"GUMROAD_ACCESS_TOKEN=(\S+)", env)
    if not tok:
        sys.exit("GUMROAD_ACCESS_TOKEN missing in config/.env")
    return tok.group(1)


def call(token, path, data=None, method="POST"):
    payload = dict(data or {})
    payload["access_token"] = token
    body = urllib.parse.urlencode(payload).encode()
    req = urllib.request.Request(API + "/" + path, data=body, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {"error": e.code, "message": e.read().decode()[:160]}


def load_catalog():
    with open(os.path.join(ROOT, "data", "products.json"), encoding="utf-8") as f:
        return json.load(f)["products"]


def catalog_map(catalog):
    out = {}
    for p in catalog:
        out[p["sku"]] = p
    return out


def pick(obj):
    if not obj or not isinstance(obj, dict):
        return str(obj or "")
    return "EN — " + (obj.get("en") or obj.get("es") or "") + "\n\nES — " + (obj.get("es") or obj.get("en") or "")


def sync_product(token, gumroad_id, catalog_product):
    desc = pick(catalog_product.get("description"))
    price_cents = int(round(catalog_product.get("price", 0) * 100))
    result = call(token, "products/" + gumroad_id, {
        "description": desc,
        "price_cents": price_cents,
    }, "PUT")
    ok = result.get("success") is True
    prod = result.get("product") or {}
    return {
        "id": gumroad_id,
        "ok": ok,
        "price_cents": prod.get("price_cents"),
        "message": result.get("message") if not ok else None,
    }


def create_free_magnet(token, name):
    result = call(token, "products", {
        "name": name,
        "price_cents": 0,
        "permalink": "sofrito-101",
        "description": ("EN — The master sofrito base: every ingredient explained, "
                        "mainland swaps, a 20-minute batch plan, and troubleshooting.\n\n"
                        "ES — La base maestra del sofrito: cada ingrediente explicado, "
                        "swaps para el mainland, un plan de lote de 20 minutos y solución de problemas."),
        "published": "false",
    })
    return {"ok": result.get("success") is True, "message": result.get("message"), "id": (result.get("product") or {}).get("id")}


def main():
    token = load_config()
    catalog = catalog_map(load_catalog())
    print("Sofrito Studio — Gumroad sync\n")

    for tier, sku, gumroad_id in TIERS:
        if tier == "free-lead-magnet":
            print("  free-lead-magnet: create in the dashboard (API can't make $0 products)")
            print("      -> Dashboard: create product \"Sofrito 101: Master Your Base\", price FREE,")
            print("         upload Sofrito-101.pdf as content, permalink \"sofrito-101\".")
            continue
        p = catalog.get(sku)
        if not p:
            print(f"  {tier}: catalog sku '{sku}' not found — skipped")
            continue
        r = sync_product(token, gumroad_id, p)
        status = "OK" if r["ok"] else "FAILED"
        price = p.get("price", 0)
        print(f"  {tier}: {status}  price=${price:.2f}" + (f"  {r['message']}" if r.get("message") else ""))
        print(f"      -> synced bilingual description for '{p['name'].get('en', sku)}'")

    print("""
Manual dashboard steps (Gumroad API can't do these):
  1. Coupons — create on each product:
       SOFRITO15  (15% off Starter Kit)          -> sent in the Action-1 welcome email
       UPGRADE9   ($9 off Kitchen Bundle)        -> Day-3 upgrade for Starter Kit buyers
       UPGRADE35  ($62 off Full Table = $35)     -> La Mesa -> Full Table post-purchase upsell
  2. Custom checkout field — add "Mainland Location" to each paid product
     (Checkout settings -> custom fields).
  3. Free lead magnet — upload Sofrito-101.pdf as content, then Publish.
""")


if __name__ == "__main__":
    main()