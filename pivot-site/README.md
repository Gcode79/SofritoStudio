# Sofrito Studio — Pivot Site (Brand Studio)

Job: 1 · MCP: cloudflare-builds · Last updated: 2026-09-04

Brand foundations for food businesses. Static-first, Cloudflare edge, zero-cost
automation stack. Recipe blog → brand studio.

## Stack (never deviate)

| Layer       | Tool                                        |
|-------------|---------------------------------------------|
| Hosting     | Cloudflare Worker + `[assets]` serving `public/` |
| Database    | D1 (`DB`)                                   |
| Config      | KV (`CONFIG`)                              |
| Async       | Queues `EMAIL_QUEUE` + `WEBHOOK_QUEUE`     |
| Email       | Resend (Worker → Queue → consumer)         |
| Automation  | Make.com (webhook-triggered scenarios)     |
| Payments    | Gumroad (sessions) + Stripe (projects)     |
| Newsletter  | Buttondown                                 |
| AI          | OpenRouter (content, copy)                 |
| CI/CD       | GitHub Actions `deploy.yml`, main = prod   |

## One-time Cloudflare setup (the only manual work)

```bash
npx wrangler login

# 1. Resources
npx wrangler d1 create sofrito-db          # paste database_id into wrangler.toml
npx wrangler kv namespace create sofrito-config   # paste id into wrangler.toml
npx wrangler queues create sofrito-emails
npx wrangler queues create sofrito-webhooks

# 2. Schema + config
npx wrangler d1 migrations apply sofrito-db --remote
bash scripts/seed-kv.sh

# 3. Secrets (also mirrored as GitHub Secrets for CI)
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put MAKE_WEBHOOK_URL
npx wrangler secret put ADMIN_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put GUMROAD_WEBHOOK_SECRET
npx wrangler secret put BUTTONDOWN_API_KEY

# 4. Deploy + go live
npx wrangler deploy                     # deploys to workers.dev subdomain first
# in wrangler.toml set pattern = "sofritostudio.com" and point DNS (CNAME)
# when the pivot is ready to cut over from the retail site.
```

## Local dev

```bash
npx wrangler dev --local
```

## Layout

```
public/            static HTML (Tailwind CDN, hosted by Worker [assets])
src/worker.js      edge logic: /api/* + queue consumers
src/emails/        Resend HTML templates (seeded to KV)
schema.sql         canonical D1 schema (idempotent)
migrations/        numbered D1 migrations
scripts/           seed-kv.sh, content generators
automations/make/  Make.com blueprint JSONs + README
content/queue/     AI-generated posts awaiting deploy
```

## Live system behavior

- Lead form → `/api/contact` → D1 → queues → Resend confirm + owner alert
  + Make.com scenario S1 (Slack/CRM/Sheets) + drip start.
- Drip: Day 2 / 5 / 9 via Make.com scenarios S2–S4.
- Any purchase (Gumroad/Stripe webhook) → `revenue` log (idempotent) → S6.
- Weekly digest (S8) + monthly revenue report (S9) emailed to owner.
- Sunday 6am content pipeline (S10) drafts next week's posts.
- Case studies auto-draft when a project is marked complete (S11).

See `automations/make/README.md` for the scenario catalog.