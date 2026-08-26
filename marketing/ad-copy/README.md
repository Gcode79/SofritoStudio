# Sofrito Studio — Ad Creative Library

Versioned creative assets for paid/organic social (Meta Reels/Feed/Stories,
Pinterest pins, carousels, 3D prompts). Each concept follows the standing
advertising directives in `.opencode/instructions.md`.

Platform specs (target viewer local time; see Dayparting directive):
- Instagram: Reels 9:16 · Feed 4:5 · Stories 9:16 (safe zones top/bottom 250px)
- Facebook: Reels 9:16 · Feed 4:5 · Stories 9:16
- Pinterest: 2:3 pins (1000x1500)

Trust signals to include in every ad: "Bilingual EN/ES", "Mainland Ingredient
Swaps", "30-Day Money-Back Guarantee".

---

## 1. Cold-Traffic Campaign — $9 Starter Kit (4 angles)

### Angle 1 — Mainland Substitute
- **Visual hook:** split screen empty Latin aisle -> frozen recao pack -> sofrito sizzling
- **EN:** "Can't find recao on the mainland? Neither could we — so we tested every swap.
  Double the cilantro, a pinch of salt, same sofrito. 100% mainland-tested, bilingual EN/ES."
- **ES:** "¿No encuentras recao en el mainland? Nosotros tampoco — y por eso probamos cada
  sustitución. Doble cilantro, una pizca de sal, el mismo sofrito."
- **Headline:** Authentic Boricua Flavor, Mainland Ingredients
- **CTA:** Get the $9 Starter Kit -> /products/starter-kit.html

### Angle 2 — Nostalgia & Heritage
- **Visual hook:** warm kitchen, abuela's hands folding pasteles -> tablet showing EN+ES recipe
- **EN:** "The first time I made arroz con pollo without calling my mother, I knew I'd gotten it
  right. 30 authentic recipes from the Ortiz kitchen — written down so you can pass them on."
- **ES:** "La primera vez que hice arroz con pollo sin llamar a mi madre, supe que al fin lo había logrado."
- **Headline:** Tastes Just Like Abuela's — Written Down
- **CTA:** Get La Mesa Boricua -> /products/la-mesa-boricua-sales.html

### Angle 3 — Busy Weeknight
- **Visual hook:** 6pm kitchen chaos -> timelapse mofongo -> family at table
- **EN:** "It's Tuesday. You're tired. Dinner should not be a research project. 50 boricua dinners
  planned end-to-end — shopping list to table."
- **ES:** "Es martes. Estás cansado. La cena no debería ser un proyecto de investigación."
- **Headline:** What's for Dinner? Already Solved.
- **CTA:** Get Boricua Weeknights -> /products/boricua-weeknights.html

### Angle 4 — Low-Friction Entry
- **Visual hook:** phone -> tap -> recipe card animates EN->ES
- **EN:** "Your first 5 Puerto Rican recipes — $9. Sofrito, arroz con pollo, pernil, tostones, flan."
- **ES:** "Tus primeras 5 recetas puertorriqueñas — $9."
- **Headline:** 5 Essential Recipes. $9. Both Languages.
- **CTA:** Get the Starter Kit -> /products/starter-kit.html

---

## 2. Retargeting — $67/$97 Bundles (3 angles)

### R1 — System Upgrade
- **EN:** "You tried the $9 Starter Kit. The sofrito batch is in your freezer. Now what? The Full
  Table gives you every guide — 30+ recipes, meal plans, printables — one download, one price."
- **ES:** "Probaste el Starter Kit de $9. ¿Y ahora qué?"
- **Headline:** You're Ready for the Full Table
- **CTA:** Get the Full Table -> /products/full-table.html

### R2 — Bundle Value
- **EN:** "Buy them separately and it's more. As the Kitchen Bundle, it's $67 for every cookbook,
  planner, and printable — bilingual, for life."
- **ES:** "Comprándolos por separado cuesta más."
- **Headline:** The Whole Library. One Price.
- **CTA:** Get the Kitchen Bundle -> /products/kitchen-bundle.html

### R3 — Money-Back De-risk
- **EN:** "Not sure it'll taste like home? Try it for 30 days. If it doesn't hit, full refund —
  no questions, no forms."
