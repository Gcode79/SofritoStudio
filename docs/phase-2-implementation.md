# Phase 2 — Premium Storefront Landing-Page Re-Engineering

Status: IN PROGRESS (working — no production deploy)
Branch: `feature/phase-2-premium-storefront`
Owner: CTO / Principal Engineer
Date: 2026-08-30

---

## Objective

Elevate the Sofrito Studio homepage (`deploy/index.html`) into a premium,
mobile-first, conversion-focused storefront. Per user sign-off, we **preserve the
existing section architecture** and refine rather than rebuild: design tokens,
typography/spacing, CTA hierarchy, video/trust/proof polish, and conversion detail.
No framework migration. Preserve Gumroad, Cloudflare, analytics, and email infra.

## Hard rules honored (from `/.opencode/instructions.md`)

- **Mobile responsiveness is inviolable** — any desktop-only styling lives inside
  `@media (min-width: 961px)`; never change `<=960px` behavior.
- **Zero dead-end CTAs** — every buy/unlock button must resolve to a published,
  purchasable Gumroad product; unpublished renders as Coming Soon/waitlist.
- **Attribution + schema integrity** — keep UTMs flowing to checkout; edge JSON-LD
  deduplicated (no duplicate `@type: Recipe`); hreflang complete on bilingual pairs.
- **Verify before deploy** — `node --check` changed JS; run the 10/10 harness
  (`python scripts/verify_all.py`) if it exists before any deploy. No production deploy.
- **Truth-teller** — no invented business/analytics claims (budget/stats = UNKNOWN).

## Prescribed CTA ladder (confirmed)

1. **La Mesa Boricua — $47** (primary)
2. **Starter Kit — $9** (secondary / low-friction entry)
3. **Free Sofrito 101** (tertiary / lead magnet)

## Mapping: plan section -> homepage location

| Phase-2 workstream | Primary target in `deploy/index.html` |
|---|---|
| Design tokens / typography / color | `deploy/css/style.css` (+ `style.min.css` mirrors) |
| Hero + CTA hierarchy | `.hero`, `.actions`, `.mobile-cta-bar` |
| Video / tutorial showcase | `.video-showcase`, `.video-wrapper` |
| Trust strip / social proof | `.trust-strip`, `.social-proof-bar` |
| Offer ladder / product cards | `#products .grid`, `.card` |
| Quiz / calculator | `#calculator`, `quiz.html` |
| Proof / testimonials | `#testimonials` |
| Family story | `#founder` |
| Final CTA / cross-sell | `.cross-sell`, `#freebie` |
| Mobile, a11y, performance, SEO, analytics | global + `<head>` JSON-LD |

## Implementation steps (incremental)

1. **Design tokens** — introduce/align CSS custom properties for color, space,
   radius, shadow, type scale. Keep the existing palette (warm neutral + accent +
   gold + charcoal `--ink`).
2. **Hero** — reinforce the La Mesa primary CTA, tighten the headline/sub-copy,
   keep trust items, ensure the mockup and bg load smoothly (already `fetchpriority=high`).
3. **Video** — keep the existing `<video>` + bilingual captions; verify poster,
   play overlay, badges; ensure no dead-end play.
4. **Trust/proof** — keep trust strip, social proof, testimonial cards; refine
   copy for specificity without inventing stats.
5. **Offer ladder** — keep the 4 product cards + compare table; confirm correct
   Gumroad destinations and the CTA ordering (La Mesa prominent).
6. **Quiz/calculator** — reuse `quiz.html` + `#sofritoCalculator`; verify the
   result mapping to products.
7. **Conversion details** — verify sticky mobile CTA bar, exit popup, freebie
   magnet, cross-sell all resolve to live/available products.
8. **SEO / structured data** — confirm the 5 product JSON-LD + FAQ + VideoObject
   + Organization blocks are present and deduped; keep hreflang intact.
9. **Analytics** — confirm GA4 events (buy/signup/video) fire via `SITE_CONFIG.ga4Id`
   in `js/main.js`; Meta pixel + CAPI intact.
10. **A11y / performance** — check skip link, aria labels, alt text, `loading=lazy`
    on below-fold images, contrast, keyboard toggles.

## Verification

- Re-run any existing harness (`python scripts/verify_all.py`, 10/10) if present.
- `node --check` on any changed JS.
- Manual browser check on mobile (`<=960px`) and desktop (`>=961px`).
- No `wrangler deploy`. Production untouched.

## Out of scope

- Framework migration
- Gumroad / Cloudflare / analytics / email re-architecture
- Invented business claims; fabricated stats
- Production deploy of this branch
