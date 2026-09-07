# Sofrito Studio — Pivot Business Model

## Core positioning
Brand studio for food businesses — restaurants, CPG brands, food trucks, specialty food. Cultural storytelling through brand identity, websites, and content systems.

## Service tiers

### Tier 1 — Project launches (one-time)
- The Sofrito ($2,500) — brand identity
- The Plato ($5,000) — brand + website
- La Mesa ($7,500) — full brand launch (most booked)

### Tier 2 — Monthly retainers
- Essentials ($1,500/mo) — 8 posts + menu spotlights + review call
- Growth ($2,500/mo) — 16 posts + 1 reel + AI drafts + strategy session
- Fractional ($4,000/mo) — guided brand decisions, vendor supervision, priority launches

### Tier 3 — Digital products (future)
- Brand Your Food Business course ($197-$497) — self-paced
- Template shop ($27-$97) — Canva/Figma templates for food brands
- Sofrito Sessions ($350-$500) — 1:1 strategy call with deliverable

### Digital lead magnet
- The Digital Guide (free) — brand-in-three-weeks method delivered via /api/newsletter

## Stack (preserved from old model)
- Cloudflare Workers (`sofrito-studio`) + D1 + KV CONFIG
- Tailwind CDN + static HTML frontend
- Make webhook (`MAKE_WEBHOOK_URL` secret) — scenario 6162070 (must be turned ON manually)
- Resend (`RESEND_API_KEY`) — email delivery
- Buttondown (`BUTTONDOWN_API_KEY`) — newsletter subscribers
- TikTok Events API (`TEST95993` server-side) + client-side pixel (`DAD07T3C77U98E0UK9L0`)
- GitHub CI (`CLOUDFLARE_API_TOKEN` secret) — deploy on push

## Pipeline (verified end-to-end)
Contact form (201) → D1 lead → webhook (`lead.new`) → Make scenario (ACTIVE 6162070)
Newsletter (`/api/newsletter`) → D1 subscriber + Buttondown + `guide_url` (new digital guide)
Events: `Lead` (contact), `CompleteRegistration` (guide subscribe), `ViewContent` (pages), `ClickButton` (CTAs) — all hashed via `ttq.identify` (client) + Events 2.0 (`TEST95993`) server-side

## Portfolio (3 concept pieces, labeled honestly)
- `/work/sofrito-studio-rebrand.html` — self-case-study (recipe blog → brand studio)
- `/work/spec-concept-01.html` — CPG / salsa concept
- `/work/spec-concept-02.html` — restaurant concept

## Social presence
Footer links live: Instagram (`instagram.com/sofritostudio`), Facebook (`facebook.com/sofritostudio`), Pinterest (`pinterest.com/sofritostudio` — profile link; board ID TODO)

## Old model exclusions (cleaned, verified by pivot-guard.ps1)
- Recipe guides (`01-sofrito-101-guide.md`, `05-sazon-guide.md`) removed
- Old product pages (`coquito-guide.html`) removed
- Old freebie PDF removed
- Endpoint no longer points to old coquito PDF — delivers new digital guide (`digital-guide.md`)
- `PINTEREST_BOARD_ID` still empty (`TODO` in `.env` — profile link used as default)
- TikTok posting token (`TIKTOK_ACCESS_TOKEN`, `CLIENT_KEY`) still empty — analytics only

## Honest gaps
- Portfolio pieces are concept work (clearly labeled in HTML)
- Pinterest board-level feed not set (profile link only)
- TikTok posting requires client auth (not available)
- Make webhook scenario must be turned ON manually (verified URL responds 200, scenario active by user confirmation)
