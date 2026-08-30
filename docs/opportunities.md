# Top 10 Opportunities — Sofrito Studio

Status: READ-ONLY assessment (no modifications)
Methodology: Impact × Confidence ÷ Effort (scored by verified gaps from audit + brand-research)

---

## OPPORTUNITY 1 — Ads Management Scopes

ID: OP-001
Name: Grant ads_management + ads_read permissions
Problem: System User token lacks `ads_management` and `ads_read` scopes. Paid campaigns cannot run.
Hypothesis: Regenerating the System User token with both scopes will unlock Meta Ads Manager access, enabling paid campaigns for Starter Kit and bundles.
Expected business impact: HIGH (unlocks paid acquisition channel; estimated $100-500/month in ad spend potential)
Technical complexity: LOW (token regeneration + upload + redeploy)
Risk: LOW (reversible — can revert token; no production impact)
Dependencies: Meta App Review / Permissions and Features (user confirmed granted; needs token regeneration)
Recommended agent: backend (token/regeneration) + growth (ad campaign setup)
Priority: P0 (Critical — blocks all paid advertising)
Status: User confirmed permissions granted; token needs verification/regeneration

---

## OPPORTUNITY 2 — Video Content Production

ID: OP-002
Name: Film 2-3 recipe video clips
Problem: Video content folder (deploy/videos/) has poster images but no integrated recipe videos. Remotion pipeline not integrated. Organic + retargeting audiences lack video assets.
Hypothesis: Creating 30-45s vertical recipe clips (sofrito blend, ingredient swap, family at table) will feed both organic reels and retargeting campaigns, increasing engagement and conversion.
Expected business impact: HIGH (video drives higher engagement; needed for retargeting audiences; supports Remotion integration in Phase 6)
Technical complexity: MEDIUM (filming + editing + uploading; Remotion integration is Phase 6)
Risk: LOW (reversible — videos can be updated; no production impact)
Dependencies: User action (film clips); logo transparent background (for branding in videos)
Recommended agent: growth (video concepts from marketing/video-concepts.md) + frontend (Remotion integration later)
Priority: P0 (Critical — needed for retargeting + organic engagement)
Status: Pending — user needs to film 2-3 clips; Remotion pipeline Phase 6

---

## OPPORTUNITY 3 — Logo Transparent Background

ID: OP-003
Name: Remove background from logo-badge.png
Problem: Logo file (`logo-badge.png`) has white/opaque background. Transparent PNG needed for ads, brand consistency, and video overlays.
Hypothesis: 512x512 transparent PNG version of the logo will improve brand consistency across ads, video content, and social assets.
Expected business impact: MEDIUM (brand consistency improves trust; needed for paid creative assets; no direct revenue impact but supports conversion)
Technical complexity: LOW (PowerToys Image Resizer, remove.bg, or Photopea — user has PowerToys installed)
Risk: LOW (reversible — original preserved; no production impact)
Dependencies: User action (process image); file at gumroad-uploads/All-Product-Images/Sofrito-Studio-Brand-Kit/logo-badge.png
Recommended agent: frontend (asset processing) + growth (ad creative consistency)
Priority: P0 (Critical — needed for ads + video + brand consistency)
Status: User exploring PowerToys / remove.bg; 512×512 spec confirmed

---

## OPPORTUNITY 4 — A/B Testing Framework

ID: OP-004
Name: Implement experiment tracking framework
Problem: No experiment tracking exists. Changes to site (headline, CTA, pricing presentation) are made without measurement. No EXP-001 through EXP-006 tracking framework.
Hypothesis: Creating an experiment framework (experiment ID, hypothesis, audience, control, variant, metrics, start/end, result, decision) will allow measurable conversion optimization.
Expected business impact: HIGH (enables data-driven CRO; potential 10-30% conversion improvement over time)
Technical complexity: MEDIUM (requires tracking framework + measurement logic; does not require major architecture change)
Risk: MEDIUM (requires careful measurement; reversible — experiments can be turned off)
Dependencies: Analytics framework (Phase 8); tracking events (existing pixel + CAPI)
Recommended agent: backend (tracking framework) + growth (experiment design) + reviewer (results verification)
Priority: P1 (Important — enables CRO)
Status: Not started — framework defined in audit (EXP-001 through EXP-006)

