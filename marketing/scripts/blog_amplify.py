#!/usr/bin/env python3
"""
Sofrito Studio — blog amplification.

When a new (or updated) blog post is published, this:
  1. appends an Instagram + Facebook post to marketing/content/queue.json
     (scheduled for the next open 10:00 UTC slot)
  2. refreshes sitemap.xml so search engines pick up the new URL
  3. prints a summary for the GitHub Actions log

Usage:  python marketing/scripts/blog_amplify.py <path-to-post>.html [more...]
Paths may be relative to the repo root (deploy/blog/x.html) or to deploy/.
"""
import datetime
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
QUEUE = ROOT / "marketing" / "content" / "queue.json"
DEPLOY = ROOT / "deploy"
SITE = "https://sofritostudio.com"

sys.path.insert(0, str(ROOT / "scripts"))
from gen_sitemap import build as build_sitemap  # noqa: E402


def normalize(path):
    p = path.replace("\\", "/")
    if p.startswith("deploy/"):
        p = p[len("deploy/"):]
    return p


def parse_post(rel_path):
    text = (DEPLOY / rel_path).read_text(encoding="utf-8", errors="ignore")

    def meta(prop):
        m = re.search(r'meta property="og:' + prop + r'" content="([^"]*)"', text)
        return m.group(1) if m else ""

    title = meta("title")
    if not title:
        t = re.search(r"<title>(.*?)</title>", text, re.S)
        if t:
            title = t.group(1).split("|")[0].strip()
    desc = meta("description")
    image = meta("image") or SITE + "/images/og-default.jpg"
    url = SITE + "/" + rel_path
    return {"title": title or "New recipe", "desc": desc or "New Puerto Rican recipe", "image": image, "url": url}


def next_slot(posts):
    dates = []
    for p in posts:
        try:
            dt = datetime.datetime.fromisoformat(p["datetime"])
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=datetime.timezone.utc)
            dates.append(dt)
        except Exception:
            continue
    base = max(dates) if dates else datetime.datetime.now(datetime.timezone.utc)
    slot = base.replace(hour=10, minute=0, second=0, microsecond=0)
    if slot <= base:
        slot += datetime.timedelta(days=1)
    return slot


def main(argv):
    paths = [normalize(a) for a in argv if a.endswith(".html")]
    if not paths:
        print("no blog posts given")
        return 1

    q = json.loads(QUEUE.read_text(encoding="utf-8"))
    posts = q["posts"]
    counters = {}
    for p in posts:
        m = re.match(r"^(ig|fb)-(\d+)$", p.get("id", ""))
        if m:
            counters[m.group(1)] = max(counters.get(m.group(1), 0), int(m.group(2)))

    slot = next_slot(posts)
    for rel_path in paths:
        meta = parse_post(rel_path)
        counters["ig"] = counters.get("ig", 0) + 1
        counters["fb"] = counters.get("fb", 0) + 1
        posts.append({
            "id": f"ig-{counters['ig']:03d}",
            "platform": "instagram",
            "datetime": slot.isoformat(),
            "image_url": meta["image"],
            "caption": f"{meta['title']} — {meta['desc'][:120]}\n\nFull recipe (EN + ES): {meta['url']}",
            "posted": False,
        })
        posts.append({
            "id": f"fb-{counters['fb']:03d}",
            "platform": "facebook",
            "datetime": slot.isoformat(),
            "image_url": meta["image"],
            "caption": f"{meta['title']} — {meta['desc'][:140]} Full recipe: {meta['url']}",
            "posted": False,
        })
        print(f"queued {rel_path} -> {posts[-2]['id']} + {posts[-1]['id']} @ {slot.isoformat()}")

    QUEUE.write_text(json.dumps(q, indent=2, ensure_ascii=False), encoding="utf-8")
    n = build_sitemap()
    print(f"sitemap refreshed: {n} URLs")
    print(f"added {len(paths)} post(s) to the social queue")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))