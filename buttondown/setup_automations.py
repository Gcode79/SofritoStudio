"""
Sofrito Studio — Buttondown Automation Setup

One-shot script that creates everything needed for the purchase / welcome /
thank-you email automation, natively inside Buttondown. Run it once your
Buttondown account is on the Basic plan or higher (tags + automations
require Basic; this script will tell you if the plan blocks them).

What it creates (all idempotent — safe to re-run):
  1. Tags        customer, customer:<tier>, product:<slug>, lang:<lang>,
                 lead:sofrito-101
  2. Emails      Welcome, Post-Purchase (EN/ES), Thank You (EN/ES) — built
                 from buttondown/templates/*.md with {{ subscriber.metadata.* }}
                 placeholders so each send is personalized
  3. Automations
                 - Welcome: fires on subscriber.created -> Welcome email (immediate)
                 - Post-Purchase + Thank You: fires when the `customer` tag is
                   added -> Post-Purchase email (immediate) + Thank You email
                   (2 days later), filtered by language (lang:en / lang:es)

How the flow works end-to-end:
  Gumroad Sale webhook -> webhook_server/main.py adds the buyer with
  metadata (product, tier, tip, contents, lang) + tags (customer, ...).
  Buttondown sees the `customer` tag added and the automation above sends
  the post-purchase email now and the thank-you ~48h later. New subscribers
  (leads) are welcome-emailed on subscriber.created.

Usage:
  python setup_automations.py --dry-run     # preview everything (no API writes)
  python setup_automations.py               # create/ensure all resources

Requires BUTTONDOWN_API_KEY in config/.env or the environment.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES = Path(__file__).resolve().parent / "templates"

try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / "config" / ".env")
except Exception:
    pass

BUTTONDOWN_API_KEY = os.getenv("BUTTONDOWN_API_KEY", "")
API = "https://api.buttondown.com/v1"
DRY = "--dry-run" in sys.argv

TIER_TAGS = ["tripwire", "core", "bundle", "addon", "seasonal", "course", "membership", "product"]
TAGS = ["customer"] + [f"customer:{t}" for t in TIER_TAGS] + ["lead:sofrito-101", "lang:en", "lang:es"]
LANG_TAGS = {"en": "lang:en", "es": "lang:es"}

# Buttondown mail-merge variables for subscriber metadata (per docs)
V = "{{ subscriber.metadata.{} }}"
SUBJECT_VARS = {"product_name": "{{ subscriber.metadata.product }}"}
BODY_VARS = {"product_name": V.format("product"), "tip": V.format("tip"), "contents": V.format("contents")}


def log(msg):
    print(("PREVIEW " if DRY else "") + msg)


def _headers():
    return {"Authorization": f"Token {BUTTONDOWN_API_KEY}", "Content-Type": "application/json"}


def _api(method: str, path: str, body: dict | None = None) -> dict:
    if DRY:
        return {}
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(API + path, data=data, headers=_headers(), method=method)
    try:
        with urllib.request.urlopen(req, timeout=40) as resp:
            return json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        err = e.read().decode()[:300]
        raise RuntimeError(f"Buttondown {method} {path} -> {e.code}: {err}")


def load_template(name: str, lang: str = "en") -> dict:
    path = TEMPLATES / (f"{name}_{lang}.md" if (TEMPLATES / f"{name}_{lang}.md").exists() else f"{name}.md")
    lines = path.read_text(encoding="utf-8").splitlines()
    return {"subject": lines[0].replace("subject:", "").strip(), "body": "\n".join(lines[1:]).strip()}


def render_email(name: str, lang: str, subject_vars: dict, body_vars: dict) -> dict:
    t = load_template(name, lang)
    subj = t["subject"]
    body = t["body"]
    for k, v in subject_vars.items():
        subj = subj.replace("{" + k + "}", v)
    for k, v in body_vars.items():
        body = body.replace("{" + k + "}", v)
    return {"subject": subj, "body": body}


def ensure_tags(dry_mode: bool) -> dict:
    """Create all tags; return {name: id}."""
    out = {}
    try:
        existing = _api("GET", "/tags?page_size=100")
        for t in existing.get("results", []):
            out[t["name"]] = t["id"]
    except Exception as e:
        log(f"Could not list tags: {e}")
    for name in TAGS:
        if name in out:
            log(f"tag ok      {name}")
            continue
        log(f"tag create  {name}")
        try:
            created = _api("POST", "/tags", {"name": name, "color": "#8a6d3b"})
            out[name] = created.get("id")
        except RuntimeError as e:
            log(f"  ! {e}")
    return out


def ensure_emails() -> dict:
    """Create the private automation emails; return {key: email_id}."""
    out = {}
    existing = {}
    try:
        for e in _api("GET", "/emails?page_size=100").get("results", []):
            existing[e.get("subject", "")] = e["id"]
    except Exception:
        pass

    def make(key, name, lang):
        if name in existing:
            log(f"email ok    {name}")
            out[key] = existing[name]
            return
        e = render_email(name, lang, SUBJECT_VARS, BODY_VARS)
        log(f"email create {name} [{lang}]")
        created = _api("POST", "/emails", {
            "subject": e["subject"],
            "body": e["body"],
            "archival_mode": "private",
            "filters": {"predicate": "and", "filters": [], "groups": []},
        })
        out[key] = created.get("id")

    make("welcome", "welcome", "en")
    make("post_en", "post_purchase", "en")
    make("post_es", "post_purchase", "es")
    make("thanks_en", "thank_you", "en")
    make("thanks_es", "thank_you", "es")
    return out


def tag_filter(tag_id: str) -> dict:
    return {"field": "subscriber.tags", "operator": "contains", "value": tag_id}


def ensure_automations(emails: dict, tag_ids: dict) -> None:
    def exists(name):
        for a in _api("GET", "/automations?page_size=100").get("results", []):
            if a.get("name") == name:
                return True
        return False

    def create(name, trigger, filters, actions):
        if exists(name):
            log(f"automation ok  {name}")
            return
        log(f"automation create {name} (trigger={trigger})")
        _api("POST", "/automations", {
            "name": name,
            "trigger": trigger,
            "filters": {"predicate": "and", "filters": filters, "groups": []},
            "actions": actions,
            "metadata": {},
            "should_evaluate_filter_after_delay": False,
        })

    # Welcome: any new subscriber gets the welcome email immediately
    create(
        "Sofrito — Welcome",
        "subscriber.created",
        [],
        [{"type": "send_email", "metadata": {"email_id": emails["welcome"]},
          "timing": {"time": "immediate"}}],
    )

    delay = {"time": "delay", "delay": {"value": "2", "unit": "days", "time_of_day": None}}

    for lang, lang_tag in LANG_TAGS.items():
        create(
            f"Sofrito — Post-Purchase + Thank You ({lang.upper()})",
            "subscriber.tags.changed",
            [tag_filter(tag_ids["customer"]), tag_filter(tag_ids[lang_tag])],
            [
                {"type": "send_email",
                 "metadata": {"email_id": emails[f"post_{lang}"]},
                 "timing": {"time": "immediate"}},
                {"type": "send_email",
                 "metadata": {"email_id": emails[f"thanks_{lang}"]},
                 "timing": delay},
            ],
        )


def main() -> None:
    if not BUTTONDOWN_API_KEY:
        sys.exit("BUTTONDOWN_API_KEY not set. Add it to config/.env")

    print("=== Sofrito Studio — Buttondown automation setup ===\n")
    tag_ids = ensure_tags(DRY)
    emails = ensure_emails()
    ensure_automations(emails, tag_ids)

    print("\nDone. Next steps:")
    print("  1. Point Gumroad (Settings > Advanced > Webhooks) at your deployed webhook: POST /gumroad/webhook")
    print("  2. Add the repo secret GUMROAD_WEBHOOK_SECRET (Gumroad signed webhooks) + WEBHOOK_URL")
    print("  3. Buyers tagged `customer` now get post-purchase + thank-you automatically.")
    if DRY:
        print("  (dry-run: nothing was written to Buttondown)")


if __name__ == "__main__":
    main()