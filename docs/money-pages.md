# Money Pages — Revenue Impact Ranking

Status: READ-ONLY assessment
Methodology: P0 = directly affects purchase; P1 = strongly influences purchase; P2 = acquisition/content; P3 = supporting/polish

---

## P0 — Directly Affects Purchase (Critical)

### 1. deploy/index.html (Homepage / Main Landing)
- Purpose: Brand introduction, trust building, primary navigation
- Target Audience: All visitors (first-time, returning, organic, social, email)
- Current CTA: Links to products, recipes, freebie — but no single dominant conversion action
- Conversion Opportunity: Add primary email capture + Starter Kit offer above fold; add social proof/testimonials; improve visual hierarchy
- SEO Opportunity: Title and meta optimized; needs stronger primary keyword targeting; needs better internal link structure to high-value pages
- Performance Opportunity: Fast static HTML; image optimization not fully automated
- Accessibility Opportunity: Verify keyboard navigation, focus states, reduced motion support
- Recommended Priority: P0 — this is the main entry point for all traffic

### 2. deploy/products.html (Product Catalog)
- Purpose: Product overview, bundle presentation
- Target Audience: Buyers considering bundles or comparing products
- Current CTA: Product links to Gumroad checkout
- Conversion Opportunity: Add bundle comparison, upgrade credit explanation, video demonstration; add embedded checkout option
- SEO Opportunity: Structured data for products; needs individual product schema for each product card
- Performance Opportunity: Product images not optimized; no lazy loading verified
- Accessibility Opportunity: Product cards need proper alt text, keyboard navigation
- Recommended Priority: P0 — central to purchase path

### 3. deploy/products/starter-kit.html (Starter Kit — $9 Entry)
- Purpose: Low-friction first purchase, entry point to customer ladder
- Target Audience: First-time buyers, organic recipe visitors
- Current CTA: Link to Gumroad checkout
- Conversion Opportunity: Add embedded checkout; add video demonstration; improve trust signals placement; add upgrade credit explanation
- SEO Opportunity: Product page title/meta; structured data present; internal links to bundle
- Performance Opportunity: Image optimization needed
- Accessibility Opportunity: Form/checkpoint accessibility if embedded checkout added
- Recommended Priority: P0 — lowest price point, highest conversion potential

### 4. deploy/products/la-mesa-boricua-sales.html (Mesa Boricua — $47 Core)
- Purpose: Main revenue driver (core product)
- Target Audience: Committed buyers, returning customers
- Current CTA: Gumroad checkout link
- Conversion Opportunity: Add video preview; add social proof/testimonials; improve product presentation; add bundle comparison
- SEO Opportunity: Product schema; needs stronger keyword targeting for Puerto Rican cookbook
- Performance Opportunity: Large PDF download — needs optimized delivery
- Accessibility Opportunity: PDF accessibility (not verified)
- Recommended Priority: P0 — highest single-product revenue

---

## P1 — Strongly Influences Purchase (Important)

### 5. deploy/freebies/ (Lead Magnet — Sofrito 101 / Starter Kit Download)
- Purpose: Email capture, first touchpoint for cold traffic
- Target Audience: First-time visitors from organic search, social, ads
- Current CTA: Download free guide
- Conversion Opportunity: Improve offer clarity; add video preview; improve download experience; add upgrade path explanation
- SEO Opportunity: Free content — needs stronger topical authority links
- Performance Opportunity: Fast download (verified)
- Accessibility Opportunity: Download links accessible
- Recommended Priority: P1 — feeds the top of funnel

### 6. deploy/sofrito-recipe.html (Recipe Content — Authority Building)
- Purpose: SEO content, trust building, traffic acquisition
- Target Audience: Organic search visitors (recipe queries)
- Current CTA: Product links embedded; no dedicated email capture
- Conversion Opportunity: Add product recommendations; add email capture for recipe guide; improve CTAs
- SEO Opportunity: Recipe schema (verified); needs stronger internal linking to Starter Kit and bundle
- Performance Opportunity: Fast; needs image optimization verification
- Accessibility Opportunity: Recipe instructions need structured markup; verify keyboard access
- Recommended Priority: P1 — key organic acquisition channel

### 7. deploy/blog.html (Content Marketing — Blog)
- Purpose: Authority building, SEO, content marketing
- Target Audience: Organic visitors, returning subscribers
- Current CTA: Not strongly conversion-focused; needs stronger product CTAs
- Conversion Opportunity: Add product recommendations per post; add email capture; improve CTAs
- SEO Opportunity: Blog content needs topical clustering around Puerto Rican cooking
- Performance Opportunity: Fast; needs lazy loading for images
- Accessibility Opportunity: Blog navigation, focus states
- Recommended Priority: P1 — supports organic growth

---

## P2 — Acquisition / Content (Medium Impact)

### 8. deploy/community.html / deploy/contact.html
- Purpose: Trust, community engagement, support
- Target Audience: Existing customers, potential partners
- Current CTA: Contact form; no direct conversion mechanism
- Conversion Opportunity: Add newsletter signup; add bundle promotion for members; add partnership inquiry form
- SEO Opportunity: Low search volume; maintain for trust
- Performance Opportunity: Fast
- Recommended Priority: P2 — supporting pages

### 9. deploy/products/thanksgiving-boricua.html / deploy/products/street-food-bundle.html
- Purpose: Seasonal / bundle products
- Target Audience: Seasonal buyers, bundle buyers
- Current CTA: Gumroad checkout
- Conversion Opportunity: Improve seasonal urgency messaging; add bundle comparison; add gift messaging
- SEO Opportunity: Seasonal keywords
- Performance Opportunity: Standard
- Recommended Priority: P2 — seasonal revenue

---

## P3 — Supporting / Polish (Lower Priority)

### 10. deploy/privacy.html / deploy/terms.html / deploy/credits.html
- Purpose: Legal, compliance, trust
- Target Audience: All users (pre-purchase verification)
- Conversion Opportunity: Minimal — maintain for trust; add link to privacy from checkout
- SEO Opportunity: Minimal
- Performance Opportunity: Fast
- Recommended Priority: P3 — necessary but not revenue-driving

---

## Summary — Highest Impact Changes (Verified Gaps)

P0 Pages (immediate revenue impact):
- deploy/index.html — add dominant email capture + Starter Kit CTA
- deploy/products.html — improve product presentation + bundle comparison
- deploy/products/starter-kit.html — embedded checkout option + video + upgrade explanation
- deploy/products/la-mesa-boricua-sales.html — video preview + bundle upsell + testimonials

P1 Pages (strong influence):
- deploy/freebies/ — stronger offer + video preview + upgrade path explanation
- deploy/sofrito-recipe.html — product recommendations + email capture
- deploy/blog.html — stronger product CTAs + email capture

P2 / P3:
- Supporting pages — maintain, add minimal conversion elements
