# 3D Reel Production Brief — "Abuela's iPad"

Status: Component scaffolded (`remotion-abuelas-ipad/`). NOT rendered. NOT deployed.
Role context: Social content creator — video ads for IG/FB (wired platforms), NOT homepage hero (rejected: "really boring").

---

## Project
- **Name**: `remotion-abuelas-ipad` (folder: `C:\Users\josho\SofritoStudio\remotion-abuelas-ipad`)
- **Component**: `src/AbuelasIpad.tsx` (scaffolded, storyboard mapped to 4 scenes, 450 frames @ 30fps, 1080×1920)
- **Format**: 9:16 vertical Reel (IG Reels / FB Reels / TikTok / YouTube Shorts)
- **Duration**: 15 sec (450 frames)
- **Target product**: Starter Kit ($9) — `SS_PRICES` verified (`main.js` line ~892, `deploy/data/products.json`)
- **Brand**: Sofrito Studio — `brand-research` / `get_brand_kit` verified (primary `#C03D2A`, accent `#9A7318`, cream `#FAF6EE`, ink `#2B2118`, voice: bilingual, heritage, mainland-tested)

---

## Storyboard (from video-concepts.md Reference 8c + Companion 5 — lines 123-205)

| Frame / Time | Scene (Component Label) | Visual Description (3D) | Kinetic Typography (On-Screen) | VO Script (Audio) | CTA / End Card |
|---|---|---|---|---|---|
| 0:00–0:03 (0-90f) | Frame 1 — Tap iPad (`SCENES[0]`) | Pixar-style 3D PR home cook (bandana + PR-flag apron), warm smile, at kitchen counter tapping glowing iPad | **Missing Abuela's Flavors?** | [Warm & Enthusiastic]: *"Craving authentic boricua flavor on the mainland?"* · SFX: pop + sparkle chime | — |
| 0:03–0:07 (90-210f) | Frame 2 — Ingredient Swirl (`SCENES[1]`) | Hyper-real 3D ingredients (culantro/recao leaves, garlic heads, red + green ají dulce, yellow onions) swirl into glass jar of emerald sofrito via liquid simulation | **100% Mainland-Friendly Swaps!** | [VO]: *"Get exact supermarket swaps for recao and ají dulce."* · SFX: chopping + herb sizzle ASMR | — |
| 0:07–0:12 (210-360f) | Frame 3 — Bilingual iPad (`SCENES[2]`) | Character holds iPad showing bilingual digital cookbook + weekly meal planner; bright studio lighting, warm wooden tones | **Bilingual Recipes (EN / ES)** | [VO]: *"Instant digital access to 30 tested family recipes in English and Spanish."* · SFX: digital swipe click | — |
| 0:12–0:15 (360-450f) | Frame 4 — Yellow CTA (`SCENES[3]`) | Character points to large yellow button, holds plate of arroz con pollo; logo badge visible | **GET THE $9 STARTER KIT** | [VO]: *"Tap below to get your $9 Starter Kit tonight!"* · SFX: upbeat Latin guitar resolve | Yellow button → `/products/starter-kit.html` |

---

## 3D Generation Prompt (Copy → Midjourney / Runway / Sora / Remotion 3D)

Copied verbatim from `video-concepts.md` lines 136-141 (Reference-derived production prompt) and updated with the storyboard mapping above:

> Pixar-style 3D young Puerto Rican female home cook, warm smile, bandana + PR-flag apron, at a kitchen counter tapping a glowing iPad; hyper-real 3D ingredients (culantro/recao leaves, garlic heads, red and green ají dulce peppers, yellow onions) swirl into a glass jar of vibrant emerald sofrito paste via liquid simulation; iPad shows bilingual digital recipe card EN/ES with weekly meal planner visible; ends with a large yellow "GET THE $9 STARTER KIT" CTA button and a plate of arroz con pollo held by the character. Bright studio lighting, warm wooden tones, macro depth of field, cinematic color grade, photorealistic food rendering, 9:16 vertical, 60fps.

---

## Asset References (Verified Paths)

| Asset | Path / Status | Usage in Component |
|---|---|---|
| Storyboard source | `marketing/video-concepts.md` (lines 123-205) | Scene mapping, VO script, timing |
| 3D multi-device mockup (reference) | `C:\Users\josho\Downloads\watermarked_img_3081925967957743166.jpg` — **MISSING** (file not found at this path; was referenced in video-concepts.md line 160) | Style baseline for character design, device layout, color grade, lighting |
| Video footage | `deploy/videos/cooking-demo.mp4` (9.8MB) / `.webm` (2.8MB) — exists, verified | Can be composited as background/video layer behind the 3D character (alternative: pure 3D render with no live footage) |
| Poster image (LCP fallback) | `deploy/videos/poster-hero.jpg` (85KB) — exists, verified | Static poster for video hero (if wired) or thumbnail for Reel |
| Captions (bilingual) | `deploy/videos/captions-en.vtt` (982B) / `captions-es.vtt` (1041B) — exists, verified | Burned-in subtitle overlay for Reel format |
| Mockup-cookbook.svg | `deploy/images/mockup-cookbook.svg` (480×360, vector) — exists, verified | Can appear as the iPad screen content or as a secondary visual element |
| Brand colors | `.opencode/instructions.md` / `get_brand_kit` — verified: primary `#C03D2A`, accent `#9A7318`, cream `#FAF6EE`, ink `#2B2118` | Used in component scaffold |
| Brand identity | Brand type: `ecommerce` (verified); audience: diaspora home cooks; voice: bilingual, heritage, mainland-tested; value props: bilingual recipes, mainland swaps, instant download, 30-day guarantee | Applied to typography and copy |
| Product price (CTA) | `SS_PRICES` (`main.js`) / `deploy/data/products.json` — Starter Kit `$9`, Mesa `$47`, Kitchen Bundle `$67`, Full Table `$97` | CTA links to `/products/starter-kit.html` |