---

## OPPORTUNITY 5 — Remotion Video Pipeline

ID: OP-005
Name: Integrate Remotion for programmatic video production
Problem: Remotion not integrated. Video content manually produced (or not produced). No programmatic video pipeline from recipe.json to video formats.
Hypothesis: Building Remotion templates that read recipe.json and output vertical (9:16), square (4:5), and widescreen (16:9) formats will scale video production efficiently.
Expected business impact: HIGH (video drives engagement; feeds retargeting + organic; scalable content production; aligns with content calendar)
Technical complexity: HIGH (new pipeline; requires Remotion setup; video rendering infrastructure; storage for outputs)
Risk: MEDIUM (reversible — templates can be disabled; no production impact until deployed)
Dependencies: Remotion installation; video concepts defined (marketing/video-concepts.md); recipe.json structure verified
Recommended agent: frontend (Remotion templates) + growth (video strategy) + backend (video storage/delivery)
Priority: P2 (Medium — high impact but complex; not blocking revenue immediately)
Status: Not started — Phase 6 planned; video scripts exist (tiktok-hooks.md, video-concepts.md)

---

## OPPORTUNITY 6 — Pinterest Standard Access

ID: OP-006
Name: Complete Pinterest Standard Access approval
Problem: Pinterest pipeline blocked (post_scheduler.py reports block). 12 pins queued (marketing/pins.json) but cannot publish without Standard access.
Hypothesis: Completing Pinterest approval will unlock an additional organic + paid channel, driving traffic to landing pages and products.
Expected business impact: MEDIUM (additional traffic channel; Pinterest users have high purchase intent; aligns with content calendar)
Technical complexity: LOW (approval process — user action; no code change needed once approved)
Risk: LOW (reversible — pipeline already exists; approval just unlocks it)
Dependencies: User action (Pinterest account approval); marketing/pins.json verified; pipeline code exists
Recommended agent: growth (social automation)
Priority: P1 (Important — unlocks queued content and additional channel)
Status: Pipeline exists (post_scheduler.py); 12 pins queued; approval needed

---

## OPPORTUNITY 7 — Embedded Checkout Option

ID: OP-007
Name: Add embedded checkout or improve checkout flow
Problem: Checkout relies solely on redirect to Gumroad. No embedded checkout option. No checkout start tracking event.
Hypothesis: Improving checkout flow (embedded option or optimized redirect) and adding checkout_start tracking will improve conversion visibility and potentially conversion rate.
Expected business impact: MEDIUM (checkout friction affects conversion; visibility into checkout abandonment enables optimization)
Technical complexity: MEDIUM (embedded checkout requires Gumroad integration; redirect optimization is simpler; tracking event addition is low complexity)
Risk: LOW (reversible — redirect option maintained as fallback)
Dependencies: Gumroad integration verified; tracking framework (Phase 8)
Recommended agent: backend (checkout flow + tracking) + growth (conversion optimization)
Priority: P1 (Important — checkout is critical conversion point)
Status: Redirect verified working; embedded checkout not implemented

---

## OPPORTUNITY 8 — Centralized Analytics Dashboard

