# Remotion — Create (Sofrito Studio)

Create a new Remotion project or composition for Sofrito Studio video assets,
following the brand rules in AGENTS.md.

## When to use

- The user asks to build a new Reel, social video, brand video, carousel
  background, or show intro.
- The user asks to set up a new Remotion project in this repo.

## Steps

1. Confirm scope: format (9:16 / 4:5 / 1:1), duration, subject, CTA, whether a
   human will appear, and the funnel stage (awareness / consideration /
   conversion). Capture this in a brief before any visual work.
2. Choose a location:
   - Project-scoped assets: `pivot-site/content/video/<slug>/`
   - Working renders: `pivot-site/skills/../../video-ads` only if that project
     is the target; otherwise keep everything under `pivot-site/content/video`.
   Do NOT use `remotion-abuelas-ipad` or the legacy Starter Kit.
3. Scaffold only if a new project is needed:

   ```bash
   npx create-video@latest --yes --blank --no-tailwind <project-name>
   ```

   Otherwise add a new composition to the existing project's `Root.tsx` /
   routes. A reusable pattern is a `registerRoot(RemotionRoot)` entry with a
   `<Composition>` per format. Pass `defaultProps` for the brief (subject,
   headline, CTA) instead of hardcoding copy.

4. Branded composition constants:

   - Reels/TikTok/Stories: 1080×1920, 9:16, fps 30, duration per brief
     (8–30 s).
   - Instagram feed/carousel frames: 1080×1350, 4:5.
   - Brand palette (CSS custom properties or a `colors.ts`):
     `--sofrito-red: #C03D2A; --sofrito-green: #3E4A3A; --sofrito-cream: #FAF6EE; --sofrito-ink: #2B2118; --sofrito-accent: #9A7318; --sofrito-cta: #EA580C;`
   - Typography: serif for headlines (`Georgia`, `Playfair Display` fallback),
     sans for body/UI (`Inter`, `Arial` fallback). Restrict to two families
     and three weights.
   - Safe margins: keep text ≥ 8% of width from edges; keep critical copy out
     of the bottom 15% (interface zones) and top ~12% on Stories/Reels.

5. Visual assets: use original/approved photography or the Realistic Social
   Visual Standard (photorealistic editorial food-business imagery). Never
   line art, vectors, clip art. Never generate imagery that implies a real
   client, venue, result, or testimonial.

6. Text: write all copy to a brief/source file first
   (`pivot-site/content/video/<slug>/copy.md`). Render copy as deterministic
   text (Path A), not baked into an image. URLs, prices, dates, names, and
   CTAs are ALWAYS deterministic overlays; never hand-rendered by an image
   model.

7. Add captions/subtitles for any Reel or video with speech (see
   `remotion-captions`).

8. Every deliverable is `DRAFT — AWAITING FOUNDER APPROVAL`.

## Quality gate (score 1–5, revise below 4)

- Photorealism / real-world credibility
- Food-business relevance (owner recognizes their world in seconds)
- Focal-point clarity on a phone
- Idea legible before the caption is read
- Distinct from generic agency content
- Ethical/permission safety (no fake clients, rights cleared)
- Realistic production scope

## Notes

- Preview before render: `npx remotion studio --no-open`; render with
  `npx remotion render` (see `remotion-render`).
- Update `Root.tsx` cache-busting `calculateMetadata` if composition duration
  or dimensions change.
- Never deploy or publish without founder approval.