"""
Sofrito Studio — Pinterest pin publisher.

Reads marketing/pins.json and publishes unpinned images to a Pinterest board
via the Pinterest v5 API. Dry-run by default.

Requires (config/.env or env):
  PINTEREST_ACCESS_TOKEN
  PINTEREST_BOARD_ID        (fallback when a pin's board_id is empty)

Usage:
  python marketing/post_to_pinterest.py --dry-run   # show what's unpinned
  python marketing/post_to_pinterest.py --publish   # actually create pins
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PINS = ROOT / "marketing" / "pins.json"
CONFIG = ROOT / "config" / ".env"
API = "https://api.pinterest.com/v5/pins"
IMAGE_BASE = "https://sofritostudio.com/images/pins"


def load_env():
    if CONFIG.exists():
        for line in CONFIG.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())


load_env()
TOKEN = os.getenv("PINTEREST_ACCESS_TOKEN", "").strip()
BOARD_ID = os.getenv("PINTEREST_BOARD_ID", "").strip()


def create_pin(pin, board_id, max_retries=4):
    body = json.dumps({
        "board_id": board_id,
        "media_source": {"source_type": "image_url", "url": f"{IMAGE_BASE}/{pin['file']}"},
        "title": pin["title"],
        "description": pin["description"],
        "link": pin.get("link"),
    }).encode()
    for attempt in range(max_retries):
        req = urllib.request.Request(API, data=body, method="POST", headers={
            "Authorization": "Bearer " + TOKEN,
            "Content-Type": "application/json",
        })
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return {"ok": True, "id": json.loads(r.read().decode()).get("id")}
        except urllib.error.HTTPError as e:
            code = e.code
            if code == 429:
                # Rate limited (org_write: 1000/day trial, 400/min standard).
                # Respect Retry-After if Pinterest sent it, else exponential backoff.
                retry_after = e.headers.get("Retry-After") if e.headers else None
                wait = float(retry_after) if retry_after else 5 * (2 ** attempt)
                print(f"429 rate-limited, waiting {wait:.0f}s ...", end=" ")
                time.sleep(wait)
                continue
            return {"ok": False, "error": f"HTTP {code}: {e.read().decode()[:200]}"}
    return {"ok": False, "error": "rate limit exhausted retries"}


def main():
    publish = "--publish" in sys.argv
    if not PINS.exists():
        print("no pins manifest at", PINS)
        return
    data = json.loads(PINS.read_text(encoding="utf-8"))
    pins = data["pins"]
    due = [p for p in pins if not p.get("posted")]

    if not TOKEN or not BOARD_ID:
        print(f"Pinterest creds not set. Dry-run of {len(due)} unpinned pins:")
        for p in due:
            print(f"  {p['file']} -> {p['title']}")
        return

    for p in due:
        board = p.get("board_id") or BOARD_ID
        print(f"pinning {p['file']} ...", end=" ")
        if not publish:
            print("(dry-run)")
            continue
        res = create_pin(p, board)
        if res.get("ok"):
            p["posted"] = True
            print("OK", res.get("id"))
        else:
            print("FAIL", res.get("error", ""))
    if publish:
        PINS.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()