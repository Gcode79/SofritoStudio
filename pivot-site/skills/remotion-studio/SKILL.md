# Remotion — Studio (Sofrito Studio)

Preview and iterate on a Sofrito Studio Remotion composition in the Remotion
Studio UI.

## When to use

- The user wants to see or tweak a video/scene before rendering.
- The user is developing a new composition for social or brand video.

## Start Studio

```bash
npx remotion studio --no-open
```

(Open the printed URL, or use `--port` to pin one.)

## Workflow

1. Open the target composition in the Studio left panel.
2. Iterate on layout, brand tokens, and text overlays in code; Studio
   hot-reloads.
3. Use the timeline to scrub frames (especially the first 1–2 s for Reels —
   the hook must land immediately).
4. Use the `--remotion` "Still" / "Render" buttons for quick previews, but for
   a final asset always use the `render` skill so output is verified.

## Sofrito Studio preview checks

- Composition type: 9:16 (Reels/Stories), 4:5 (Instagram), or 1:1 — as briefed.
- Design tokens: warm neutrals, earthy red/deep green accents, cream/ink text,
  natural food-business textures. Conversion orange CTA used only for the
  action.
- Text: deterministic overlays only; no baked-in image text; captions shown
  for speech (see `remotion-captions`).
- Focal point uncluttered; text off the focal subject; safe margins clear of
  platform interface zones.
- No line art / vectors / clip-art / fake-client realism.
- Mark preview `DRAFT — AWAITING FOUNDER APPROVAL` before sharing.

## Notes

- Studio renders are for preview, not final export.
- Do not change a composition's ID blindly — Studio/`Root.tsx` must match the
  IDs used in the render commands.