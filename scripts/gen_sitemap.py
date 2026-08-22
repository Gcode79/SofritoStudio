#!/usr/bin/env python3
"""
Sofrito Studio — sitemap generator.

Regenerates sitemap.xml (deploy/ + root/) from the deploy HTML tree.
Skips noindex pages (credits, upsell funnels, etc.). Priorities:
home 1.0, top-level 0.8, blog/products 0.7, /es/ 0.6.

Usage:  python scripts/gen_sitemap.py
"""
import datetime
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEPLOY = ROOT / "deploy"
SITE = "https://sofritostudio.com"
NOINDEX = re.compile(r'name="robots"\s+content="[^"]*noindex')


def build():
    today = datetime.date.today().isoformat()
    urls = []
    for f in sorted(DEPLOY.rglob("*.html")):
        rel = f.relative_to(DEPLOY).as_posix()
        if any(part.startswith(".") for part in rel.split("/")):
            continue
        text = f.read_text(encoding="utf-8", errors="ignore")
        if NOINDEX.search(text):
            continue
        if rel == "index.html":
            loc, prio = SITE + "/", 1.0
        elif rel.startswith("es/"):
            loc, prio = SITE + "/" + rel, 0.6
        elif rel.startswith("blog/") or rel.startswith("products/"):
            loc, prio = SITE + "/" + rel, 0.7
        else:
            loc, prio = SITE + "/" + rel, 0.8
        urls.append((loc, today, prio))

    urls.sort(key=lambda x: -x[2])
    xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for loc, lastmod, prio in urls:
        xml += [
            "  <url>",
            f"    <loc>{loc}</loc>",
            f"    <lastmod>{lastmod}</lastmod>",
            "    <changefreq>weekly</changefreq>",
            f"    <priority>{prio}</priority>",
            "  </url>",
        ]
    xml.append("</urlset>")
    out = "\n".join(xml) + "\n"
    for target in (DEPLOY / "sitemap.xml", ROOT / "sitemap.xml"):
        target.write_text(out, encoding="utf-8")
    return len(urls)


def main():
    n = build()
    print(f"sitemap regenerated: {n} URLs")


if __name__ == "__main__":
    main()