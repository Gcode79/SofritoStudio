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

## Live decisions (proxy-executed 2026-09-08)
- **Session format:** Sofrito Session = 90 minutes at $400 (was 75). $267/hr effective — mid-band for the established-consultant tier (benchmark $300–600 for 90-min); written action plan deliverable keeps it at the upper band; longer runway to convert to Tier-1 packages. Copy updated site-wide, deployed, verified live (version 40c50672).
- **Payment processor:** Stripe for sessions/services/projects. Rationale: the worker.js invoice pipeline already targets the Stripe API (customers, finalize, send_invoice, webhooks); a $400 session costs ~$11.90 (2.9% + $0.30) vs ~$52+ all-in on Gumroad (10% + $0.50 + processing); B2B buyers expect an invoice from Sofrito, not a Gumroad receipt; sessions are services, so merchant-of-record tax comfort is not needed (US services are largely not sales-taxable). Gumroad remains only as the dormant legacy digital-products path.
- **Booking path:** sessions still route via /session.html → contact.html lead pipeline until the Calendly event URL is provided (then KV site/config.session_url swaps the #buy-session button live — site.js already supports it; the hide-when-null regression was removed 2026-09-08). Calendly webhook integration is coded and staged but NOT deployed (sign-off pending).
- **Booking automation (S19, staged):** `/api/calendly-webhook` (worker.js, post-stripe) verifies `Calendly-Webhook-Signature` (`t.v1` hex HMAC-SHA256, 5-min tolerance, mirrors the Stripe parser). `invitee.created` → `calendly_bookings` row (booking_uuid UNIQUE, idempotent via ON CONFLICT DO NOTHING + WHERE NOT EXISTS lead guard) + mirrored lead (channel `calendly`, source `calendly_booking`, status `contacted`, budget $400) + owner email (`booking-notify.html`) + webhook `booking.new`. `invitee.canceled` flips both rows to `cancelled` + `booking-cancel-notify.html` + webhook `booking.cancelled`. Payment handling is gated by KV `config/booking_billing` (default `'none'`) — charge-at-booking ($400 expected at booking) vs invoice-after-call is an owner decision and blocks auto-invoicing. Migration `0004_calendly_bookings.sql` applied to remote D1 on 2026-09-09 (via D1 API + d1_migrations tracking row, since the local wrangler token lacks D1 scope — use the cloudflare-bindings tools or an API token with D1 edit for future migrations). Owner inputs still pending: Calendly 90-min event URL + signing key, Stripe account + STRIPE_API_KEY secret, billing decision.
- **Data hygiene:** `probe.row.0908@example.com` confirmed absent from remote D1 (cleanup done).

## Stack (preserved from old model)
- Cloudflare Workers (`sofrito-studio`) + D1 + KV CONFIG
- Tailwind CDN + static HTML frontend
- Zapier catch hook (`WEBHOOK_URL` secret) — lead -> Google Sheets + owner email
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

## Research gate & content rules (standing, enforced)
- **Rule:** every decision on this business is made 100% according to research; content best
  practices from the research base are applied before any content is committed. No content post
  goes out without a researched image at platform-exact spec.
- **Niche & lead rule:** all content is Sofrito Studio niche (food-business branding) and
  advertises sofritostudio.com. Chain: content → site visit → lead (free guide via
  `/api/newsletter`, contact form, or session) → prospect → customer. More leads = more visits =
  more potential customers.
- Authority: `content-guidelines.md` (this file) — specs, format mix, gate checks. Generators in
  `pivot-site/scripts/` fail non-zero when the gate is unmet.
- **Pivot confinement (standing, immutable):** the pivot business model — Strategy Sessions,
  project launches, retainers, free Digital Guide lead magnet — is FIXED. All future decisions and
  asset work are confined to it. Legacy assets may only be ALTERED to fit the pivot model; nothing
  may restore, resurrect, or re-market the old retail/cookbook model ($47 products, product pages,
  recipe-store CTAs). Recipes/content exist solely as top-of-funnel traffic steered to the studio.
- **Big-decision sign-off (standing):** any major decision (deploys, commits, pricing, launches,
  external billing, campaign spend) is run by the owner BEFORE implementation. Approved asset
  imports and read-only research proceed autonomously.
