# Remotion — Captions (Sofrito Studio)

Generate, display, and import captions for Sofrito Studio videos (Reels,
Stories, explainers). Captions are REQUIRED for any video with speech or
voiceover.

## When to use

- The user is making a video with a spoken hook, voiceover, or interview.
- A video must be postable with sound off (Reels/TikTok default).

## Sofrito Studio caption rules

- Captions render via the deterministic text layer (Path A). Never bake
  caption text into an image model or rely on image-generated text.
- Every caption is exact copy from the approved source (see `remotion-create`
  for the `copy.md` brief). Do not retype captions from memory.
- Typography: bold sans-serif (body/UI face), cream (`#FAF6EE`) on a dark
  transparent panel, or ink (`#2B2118`) on cream. Minimum ~48px at 1080px
  width so words are readable on a phone.
- Placement: lower-center, OUTSIDE the platform-safe zones (keep clear of the
  bottom ~15% on Stories/Reels for UI overlay). Never cover the focal subject.
- One idea per caption page; no more than ~3 short lines.
- Word-highlighting color must differ by brightness, not color alone
  (accessibility); e.g. highlight = cream on the dark panel, spoken word =
  warm accent (`#D88B47`) with weight change.
- Scorecards/CTAs in captions must match the exact approved copy; mark the
  video `DRAFT — AWAITING FOUNDER APPROVAL`.

## Caption data model

```ts
import type { Caption } from "@remotion/captions";

type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
  pageBreakAfter?: boolean;
};
```

## Generating captions from audio

Install the transcription package:

```bash
npx remotion add @remotion/install-whisper-cpp
```

Transcribe locally with Whisper.cpp (no audio leaves the machine), convert to
`Caption[]` with `toCaptions()`, and write JSON to the project's `public/`
folder so Remotion can `staticFile()` it. Transcribe each clip separately into
its own JSON file. Use 16 kHz WAV input; enable token-level timestamps so the
spoken word can be highlighted.

## Importing a .srt file

```bash
npx remotion add @remotion/captions
```

Fetch the `.srt` with `staticFile()`, then `parseSrt({ input: text })` from
`@remotion/captions`. Parsed output is `Caption[]` and works with all captions
utilities. Remote URLs via `fetch()` are also supported.

## Displaying captions

1. Load captions JSON with `useDelayRender()` (hold the render until the file
   is fetched) and `continueRender(handle)` when loaded.
2. Group words into pages with `createTikTokStyleCaptions()`; tune
   `combineTokensWithinMilliseconds` (~1200 ms = a few words per page;
   lower = more word-by-word). Respect `pageBreakAfter`.
3. Map pages into `<Sequence>`s computed from `startMs` x `fps`; skip pages
   whose computed duration is <= 0.
4. Put caption logic in its own component file, not inline in the scene.
5. Use `whiteSpace: "pre"` (captions are whitespace-sensitive — include the
   leading space in each token's `text`).
6. Highlight the active word per frame via `page.startMs + (frame/fps)*1000`
   compared against each token's `fromMs`/`toMs`.

## Verification

- Every word renders; no cut-off lines at the last page.
- Text readable at final mobile-post size; inside safe margins; adequate
  contrast against the scene (panel/gradient used where needed).
- Spoken copy matches the approved `copy.md` character-for-character.
- No platform-UI collision at the bottom of 9:16 output.