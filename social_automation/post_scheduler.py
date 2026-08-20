"""Sofrito Studio — Social Post Scheduler.

Reads social_automation/content_calendar.json and schedules / publishes
posts to social platforms. Supports two modes:
  - API mode (Pinterest v5) via a real token
  - Playwright browser automation (Instagram/TikTok/Facebook) — stubbed here
    to a dry-run template since these platforms require browser sessions.

Every item in the calendar is bilingual (EN/ES captions + voiceover + tags).

Usage:
    python post_scheduler.py --dry-run              # preview next posts
    python post_scheduler.py --publish pinterest    # publish next Pinterest pin
    python post_scheduler.py --day 2026-08-20       # show a specific day
"""

import argparse
import json
import os
import sys
import time
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "config"))
try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / "config" / ".env")
except Exception:
    pass

CALENDAR = Path(__file__).resolve().parent / "content_calendar.json"


def load_calendar() -> list[dict]:
    return json.loads(CALENDAR.read_text(encoding="utf-8"))


def next_drafts(channel: str | None = None) -> list[dict]:
    items = load_calendar()
    drafts = [i for i in items if i.get("status", "draft") == "draft"]
    if channel:
        drafts = [i for i in drafts if i["channel"] == channel]
    return drafts


def _pinterest_publish(item: dict) -> dict:
    """Publish a pin via Pinterest API v5. Returns created pin info."""
    token = os.getenv("PINTEREST_ACCESS_TOKEN", "")
    media = os.getenv("PIN_MEDIA_URL", "")
    if not token or not media:
        raise RuntimeError("PINTEREST_ACCESS_TOKEN and PIN_MEDIA_URL required to publish")
    import urllib.request, urllib.error, json as _json
    # Resolve board id (first board)
    req = urllib.request.Request(
        "https://api.pinterest.com/v5/boards",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        boards = _json.loads(resp.read().decode()).get("items", [])
    if not boards:
        raise RuntimeError("No Pinterest board available")
    board_id = boards[0]["id"]

    body = {
        "board_id": board_id,
        "title": item["title_en"][:100],
        "description": item["caption_en"][:500],
        "link": item["cta"],
        "media_source": {"source_type": "image_url", "url": media},
    }
    req2 = urllib.request.Request(
        "https://api.pinterest.com/v5/pins",
        data=_json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req2, timeout=30) as resp:
        return _json.loads(resp.read().decode())


def mark_published(date_str: str, channel: str) -> None:
    items = load_calendar()
    for i in items:
        if i["date"] == date_str and i["channel"] == channel:
            i["status"] = "published"
    CALENDAR.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true", help="Preview next posts without publishing")
    p.add_argument("--publish", choices=["pinterest"], help="Publish to a channel (Pinterest v5 supported)")
    p.add_argument("--day", default=None, help="Show a specific day (YYYY-MM-DD)")
    args = p.parse_args()

    if args.day:
        items = load_calendar()
        for i in items:
            if i["date"] == args.day:
                print(f"[{i['date']}] {i['channel']}: {i['title_en']}")
                print(f"  EN: {i['caption_en']}")
                print(f"  ES: {i['caption_es']}")
                print(f"  VO: {i['reel_voiceover_en']}")
                print(f"  Tags: {i['hashtags']}")
        return

    drafts = next_drafts()
    if not drafts:
        print("No draft posts left. Regenerate the calendar.")
        return

    if args.dry_run:
        print(f"Next {min(len(drafts), 5)} scheduled posts:")
        for i in drafts[:5]:
            print(f"  [{i['date']}] {i['channel']}: {i['title_en']}")
        return

    if args.publish == "pinterest":
        pin = next((d for d in drafts if d["channel"] == "pinterest"), None)
        if not pin:
            print("No Pinterest draft to publish.")
            return
        result = _pinterest_publish(pin)
        mark_published(pin["date"], "pinterest")
        print(f"Published pin {result.get('id')}: {pin['title_en']}")
        time.sleep(1)


if __name__ == "__main__":
    main()
