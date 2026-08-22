"""
Sofrito Studio — Instagram + Facebook content publisher.

Reads marketing/content/queue.json and publishes due posts to Instagram
(IG Business API) and Facebook (Page photos) using the Meta Graph API.

Requires (config/.env or env):
  META_ACCESS_TOKEN          (long-lived token with scopes: instagram_basic,
                              instagram_content_publish, pages_show_list,
                              pages_manage_posts)
  META_PAGE_ID               (optional — auto-resolved from the token if empty)
  META_INSTAGRAM_ACCOUNT_ID  (optional — auto-resolved from the page if empty)

Usage:
  python marketing/post_to_meta.py --dry-run     # show what's due (default)
  python marketing/post_to_meta.py --publish     # actually post due items
  python marketing/post_to_meta.py --publish --platform instagram
"""

import os
import sys
import json
import datetime
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUEUE = ROOT / "marketing" / "content" / "queue.json"
CONFIG = ROOT / "config" / ".env"
API = "https://graph.facebook.com/v21.0"


def load_env():
    if CONFIG.exists():
        for line in CONFIG.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())


load_env()

TOKEN = os.getenv("META_ACCESS_TOKEN", "").strip()
PAGE_ID = os.getenv("META_PAGE_ID", "").strip()
IG_ID = os.getenv("META_INSTAGRAM_ACCOUNT_ID", "").strip()


def graph(path, params) -> dict:
    params["access_token"] = TOKEN
    url = f"{API}/{path}?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=40) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"error": e.read().decode()[:300]}


def resolve_page_and_ig():
    """Auto-resolve the Facebook page id (from the token) and the linked
    Instagram business account id. Both are optional if already configured."""
    page_id = PAGE_ID
    if not page_id:
        accounts = graph("me/accounts", {"fields": "id,name"})
        pages = accounts.get("data") or []
        if pages:
            page_id = pages[0]["id"]
    if not page_id:
        return None, None
    ig_id = IG_ID
    if not ig_id:
        info = graph(page_id, {"fields": "instagram_business_account"})
        iba = info.get("instagram_business_account") or {}
        ig_id = iba.get("id")
    return page_id, ig_id


def post_instagram(image_url, caption):
    created = graph(f"{IG_ID}/media", {"image_url": image_url, "caption": caption})
    if "error" in created:
        return created
    cid = created.get("id")
    if not cid:
        return {"error": "no creation id"}
    published = graph(f"{IG_ID}/media_publish", {"creation_id": cid})
    if "error" in published:
        return published
    return {"ok": True, "media_id": published.get("id")}


def post_facebook(image_url, caption):
    data = urllib.parse.urlencode({
        "url": image_url, "caption": caption, "access_token": TOKEN,
    }).encode()
    req = urllib.request.Request(f"{API}/{PAGE_ID}/photos", data=data)
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return {"ok": True, "id": json.loads(r.read().decode()).get("id")}
    except urllib.error.HTTPError as e:
        return {"error": e.read().decode()[:300]}


def due_posts(posts, platform=None):
    now = datetime.datetime.now(datetime.timezone.utc)
    out = []
    for p in posts:
        if p.get("posted"):
            continue
        if platform and p.get("platform") != platform:
            continue
        try:
            dt = datetime.datetime.fromisoformat(p["datetime"])
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=datetime.timezone.utc)
        except Exception:
            continue
        if dt <= now:
            out.append(p)
    return out


def main():
    global PAGE_ID, IG_ID  # auto-resolve may rewrite these
    publish = "--publish" in sys.argv
    platform = None
    if "--platform" in sys.argv:
        platform = sys.argv[sys.argv.index("--platform") + 1]

    if not QUEUE.exists():
        print("no queue at", QUEUE)
        return
    posts = json.loads(QUEUE.read_text(encoding="utf-8")).get("posts", [])

    due = due_posts(posts, platform)
    if not due:
        print("nothing due.")
        return

    if not (TOKEN and PAGE_ID and IG_ID):
        if not TOKEN:
            print("META_ACCESS_TOKEN not set (config/.env). Dry-run of due posts only:")
            for p in due:
                print(f"  [{p['platform']}] {p['id']} {p['datetime']} {p['image_url']}")
            return
        # Token present but page/IG ids missing — auto-resolve from the token.
        page_id, ig_id = resolve_page_and_ig()
        if not page_id or not ig_id:
            print(f"Could not auto-resolve page/IG ids. Set META_PAGE_ID + META_INSTAGRAM_ACCOUNT_ID in config/.env.")
            print("Dry-run of due posts only:")
            for p in due:
                print(f"  [{p['platform']}] {p['id']} {p['datetime']} {p['image_url']}")
            return
        PAGE_ID, IG_ID = page_id, ig_id
        print(f"resolved PAGE_ID={PAGE_ID} IG_ID={IG_ID}")

    for p in due:
        print(f"posting [{p['platform']}] {p['id']} ...", end=" ")
        if not publish:
            print("(dry-run, would post)")
            continue
        if p["platform"] == "instagram":
            res = post_instagram(p["image_url"], p["caption"])
        else:
            res = post_facebook(p["image_url"], p["caption"])
        if res.get("ok"):
            p["posted"] = True
            print("OK", res.get("id") or res.get("media_id"))
        else:
            print("FAIL", res.get("error", ""))

    QUEUE.write_text(json.dumps({"posts": posts}, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()