# 3D Tool Example — "Abuela's iPad" Scene Breakdown

This is the concrete example of how the 3D prompt (`PRODUCTION-BRIEF.md` line 33) produces each frame. No external tool running here — this is the reference guide to compare against when your 3D render (Midjourney / Runway / Sora) is produced.

---

## Frame 1 (0:00–0:03) — "Tap iPad"

**Prompt segment**: *"Pixar-style 3D young Puerto Rican female home cook, warm smile, bandana + PR-flag apron, at a kitchen counter tapping a glowing iPad"*

**Reference assets**:
- Character style: `docs/hero-video-spec.md` (Pixar-style 3D Boricua home cook, bandana + PR-flag apron — direction A from spec)
- Kitchen scene (background/lighting reference): `public/assets/abuela's.jpg` (714KB, original kitchen hero)
- Brand mark (end-card / overlay): `public/assets/logo-badge-1024.png` (161KB)
- Color grade: `.opencode/instructions.md` (primary `#C03D2A`, accent `#9A7318`, cream `#FAF6EE`, ink `#2B2118`)

**What the 3D render should show**:
- 3D character at wooden kitchen counter (texture/style from `abuela's.jpg`: dark wood, warm lighting, festive decor, candles)
- Glowing iPad in hand (iPad screen shows bilingual cookbook — can reuse `mockup-cookbook.svg` or produce new bilingual card texture)
- Character expression: warm, enthusiastic (not static — slight head tilt toward iPad)
- Background: `abuela's.jpg` kitchen elements (roast chicken plate, coquito dessert, green herbs, candles) as ambient scene props, not the main focus
- Lighting: bright studio + warm wooden tones (from prompt + `abuela's.jpg` reference)

---

## Frame 2 (0:03–0:07) — "Ingredient Swirl"

**Prompt segment**: *"hyper-real 3D ingredients (culantro/recao leaves, garlic heads, red and green ají dulce peppers, yellow onions) swirl into a glass jar of vibrant emerald sofrito paste via liquid simulation"*

**Reference**:
- Real ingredients: `deploy/videos/cooking-demo.mp4` (macro ingredient prep footage — this is the closest real reference for how recao, garlic, ají dulce, onion look when chopped/prepped)
- Glass jar: standard food-product jar (no specific reference; design from brand colors: clear glass + emerald green liquid)
- Liquid simulation: emerald green (`#2B2118` ink + `#C03D2A` primary blend → emerald tone)

**What the 3D render should show**:
- Ingredients floating/swiring (not falling — liquid simulation effect) into a clear glass jar
- Jar label: minimal — can use `logo-badge-1024.png` scaled small, or no label (ingredient focus)
- Emerald sofrito filling from bottom (visual: liquid rising smoothly)
- No character in this frame (focus on ingredients)

---

## Frame 3 (0:07–0:12) — "Bilingual iPad"

**Prompt segment**: *"iPad shows bilingual digital recipe card EN/ES with weekly meal planner visible"*

**Reference**:
- Digital cookbook content: `deploy/images/mockup-cookbook.svg` (bilingual EN/ES recipe cards — can be used as the iPad screen texture)
- Brand identity: bilingual claim verified from brand kit (`.opencode/instructions.md` / `get_brand_kit`)

**What the 3D render should show**:
- Character holding iPad closer to camera (close-up on screen)
- Screen content: bilingual recipe card (EN left / ES right, or stacked) + weekly meal planner visible
- Character's hand visible holding the iPad (warm skin tone, bandana visible at wrist)
- Background slightly blurred (macro DOF from prompt) to focus on screen

---

## Frame 4 (0:12–0:15) — "Yellow CTA"

**Prompt segment**: *"ends with a large yellow 'GET THE $9 STARTER KIT' CTA button and a plate of arroz con pollo held by the character"*

**Reference**:
- CTA color: yellow (`#9A7318` / bright yellow — from brand accent) — the prompt specifies "yellow" for the button
- Price verification: `SS_PRICES` / `deploy/data/products.json` — Starter Kit = `$9`
- Product link: `/products/starter-kit.html` (verified existing page)
- Arroz con pollo plate: `cooking-demo.mp4` (real footage shows cooked chicken + rice dish — can be used as plate reference or texture reference)
- Brand badge: `logo-badge-1024.png` (for end-card logo overlay)

**What the 3D render should show**:
- Character pointing at (or holding) a large yellow button that reads "GET THE $9 STARTER KIT"
- Character holding a plate of arroz con pollo (food texture from `cooking-demo.mp4` reference)
- Button design: bright yellow (`#9A7318` / `#F2C94E`), rounded corners, bold sans-serif text, shadow/glow effect
- End card also shows small logo badge (`logo-badge-1024.png`) in corner

---

## Production Path (Concrete — After This Brief)

Given this is the confirmed approach (external 3D tool, not Remotion server), the concrete steps are:

1. **Run prompt** (from `PRODUCTION-BRIEF.md` line 33) in your chosen tool:
   - Midjourney: `/imagine [prompt] --ar 9:16 --v 7 --style raw`
   - Runway Gen-3 Alpha: Text-to-video, paste prompt, 9:16, 5-10 sec
   - Sora: Text-to-video, same settings
   - (Include reference images: upload `public/assets/abuela's.jpg` + `public/assets/chatgpt-hero-20260826.png` as image prompts/reference in the tool if it supports reference uploads)

2. **Generate 4 scenes** (one per storyboard frame) OR generate the full 15-sec video in one prompt (most 3D video tools support continuous generation; if not, generate each scene separately and composite in Remotion or any video editor)

3. **Edit / composite** (two options):
   - **Option A — Remotion**: Import rendered MP4 into `remotion-abuelas-ipad/`, update `AbuelasIpad.tsx` to replace scene overlays with `<Video src="...mp4" />`, restart `npm run dev` (`localhost:3000`), render with `npx remotion render`
   - **Option B — Manual editor**: Import rendered MP4 + `cooking-demo.mp4` footage into Premiere / CapCut / iMovie; add burned-in captions (`captions-en.vtt` / `captions-es.vtt`); add yellow CTA button overlay; export 1080×1920, 30fps, H.264

4. **Subtitle confirmation needed** (before final export): burned-in (from VTT files) or separate track?

5. **Post to IG/FB** (`pr.sofritostudio` / `Sofrito Studio`): upload final MP4; caption uses the script from `post-ingredient-swap.md` (for Concept 1) or `PRODUCTION-BRIEF.md` scene descriptions (for Concept 2); link to `SS_PRICES` Starter Kit (`$9`)

---

This is the concrete example. The 3D prompt produces the 4 scenes. `abuela's.jpg` serves the kitchen/background layer. The component (`AbuelasIpad.tsx`) serves as the composition reference. There's no server running (`localhost:3000` stops after timeout) — this document IS the preview/reference for production.
