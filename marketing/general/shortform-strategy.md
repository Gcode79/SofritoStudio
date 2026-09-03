# Short-Form Video Strategy — Puerto Rican Diaspora Cooks

Two high-converting faceless concepts for Reels / TikTok / Shorts (9:16, hands
+ ingredients only, burned-in bilingual captions). Each is scripted in English
and Spanish with hook → shots → on-screen text → CTA. Batch-film 3 takes per
concept per session.

CTA links:
- $9 Starter Kit: `https://sofritostudio.com/products/starter-kit.html` (also
  opens the cart drawer in-context via `data-cart-add`)
- Recipe database: `https://sofritostudio.com/recipe-db.html`
- Swap guides: `https://sofritostudio.com/blog/mainland-ingredients.html`
  and `https://sofritostudio.com/blog/hawaii-adaptations.html`

---

## Concept 1 · Ingredient Swaps  (CTA → $9 Starter Kit)

**Goal:** show that authentic boricua food works with what's at ANY local
supermarket (mainland or Hawaii) — then convert to the Starter Kit.

### ENGLISH (≈45–55s)
| Time | Visual | On-screen text (overlay) | Audio hook (optional VO) |
|---|---|---|---|
| 0–2s | Hands hold a bunch of culantro/recao | HOOK: "Can't find culantro at your store?" | "Can't find culantro? Your local store already has the swap." |
| 2–8s | Cut to a bunch of cilantro; hands double it + add a pinch of salt | RECAO → DOUBLE THE CILANTRO + A PINCH OF SALT | — |
| 8–16s | Ají dulce → sweet banana pepper side-by-side | AJÍ DULCE → SWEET BANANA PEPPER (+ touch of heat) | — |
| 16–24s | Gandules → black-eyed peas | GANDULES → BLACK-EYED PEAS | — |
| 24–32s | Sazón ingredients (paprika, garlic, cumin) | SAZÓN → PAPRIKA + GARLIC + CUMIN + OREGANO | "Same flavor, different aisle." |
| 32–45s | Sofrito cube melting into sizzling oil | EVERY SWAP + 5 RECIPES = $9 STARTER KIT | "Every swap, plus 5 recipes, in the Starter Kit." |
| 45–55s | END CARD: Starter Kit cover + link | `sofritostudio.com` → $9 Starter Kit | — |

### ESPAÑOL (≈45–55s)
| Time | Visual | Texto en pantalla | Audio |
|---|---|---|---|
| 0–2s | Mano con recao/culantro | HOOK: "¿No encuentras culantro en tu tienda?" | "¿No encuentras culantro? Tu tienda local ya tiene el swap." |
| 2–8s | Cilantro duplicado + pizca de sal | RECAO → DUPLICA EL CILANTRO + PIZCA DE SAL | — |
| 8–16s | Ají dulce → chile banana dulce | AJÍ DULCE → CHILE BANANA DULCE (+ un toque de picante) | — |
| 16–24s | Gandules → guisantes de ojo negro | GANDULES → GUISANTES DE OJO NEGRO | — |
| 24–32s | Sazón (pimentón, ajo, comino) | SAZÓN → PIMENTÓN + AJO + COMINO + ORÉGANO | "Mismo sabor, otro pasillo." |
| 32–45s | Cubo de sofrito en aceite | CADA SWAP + 5 RECETAS = KIT DE INICIO $9 | "Cada swap, más 5 recetas, en el Kit de Inicio." |
| 45–55s | TARJETA FINAL: Kit de Inicio + link | `sofritostudio.com` → Kit de Inicio $9 | — |

**Variants:** Hawaii cut — swap the ají dulce/sazón shots for taro/kabocha/local
fish (link to the Hawaii guide). West/East Coast overlay copy can be geo-swapped
from the edge banner copy if filmed once and captioned per region.

---

## Concept 2 · Cultural Nostalgia  (CTA → recipe database)

**Goal:** evoke the abuela's kitchen and the diaspora connection; drive traffic
to the searchable recipe hub where every dish lives.

### ENGLISH (≈40–50s)
| Time | Visual | On-screen text (overlay) | Audio hook |
|---|---|---|---|
| 0–2s | Hands pound green plantains in a pilón (wooden mortar) | HOOK: "This is how mofongo gets made in our kitchen." | "This is how mofongo gets made in our kitchen." |
| 2–10s | Green plantains frying, cut to the mash | GREEN PLANTAINS ONLY | "Green, never yellow — that's the rule." |
| 10–18s | Garlic + chicharrón added, mashing while hot | MASH WHILE HOT · GARLIC + CHICHARRÓN | — |
| 18–28s | Dome plated, steam rising | WORK FAST — IT STIFFENS | — |
| 28–40s | Overlay to the recipe hub grid | 30+ BILINGUAL RECIPES → SEARCHABLE HUB | "The whole library is free to browse — 30+ bilingual recipes." |
| 40–50s | END CARD: recipe index + link | `sofritostudio.com/recipe-db` | — |

### ESPAÑOL (≈40–50s)
| Time | Visual | Texto en pantalla | Audio |
|---|---|---|---|
| 0–2s | Manos machacando plátanos verdes en el pilón | HOOK: "Así se hace el mofongo en nuestra cocina." | "Así se hace el mofongo en nuestra cocina." |
| 2–10s | Plátanos verdes fritos, corte al machacado | SOLO PLÁTANOS VERDES | "Verde, nunca amarillo — esa es la regla." |
| 10–18s | Ajo + chicharrón, machacando caliente | MACHACA CALIENTE · AJO + CHICHARRÓN | — |
| 18–28s | Cúpula servida, vapor | TRABAJA RÁPIDO — SE ENDURECE | — |
| 28–40s | Transición a la cuadrícula del índice | 30+ RECETAS BILINGÜES → BUSCA TODO | "Toda la biblioteca es gratis — más de 30 recetas bilingües." |
| 40–50s | TARJETA FINAL: índice + link | `sofritostudio.com/recipe-db` | — |

**Variants:** batch-prep (sofrito cubes into the tray), toston press, pernil
24-hour marinade — all reuse the same hook/CTA template. Cross-post to IG + FB
via `marketing/platforms/meta/post_to_meta.py`; TikTok hooks live in `marketing/platforms/tiktok/hooks.md`.

---

## Production notes
- 9:16, hands + ingredients only, shot at 4K then cropped to 1080×1920.
- Hook in the first 2s; one technique per video; one CTA at the end.
- Burned-in captions EN + ES (both concepts are already dual-language).
- The $9 Starter Kit CTA can be a `data-cart-add` link on a companion landing
  page so taps open the cart drawer in-context (see `/recipe-db.html` unlock
  pattern).

## Companion email nurture (already wired in the Worker)
The 3-part sequence for free-guide subscribers:
1. **Day 0** — `welcome_15`: deliver Sofrito 101 + 15% code + $9 Starter Kit hook.
2. **Day 3** — `nurture_swaps`: substitution secrets + La Mesa Boricua ($47).
3. **Day 7** — `nurture_heritage`: heritage + social proof + urgency.
Runs automatically from the hourly cron (`/api/cron/run`); stops if the lead
converts.