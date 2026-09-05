# Make.com Automation Playbook — Sofrito Studio

Scenarios are wired against the worker's webhooks. The worker already sends a
`lead.new` event to `MAKE_WEBHOOK_URL` on every contact-form submission. Keep
that URL in the worker secret, never in this repo.

## Secret inputs (worker / Make, never commit)
| Secret | Where | Used by |
|---|---|---|
| `MAKE_WEBHOOK_URL` | worker secret | S1–S4, S9 |
| `RESEND_API_KEY` | worker secret | S5 (or worker drip) |
| `BUTTONDOWN_API_KEY` | worker secret | newsletter subscribe |

## General rules
- Every scenario must be idempotent: the worker's `lead.new` dedupes on
  `email + created_at`; Make should re-check with a "no response found" guard on
  its own search step.
- Language: keep footer copy bilingual (EN/ES), PR register.
- Never log the full `MAKE_WEBHOOK_URL` — log `scenario` + `lead.email` only.

## Scenario inventory
| # | Name | Trigger | Purpose |
|---|------|---------|---------|
| S1 | New lead → Notion/Sheets | HTTP `lead.new` | Human CRM log |
| S2 | `lead.won` → email | HTTP `lead.won` | Celebrate the close |
| S3 | Discussion starter | HTTP `lead.new` | Quick personal 1st reply draft |
| S4 | Onboarding pack | HTTP `lead.won` | Send welcome assets |
| S5 | Owner 24h reminder | HTTP `lead.new` + timeout | Escalate un-replied leads (also in worker cron) |
| S6 | Monthly analytics | Cron (1st of month) | Numbers to owner email |
| S7 | Weekly content publish | Cron (Mon 13:00 UTC) | Publish `content/queue/social-week-*` |
| S8 | A/B test export | Cron (Sun) | Pull variant stats |
| S9 | Testimonial request | HTTP `lead.won` + 30d | Ask for a review |
| S10 | Newsletter digest | Cron (weekly) | Send newsletter draft to owner review |
| S11 | Promo scheduler | Cron (holiday seasonal) | Send promo to Buttondown list |

## Setup checklist
1. Create each scenario in Make from `scenarios/*.json` (custom webhook trigger).
2. Register one webhook per scenario that needs `lead.new` — or forward from the
   single webhook by filtering on `eventType`, whichever you prefer.
3. Set the HTTP Authorization header to a per-scenario token you generate
   (`openssl rand -hex 32`). The worker appends `makeKey` — add a `.env` var if
   you want Make to verify it.
4. S10 and S11 write to Buttondown via its Buttondown API (API key above).

## Scenarios detail
### S1 — New lead → Notion/Sheets
Webhook → Parse JSON → Find-or-create Notion page on `ti_lead` database.
Fields: name, email, phone, business_name, business_type, package_interest,
budget, score, message, channel, created_at. Guard: skip if email exists in last
90 days.

### S2 — lead.won → email
Webhook → Parse JSON → Search Notion for email → Update status "won" → Resend
email `lead-won.html` (in `src/emails/`).

### S3 — Discussion starter
Webhook → Parse JSON → Build first-reply draft (copy in `prompts/first-reply.md`)
→ Output to the owner email as a draft, never send automatically.

### S4 — Onboarding pack
Webhook `lead.won` → Fetch `src/emails/onboarding-pack.html` → Enrich with
`siteUrl`, `lead.name`, `lead.business_name` → Send via Resend to the new client.

### S5 — Owner 24h reminder
Webhook `lead.new` → wait 24h → check Notion status still "new" → email owner
(`follow-up-lead-reminder.html`). Redundant with the worker cron; keep whichever
runs.

### S6 — Monthly analytics
Cron (1st, 09:00 UTC) → Pull D1 view `v_pipeline` via worker `/api/dashboard`
(ADMIN_KEY) → Format → email to `NOTIFICATION_EMAIL`.

### S7 — Weekly content publish
Cron (Mon 13:00 UTC) → Read newest file in `content/queue/social-week-*` →
Publish to the chosen channel modules (Instagram, TikTok, LinkedIn) → Mark file
as `published/`.

### S8 — A/B test export
Cron (Sun 20:00 UTC) → Pull `v_top_content` or platform data → CSV via
Google Sheets → send email with the CSV attached.

### S9 — Testimonial request
Webhook `lead.won` → wait 30 days → send `follow-up-day30.html` (exists) → on
reply, store in a Notion "testimonials" db for review.

### S10 — Newsletter digest
Cron (weekly) → Read latest `content/queue/newsletter-*` → create Buttondown
draft → email owner a review link.

### S11 — Promo scheduler
Cron (configure once) → Read `prompts/promo-*.md` → Buttondown newsletter
campaign to the two lists (web + extra) → log to Notion.

## Conventions honored
- Money as integer cents; never flatten to floats in Make.
- All emails come from `RESEND_FROM` (`hello@sofritostudio.com`).
- Publishing never blocks on the worker; Make is the orchestrator for timed sends.