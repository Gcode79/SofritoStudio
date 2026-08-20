# Sofrito Studio — Email Automation Sequences

Complete email copy for every automated flow. These map to the flows in
`buttondown/send_broadcast.py` and run as Buttondown broadcasts (tag-segmented
on the paid plan; whole-list on free).

> ⚠️ On Buttondown's FREE plan, emails broadcast to the whole list (no tags).
> Upgrade to Basic (~$9/mo) to segment leads vs. buyers for the tripwire and
> onboarding flows to work as intended.

---

## 1. Welcome / Lead Magnet (lead_magnet)

**Trigger:** New subscriber (from freebie signup).
**Goal:** Deliver the freebie, build connection, tease the $9 Starter Kit.

### Email — freebie delivery
**Subject:** Your free recipe starter kit is here

Hey! Your free Puerto Rican recipe starter kit is ready:

https://sofritostudio.com/freebies/Sofrito-101.pdf

It covers the **sofrito base** — the flavor foundation of every Puerto Rican dish — with mainland ingredient swaps and a 20-minute batch plan.

If it doesn't arrive, check spam and add us to your contacts.

**When you're ready to go further:** the Starter Kit has the 5 essential dishes for just $9.

Buen provecho,
— The Ortiz kitchen, Sofrito Studio

---

## 2. Tripwire Conversion (tripwire)

**Trigger:** 24–48h after a free subscriber joins.
**Goal:** Convert free → $9 Starter Kit buyer.
**Segmentation:** Tag `lead:sofrito-101` (paid plan).

### Email 1 (hour ~24) — value + tease
**Subject:** The 5 essential dishes, for $9

Hey,

The sofrito base is the foundation — but there are 5 dishes every boricua kitchen needs to nail. I put them all in one place:

**The Sofrito Starter Kit — $9**

- Sofrito (the base you already know)
- Arroz con Pollo
- Pernil
- Tostones
- Flan

All bilingual, tested in the Ortiz kitchen, with mainland ingredient swaps.

Get it here: https://sofritostudio.com/products/starter-kit.html

When you're ready to go beyond these 5, the credit applies toward any bigger bundle.

— Josh, Sofrito Studio

### Email 2 (hour ~48) — urgency nudge
**Subject:** Last chance — the $9 starter

Hey,

Quick heads-up — the Starter Kit's $9 entry price is the lowest way to try boricua cooking, and it's the same recipes people cook for years.

5 recipes, bilingual, instant download, 30-day guarantee:

https://sofritostudio.com/products/starter-kit.html

If you've been thinking about it, this is the easiest first step.

— Josh

---

## 3. Post-Purchase Onboarding (onboarding)

**Trigger:** After a purchase.
**Goal:** Deliver, educate, soft-upsell to Full Table ($97).
**Segmentation:** Tag `customer:<tier>` (paid plan).

### Email 1 (immediate) — delivery
**Subject:** Thanks! Your book is ready

Your download is in your Gumroad library.

**Start with the sofrito** — it's the base of everything. Once you master it, mofongo, pernil, arroz con pollo, and coquito all get a step easier.

Full cookbook: https://sofritostudio.com/products/la-mesa-boricua-sales.html

If anything feels off, reply and I'll fix it fast.

— The Ortiz kitchen

### Email 2 (day 7) — check-in + tip
**Subject:** How's your first week?

Have you cooked anything yet? I'd love to hear how it turned out.

**Tip:** don't lift the lid once the rice boils. The steam does the work — lift it and you lose the moisture that makes rice fluffy instead of mushy.

Reply and tell me what you made.

— Josh

### Email 3 (day 14) — soft upsell to Full Table
**Subject:** Ready for the next level?

If you've nailed the basics, **The Full Table** takes it further:

- Cookbook + printables
- 50 no-recipe 30-minute dinners
- The 6-step planning-to-table workflow

Get authentic boricua dinner on the table in 30 minutes, no recipe required:

https://sofritostudio.com/products/full-table.html

— Josh, Sofrito Studio

---

## 4. Abandoned Cart (abandoned_cart)

**Trigger:** Cart abandoned.
**Goal:** Recover the sale.
**Segmentation:** Tag `cart:abandoned` (paid plan) or Gumroad's own abandoned-cart emails.

### Email 1 — reminder
**Subject:** Your cart is waiting

Looks like you were checking out and didn't finish. No worries — it's saved.

**La Mesa Boricua** — 30 bilingual recipes, mainland swaps, holiday menus, and a full Nochebuena timeline.

https://sofritostudio.com/products/la-mesa-boricua-sales.html

Reply if you hit a snag at checkout — I'm here to help.

— The Ortiz kitchen

### Email 2 — discount
**Subject:** 10% off — 24 hours only

Use code **COMEBACK10** for 10% off La Mesa Boricua. It expires in 24 hours.

https://sofritostudio.com/products/la-mesa-boricua-sales.html

30 recipes, bilingual, instant download.

— Josh

---

## 5. Seasonal (seasonal)

**Trigger:** High-volume holidays.
**Goal:** Drive holiday sales.
**Segmentation:** Tag `seasonal:<holiday>` (paid plan).

### Thanksgiving (Nov)
**Subject:** Prep your Boricua Thanksgiving — the complete guide

Pasteles workflow, pernil timing for the big day, and Puerto Rican sides that steal the show. Printable shopping list + step-by-step timeline.

https://sofritostudio.com/products/la-mesa-boricua-sales.html

### Nochebuena / Navidad (Dec)
**Subject:** Prep your Nochebuena menu — the complete guide

Pasteles, pernil, coquito — the full timeline so you're never scrambling on the big night.

https://sofritostudio.com/products/la-mesa-boricua-sales.html

### San Sebastián (Jan)
**Subject:** Prep for the San Sebastián Street Fest

Portable snacks, drinks, and parranda tips for the biggest street festival.

https://sofritostudio.com/products/la-mesa-boricua-sales.html

---

## How to run these

```bash
# Preview the flow copy
cd buttondown
python send_broadcast.py --demo

# Create a flow as a Buttondown broadcast (draft)
python send_broadcast.py --flow lead_magnet --lang en
python send_broadcast.py --flow tripwire --lang en
python send_broadcast.py --flow onboarding --lang es
python send_broadcast.py --flow seasonal --holiday navidad --lang en
```

Each creates a broadcast draft in Buttondown. Review + schedule it there (or
automate via a GitHub Action — see `.github/workflows/`).
