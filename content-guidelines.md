# Sofrito Studio — Content & Image Standard (Researched, Enforced)

> **Standing rule:** every decision on this business is made 100% according to research.
> **No content ships without a researched, platform-exact image.**
> A post with text but no image is never published. These specs are the authority;
> the generators in `pivot-site/scripts/` enforce them (see "The Gate").

---

## 1. Why images (evidence, not opinion)

- **Picture superiority** is the core mechanism: images win attention before a word is read.
  Journal of Marketing (2021), analysis of 34,610 posts: higher text-to-image ratio → fewer
  likes *and* fewer comments (Instagram effect stronger than Facebook).
- **Images beat text-only posts on engagement** (2025–26 platform medians, independently sourced):
  - LinkedIn: image 2.13% vs text 1.54% (single image); 1–2 images ≈ +68% engagement.
  - Instagram feed: image posts median 3.85% engagement — the highest feed format for interaction.
  - Facebook: image posts median 5.2% engagement (highest median of all Facebook formats).
  - X: posts with images +~20% engagement vs text-only.
- **Email: images earn +42% CTR over text-only** (BounceCheck); image-heavy emails do NOT
  meaningfully hurt opens (Flodesk 2026, 14.3B deliveries — text:image ratio explains only
  0.3% of campaign variance). The 80/20 "text-first" rule is badly over-applied: for
  food/eCommerce (psychologically-near, sensory products), image-forward wins.
- **Reach vs engagement tradeoff (known pitfall):** Reels reach 2.25× single images on Instagram,
  but engagement/person is lower than carousels/images. Pick the format by the goal — reach plays
  get video, engagement plays get image/carousel.

## 2. Platform-exact image specs (2026, Hootsuite/current platform guidance)

Standard shared width: **1080px** (export @2x where applicable).

| Surface | Ratio | Exact pixels | Notes |
|---|---|---|---|
| Instagram feed (default) | 4:5 | 1080×1350 | Best feed reach on mobile; use for products/recipes |
| Instagram feed (square fallback) | 1:1 | 1080×1080 | Crops safely everywhere |
| Instagram stories / Reels | 9:16 | 1080×1920 | Keep key content within 1080×1680 safe zone |
| Facebook feed | 1:1 / 4:5 | 1080×1080 / 1080×1350 | Same asset as IG is fine |
| Facebook cover | — | 851×315 | Page-level only |
| Facebook story | 9:16 | 1080×1920 | |
| LinkedIn single-image post | 1:1 | 1200×1200 | Best-performing LinkedIn feed format |
| LinkedIn landscape / link | 1.91:1 | 1200×627 | Link share card |
| LinkedIn carousel / document | — | 4–8 slides, 1200×1200 first slide | **Carousels are the #1 LinkedIn format** (21.77% median ER; +585% vs text) — use for process/recipes |
| X in-stream | 16:9 | 1600×900 | Full-width crop |
| X card | 1.91:1 | 1200×628 | |
| Pinterest | 2:3 | 1000×1500 | Best-performing Pinterest ratio; max file 20MB |
| TikTok | 9:16 | 1080×1920 | Center-frame captions; leave 240px top/bottom for UI |

**Text-on-image rules (every platform):** one idea per image; ≤3 short lines; headroom for
platform UI; never put the CTA inside the image (email) — always as live text.

## 3. Link previews (Open Graph — every page, unique per page)

- Exact size **1200×630 (1.91:1)**; PNG or JPEG; **<1MB** (~300KB soft cap for WhatsApp).
- Safe zone: center **1100×550** (66% area) — text never bleeds to the edge.
- Typography: title **48–72pt**, subtitle **24–36pt**, brand mark 18–24pt; sans-serif;
  ≤6–8 words per line; WCAG AA contrast (≥4.5:1).
- Color: max **2–3 colors**; brand-color background (slate-900 / white / orange-600), never busy.
- Meta wiring: `og:image`, `og:image:width`, `og:image:height`, `og:title`, `og:description`,
  `twitter:card=summary_large_image`, `max-image-preview:large` (Google Discover eligibility).
- A shared site-wide cover is NOT acceptable — each page gets its own OG image in the new stack.
- Previews with a proper OG image lift CTR by up to 2–3x vs a generic/missing preview.

## 4. Email image spec (newsletter + sequences)

- Header/hero **600–640px wide** (export @2x = 1200–1280px).
- Image blocks **<100–200KB each**; whole email **≤1MB**; JPEG for photos, PNG for text/logos.
- **Alt text on every image** (images are blocked by default in Outlook + Apple Mail — the email
  must still read well).
- CTA as **live text button**, never embedded in an image.
- Balance: food brand = image-forward, but keep readable text blocks (sensory product ≈ images win).

