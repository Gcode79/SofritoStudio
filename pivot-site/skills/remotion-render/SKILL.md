# Remotion — Render (Sofrito Studio)

Render video or still frames from a Sofrito Studio Remotion composition to an
exportable file.

## When to use

- The user asks to export a Reel, social video, brand video, or frame.
- The user asks to produce a final MP4 or image deliverable.

## Render a video

```bash
npm run build
npx remotion render <composition-id> <output>
```

Examples for the branded formats:

```bash
# 9:16 Reel
npx remotion render Reels9to16 out/reels/slug-reel-01.mp4

# 4:5 Instagram frame sequence (if composition drives carousel slides)
npx remotion render Carousel4to5 out/carousel/slug-frame-01.png --frame=0
```

Flags available as needed (adjust to the composition ID actually present):
`--codec=h264`, `--crf`, `--scale`, `--frame=<number>` for stills,
`--overwrite`, `--concurrency`, `--log=verbose`.

## Render a still

```bash
npx remotion still <composition-id> <output.png> --frame=<number>
```

## Verification checklist

- [ ] Output is the intended aspect ratio (1080×1920 / 1080×1350 / 1:1) and
      matches the format used at export.
- [ ] NO image-model text: every headline, URL, price, date, name, or >5-word
      string is a deterministic overlay (Path A). Garbled or wrong text =
      FAIL, do not use.
- [ ] Safe margins respected on a phone-size preview.
- [ ] Contrast sufficient; no copy over the focal subject.
- [ ] Captions/subtitles present for video with speech.
- [ ] No AI imagery implying a real client, venue, result, or testimonial.
- [ ] File labeled `DRAFT — AWAITING FOUNDER APPROVAL`.

## Notes

- Render from the directory containing `remotion.config.ts`.
- On failure, inspect the log; do not silently re-render (double-bills
  nothing locally but hides issues). Fix the underlying config first.
- Renders are local exports only. Uploading, scheduling, or publishing is
  gated on founder approval.