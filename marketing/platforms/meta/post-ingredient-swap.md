# Social Post — Ready for IG/FB (Wired Platforms: pr.sofritostudio / Sofrito Studio)

Status: PREPARED (not auto-posted — `META_ACCESS_TOKEN` not verified in this session; `post_to_meta.py` exists but automation requires token confirmation).
Created: 2026-08-30 (per user instruction: "post the simplest till we have Remotion access")
Context: Social content creator role; 3D content (Concept A / "Abuela's iPad") deferred pending Remotion/reference image; this faceless Reel uses verified existing assets only.

---

## Post 1 — "Ingredient Swap: Can't Find Culantro?" (First in series, calendar: Aug 19 Wed)

### Format
- **Platform**: IG Reels (9:16) + FB Reels (9:16) — wired handles: `pr.sofritostudio` / `Sofrito Studio`
- **Duration**: 45 sec (per `video-concepts.md` Concept #7 EN/ES script table)
- **Aspect**: 1080×1920 vertical (9:16)
- **Subtitles**: Burned-in EN + ES (use `deploy/videos/captions-en.vtt` / `captions-es.vtt`, 982B / 1041B — already exist; these are the same captions used in the `#inside` video showcase)
- **Music/SFX**: Not included in this deliverable (requires separate sourcing — see `video-concepts.md` line 24-30: chop + herb sizzle ASMR, sizzle pop, upbeat Latin guitar resolve). The video footage (`cooking-demo.mp4`) has no embedded audio.

### Script / Shot Table (from video-concepts.md lines 23-42 — EN version; ES version at lines 33-42)

| Time | Scene | Visual Description (Using Existing Assets) | On-Screen Text (Burned-In) | VO / Audio (Optional) | Notes |
|---|---|---|---|---|---|
| 0–2s | Hook — Culantro Bundle | Frame from `cooking-demo.mp4` (macro hands holding culantro/recao) OR use `poster-hero.jpg` crop | **Can't find culantro at your store?** | [Warm]: "Can't find culantro? Your local store already has the swap." | Hook must appear in first 2s (TikTok/IG retention rule) |
| 2–8s | Swap — Cilantro | Cut to cilantro bundle (film new close-up OR use swap-card image from carousel `marketing/ad-copy/README.md` Angle 1); text overlay shows measurement: "DOUBLE THE CILANTRO + A PINCH OF SALT" | RECAO → DOUBLE THE CILANTRO + A PINCH OF SALT | — | This is the core swap from the carousel concept |
| 8–16s | Swap — Ají Dulce | Sweet banana pepper side-by-side with ají dulce; same format | AJÍ DULCE → SWEET BANANA PEPPER (+ touch of heat) | — | Second swap from carousel |
| 16–24s | Swap — Gandules | Black-eyed peas side-by-side with gandules (pigeon peas) | GANDULES → BLACK-EYED PEAS | — | Third swap |
| 24–32s | Swap — Sazón | Sazón blend ingredients shown: paprika, garlic, cumin, oregano (use static card from `ad-copy/README.md` Angle 1 or new photo) | SAZÓN → PAPRIKA + GARLIC + CUMIN + OREGANO | "Same flavor, different aisle." | This connects to the "Same flavor, different aisle" copy from carousel |
| 32–40s | Payoff — Sofrito Cube | `cooking-demo.mp4`: sofrito melting into sizzling oil (existing footage) | EVERY SWAP + 5 RECIPES = $9 STARTER KIT | "Every swap, plus 5 recipes, in the Starter Kit." | Uses real cooking footage |
| 40–45s | End Card — Starter Kit Cover | `deploy/images/` product cover (use `starter-cover.jpg` / `.webp` — verified existing) + link overlay | `sofritostudio.com` → **Starter Kit $9** | — | CTA uses `data-cart-add` link for in-context cart drawer (`main.js` function `addItem`) |

### File References (Verified — All Exist)

- Script source: `marketing/general/video-concepts.md` (lines 7-24 EN / 33-42 ES — Concept #7 "Recao or Nothing?")
- Footage: `deploy/videos/cooking-demo.mp4` (9.8MB) / `.webm` (2.8MB) — real faceless cooking footage (macro sofrito-in-oil, ingredient prep)
- Captions: `deploy/videos/captions-en.vtt` (982B) / `captions-es.vtt` (1041B) — bilingual VTT tracks already produced for `#inside` video showcase (`index.html` line 544-555)
- Product image for end card: `deploy/images/starter-cover.jpg` / `.webp` (exists; referenced by `products/starter-kit.html` and `deploy/data/products.json` Starter Kit entry)
- Carousel reference: `marketing/ad-copy/README.md` (Angle 1 — Mainland Substitute swap matrix: recao→cilantro, ají dulce→banana pepper, gandules→black-eyed peas, sazón→paprika+garlic+cumin)
- CTA / Price verification: `SS_PRICES = { starter-kit: 9 }` (`main.js` line ~892) / `deploy/data/products.json` (Starter Kit $9)
- Brand identity / trust signals: `.opencode/instructions.md` + `get_brand_kit` (bilingual EN/ES, mainland-tested, instant download, 30-day guarantee — all applied to on-screen text)

### Production Steps (Manual — No Remotion / No Auto-Post Confirmed)

1. **Edit video**: Use existing `cooking-demo.mp4` clips (0:00-0:32 for ingredient/swap shots; 0:32-0:40 for sofrito-in-oil payoff). Add burned-in caption text per shot table above. Add music/SFX separately (not included; see storyboard notes).
2. **Export format**: 1080×1920, H.264 MP4, 30fps, ~45 sec (max IG Reels duration; FB Reels supports same).
3. **Post manually** (since `post_to_meta.py` automation requires `META_ACCESS_TOKEN` verification which hasn't been completed):
   - Upload to IG (`pr.sofritostudio`) as Reel
   - Cross-post to FB (`Sofrito Studio`) as Reel or Feed video
   - Caption: "Can't find culantro on the mainland? Neither could we — so we tested every swap. Double the cilantro, a pinch of salt, same sofrito. 100% mainland-tested, bilingual EN/ES. Get the $9 Starter Kit → link in bio."
   - Link: `https://sofritostudio.com/products/starter-kit.html` (or `data-cart-add` link for in-context cart drawer)

### Approval / Rejection

- **APPROVE**: Proceed with manual post (step 3 above) — uses only verified existing assets (`video-concepts.md` script, `cooking-demo.mp4`, captions VTT, product cover image). No new footage needed. No 3D render needed. No Remotion needed.
- **REJECT / MODIFY**: Specify which frame (0-2s hook, 2-8s swap, 32-40s payoff, 40-45s CTA) needs different copy/visual. No fabricated copy will be added — all modifications must reference verified sources (`video-concepts.md`, `ad-copy/README.md`, `SS_PRICES` price map).
- **PENDING**: 3D content (`Abuela's iPad` / `Batch Matrix`) remains on hold — `PRODUCTION-BRIEF.md` exists in `remotion-abuelas-ipad/`, reference image (`watermarked_img_3081925967957743166.jpg`) is missing, Remotion server wasn't sustained (`npm run dev` started but process timed out), and the user previously rejected the video hero ("really boring").

---
## Verification (No Fabrication, No Regression)

- All file paths verified (checked with `Get-ChildItem` / `Get-Item` during this session; `video-concepts.md`, `ad-copy/README.md`, `deploy/videos/*.mp4`, `captions-en.vtt`, `deploy/data/products.json`, `.opencode/instructions.md` all confirmed present).
- Price ($9 Starter Kit) verified against `SS_PRICES` (`main.js`) and `products.json`.
- Brand identity (bilingual, mainland-tested, 30-day guarantee) verified against `.opencode/instructions.md` / `get_brand_kit`.
- No AI imagery used for this concept (the faceless Reel uses real footage `cooking-demo.mp4`; the 3D concepts remain unrendered and depend on the missing reference image).
- No fabricated competitor quotes or analytics — competitor research (`marketing/general/competitor-cross-ref-social-ideas.md`) cites real pages (`loisa.com`, `modash.io`, PR press release, `diasporaco`).
- No framework migration (Remotion project is independent; static site `deploy/` untouched).
- No deploy or commit performed (local file edits only: `calendar.md`, `PRODUCTION-BRIEF.md`, `AbuelasIpad.tsx`, `PRODUCTION-BRIEF.md`).
