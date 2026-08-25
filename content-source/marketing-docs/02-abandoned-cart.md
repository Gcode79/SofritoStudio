# Email Sequence 2: Abandoned Cart (3 emails)

**Trigger:** Added to cart but didn't purchase within 30 minutes
**Platform:** ConvertKit + WooCommerce (CartFlows or AutomateWoo)
**Goal:** Recover lost sales

---

## EMAIL 1: 1 HOUR — Gentle Reminder

**Subject:** Your recipes are waiting 🍚
**Preview:** Complete your purchase before your cart expires

---

Hey there,

You left something in your cart at Sofrito — Cocina Boricua.

**Your cart contains:**
[PRODUCT NAME]
[PRODUCT IMAGE]
[PRODUCT PRICE]

Your Puerto Rican recipes are waiting. Complete your purchase and start cooking tonight.

[Complete Your Purchase →]

**Why buy from us?**
- Instant download — start cooking in 5 minutes
- Lifetime access — come back anytime
- 30-day money-back guarantee — no risk
- Bilingual recipes — English and Spanish

If you have any questions, just hit reply. We're here to help.

Con cariño,
**The Ortiz Family**
Sofrito — Cocina Boricua

P.S. Every recipe in your cart has been tested in the Ortiz kitchen until it just works. We guarantee it.

---

## EMAIL 2: 24 HOURS — Social Proof

**Subject:** See what María made with La Mesa Boricua
**Preview:** "First batch since my abuela's, and it actually tasted right"

---

Yesterday, you were thinking about getting [PRODUCT NAME].

Today, I want you to meet María.

> "I grew up eating mofongo but never dared to make it. The Sofrito 101 guide walked me through the base — first batch since my abuela's, and it actually tasted right."

María is one of thousands of home cooks who've used our recipes to bring Puerto Rican cooking into their kitchens. She's not a chef. She's not Puerto Rican. She just wanted to cook food that tasted like home.

**You can too.**

Your cart is still waiting:

[PRODUCT NAME] — [PRICE]

[Complete Your Purchase →]

**What you'll get:**
- Step-by-step recipes that actually work
- Mainland ingredient swaps (no impossible shopping trips)
- Bilingual: English and Spanish
- Lifetime access + free updates

Don't let another day go by without cooking something boricua.

Con cariño,
**The Ortiz Family**

P.S. Remember: 30-day money-back guarantee. If it doesn't work for you, you get a full refund. No questions asked.

---

## EMAIL 3: 72 HOURS — Discount Offer

**Subject:** 10% off — just for you
**Preview:** Use code SAVE10 before your cart expires

---

This is your last chance.

Your cart at Sofrito — Cocina Boricua is about to expire. But before it does, here's 10% off to help you decide.

**Use code SAVE10 at checkout**

[PRODUCT NAME] — [DISCOUNTED PRICE]

[Complete Your Purchase — Use Code SAVE10 →]

**Why you'll love it:**
- Authentic Puerto Rican recipes from the Ortiz family kitchen
- Tested until they just work
- Made for mainland cooking (no impossible ingredients)
- Bilingual: English and Spanish
- Instant download, lifetime access
- 30-day money-back guarantee

This code expires in 24 hours. After that, your cart will be emptied.

Con cariño,
**The Ortiz Family**

P.S. We don't do discounts often. This is your chance to get the recipes of the Ortiz kitchen at a special price. Don't miss it.

---

# SEQUENCE SETTINGS

**Trigger:** WooCommerce cart abandoned (30-minute delay)
**Delay between emails:** 1 hour → 24 hours → 72 hours
**Exit condition:** Makes a purchase (remove from sequence)
**Discount code:** SAVE10 (10% off, single use, 24-hour expiry)
**A/B test:** Subject lines on email 1
**Segmentation:** Tag by product abandoned for future retargeting

---

# EXIT-INTENT POPUP (Pair with this sequence)

**Trigger:** Mouse moves toward browser close button (exit intent)
**Display:** Homepage, blog, product pages (NOT checkout)

**Copy:**
Headline: "Wait — get 5 free Puerto Rican recipes"
Subhead: "The Ortiz family's favorite dishes, step by step."
CTA: "Send Me the Recipes"
Fields: Email address only
Design: Product photo + email field + CTA button

**After submission:** Deliver 5 Beginner Recipes lead magnet + enter Welcome Sequence
