# Email Automation — Sofrito Studio

How the welcome, post-purchase, and thank-you emails work, and how to turn
them on. **Transactional emails are sent from the business address**
(`hello@sofritostudio.com`) via **Resend** (a simple HTTPS email API) from
the **Cloudflare Worker** — fully serverless on your own domain.

## The funnel

| Stage | Trigger | Email | When |
|---|---|---|---|
| **Welcome** | New subscriber / lead | Freebie welcome + 3-day plan | Immediate |
| **Post-purchase** | Gumroad sale webhook | Personalized "you're in" email | Immediate |
| **Thank you** | 2 days after purchase | Warm thank-you + next-step suggestions | ~48h later |

Every email is bilingual (EN/ES) and personalized per product/tier.

## Architecture

- **Cloudflare Worker** (`cloudflare/src/index.js` + `webhook.js`) — already
  runs on `sofritostudio.com/*` (redirects + JSON-LD). Added routes:
  - `POST /gumroad/webhook` — Gumroad **Sale** → adds buyer to Buttondown
    (metadata + tags) **and** sends the instant post-purchase email via Resend.
  - `POST /lead/webhook` — freebie signup → Buttondown add + welcome email.
  - `GET /health`.
- **Resend** — the email transport. Real business sender
  (`Sofrito Studio <hello@sofritostudio.com>`) with SPF + DKIM on the
  domain. Gmail SMTP can't run inside Workers (no raw TCP), so Resend is
  the transport. Free tier: 3,000 emails/month.
- **Cron workflows** (GitHub Actions) — the thank-you (~48h) and the
  welcome for Buttondown-embed signups run on schedule; `mailer/gmail_sender.py`
  now auto-prefers Resend when `RESEND_API_KEY` is set (falls back to Gmail).
- **Templates** — source of truth: `buttondown/templates/*.md`
  (`mailer/gmail_sender.py` + the Python webhook) and `cloudflare/src/emails.js`
  (the Worker). Keep both in sync when editing copy.

## Getting it live

1. **Resend** (~10 min):
   - Sign up at resend.com → **Add Domain** → `sofritostudio.com`
   - Add the DNS records it gives you (SPF + DKIM) at Cloudflare → save → verify
   - **API Keys → Create** → copy the key
   - Add to `config/.env` + GitHub secret:
     ```
     RESEND_API_KEY=<key>
     RESEND_FROM=hello@sofritostudio.com
     RESEND_FROM_NAME=Sofrito Studio
     ```
   - Test locally: `python mailer/gmail_sender.py welcome you@example.com`
2. **Deploy the Worker** (from the repo, `cloudflare/`):
   ```
   cd cloudflare
   npx wrangler login
   npx wrangler secret put BUTTONDOWN_API_KEY
   npx wrangler secret put RESEND_API_KEY
   npx wrangler deploy
   ```
   Verify: `https://sofritostudio.com/health` → `{"status":"ok"}`
3. **Point Gumroad** at it: Settings → Advanced → Webhooks →
   `https://sofritostudio.com/gumroad/webhook` → event **Sale**.
4. **Add repo secrets**: `BUTTONDOWN_API_KEY`, `RESEND_API_KEY`,
   `RESEND_FROM`, `GUMROAD_ACCESS_TOKEN` (Gmail secrets optional now).
5. **Wire the freebie forms** (optional): point the site lead forms at
   `https://sofritostudio.com/lead/webhook` for instant welcome + tags.

## Notes

- Resend free: 3,000 emails/month, 100/day limit — plenty here.
- Emails come from `Sofrito Studio <hello@sofritostudio.com>` with real
  SPF/DKIM (no "via gmail.com"). Requires `hello@sofritostudio.com` to be a
  verified Resend domain (step 1) and the Cloudflare Email Routing rule
  (`hello@sofritostudio.com` → your inbox) if you want replies.
- The Python webhook (`webhook_server/`) still exists as an optional host
  and uses the same mailer; the Worker is the recommended path.