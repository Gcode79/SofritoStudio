"""
Sofrito Studio — daily analytics log.

Appends one row per run to marketing/analytics/daily.csv:
  date, gumroad_revenue, gumroad_sales, subscribers, notes

Data sources (best-effort; each degrades gracefully when its key is missing):
  Gumroad   GET /v2/sales?after=<today 00:00 UTC>   (GUMROAD_API_TOKEN / GUMROAD_ACCESS_TOKEN)
  Buttondown GET /v1/subscribers                    (BUTTONDOWN_API_KEY)

Run:  python analytics_daily.py [--csv]
"""
import csv
import datetime
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "marketing" / "analytics" / "daily.csv"


def _load_env():
    env = ROOT / "config" / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())


def _get_json(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def _gumroad_revenue():
    token = os.getenv("GUMROAD_API_TOKEN") or os.getenv("GUMROAD_ACCESS_TOKEN", "")
    if not token:
        return None, None
    today = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT00:00:00Z")
    params = urllib.parse.urlencode({"access_token": token, "after": today})
    try:
        data = _get_json("https://api.gumroad.com/v2/sales?" + params)
    except Exception:
        return None, None
    sales = data.get("sales") or []
    revenue = sum(s.get("price", 0) for s in sales) / 100.0
    return round(revenue, 2), len(sales)


def _subscriber_count():
    key = os.getenv("BUTTONDOWN_API_KEY", "")
    if not key:
        return None
    try:
        data = _get_json("https://api.buttondown.com/v1/subscribers", {"Authorization": "Token " + key})
        return data.get("count")
    except Exception:
        return None


def main():
    _load_env()
    revenue, sales = _gumroad_revenue()
    subscribers = _subscriber_count()

    notes = []
    if revenue is None:
        notes.append("gumroad not configured")
    if subscribers is None:
        notes.append("buttondown not configured")

    row = [
        datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
        "" if revenue is None else revenue,
        "" if sales is None else sales,
        "" if subscribers is None else subscribers,
        "; ".join(notes) or "ok",
    ]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    new_file = not OUT.exists()
    with open(OUT, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if new_file:
            w.writerow(["date", "gumroad_revenue", "gumroad_sales", "subscribers", "notes"])
        w.writerow(row)

    print("logged:", row)


if __name__ == "__main__":
    main()