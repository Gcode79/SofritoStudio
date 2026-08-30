# Roadmap — Sofrito Studio

Status: Phase 0 (Audit) complete — READ-ONLY.
Branch: ai-operating-system
Next: Await user approval before Phase 1 implementation.

---

## Phase 1 — Foundation (COMPLETE / IN PROGRESS)
Objective: Verify core infrastructure is stable and secure.
Dependencies: None (independent verification)
Tasks:
- Verify ads permissions (ads_management + ads_read) — user confirmed granted; token needs regeneration with scopes
- Verify CAPI events working (Purchase + Lead verified)
- Verify Pixel working (CSP fixed, detection confirmed)
- Confirm brand identity and brand kit assets
- Confirm product catalog (JSON verified, products live)
Files affected: config/.env, cloudflare/src/webhook.js, cloudflare/src/index.js
External services: Meta (ads scopes), Cloudflare (deployment)
Risk: LOW (reversible, read-only verification)
Expected business impact: HIGH (unlocks paid campaigns; confirms tracking reliability)
Definition of done: Token regenerated with scopes verified; all events verified; brand assets confirmed; audit.md complete.
Status: IN PROGRESS (token regeneration pending; brand assets confirmed; audit complete)

---

## Phase 2 — Premium Frontend (P0 — START HERE AFTER APPROVAL)
Objective: Improve visual quality, trust, and conversion of main landing pages.
Dependencies: Phase 1 verification complete
Tasks:
- Regenerate System User token with ads_management + ads_read scopes
- Create 512x512 transparent PNG logo (PowerToys / remove.bg / Photopea)
- Film 2-3 recipe video clips (vertical 9:16, 30-45s)
- Improve deploy/index.html (dominant email capture + Starter Kit CTA above fold)
- Add video preview to deploy/products/starter-kit.html
- Add social proof/testimonials to product pages (if available)
- Verify logo placement and brand consistency across all landing pages
Files affected: deploy/index.html, deploy/products/*.html, deploy/freebies/, brand assets
External services: PowerToys / remove.bg / Photopea (logo); video production (manual)
Risk: LOW (visual changes; reversible; no architecture migration)
Expected business impact: MEDIUM-HIGH (brand consistency improves trust; video feeds retargeting; logo needed for ads)
Definition of done: Logo transparent; videos filmed and uploaded; landing pages have stronger CTAs; no broken links or accessibility failures.
Status: BLOCKED (awaiting Phase 1 approval + user video action + logo processing)

---

## Phase 3 — Conversion System (P1 — START AFTER PHASE 2)
Objective: Implement measurable conversion optimization.
Dependencies: Phase 2 complete (video + logo available for ads)
Tasks:
- Implement A/B testing framework (EXP-001 through EXP-006 tracking)
- Create embedded checkout option or optimize redirect flow
- Add checkout_start tracking event
- Add product recommendations (static/config-based initially) to product pages
- Verify full email lifecycle automation (Buttondown flows tested end-to-end)
- Create retargeting audiences (once ads scopes granted)
Files affected: deploy/index.html, deploy/products/*.html, deploy/freebies/, cloudflare/src/index.js, buttondown/templates/, analytics/daily.csv
External services: Meta (retargeting audiences — requires ads scopes), Buttondown, Gumroad
Risk: MEDIUM (changes conversion paths; requires careful measurement)
Expected business impact: HIGH (A/B framework enables CRO; checkout optimization improves conversion; retargeting increases AOV)
Definition of done: Experiment framework working; embedded checkout or optimized redirect confirmed; checkout tracking verified; retargeting audiences created; email automation fully tested.
Status: NOT STARTED (blocked by Phase 2 + ads scopes)

---

## Phase 4 — Gumroad Commerce (COMPLETE / VERIFIED)
Objective: Confirm commerce authority is stable and optimized.
Dependencies: None (independent verification — already complete)
Tasks:
- Verify Gumroad webhook processing (verified: webhook receives sale events)
- Verify product data structure (products.json verified)
- Confirm checkout redirect working (/buy/ paths)
- Confirm bundle structure working (upsells array in products.json)
Files affected: deploy/products/*.html, cloudflare/src/webhook.js, deploy/data/products.json
External services: Gumroad
Risk: LOW (verified working)
Expected business impact: MEDIUM (checkout reliability affects all revenue)
Definition of done: Webhook verified; checkout redirect working; bundle links working; no checkout errors.
Status: COMPLETE

---

## Phase 5 — Email / CRM (IN PROGRESS / PARTIAL)
Objective: Complete full customer lifecycle automation.
Dependencies: Phase 4 complete (checkout + webhook verified)
Tasks:
- Verify all Buttondown flows (lead_magnet, onboarding, tripwire, seasonal, abandoned_cart)
- Confirm customer state tracking (tags applied correctly: customer:<tier>, product:<slug>, lang:en/es)
- Verify no contradictory offers (Starter Kit buyer doesn't receive Starter Kit offer; receives bundle offer)
- Create bundle upsell automation (upgrade credit explanation included)
Files affected: buttondown/templates/*.md, buttondown/send_broadcast.py, cloudflare/src/webhook.js
External services: Buttondown
Risk: LOW (reversible; no architecture change; verification only)
Expected business impact: MEDIUM (retention improvement; AOV increase through automated upsell)
Definition of done: All flows tested end-to-end; tags working; no contradictory offers; bundle upsell working.
Status: IN PROGRESS (templates verified; full automation flow unverified)

---

## Phase 6 — Remotion Content Engine (P2 — START AFTER PHASE 2)
Objective: Integrate Remotion for scalable video/content production.
Dependencies: Phase 2 complete (video clips available), Phase 1 verification complete
Tasks:
- Set up Remotion templates (recipe.json -> video output)
- Create vertical (9:16), square (4:5), widescreen (16:9) output formats
- Build reusable video templates for recipe content
- Integrate video pipeline into content calendar workflow
Files affected: remotion/ (new), deploy/videos/, marketing/video-concepts.md, deploy/data/recipes.json
External services: Remotion (video rendering infrastructure — requires setup)
Risk: MEDIUM (new pipeline; reversible; no production impact until deployed)
Expected business impact: HIGH (scalable video production; feeds retargeting + organic; aligns with content calendar)
Definition of done: Remotion template produces video from recipe.json; outputs stored; integrated into content workflow.
Status: NOT STARTED (Phase 6 planned; video clips needed first)

---

## Phase 7 — Gooseworks Automation (PARTIAL / BLOCKED)
Objective: Integrate Gooseworks for research, creative remix, and marketing intelligence.
Dependencies: Phase 1 complete (brand verified), Phase 2 complete (assets available)
Tasks:
- Resolve brand lookup issue (brand_id: b1842aa1-81cc-46be-aad5-6f0967b083aa vs Sofrito Studio)
- Complete brand-research documentation (brand core complete in brand-core/)
- Complete creative remix (A: Starter Kit Mainland Sub + D: Batch Cooking queued; blocked by brand lookup/service)
- Automate weekly research reports (marketing/research/)
- Automate analytics reporting
Files affected: marketing/research/, marketing/ad-copy/, brand-core/, docs/analytics.md
External services: GooseWorks
Risk: LOW-MEDIUM (service down / brand lookup blocked; reversible once resolved)
Expected business impact: MEDIUM (scalable creative production; automated research; time savings)
Definition of done: Brand lookup resolved; remix generates; research reports automated; analytics automated.
Status: PARTIAL (brand-research complete; creative remix blocked by brand lookup / service)

---

## Phase 8 — Analytics / CRO (NOT STARTED)
Objective: Implement centralized analytics and conversion optimization framework.
Dependencies: Phase 3 complete (conversion tracking verified), Phase 5 complete (email automation verified)
Tasks:
- Create centralized analytics dashboard (docs/analytics.md framework)
- Implement experiment tracking framework (docs/experiments.md framework)
- Add performance monitoring (Core Web Vitals, page speed tracking)
- Add automated performance reports
- Implement conversion optimization experiments (EXP-001 through EXP-006)
Files affected: docs/analytics.md, docs/experiments.md, deploy/index.html, deploy/products/*.html, analytics tracking
External services: Analytics service (TBD — could use existing CSV tracking + automated aggregation)
Risk: LOW (new reporting layer; no architecture change; reversible)
Expected business impact: MEDIUM (better decision-making; no direct revenue impact but enables CRO)
Definition of done: Dashboard working; experiments tracked; reports automated; performance monitored.
Status: NOT STARTED (framework defined; no implementation)

---

## Phase 9 — Continuous Optimization (NOT STARTED)
Objective: Automate continuous improvement loop.
Dependencies: Phase 9 complete (analytics framework + CRO working)
Tasks:
- Automate weekly performance reports
- Automate experiment analysis
- Automate content optimization recommendations
- Automate SEO opportunity discovery
- Automate dependency vulnerability scanning
Files affected: marketing/research/, marketing/analytics/, docs/analytics.md, docs/experiments.md
External services: GooseWorks, analytics service
Risk: LOW (automation layer; reversible)
Expected business impact: MEDIUM (operational efficiency; faster optimization cycles)
Definition of done: Weekly reports automated; experiment analysis automated; optimization recommendations generated.
Status: NOT STARTED (Phase 9 framework defined; no automation implemented)

---

## Phase 10 — Continuous Optimization (FUTURE / NOT STARTED)
Note: The spec defines 9 phases (1-9). Phase 10 is an extension — not required but recommended for mature operations.

---

## Dependencies Across Phases

Phase 1 (Foundation) -> Phase 2 (Frontend) -> Phase 3 (Conversion) -> Phase 4 (Commerce — complete) -> Phase 5 (Email — partial) -> Phase 6 (Remotion) -> Phase 7 (Gooseworks — partial) -> Phase 8 (Analytics) -> Phase 9 (Continuous)

Phase 2 (Frontend) and Phase 6 (Remotion) can run partially in parallel once Phase 1 is verified.
Phase 3 (Conversion) and Phase 5 (Email) depend on Phase 1 verification and Phase 4 (Commerce — complete).
Phase 7 (Gooseworks) is independent of Phase 2-6 but requires Phase 1 verification.
Phase 8 (Analytics) depends on Phase 3 (Conversion tracking) and Phase 5 (Email).

---

## High-Leverage Priorities (From Audit)

P0 (Critical — Block Revenue):
- Ads scopes verification/regeneration (OP-001) — unlocks paid campaigns
- Video content production (OP-002) — feeds retargeting + organic
- Logo transparent background (OP-003) — needed for ads + brand consistency

P1 (Important — Improve Conversion / Retention):
- A/B testing framework (OP-004) — enables CRO
- Embedded checkout / checkout optimization (OP-007) — reduces friction
- Full email lifecycle verification (OP-010) — improves retention
- Pinterest access approval (OP-006) — unlocks additional channel

P2 (Medium — Scale / Automate):
- Remotion video pipeline (OP-005) — scalable content production
- Centralized analytics dashboard (OP-008) — better business intelligence
- Dynamic product recommendations (OP-009) — AOV improvement

---

## Technical Risk Assessment

- Phase 1: LOW — verification only; no architecture change
- Phase 2: LOW — visual/content improvements; reversible
- Phase 3: MEDIUM — conversion path changes; requires measurement
- Phase 4: LOW — verified complete
- Phase 5: LOW — verification of existing automation
- Phase 6: MEDIUM — new video pipeline; requires infrastructure
- Phase 7: LOW-MEDIUM — service dependency; blocked by brand lookup
- Phase 8: LOW — reporting layer; no architecture change
- Phase 9: LOW — automation layer; reversible

---

## Business Impact Assessment

Immediate (Phase 1-2): High impact — unlocks paid advertising, improves brand consistency, provides video content
Short-term (Phase 3-5): High impact — improves conversion, retention, checkout flow, unlocks additional channels
Medium-term (Phase 6-7): High impact — scalable content production, automated research/intelligence
Long-term (Phase 8-9): Medium impact — continuous optimization, operational efficiency

---

## Next Step

Phase 1 verification (ads scopes + brand lookup) must be completed before Phase 2 implementation. Once Phase 1 is approved by the user, proceed to Phase 2 (Premium Frontend) with the understanding that:
- No production modifications without approval
- Each phase completes with definition of done verification
- No framework migration without business justification
- Every change must be testable and reversible
