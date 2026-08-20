# Sofrito Studio — E-Commerce Growth Stack

Automated infrastructure selling Puerto Rican recipe PDF guides:
**Cloudflare** (edge) + **Gumroad** (products/payments) + **Buttondown** (email).

## Structure

```
├── cloudflare/
│   ├── wrangler.toml          # Cloudflare Workers configuration
│   └── src/
│       └── index.js           # Edge redirects & JSON-LD schema injection
├── webhook_server/
│   ├── main.py                # FastAPI listener (Gumroad webhook -> Buttondown API)
│   └── requirements.txt       # fastapi, uvicorn, requests, python-dotenv
├── buttondown/
│   ├── send_broadcast.py      # Schedule/send email campaigns
│   └── templates/
│       ├── lead_magnet.md     # Free starter kit email template
│       └── onboarding.md      # Post-purchase 3-step sequence
├── social_automation/
│   ├── post_scheduler.py      # Social media API / Playwright scheduling
│   ├── generate_calendar.py   # Builds the 30-day bilingual calendar
│   └── content_calendar.json  # 30-day bilingual captions, tags, reel scripts
├── config/
│   └── .env.example           # API keys (Gumroad, Buttondown, Cloudflare, …)
└── README.md                  # This file
```

## Quick Start

1. **Set up environment:**
   ```
   copy config\.env.example config\.env
   ```
   Fill in `config/.env` with your real keys. Never commit `.env`.

2. **Generate the 30-day bilingual content calendar:**
   ```
   cd social_automation
   python generate_calendar.py
   python post_scheduler.py --dry-run      # preview
   python post_scheduler.py --day 2026-08-20
   ```

## Per-Component Guide

### 1. Cloudflare (`cloudflare/`)
Single worker (`src/index.js`) doing two jobs at the edge:
- **Redirects:** `/buy/mesa` → Gumroad checkout (301), legacy anchor redirects, A/B offer links.
- **JSON-LD:** injects Recipe schema into static recipe pages for rich results.

```bash
cd cloudflare
npm install
npx wrangler dev src/index.js --port 8787   # local
npx wrangler deploy                          # requires CF_API_TOKEN or wrangler login
```

### 2. Webhook Server (`webhook_server/`)
FastAPI app receiving Gumroad **sale** webhooks → adds buyer to Buttondown with
tags (`customer:<tier>`, `product:<slug>`, `lang:es`) and sends a bilingual
post-purchase email. A second endpoint `/lead/webhook` tags free lead-magnet
signups as `lead:sofrito-101`.

```bash
cd webhook_server
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

**Wire Gumroad:** Settings → Advanced → Webhooks → `https://your-app.com/gumroad/webhook` → event **Sale**.

### 3. Buttondown (`buttondown/`)
Send/schedule email campaigns from Markdown templates. Available flows:
`lead_magnet`, `tripwire` (free → $9 Starter Kit in 48h), `onboarding`
(post-purchase + Full Table upsell), `abandoned_cart`, `seasonal`
(Thanksgiving / Nochebuena / San Sebastián).

```bash
cd buttondown
python send_broadcast.py --demo                     # preview templates
python send_broadcast.py --flow onboarding --to you@example.com
python send_broadcast.py --flow tripwire --lang es
python send_broadcast.py --flow seasonal --holiday san-sebastian --lang es
```

### 4. Social Automation (`social_automation/`)
`content_calendar.json` holds 30 days of bilingual captions, hashtags, Reels
voiceover scripts, and image prompts. `post_scheduler.py` publishes (Pinterest
v5 via API; Instagram/TikTok/Facebook need browser automation — see the script).

### 5. Config (`config/`)
All API keys via `config/.env` (see `.env.example`).

## Security & Honesty
- Secrets live in `config/.env` (git-ignored). Required: `BUTTONDOWN_API_KEY`,
  `GUMROAD_ACCESS_TOKEN`, `CF_API_TOKEN`.
- All marketing copy avoids fabricated social proof (no fake "500+ cooks" or
  invented testimonials).
