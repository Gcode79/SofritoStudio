"""
Sofrito Studio — Gmail sender + email rendering (shared)

Sends the welcome / post-purchase / thank-you emails from Gmail over SMTP
using an App Password (no Buttondown API limit on one-off sends). Used by:
  - webhook_server/main.py   (instant post-purchase + welcome)
  - .github/workflows/*.yml  (welcome cron + daily thank-you follow-up)

Setup (one-time, in your Google account):
  1. Turn on 2-Step Verification
  2. Google Account > Security > 2-Step Verification > App passwords
     (or https://myaccount.google.com/apppasswords)
  3. Create an app password for "Mail"
  4. Add to config/.env:
        GMAIL_USER=j.ortiz1148@gmail.com
        GMAIL_APP_PASSWORD=<16-char app password>

Sending quota: 500 emails/day for a free Gmail account (plenty here).
"""

import os
import re
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES = Path(__file__).resolve().parent.parent / "buttondown" / "templates"
CONFIG = ROOT / "config" / ".env"

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465  # SSL


def load_env():
    def read(path, overwrite=False):
        if path.exists():
            for line in path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    if overwrite and v.strip():
                        os.environ[k.strip()] = v.strip()
                    elif not overwrite:
                        os.environ.setdefault(k.strip(), v.strip())

    read(CONFIG)                      # config/.env first (defaults)
    read(ROOT.parent / "gmail-automation" / ".env", overwrite=True)  # gmail creds override


load_env()

GMAIL_USER = os.getenv("GMAIL_USER", "").strip()
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "").strip()

# Business "From" address. When set to a domain alias (e.g.
# hello@sofritostudio.com) Gmail sends as that address — it must be added
# and verified under Gmail > Settings > Accounts > "Send mail as" (and the
# domain must have email routing so the verification email arrives).
# Falls back to GMAIL_USER when unset.
GMAIL_FROM = os.getenv("GMAIL_FROM", "").strip() or GMAIL_USER
SITE_FROM_NAME = os.getenv("SITE_FROM_NAME", "Sofrito Studio").strip()

# Resend (transactional email API) — preferred transport when set. Works
# from anywhere (Workers, GH Actions, the local webhook) with real business
# deliverability on hello@sofritostudio.com.
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
RESEND_FROM = os.getenv("RESEND_FROM", "hello@sofritostudio.com").strip()
RESEND_FROM_NAME = os.getenv("RESEND_FROM_NAME", "Sofrito Studio").strip()


# ------------------------------------------------------------------
# Rendering
# ------------------------------------------------------------------
def load_template(name: str, lang: str = "en") -> dict:
    """Load a template: first line `subject: ...`, then body with {var}s."""
    path = TEMPLATES / f"{name}_{lang}.md"
    if not path.exists():
        path = TEMPLATES / f"{name}.md"
    lines = path.read_text(encoding="utf-8").splitlines()
    return {"subject": lines[0].replace("subject:", "").strip(),
            "body": "\n".join(lines[1:]).strip()}


def render(name: str, lang: str = "en", **vars_) -> tuple[str, str]:
    t = load_template(name, lang)
    subj = t["subject"]
    body = t["body"]
    for k, v in vars_.items():
        subj = subj.replace("{" + k + "}", str(v))
        body = body.replace("{" + k + "}", str(v))
    return subj, md_to_text(body)


def md_to_text(md: str) -> str:
    """Minimal markdown -> readable plain text for Gmail."""
    md = md.replace("**", "")
    md = re.sub(r"^###?\s*", "", md, flags=re.M)
    md = re.sub(r"^[-*]\s+", "• ", md, flags=re.M)
    # inline links: [text](url) -> text (url)
    md = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", md)
    return "\n".join(line.rstrip() for line in md.splitlines()).strip()


# ------------------------------------------------------------------
# Sending
# ------------------------------------------------------------------
def send_gmail(to: str, subject: str, body: str, reply_to: str | None = None) -> None:
    if not (GMAIL_USER and GMAIL_APP_PASSWORD):
        raise RuntimeError("GMAIL_USER / GMAIL_APP_PASSWORD not set in config/.env")

    msg = EmailMessage()
    msg["From"] = f"{SITE_FROM_NAME} <{GMAIL_FROM}>"
    msg["To"] = to
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)

    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=30) as server:
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.send_message(msg)


def send_resend(to: str, subject: str, body: str, reply_to: str | None = None) -> None:
    """Send via Resend (HTTPS API). Requires RESEND_API_KEY."""
    if not RESEND_API_KEY:
        raise RuntimeError("RESEND_API_KEY not set")

    import json as _json
    import urllib.request as _ur

    payload = {
        "from": f"{RESEND_FROM_NAME} <{RESEND_FROM}>",
        "to": [to],
        "subject": subject,
        "text": body,
    }
    if reply_to:
        payload["reply_to"] = [reply_to]
    req = _ur.Request(
        "https://api.resend.com/emails",
        data=_json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "sofrito-studio/1.0",  # Resend blocks requests without a UA (403/1010)
        },
        method="POST",
    )
    try:
        with _ur.urlopen(req, timeout=30) as resp:
            if resp.status not in (200, 201):
                raise RuntimeError(f"Resend error {resp.status}")
    except _ur.HTTPError as e:
        raise RuntimeError(f"Resend error {e.code}: {e.read().decode()[:300]}")


def send_email(to: str, subject: str, body: str, reply_to: str | None = None) -> None:
    """Transport-aware send: Resend if configured, else Gmail."""
    if RESEND_API_KEY:
        return send_resend(to, subject, body, reply_to)
    return send_gmail(to, subject, body, reply_to)


def send_flow(name: str, to: str, lang: str = "en", **vars_) -> None:
    """Render + send a template email. Returns nothing; raises on failure."""
    subject, body = render(name, lang, **vars_)
    send_email(to, subject, body)


if __name__ == "__main__":
    import sys
    # CLI: python mailer/gmail_sender.py <template> <to> [lang] [key=value ...]
    if len(sys.argv) < 3:
        sys.exit("usage: python mailer/gmail_sender.py <template> <to> [lang] [k=v ...]")
    name, to = sys.argv[1], sys.argv[2]
    lang = sys.argv[3] if len(sys.argv) > 3 else "en"
    vars_ = dict(a.split("=", 1) for a in sys.argv[4:])
    subject, body = render(name, lang, **vars_)
    print("subject:", subject)
    print("body:", body)
    print("--- sending ---")
    send_gmail(to, subject, body)
    print("sent")