---

## Technical Notes (Remotion Component — `AbuelasIpad.tsx`)

- Component file: `remotion-abuelas-ipad/src/AbuelasIpad.tsx`
- Root updated: `remotion-abuelas-ipad/src/Root.tsx` (imports and renders `AbuelasIpadComp`)
- Scene array (`SCENES`) maps the 4 storyboard scenes with start/end frames, labels, kinetic typography, subtitles, and time markers — this serves as both the production reference and the component structure guide.
- The component renders a reference overlay for review; the actual 3D visual assets must be produced externally (the prompt above) and then composited via Remotion's `<AbsoluteFill>`, `<Sequence>`, `<Img>`, `<Video>`, and `<OffthreadVideo>` APIs.
- No framework migration: this is a standalone Remotion project (`remotion-abuelas-ipad/`), separate from the static site (`deploy/`). It does NOT replace the homepage hero.
- No fabricated claims: the VO script uses the exact copy from `video-concepts.md`; the price (`$9 Starter Kit`) is verified from `SS_PRICES`; the bilingual claim is verified from the brand kit; the 3D character description is from the storyboard spec.
- No AI imagery rule: the 3D render is an original production (Pixar-style character), not a stock photo or AI-generated still — consistent with `docs/hero-video-spec.md` directive ("No generic stock, no AI imagery, no cultural stereotypes").

---

## What Needs User Approval / Action Before Rendering

1. **Reference image**: `C:\Users\josho\Downloads\watermarked_img_3081925967957743166.jpg` is missing. The 3D character design, device layout, and color grade reference must be available before the 3D render can match the spec. Check the download folder or provide the file.
2. **3D production tool**: Confirm whether to use (a) Remotion 3D components (requires 3D assets produced externally and composited), (b) Midjourney/Runway/Sora for the 3D render (using the prompt above), or (c) manual video editing (After Effects / Premiere) with the script overlay.
3. **Music / SFX**: The storyboard references specific SFX (pop + sparkle chime, chopping + herb sizzle, digital swipe click, upbeat Latin guitar resolve). These must be sourced or produced separately — the component scaffold has no audio layer yet.
4. **Subtitle format**: The captions (`captions-en.vtt` / `captions-es.vtt`) are in VTT format. Confirm whether to burn subtitles directly into the video (as the storyboard requires — "Burned-in captions EN + ES") or provide separate subtitle tracks.
5. **Deployment decision**: Confirm this is for IG/FB Reels (9:16, wired platforms), not the homepage hero (rejected). Once rendered, the video file can be uploaded manually or automated via `post_to_meta.py` (requires `META_ACCESS_TOKEN` verification).
6. **Hero video status**: `hero-video-preview.html` (video hero with `cooking-demo.webm`) was rejected ("really boring"). This 3D Reel (`AbuelasIpad`) is a separate asset — it does NOT replace the homepage hero and does NOT use the video hero component.

---

## Incorporated Site Assets (from Desktop\SiteImages — copied 2026-08-30)

The user instructed: "Site files and images, incorporate to project." The following files from `C:\Users\josho\Desktop\SiteImages` have been copied to `remotion-abuelas-ipad/public/assets/`:

| File (Source) | Size | Destination | Role in 3D Reel |
|---|---|---|---|
| `abuela's.jpg` (original hero — abuela kitchen, 731KB) | 714.3 KB | `public/assets/abuela's.jpg` | Can serve as background scene, reference for kitchen counter texture/lighting, or as the "abuela" human-story layer (per hero-video-spec.md direction A: food/human B-roll) |
| `ChatGPT Image Aug 26, 2026, 07_24_45 PM.png` (AI food scene, 1.2MB) | 1230.1 KB | `public/assets/chatgpt-hero-20260826.png` | This is the same AI-generated hero image (`thumbnail_mesa_1280x720.jpg`) approved as the static hero (`hero-mesa.webp`). In the 3D Reel, it can serve as the poster frame (LCP fallback) or as a texture/reference for the food-render layer |
| `logo-badge-1024-removebg.png` (logo, 165KB) | 161.5 KB | `public/assets/logo-badge-1024.png` | Brand mark — use for `hero-brand` overlay or end-card logo badge |

These assets are now referenced from the Remotion component (via `public/` URL paths) and from the production brief. (Before Any Render / Deploy)

- [ ] `python scripts/verify_all.py` still 10/10 (this file introduces no executable changes — it creates a new independent Remotion project)
- [ ] Reference image (`watermarked_img...`) located / reproduced
- [ ] 3D production tool selected (Remotion 3D / external render)
- [ ] Music / SFX sources confirmed
- [ ] Subtitle method confirmed (burned-in vs. VTT track)
- [ ] User approves the visual direction (no AI imagery, 3D original production, brand-consistent)
- [ ] CTA link verified (`/products/starter-kit.html` → `SS_PRICES` $9)
- [ ] No framework migration of the live site (`deploy/index.html` untouched)
- [ ] No fabricated social proof or customer numbers in the copy (truth-teller verified — only verified claims: bilingual, mainland-tested, instant download, 30-day guarantee, 3 generations tested, $9 price)
