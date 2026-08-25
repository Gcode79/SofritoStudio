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
| **Package follow-ups** | 2, 7 & 14 days after purchase | Package-specific tips + next step | Day 2, 7, 14 |
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
- **Cron workflows** (GitHub Actions):
  - `package-sequences.yml` (+ `mailer/run_package_sequences.py` +
    `mailer/package_sequences.py`) — daily: pulls Gumroad sales from the
    last 16 days and emails the **Day-2 / Day-7 / Day-14** package-specific
    sequence for each purchase (tripwire, core, bundle, addon, seasonal,
    course, membership, product — EN/ES, auto-detected from the buyer's
    language custom field).
  - `reengagement.yml` (+ `mailer/reengagement.py`) — 1st of month: warm
    "still cooking?" email to buyers whose most recent purchase was 21–50
    days ago (fresh cohort each month).
  - `post-purchase-followup.yml` — daily thank-you (~48h).
  - `welcome.yml` — welcomes new Buttondown-embed signups.
  - `mailer/gmail_sender.py` auto-prefers Resend when `RESEND_API_KEY` is
    set (falls back to Gmail).
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
5. **Lead forms are wired** — the freebie pages (5-beginner-recipes,
   pantry-checklist, sazon-guide, holiday-cheat-sheet) submit to
   `https://sofritostudio.com/lead/webhook`, which adds the lead to
   Buttondown (tags + metadata) and sends the instant welcome email via
   Resend.

## Notes

- Resend free: 3,000 emails/month, 100/day limit — plenty here.
- Emails come from `Sofrito Studio <hello@sofritostudio.com>` with real
  SPF/DKIM (no "via gmail.com"). Requires `hello@sofritostudio.com` to be a
  verified Resend domain (step 1) and the Cloudflare Email Routing rule
  (`hello@sofritostudio.com` → your inbox) if you want replies.
- The old FastAPI webhook (`legacy-webhook-server/`) is retired; the Cloudflare Worker handles webhooks
  and uses the same mailer; the Worker is the recommended path.
