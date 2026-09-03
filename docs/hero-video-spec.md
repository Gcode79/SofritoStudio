# Hero Video — Drop-in Component Spec

Prepared so future **approved original footage** can be dropped into the homepage hero
without redesigning the hero. No assets were fabricated; nothing here is deployed.

Status: **component prepared, NOT wired into the served page.** The live homepage still
renders the static hero (see `docs/hero-video-preview.html` for a working preview that
reuses already-shipped `deploy/videos/` footage).

---

## 1. Current hero asset (what is live today)

The `.hero` section (`deploy/index.html:441-471`) is a **static split-screen**:

| Layer | Asset | Size | Role |
|---|---|---|---|
| Background | `images/hero-abuela.webp` | 1600×1068 | `.hero-bg` full-bleed, under a 3-layer ink scrim (`.hero::before`, `style.css:336`) |
| Product visual | `images/mockup-cookbook.svg` | 480×360 | right-hand tablet/cookbook mockup |
| Copy + CTA ladder | — | — | eyebrow → H1 → lead → La Mesa **$47 primary** → $9 secondary → free-guide form → trust strip |

There is **no video in the hero**. The only deployed footage (`deploy/videos/cooking-demo.*`,
`poster-hero.jpg`, `captions-*.vtt`) lives in the **separate `#inside` video showcase**
(`index.html:544-592`).

## 2. Strengths / weaknesses (assessed)

**Strengths**
- Correct CTA hierarchy and clear lead-capture already in place.
- Static hero is fast and cheap on LCP (bg is `preload`ed, `fetchpriority=high`, `index.html:28`).
- Scrim + centered copy give solid text contrast.

**Weaknesses**
- Food/human story isn't the focus — a background scene + app mockup lead, not an
  appetizing plate → misses the "I want to eat that" trigger.
- `hero-abuela.webp` tone is uneven (cool/dark top ~84,63,63 vs warm orange bottom
  ~135,72,38) and sits under a heavy scrim, so its story is dimmed to near-invisible.
- Two visual objects (bg + mockup) split attention; no motion.

## 3. Ideal replacement composition

**Direction — "the plate before the table."**
- **(A) Food/kitchen B-roll** (appetite): sizzling oil, hands adding sofrito, steam,
  a finished plated dish. Muted autoplay, looping.
- **(B) Human story** (tradition/warmth): family/abuela hands cooking together.

Both: copy + CTA left-aligned over a **strong left scrim only** (food stays visible),
slim `logo-badge` top-right (brand present, never the main object), trust strip + dual CTA
kept. Emotional chain the framing must serve:
1. See food → "I want to eat that."
2. Copy/quiz → "I want to learn to make that."
3. CTA button → "I want La Mesa Boricua." ($47 primary, $9 secondary).

No generic stock, no AI imagery, no cultural stereotypes. Food/human story is the subject;
the 512×512 `logo`/`logo-badge.svg` stays as the brand mark only.

## 4. Drop-in implementation (exact paths — create these later)

Place original footage in `deploy/videos/`:
- `hero-poster.jpg` — poster frame (the first appetizing frame; also the LCP image)
- `hero-broll.webm` / `hero-broll.mp4` (small) — muted autoplay food/KP B-roll, ~8-15s loop
- `captions-hero-en.vtt` / `captions-hero-es.vtt`

### HTML — replace the `.hero-bg` div (`index.html:442`) with a video layer
```html
<video class="hero-video" id="heroVideo"
       poster="videos/hero-poster.jpg" muted loop playsinline
       preload="metadata" aria-label="..."
       aria-describedby="hero-caption">
  <source src="videos/hero-broll.webm" type="video/webm">
  <source src="videos/hero-broll.mp4"  type="video/mp4">
  <track kind="captions" label="English" srclang="en" src="videos/captions-hero-en.vtt" default>
  <track kind="captions" label="Español" srclang="es" src="videos/captions-hero-es.vtt">
</video>
<!-- a11y: visible-always caption line + play/pause control (pattern from #inside showcase) -->
<button class="hero-video-toggle" id="heroVideoToggle" aria-label="Pause hero video"
        aria-pressed="false"><svg .../></button>
```
Keep the existing `images/mockup-cookbook.svg` on the right (drop-in fallback + product
context) and keep `.hero::before` **but lighten it** so food stays visible:
```css
.hero-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; }
/* scrim: strong left edge only, right stays clear so food shows */
.hero::before { background: linear-gradient(90deg, rgba(43,33,24,.72) 0%, rgba(43,33,24,.45) 38%, rgba(43,33,24,.08) 68%, rgba(43,33,24,0) 100%); }
@media (max-width:960px){ /* existing mobile rules already stack copy; keep video behind */ }
```

### JS hook (mirror into `main.min.js`)
- On `#heroVideoToggle` click → `video.paused ? video.play() : video.pause()`; swap
  `aria-pressed`/label; keep `muted` mandatory (autoplay policy) with captions on.
- Reuse the existing `#inside` video caption wiring pattern — no new architecture.

### CWV guardrails
- `poster` doubles as LCP image; keep `preload="metadata"`, not `auto`, so mobile data is spared.
- Lazy video behind the fold guidance already applies to `#inside` (`preload="none"`).
- No `autoplay` attribute (policy-safe); start playback in JS only after `play()` is allowed,
  or leave the poster as a poster with a play toggle — always a graceful static fallback.

## 5. QA checklist (run when footage is dropped in)
- [ ] `python scripts/verify_all.py` → 10/10.
- [ ] `<=960px`: hero stacks copy above reveals; no overlap, no horizontal scroll.
- [ ] Poster is the LCP image; LCP still green.
- [ ] Muted autoplay on desktop; static poster fallback when JS/data-saver.
- [ ] Captions visible/toggleable; play/pause has `:focus-visible` + `aria-pressed`.
- [ ] No icon/logo says a claim the page doesn't support (Truth-Teller).
- [ ] Production deploy only after explicit sign-off — none performed for this component.
