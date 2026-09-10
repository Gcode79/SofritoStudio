# Remotion — Best Practices Router (Sofrito Studio)

Use this skill first for any video task. It routes to the correct branded
Remotion skill. Preserve the user's project state; never start from scratch
without confirmation.

## Generic advice

- Load `remotion-create` only when the user is creating a new project/a new
  composition.
- Load `remotion-markup` when writing or optimizing markup/animations.
- Load `remotion-captions` when working with captions or subtitles.
- Load `remotion-render` when rendering, exporting, uploading, or downloading.
- Load `remotion-studio` when developing or previewing.
- Load `remotion-upgrade` when upgrading a project.
- Load `remotion-docs` to answer documentation questions.
- Keep debugging simple (browser devtools concurrency) unless a project
  setting changes.

## Sofrito Studio rules (always apply)

- Compositions are authored here in the pivot-site repo (`pivot-site/skills`,
  `pivot-site/content/video`), never derived from the legacy
  `remotion-abuelas-ipad` Starter Kit or "Abuela's iPad" ad concept.
- Formats: Reels/TikTok/Stories 9:16 (1080×1920), Instagram feed/carousel 4:5
  (1080×1350), 1:1 for generic social, LinkedIn composed separately (1.91:1 or
  1:1). Design vertical mobile-first.
- Design tokens: warm neutrals, earthy red (`#C03D2A`), deep green, cream
  (`#FAF6EE`), ink (`#2B2118`), natural wood/ceramic/paper textures. Conversion
  trigger orange (`#EA580C`) is reserved for the CTA and used sparingly.
- Headings serif / body sans; explicit hover, focus, disabled states on any
  interactive element.
- No line art, vectors, clip art, flat illustration, or "agency-style"
  graphics. Use the Realistic Social Visual Standard only.
- On-image text uses Path A (deterministic text overlay) for any
  business-critical, URL, price, date, name, or >5-word copy. Never let an
  image model or Remotion text render a URL, price, date, or name by hand.
- Never imply a real client, testimonial, result, venue, or completed
  engagement with AI imagery.
- Every deliverable is marked `DRAFT — AWAITING FOUNDER APPROVAL`. Nothing is
  scheduled, uploaded, published, or promoted without founder approval.

## Runtime details

- Remotion project version: 4.x, React 19.
- Run `remotion` commands from the directory containing the Remotion config
  (`remotion.config.ts`). This package uses `@remotion/bundler` and the
  headless Chrome fallback unless configured otherwise.
- Prefer `npx remotion studio` for local preview; never commit network/server
  secrets into configs.