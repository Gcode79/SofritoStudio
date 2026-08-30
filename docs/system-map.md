# System Map — Sofrito Studio

Created: Phase 0 (read-only audit)
Status: EXISTING SYSTEM DOCUMENTED — NO MODIFICATIONS

---

## Flow Map

USER (browser — mobile/desktop)
↓
CLOUDFLARE (edge hosting, deploy/ static HTML)
↓
WEBSITE / LANDING PAGE (deploy/index.html, deploy/sofrito-recipe.html)
↓
CONTENT / VALUE (recipe pages, blog posts, free lead magnet)
↓
PRODUCT PAGE (deploy/products/*.html — starter-kit, mesa-boricua, etc.)
↓
GUMROAD CHECKOUT (/buy/ redirects — Cloudflare worker handles redirect + tracking)
↓
PURCHASE (Gumroad webhook: cloudflare/src/webhook.js — HMAC verified)
↓
BUTTONDOWN TAGS + POST-PURCHASE EMAIL (buttondown/templates/onboarding.md)
↓
CROSS-SELL / BUNDLE (Buttondown upsell sequences — tripwire.md, seasonal.md)
↓
REPEAT PURCHASE / REPEAT CUSTOMER (future: membership/recurring)

---

## Technology Per Step

Step | Technology | File / Location | External Service | Potential Failure Point
--- | --- | --- | --- | ---
User | Browser | N/A | N/A | Slow initial render, accessibility gaps
Website | Cloudflare Workers + static HTML | deploy/index.html, deploy/*.html, deploy/css/, deploy/js/ | Cloudflare (hosting + edge) | CSP block (fbevents.js — FIXED), redirect failures
Landing Page | Static HTML + JSON-LD injection | deploy/index.html, deploy/sofrito-recipe.html, deploy/recipe-db.html | N/A | Schema errors, broken links, slow load
Content / Value | Markdown source -> static HTML | content-source/, deploy/blog.html | N/A | Thin content, no product CTA, no email capture
Product Page | Static HTML (per product) | deploy/products/starter-kit.html, deploy/products/la-mesa-boricua.html | Gumroad (checkout link) | Checkout redirect broken, no trust signals
Gumroad Checkout | Redirect via /buy/ URL | cloudflare/src/index.js (redirect logic) | Gumroad (checkout, payment, fulfillment) | Webhook misconfiguration, checkout failure, no tracking
Purchase Tracking | Cloudflare webhook | cloudflare/src/webhook.js | Gumroad webhook + Buttondown tags | HMAC verification failure, webhook timeout, duplicate events
Post-Purchase Email | Buttondown automation | buttondown/templates/onboarding.md, lead_magnet.md | Buttondown (email service) | Template errors, segmentation wrong (offer Starter Kit to buyer), email deliverability
Cross-Sell / Bundle | Buttondown sequences | buttondown/templates/tripwire.md, seasonal.md, abandoned_cart.md | Buttondown | Sequence timing wrong, no complementary offer logic
Repeat Purchase | Not fully automated | Buttondown (planned), marketing/content_calendar/ | Buttondown + future membership | No recurring revenue infrastructure

---

## Data Flow Per Step

1. User requests page -> Cloudflare serves static HTML (deploy/)
2. Page loads with JSON-LD (Recipe schema) injected by edge worker (index.js)
3. User clicks product -> /buy/ redirect handled by Cloudflare worker
4. Checkout completes on Gumroad -> webhook POST to /gumroad/webhook
5. Webhook verifies HMAC -> tags applied (customer:<tier>, product:<slug>, lang:en/es)
6. Buttondown sends email based on tags -> onboarding, cross-sell, seasonal
7. User receives email -> can return to site (repeat purchase path)

---

## External Dependencies

- Cloudflare: hosting, edge logic, webhook endpoint
- Gumroad: checkout, payments, fulfillment, webhook source
- Buttondown: email automation, templates, broadcasts
- Meta Pixel (1080764457765905): browser-side tracking
- Meta CAPI (META_CAPI_ACCESS_TOKEN): server-side Purchase + Lead events
- Pinterest: social scheduling (post_scheduler.py — partial, needs browser automation)
- Remotion: video content production (NOT yet integrated)
- GooseWorks: brand research, creative remix, analytics automation (NOT fully integrated)

---

## Potential Failure Points (Verified Gaps)

P0 (Critical):
- Ads scopes not fully granted (user says granted; token needs verification/regeneration with ads_management + ads_read)
- Video content missing (2-3 recipe clips — needed for retargeting + organic)
- Logo transparent background missing (needed for ads + brand consistency)
- Remotion pipeline not integrated (scalable video production missing)
- A/B testing framework missing (no experiment tracking)
- Embedded checkout not implemented (only redirect to Gumroad)
- No automated retargeting audiences (pixel exists, audiences not built)

P1 (Important):
- No centralized analytics dashboard
- No automated analytics reporting
- No automated SEO opportunity discovery
- No automated content gap analysis
- No competitor tracking automation
- No dynamic product recommendations
- No conversion optimization framework
- Pinterest pipeline blocked (Standard access approval needed)

P2 (Medium):
- Performance monitoring missing
- Security scanning missing
- Image optimization pipeline missing
- Font optimization unverified
- Lazy loading unverified
- No Core Web Vitals tracking

P3 (Polish):
- Legacy reference files kept (legacy-site-v1/, legacy-webhook-server/)
- Manual analytics CSV tracking
- No automated performance reports
- No automated dependency vulnerability reports

---

## What Works Well (Verified)

- Static HTML deployment (fast, reliable)
- Cloudflare edge routing (redirects, JSON-LD injection)
- Gumroad checkout integration (verified working, webhook configured)
- Meta Pixel (CSP fixed, detects correctly)
- Meta CAPI (Purchase + Lead events verified: events_received: 1)
- Buttondown email templates (lead magnet, onboarding, tripwire, seasonal, abandoned cart)
- Content calendar automation (30-day bilingual calendar exists)
- Social scheduling (partial — Pinterest via API; IG/TikTok/FB need browser automation)
- SEO schema injection (Recipe schema, sitemap submitted, canonical URLs present)
- Product data structured (JSON, bilingual names, descriptions, prices, tags)
- Brand core analyzed (summary.md + recommendations.md written)

---

## Security / Privacy (Verified)

- Secrets in config/.env (gitignored, not committed)
- Gumroad webhook has HMAC verification
- No customer PII exposed to frontend
- Pixel CSP fixed (fbevents.js allowed, no CSP block)
- No fake social proof or fabricated testimonials

---

## Notes for Implementation

This audit was completed in READ-ONLY mode. No files were modified. The system is verified to be working correctly in its current architecture. The primary gaps are in paid advertising (scopes), video content production, logo assets, A/B testing, and automated analytics — all of which are business/operational gaps rather than technical failures.
