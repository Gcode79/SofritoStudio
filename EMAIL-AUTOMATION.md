# Email Automation — Sofrito Studio

How the welcome, post-purchase, and thank-you emails work, and how to turn
them on. **Transactional emails are sent from a business address**
(`hello@sofritostudio.com`) via Gmail SMTP using your Gmail + an App
Password — that's what lets us send personalized one-off emails (the
Buttondown API can't; it's broadcast-only).

## The funnel

| Stage | Trigger | Email | When |
|---|---|---|---|
| **Welcome** | New subscriber / lead | Freebie welcome + 3-day plan | Immediate |
| **Post-purchase** | Gumroad sale webhook | Personalized "you're in" email | Immediate |
| **Thank you** | 2 days after purchase | Warm thank-you + next-step suggestions | ~48h later |

Every email is bilingual (EN/ES) and personalized per product/tier.

## How it runs

- **Gmail sender** (`mailer/gmail_sender.py`) — renders the templates and
  sends via `smtp.gmail.com` (SSL). Reads `GMAIL_USER` / `GMAIL_APP_PASSWORD`
  from `config/.env` or env vars (GitHub Actions secrets). Stdlib only —
  no `pip install` needed in workflows.
- **Webhook server** (`webhook_server/main.py`) — FastAPI. On a Gumroad
  **sale** (`POST /gumroad/webhook`) it (1) adds the buyer to Buttondown
  with metadata + tags for list capture, and (2) sends the personalized
  post-purchase email via Gmail immediately. `POST /lead/webhook` does the
  same for leads + the welcome email.
- **Thank-you follow-up** (`.github/workflows/post-purchase-followup.yml`) —
  daily cron: pulls Gumroad sales from 2 days ago, emails each buyer the
  thank-you via Gmail.
- **Welcome for embed signups** (`.github/workflows/welcome.yml`) — every
  15 min: new Buttondown subscribers get the welcome via Gmail.
- **Templates** (`buttondown/templates/*.md`) — the copy. Format:
  `subject:` line, then body with `{var}` placeholders
  (`product_name`, `tip`, `contents`).
- **Optional Buttondown native automations** (`buttondown/setup_automations.py`)
  — only if you later upgrade to Basic; the Gmail path above needs no paid
  plan and is the recommended default.

## Getting it live

0. **Business From address** (so emails say `Sofrito Studio <hello@sofritostudio.com>`,
   not your personal Gmail):
   - Cloudflare dashboard → **Email → Email Routing → Custom addresses** →
     add `hello@sofritostudio.com` → forward to `j.ortiz1148@gmail.com`
     (the domain already uses Cloudflare Email Routing — MX confirmed)
   - Gmail → Settings → **Accounts and Import → Send mail as → Add another
     email address** → enter `hello@sofritostudio.com` → the verification
     email lands in your Gmail via the forwarding → click the verify link
   - `config/.env` already has `GMAIL_FROM=hello@sofritostudio.com`; add the
     same as the `GMAIL_FROM` GitHub secret
1. **Gmail App Password** (one-time, 2 min):
   - Enable 2-Step Verification at myaccount.google.com/security
   - myaccount.google.com/apppasswords → create one for "Mail" (16 chars)
   - Add to `config/.env` (and to GitHub secrets):
     ```
     GMAIL_USER=j.ortiz1148@gmail.com
     GMAIL_APP_PASSWORD=<16-char app password>
     GMAIL_FROM=hello@sofritostudio.com
     ```
   - Test locally: `python mailer/gmail_sender.py welcome you@example.com`
2. **Deploy the webhook server** (Render / Railway / Fly.io / VPS):
   ```
   cd webhook_server
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 5000
   ```
3. **Point Gumroad at it**: Settings → Advanced → Webhooks →
   `https://<your-app>/gumroad/webhook`, event `Sale`. (Optional: signed
   webhooks → set `GUMROAD_WEBHOOK_SECRET`.)
4. **Add repo secrets** (Settings → Secrets and variables → Actions):
   `BUTTONDOWN_API_KEY`, `GUMROAD_ACCESS_TOKEN`, `GMAIL_USER`,
   `GMAIL_APP_PASSWORD`, `GMAIL_FROM`, `WEBHOOK_URL`.
5. **(Optional) Wire the freebie forms** on the site to the deployed
   `POST /lead/webhook` so signups get the instant welcome + tags.

## Notes

- Gmail free quota: 500 emails/day — more than enough.
- Emails come from `Sofrito Studio <hello@sofritostudio.com>` (your domain
  alias). Some recipients may see "via gmail.com" since the transport is
  Gmail; for zero "via" + max deliverability later, switch the transport to
  Resend / Google Workspace with SPF + DKIM on the domain (the sender module
  is transport-agnostic).
- The webhook is the only piece that needs hosting; the welcome and
  thank-you crons run free on GitHub Actions.
- Don't re-run `setup_automations.py` expecting template updates — edit
  created emails in the Buttondown dashboard instead.