- **ES:** "¿No estás seguro de que sepa a hogar? Pruébalo por 30 días."
- **Headline:** 30 Days. Full Refund. Zero Risk.
- **CTA:** Try It Risk-Free -> /products/la-mesa-boricua-sales.html

---

## 3. Lead Magnet — Free Sofrito 101 (4 variations)

- **B1 Lead Magnet:** phone->tap->recipe EN->ES. "Free: the sofrito guide that unlocks every
  boricua recipe." Headline: Master Sofrito. Free. CTA: /freebies/sofrito-101.html
- **B2 Lead + 15%:** "FREE guide + 15% off your first kit — code SOFRITO15 for 7 days."
  CTA: /products/starter-kit.html?coupon=SOFRITO15
- **B3 Spanish-primary:** "El secreto de la cocina boricua es gratis." Headline: El Sofrito, Gratis.
  CTA: /es/freebies/sofrito-101.html
- **B4 POV:** email->download->sofrito on stove. "From Email to Sizzle in 2 Minutes."
  CTA: /freebies/5-beginner-recipes.html

---

## 4. Cinematic Reels (ASMR, 9:16) — full shot tables in session history

- **"Emerald in the Oil"** ($9 Kit, swaps) — macro sofrito-in-oil hook, recao->cilantro swap card,
  tablet EN->ES, sizzle ASMR. CTA /products/starter-kit.html
- **"Tuesday, Solved"** ($9 Kit, weeknight) — 6pm timer hook, one-pot, swap notes, family table. CTA same.
- **Stories cut:** both reels have safe-zone layout (top: brand; bottom: CTA pill; mid clean).
- **4:5 static variant** of "Tuesday, Solved" for IG/FB Feed.

## 5. Carousels

- **Sofrito 101 swap matrix (4 slides, 4:5):** hook -> recao->cilantro -> ají dulce->cubanelle +
  malanga->yuca -> CTA /freebies/sofrito-101.html
- **"From the Guide — Prove It" (4 slides):** every swap tested -> matrix -> batch plan -> CTA.

## 6. Pinterest Pins (2:3) — queued in marketing/pins.json

- 12 pins total (10 recipe pins + 2 Sofrito-101 swap/batch pins).
- New pin concepts: "The Sofrito Swap Sheet" and "Batch Sofrito in 20 Minutes".
- NOTE: the 2 new pin image files (sofrito-swap-sheet-pin.png, sofrito-batch-plan-pin.png) still
  need to be rendered into deploy/images/pins/ before the pipeline can publish them.

## 7. 3D / AI-Generated Concepts (prompt-ready for Runway/Sora/Midjourney)

Style baseline for all 3D concepts: match the reference frame in
`C:\Users\josho\Downloads\watermarked_img_3081925967957743166.jpg`
(character rendering, lighting, color grade), re-framed to destination ratio.

- **"Abuela's iPad"** (9:16 Reel, $9 Kit): Pixar-style 3D abuela, floating sofrito/garlic/recao
  orbit, iPad EN->ES, multi-device reveal, gold CTA. Full prompt in session history.
- **"The Full Table, Floating"** (16:9 pre-roll, $67 Bundle): 3D cook + isometric library tower,
  floating devices, pernil/rice/plantain food accents. Full prompt in session history.

## 8. Reference — Downloads example (3D/animated style match)

- Source: `C:\Users\josho\Downloads\watermarked_img_3081925967957743166.jpg`
- Spec: 1408x768 (1.83:1), JPEG — widescreen 3D/animated ad frame.
- Use: **emulated style reference** for the 3D/AI concepts below — any generation that
  targets this look must take it as the visual style baseline (character rendering,
  lighting, grading), re-framed to the destination ratio (4:5 feed / 9:16 reel).
- Status: style directive noted in prompts; pixel-level matching requires image input
  (not available in current model) — regenerate prompts once visual can be reviewed.

---

## Funnel architecture (first 8 weeks)

| Stage | Campaign | Creative | Goal |
|---|---|---|---|
| Prospecting | Free Sofrito 101 | B1/B3 | Lead volume |
| Prospecting | $9 Starter Kit | Angles 1-4 + geo | First purchase |
| Retargeting | Visitors/kit-buyers -> bundles | R1-R3 | $67/$97 AOV |
| Email | Post-purchase/abandoned | Broadcast-aligned 10a/7p | Cross-sell |