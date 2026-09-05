# Content Queue — Sofrito Studio

Working folder for generated copy. Nothing here is served directly; the
generators write to `content/queue/`, a human reviews, and approved pieces move
into `public/blog/` (blog), `public/work.html` (case studies), or hand off to
Make (social, newsletter).

## Pipeline
1. `node scripts/generate-blog-post.js "angle" [--emit]` → `blog-<slug>.md`
   (+ `public/blog/<slug>.html` with `--emit`)
2. `node scripts/generate-social-batch.js "brand theme"` → `social-week-<date>.md`
   → review → Make **S7** publishes
3. `node scripts/generate-newsletter.js "theme"` → `newsletter-<date>.md`
   → review → Buttondown draft
4. `node scripts/generate-case-study.js "client before/after"` → `case-<slug>.md`
   → sensitivity review → add to `public/work.html`

## Voice lock
The shared system prompt in `scripts/ai-lib.js` bans: leverage, synergy,
innovative, cutting-edge, passionate, game-changer, delicious, authentic.
Keep it that way — it's the brand.

## Housekeeping
- Review every file before it ships. AI drafts are a first pass, not a cease-fire.
- Upload approved posts via `git add public/blog/<slug>.html` and commit;
  the worker serves `public/` directly, no build step.