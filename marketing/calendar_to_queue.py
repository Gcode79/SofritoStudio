#!/usr/bin/env python3
"""
Sofrito Studio — content calendar -> social queue sync.

Ensures the Meta queue always has a rolling 7-day runway of IG + FB posts
by generating themed filler from the weekly calendar (content_calendar.py
themes). Idempotent: only fills dates that have no post yet.

Usage:  python marketing/calendar_to_queue.py
"""
import datetime
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUEUE = ROOT / "marketing" / "content" / "queue.json"
SITE = "https://sofritostudio.com"

WEEK_THEMES = [
    ("Sofrito batch day — the base every dish builds on", "https://sofritostudio.com/products/starter-kit.html"),
    ("Weeknight arroz con pollo, one pot, under an hour", "https://sofritostudio.com/products/la-mesa-boricua-sales.html"),
    ("Mainland ingredient swaps — cook boricua anywhere", "https://sofritostudio.com/products/starter-kit.html"),
    ("Nochebuena planning — the timeline that saves the table", "https://sofritostudio.com/products/full-table.html"),
    ("Coquito & postres — the sweet side of the island", "https://sofritostudio.com/products/coquito-guide.html"),
    ("Kitchen systems & meal-prep — boricua all week", "https://sofritostudio.com/products/kitchen-bundle.html"),
    ("Family table storytelling — tradition on the plate", "https://sofritostudio.com/products/starter-kit.html"),
]

IMAGE_BASE = SITE + "/images"

# Rotate pin/hero images across filler posts (indexed by day)
PIN_IMAGES = [
    "pernil-course-pin.png", "rec-alcapurrias-pin.png", "rec-arroz-gandules-pin.png",
    "rec-arroz-pin.png", "rec-coquito-pin.png", "rec-habichuelas-pin.png",
    "rec-mofongo-pin.png", "rec-pastelillos-pin.png", "rec-tembleque-pin.png",
    "rec-tostones-pin.png",
]
FB_IMAGES = [
    "pernil-course.jpg", "rec-alcapurrias.jpg", "rec-arroz-gandules.jpg",
    "rec-arroz.jpg", "rec-coquito.jpg", "rec-habichuelas.jpg",
    "rec-mofongo.jpg", "rec-pastelillos.jpg", "rec-tembleque.jpg",
    "rec-tostones.jpg",
]


def theme_for(date):
    return WEEK_THEMES[date.weekday()]


def images_for(date):
    idx = date.toordinal() % len(PIN_IMAGES)
    return PIN_IMAGES[idx], FB_IMAGES[idx]


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


def main():
    q = json.loads(QUEUE.read_text(encoding="utf-8"))
    posts = q["posts"]
    existing = {p.get("datetime", "")[:10] for p in posts}
    counters = {}
    for p in posts:
        m = re.match(r"^(ig|fb)-(\d+)$", p.get("id", ""))
        if m:
            counters[m.group(1)] = max(counters.get(m.group(1), 0), int(m.group(2)))

    slot = next_slot(posts)
    added = 0
    while added < 14 and len(posts) < 200:
        day = slot.date().isoformat()
        if day not in existing:
            theme, link = theme_for(slot.date())
            pin, fb = images_for(slot.date())
            counters["ig"] = counters.get("ig", 0) + 1
            counters["fb"] = counters.get("fb", 0) + 1
            posts.append({
                "id": f"ig-{counters['ig']:03d}", "platform": "instagram",
                "datetime": slot.isoformat(), "image_url": f"{IMAGE_BASE}/pins/{pin}",
                "caption": f"{theme} 🇵🇷\n\n{link}", "posted": False,
            })
            posts.append({
                "id": f"fb-{counters['fb']:03d}", "platform": "facebook",
                "datetime": slot.isoformat(), "image_url": f"{IMAGE_BASE}/{fb}",
                "caption": f"{theme} — {link}", "posted": False,
            })
            existing.add(day)
            added += 2
        slot += datetime.timedelta(days=1)

    QUEUE.write_text(json.dumps(q, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"queue now: {len(posts)} posts (added {added})")


if __name__ == "__main__":
    main()