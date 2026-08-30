# Customer Journey — Sofrito Studio

Status: READ-ONLY assessment. No modifications made.

---

## Journey A: First-Time Visitor (Organic Search / Social / Direct)

Entry Point: Recipe article (e.g., deploy/sofrito-recipe.html, deploy/recipe-db.html) or homepage (deploy/index.html)
Sequence: Recipe/Blog -> Content Engagement -> Email Capture (freebie) -> Email Welcome -> Starter Kit Offer ($9) -> Purchase -> Post-Purchase Education -> Bundle Upsell
Current CTA: Recipe pages → Product links (but no prominent email capture on content pages)
Conversion Event: Email signup (lead) or Starter Kit purchase
Likely Objection: "Is this authentic?" / "Can I trust this recipe?" / "Will the ingredients be available?"
Trust Mechanism: "Tested in the Ortiz kitchen", bilingual content, ingredient swap guides, 30-day guarantee
Next Logical Action: Download free starter guide → receive tripwire email (48h) → purchase Starter Kit → receive onboarding email → upgrade to Full Table

---

## Journey B: Organic Search Visitor (Recipe Query)

Entry Point: Recipe page via organic search (SEO schema present, sitemap submitted)
Sequence: Search Result -> Recipe Page (JSON-LD Recipe schema) -> Related Recipes / Product CTA -> Email Capture / Product Page
Current CTA: Product links embedded in recipe pages (not verified if optimized)
Conversion Event: Email signup or product view
Likely Objection: "This is just another recipe blog" / "No reason to buy"
Trust Mechanism: Recipe quality, authentic cultural context, ingredient education, bilingual content
Next Logical Action: Download ingredient swap guide (new opportunity) -> Starter Kit purchase -> Full cookbook

---

## Journey C: Social Visitor (Instagram / TikTok / Pinterest Reels)

Entry Point: Social profile/link -> Landing page (freebie or product page)
Sequence: Social Post -> Landing Page -> Email Capture / Product Page
Current CTA: Social links lead to landing pages; video content exists (deploy/videos/) but not integrated into funnel
Conversion Event: Email signup (primary) or purchase (secondary)
Likely Objection: "Is this just entertainment?" / "No clear value proposition"
Trust Mechanism: Video content (demonstrates authenticity), brand identity (logo-badge.png, family-centered messaging)
Next Logical Action: Watch recipe video -> Download free guide -> Receive tripwire email -> Purchase Starter Kit

---

## Journey D: Email Subscriber (Lead Magnet / Newsletter)

Entry Point: Email capture via free lead magnet (Sofrito 101 / deploy/freebies/)
Sequence: Email Signup -> Welcome Sequence (buttondown/templates/onboarding.md) -> Education Emails (recipe guides) -> Product Introduction -> Purchase -> Post-Purchase Education
Current CTA: Welcome sequence leads to Starter Kit offer; onboarding leads to Full Table upsell
Conversion Event: Starter Kit purchase ($9) -> Full Table purchase ($47) -> Bundle purchase ($67/$97)
Likely Objection: "Is $9 worth it?" / "What if I don't like it?" / "Will this help me cook?"
Trust Mechanism: 30-day guarantee, bilingual content, ingredient finder, upgrade credit system
Next Logical Action: Purchase Starter Kit -> Receive post-purchase education -> Upgrade to bundle (within 30 days for full credit) -> Repeat purchase (seasonal offers)

---

## Journey E: First-Time Purchaser

Entry Point: Product page (Starter Kit, Mesa Boricua) -> Gumroad Checkout
Sequence: Product Page -> Gumroad Checkout (/buy/) -> Purchase Confirmation (Gumroad webhook) -> Post-Purchase Email (Buttondown onboarding) -> Cross-Sell Email (bundle offer) -> Repeat Purchase (seasonal)
Current CTA: Product pages link to Gumroad; no embedded checkout
Conversion Event: Purchase confirmed via webhook (tags applied: customer:<tier>, product:<slug>, lang:en/es)
Likely Objection: "Can I trust this digital product?" / "Will it work for my family?" / "Can I get a refund?"
Trust Mechanism: 30-day guarantee, "Tested in Ortiz kitchen", bilingual format, instant download, upgrade credit
Next Logical Action: Download PDF -> Try recipes -> Post-purchase email -> Bundle offer (tripwire: 48h after purchase) -> Repeat customer (seasonal offers, future membership)

---

## Journey F: Returning Customer

Entry Point: Email campaign (seasonal, bundle offer), direct visit, or retargeting audience
Sequence: Email / Direct / Social -> Product Page / Bundle Offer -> Gumroad Checkout -> Purchase -> Post-Purchase Sequence
Current CTA: Seasonal offers (Thanksgiving, Nochebuena) exist (buttondown/templates/seasonal.md); bundle upsell (buttondown/templates/onboarding.md)
Conversion Event: Repeat purchase (bundle, seasonal product)
Likely Objection: "I've already bought something — why buy more?" / "Is this complementary?"
Trust Mechanism: Upgrade credit (existing purchase credited toward bundle), familiar brand identity, consistent quality
Next Logical Action: Purchase bundle -> Seasonal purchase -> Future membership / recurring offer (planned)

---

## Gaps in Customer Journey (Verified)

- No embedded checkout (only redirect to Gumroad — adds friction)
- No product view tracking events (only page view + purchase)
- No automated retargeting audiences (pixel exists, no audience creation)
- No dynamic product recommendations on site
- No A/B testing framework for landing page variations
- Video content exists (deploy/videos/) but not integrated into funnel flows
- Social posting pipeline blocked (Pinterest Standard access approval needed)
- Full email lifecycle automation not fully verified (Buttondown templates present; full automation flow unverified)
- No membership or recurring revenue infrastructure
