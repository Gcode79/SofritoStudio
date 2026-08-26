# -*- coding: utf-8 -*-
"""
Gumroad stale-file checker.

Gumroad's API cannot upload files, but it CAN list each product's attached
content filenames. This script compares what Gumroad currently serves against
the compliant files on disk (Desktop\\Sofrito-Gumroad-Uploads\\All-Products)
and prints exactly which products need a re-upload and which file to drop in.

Usage:
    python scripts/check_gumroad_files.py          # live check against the API
    python scripts/check_gumroad_files.py --dry   # show mapping only (no API)
"""
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DESKTOP = Path(r"C:\Users\josho\Desktop\Sofrito-Gumroad-Uploads\All-Products")

# Gumroad product permalink/short-url slug -> local folder under All-Products
# (folders are the product folders created by make_all_products.py)
PRODUCT_FOLDERS = {
    "sofrito-starter-kit": "Sofrito Starter Kit",
    "coquito-guide": "The Coquito Guide",
    "boricua-breakfasts": "Boricua Breakfasts",
    "postres-boricuas": "Postres Boricuas",
    "comida-callejera": "Comida Callejera",
    "pernil-playbook": "The Pernil Playbook",
    "holiday-coquito-addon": "Holiday Companion (Add-on)",
    "air-fryer-boricua": "Air Fryer Boricua",
    "boricua-meal-prep": "Meal Prep Boricua",
    "sofrito-masterclass": "The Sofrito Masterclass",
    "thanksgiving-boricua": "Thanksgiving Boricua",
    "navidad-boricua": "Navidad Boricua",
    "la-mesa-boricua-sales": "La Mesa Boricua",
    "boricua-weeknights": "Boricua Weeknights",
    "kitchen-bundle": "The Kitchen Bundle",
    "full-table": "The Kitchen Bundle",
    "breakfast-bundle": "Boricua Breakfasts",
    "street-food-bundle": "Comida Callejera",
    "holiday-bundle": "Holiday Companion (Add-on)",
    "complete-kitchen": "The Sofrito Masterclass",
}

# Also honor the tier permalinks used by sync_gumroad.py
TIER_ALIASES = {
    "lm9z_c4fPOQY1_4_Zrv0fw==": "Sofrito Starter Kit",
    "cmfkg": "La Mesa Boricua",
    "razabs": "The Kitchen Bundle",
    "dodbtn": "The Kitchen Bundle",
}


def load_token():
    env = (ROOT / "config" / ".env")
    if not env.exists():
        sys.exit("config/.env missing")
    tok = re.search(r"GUMROAD_ACCESS_TOKEN=(\S+)", env.read_text(encoding="utf-8"))
    if not tok:
        sys.exit("GUMROAD_ACCESS_TOKEN missing in config/.env")
    return tok.group(1)


def api(token, path):
    q = urllib.parse.urlencode({"access_token": token})
    req = urllib.request.Request(f"https://api.gumroad.com/v2/{path}?{q}")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {"success": False, "message": f"HTTP {e.code}"}


def local_files_for(folder):
    d = DESKTOP / folder
    if not d.exists():
        return []
    return sorted(p.name for p in d.iterdir()
                  if p.suffix.lower() in (".pdf", ".epub"))


def main():
    dry = "--dry" in sys.argv
    token = None if dry else load_token()

    # expected local sets
    expected = {}
    for slug, folder in {**PRODUCT_FOLDERS, **TIER_ALIASES}.items():
        expected.setdefault(folder, set()).update(local_files_for(folder))

    if dry:
        print("DRY RUN — mapping only (no API call)\n")
        for folder, files in sorted(expected.items()):
            print(f"{folder}: {', '.join(sorted(files)) or '(none)'}")
        return

    products = api(token, "products")
    if not products.get("success"):
        sys.exit("API error: " + str(products.get("message", "?")))

    print("Gumroad file check — comparing served vs. compliant local files\n")
    stale, ok, unknown = [], [], []
    for p in products.get("products", []):
        name = p.get("name", "?")
        short = (p.get("short_url") or "").rstrip("/").split("/")[-1]
        ids = [short, p.get("id") or ""]
        # served file names
        served = set()
        for v in p.get("variants") or []:
            for vv in v.get("variants") or []:
                for f in vv.get("files") or []:
                    served.add(f.get("name", ""))
        if not served:
            for f in p.get("files") or []:
                served.add(f.get("name", ""))

        folder = None
        for slug, fld in PRODUCT_FOLDERS.items():
            if slug in ids or slug == short:
                folder = fld
                break
        if not folder:
            for gid, fld in TIER_ALIASES.items():
                if gid in ids:
                    folder = fld
                    break
        if not folder:
            unknown.append((name, short, sorted(served)))
            continue

        local = expected.get(folder, set())
        if not local:
            unknown.append((name, short, sorted(served)))
            continue
        missing = sorted(local - served)
        extra = sorted(served - local)
        if missing:
            stale.append((name, folder, missing))
            if extra:
                print(f"  (also serving {', '.join(extra)} not in local set)")
        else:
            ok.append(name)

    print(f"UP TO DATE ({len(ok)}):")
    for n in ok:
        print(f"  \u2713 {n}")
    print(f"\nSTALE — re-upload these ({len(stale)}):")
    for name, folder, missing in stale:
        print(f"  ! {name}  <- replace with files from: {DESKTOP / folder}")
        for m in missing:
            print(f"      {m}")
    if unknown:
        print(f"\nUNMAPPED (add to PRODUCT_FOLDERS if needed) ({len(unknown)}):")
        for name, short, served in unknown:
            print(f"  ? {name} /l/{short} serving: {', '.join(served) or '(no files)'}")


if __name__ == "__main__":
    main()