ID: OP-008
Name: Build centralized analytics dashboard
Problem: Analytics is manual (analytics/daily.csv). No centralized dashboard for business decisions. No automated reporting.
Hypothesis: Creating a centralized analytics dashboard (even basic) that aggregates page views, product views, checkout starts, purchases, email signups, and content engagement will enable faster business decisions.
Expected business impact: MEDIUM (better decision-making speed; no direct revenue impact but improves strategic direction)
Technical complexity: LOW (basic dashboard; can start with manual CSV aggregation + automated reporting)
Risk: LOW (reversible; no production impact)
Dependencies: Tracking events (verified); data sources (pixel, CAPI, Buttondown, Gumroad webhooks)
Recommended agent: backend (data aggregation) + growth (report design) + reviewer (verification)
Priority: P2 (Medium — important for business intelligence; not blocking revenue)
Status: Manual tracking only; dashboard framework not started

---

## OPPORTUNITY 9 — Dynamic Product Recommendations

ID: OP-009
Name: Add dynamic product recommendations to site
Problem: No product recommendations on site. Users must manually navigate between products. No cross-sell mechanism integrated into website.
Hypothesis: Adding product recommendations (related products, upgrade options, bundle suggestions) to product pages and post-purchase flows will increase average order value.
Expected business impact: MEDIUM (increases AOV; leverages existing bundle structure; simple implementation)
Technical complexity: LOW (static recommendations based on product relationships; no complex algorithm needed initially)
Risk: LOW (reversible; no production impact)
Dependencies: Product data (verified); recommendation logic (can be manual/config-based initially)
Recommended agent: frontend (UI component) + backend (recommendation logic)
Priority: P2 (Medium — AOV improvement; simple to implement)
Status: Not implemented; bundle relationships exist (products.json upsells array)

---

## OPPORTUNITY 10 — Email Lifecycle Automation Verification

ID: OP-010
Name: Verify and complete full email lifecycle automation
Problem: Email automation flows exist (Buttondown templates: lead_magnet, onboarding, tripwire, seasonal, abandoned_cart) but full lifecycle automation not verified. Customer state tracking exists (tags applied) but automation flow integration unverified.
Hypothesis: Verifying that all email flows trigger correctly (based on purchase state, product tags, customer tier) will improve repeat purchase rate and customer retention.
Expected business impact: MEDIUM (email is high-leverage for retention; minimal additional cost once verified)
Technical complexity: LOW (verification + potential fixes; no major architecture change)
Risk: LOW (reversible; can disable flows without impact)
Dependencies: Buttondown integration verified; webhook tags working; customer state tracking
Recommended agent: growth (email strategy) + backend (tag verification + automation logic)
Priority: P2 (Medium — retention improvement; low complexity; high confidence)
Status: Templates verified; automation flow verification unverified; full lifecycle not tested end-to-end

---

## Scoring Summary (Impact × Confidence ÷ Effort)

OP-001 (Ads scopes): High impact, High confidence, Low effort → Score: VERY HIGH
OP-002 (Video): High impact, High confidence, Medium effort → Score: HIGH
OP-003 (Logo): Medium impact, High confidence, Low effort → Score: HIGH
OP-004 (A/B framework): High impact, Medium confidence, Medium effort → Score: MEDIUM-HIGH
OP-005 (Remotion): High impact, Medium confidence, High effort → Score: MEDIUM
OP-006 (Pinterest): Medium impact, High confidence, Low effort → Score: MEDIUM-HIGH
OP-007 (Embedded checkout): Medium impact, Medium confidence, Medium effort → Score: MEDIUM
OP-008 (Analytics dashboard): Medium impact, High confidence, Low effort → Score: MEDIUM-HIGH
OP-009 (Recommendations): Medium impact, High confidence, Low effort → Score: MEDIUM-HIGH
OP-010 (Email automation): Medium impact, High confidence, Low effort → Score: MEDIUM-HIGH

---

## Recommendation

Start with P0 (OP-001: Ads scopes verification/regeneration). Once complete, proceed to OP-002 (video production) and OP-003 (logo background removal) in parallel — both needed for paid creative assets. Then implement OP-004 (A/B framework) and OP-007 (embedded checkout) as the foundation for conversion optimization. Remotion (OP-005) and Pinterest (OP-006) follow as medium-complexity improvements.