## 5. Brand palette for generated/styled images

- Background base: `#F9FAFB` (gray-50) / deep `#0F172A` (slate-900) for contrast plates.
- Accent/action: `#EA580C` (orange-600), hover `#C2410C` (orange-700).
- Success: `#16A34A` (green-600).
- Typography: serif for headings, sans for body/ui, per the site design system.

## 6. Text rules (researched, 2026 medians)

- **Hashtags: 1–3 max.** Median engagement 4.8% at 1–3; drops to 0.9% at 11+. (3 is the cap already — keep it.)
- **End captions with a genuine question:** ≈2× engagement rate vs not.
- **Captions extend the image** (bonus context, story, backstory) — matches psychologically-near
  brands (food = near). Don't repeat what the photo shows.
- **Hard/copy CTA only on conversion posts**; soft CTA (comment, save) on discovery posts.
- No emojis, no banned words (see `ai-lib.js` `BANNED`); allow EN + natural ES switch.
- **Cadence:** consistent beats intense (Buffer: 5× more reach staying consistent than going
  viral once). LinkedIn 3–5/wk; IG feed 4–5/wk + stories; Pinterest 3–5/wk (recipes are a core fit).
- **Times (Flodesk 2026, email):** 5–8am ET opener (6am sweet spot), Tuesday clicks +31%,
  Friday opens +10%. Apply to broadcast emails; for social, post to when audience is online.

## 7. Format-mix by goal

| Goal | Use |
|---|---|
| Reach / discovery | Reels / TikTok (9:16 video), Pinterest 2:3 pins |
| Engagement | Instagram carousel (3–4 slides; +109% engagement/person vs reels), LinkedIn carousel |
| Proof / depth | LinkedIn carousel or document (21.77% median ER), 4–8 slides |
| Direct conversion | FB/IG feed image + live-text CTA; email with live CTA button |

## 8. AI-image policy (our workflow generates images via AI)

- Digital/Applied found a **~12% engagement penalty for AI-labeled posts**; LinkedIn actively
  flags suspected AI content. For a food brand, authenticity is the trust currency.
- **When AI-generated images are used:** they must be high-fidelity food photography (no AI tells:
  no melted logos, extra fingers, floating props, wonky lettering on packaging). Generate, judge,
  re-roll until credible. Where it matters (hero dishes, recipes), prefer real photography we shoot.
- **Never present AI imagery as real photography.** Label tactfully where consumers would assume
  otherwise (e.g. "concept render" on spec work — the portfolio already does this).
- Generated images get the same platform-exact export + alt-text discipline as everything else.

## 9. Niche & lead rule (this website IS the product)

- Sofrito Studio is a **brand studio for food businesses** (restaurants, CPG, food trucks,
  catering, specialty food). Every piece of content — blog, social, email, image, video — must be
  on-niche: food-business branding, menus, storytelling, website strategy, or culture told through
  a brand-voice angle. Off-niche material does not ship through this pipeline.
- **Every piece advertises the website.** The value chain: content drives a visitor to
  sofritostudio.com → the visit converts to a lead (free Digital Guide via `/api/newsletter`,
  contact form, or a session) → the lead enters the outreach pipeline → the lead becomes a
  customer. More leads = more site visits = more potential customers. Content is the top of that funnel.
- Each post carries at least one natural steering mechanism: a service link (services.html), a
  work piece (`/work/...`), the free guide (`/freebies/digital-guide.md`), or a Journal/blog page.
- Soft CTA on discovery posts; explicit CTA on conversion posts. Hard sales on awareness posts = flagged off.
- Titles + meta descriptions carry the niche keyword family ("brand studio for food businesses") so
  search traffic lands on-topic and on-site.

## 10. The Gate (enforced in generators, verified before any post)

Every post/email must pass ALL of:
1. **Image present** — a research-provisioned image exists for the post (not optional).
2. **Spec exact** — the image's export size matches the platform row in §2 (or OG §3 / email §4).
3. **Alt text ≤125 chars** describing what's actually in the image, with the dish/product.
4. **Text-on-image** respects the ≤3-line, one-idea, safe-zone rule; CTA is live text.
5. **File budget** — email: ≤1MB total; link preview: <1MB.
6. **Filenames** are slug-kebab (`pinchos-overhead-1080.jpg`), stored under `content/images/<slug>/`.
7. **On-niche** — the topic is food-business branding/marketing (services, work, guide, Journal);
   off-niche ideas are rejected.
8. **Steers to the site** — at least one natural mention or link to sofritostudio.com present.
9. **Lead path named** — the copy makes clear what the reader does next (download the guide, view
   the work, book the session) so the content converts a visitor into a lead.

Failure = the generator exits non-zero; nothing is written to content queue without satisfying gate.