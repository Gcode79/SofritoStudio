# Package Manifest — Gumroad Implementation

Central inventory of every package on sofritostudio.com and its Gumroad wiring.

**How activation works:** each buy button has a `data-product="KEY"` attribute.
`js/main.js` reads `SITE_CONFIG.gumroad[KEY]` and sets the button's `href`.
If the URL contains `YOURGUMROAD` (placeholder), the button is left as `href="#"`
so it stays safely inert until you paste the real Gumroad URL.

To go live on a package: create the Gumroad product → copy its share URL →
replace the placeholder in `SITE_CONFIG.gumroad` in `js/main.js` (root AND `deploy/`).

---

## Core packages (on products.html)

| # | Package | Price | data-product KEY | Page | Gumroad status |
|---|---------|-------|------------------|------|----------------|
| 1 | Sofrito Starter Kit | $9 | `starter-kit` | products.html#starter-kit | ⏳ PLACEHOLDER |
| 2 | La Mesa Boricua | $47 | `mesa` | products.html#la-mesa-boricua, products/la-mesa-boricua.html | ✅ LIVE |
| 3 | The Kitchen Bundle | $67 | `kitchen-bundle` | products.html#kitchen-bundle, products/kitchen-bundle-printables.html | ✅ LIVE |
| 4 | The Full Table | $97 | `full-table` | products.html#full-table | ✅ LIVE |
| 5 | Boricua Weeknights | $27 | `weeknights` | products.html, products/boricua-weeknights.html | ⏳ PLACEHOLDER |
| 6 | Boricua Holiday & Coquito Guide (add-on) | $12 | (links to Holiday Bundle) | products.html (Add to Order CTA) | ⏳ wires to #16 |

## Individual guides

| # | Package | Price | data-product KEY | Page | Gumroad status |
|---|---------|-------|------------------|------|----------------|
| 7 | Boricua Breakfasts | $7.99 | `breakfasts` | products/breakfasts.html | ⏳ PLACEHOLDER |
| 8 | Comida Callejera | $9.99 | `callejera` | products/callejera.html | ⏳ PLACEHOLDER |
| 9 | Postres Boricuas | $7.99 | `postres` | products/postres.html | ⏳ PLACEHOLDER |
| 10 | Sofrito Master Class | $12.99 | `sofrito-masterclass` | products/sofrito-masterclass.html | ⏳ PLACEHOLDER |
| 11 | Boricua Meal Prep | $12.99 | `meal-prep` | products/meal-prep.html | ⏳ PLACEHOLDER |
| 12 | Air Fryer Boricua | $9.99 | `air-fryer` | products/air-fryer.html | ⏳ PLACEHOLDER |
| 13 | The Pernil Playbook | $14.99 | `pernil-playbook` | products/pernil-playbook.html | ⏳ PLACEHOLDER |

## Bundles

| # | Package | Price | data-product KEY | Page | Gumroad status |
|---|---------|-------|------------------|------|----------------|
| 14 | Breakfast Bundle | $16.99 | `breakfast-bundle` | products/breakfast-bundle.html | ⏳ PLACEHOLDER |
| 15 | Street Food Bundle | $16.99 | `street-food-bundle` | products/street-food-bundle.html | ⏳ PLACEHOLDER |
| 16 | Holiday Bundle | $17.99 | `holiday-bundle` | products/holiday-bundle.html | ⏳ PLACEHOLDER |
| 17 | The Complete Kitchen | $59 | `complete-kitchen` | products/complete-kitchen.html | ⏳ PLACEHOLDER |

## Seasonal (coming soon)

| # | Package | Price | data-product KEY | Page | Gumroad status |
|---|---------|-------|------------------|------|----------------|
| 18 | Thanksgiving Boricua | $14.99 | `thanksgiving-boricua` | products/thanksgiving-boricua.html | ⏳ PLACEHOLDER |
| 19 | Navidad Boricua | $19.99 | `navidad-boricua` | products/navidad-boricua.html | ⏳ PLACEHOLDER |
| 20 | The Coquito Guide | $14.99 | `coquito-guide` | products/coquito-guide.html | ⏳ PLACEHOLDER |

## Course & membership

| # | Package | Price | data-product KEY | Page | Gumroad status |
|---|---------|-------|------------------|------|----------------|
| 21 | Mofongo & More (waitlist) | $197 | `course` | products.html#mofongo-course | ⏳ PLACEHOLDER (waitlist form live) |
| 22 | Membership (monthly) | $9.99/mo | `membership-monthly` | membership.html | ⏳ PLACEHOLDER |
| 23 | Membership (yearly) | $99/yr | `membership-yearly` | membership.html | ⏳ PLACEHOLDER |

---

## Checklist — replace these placeholders in `SITE_CONFIG.gumroad`

- [ ] `starter-kit` → sofrito-starter-kit
- [ ] `weeknights` → boricua-weeknights
- [ ] `breakfasts` → boricua-breakfasts
- [ ] `callejera` → comida-callejera
- [ ] `postres` → postres-boricuas
- [ ] `sofrito-masterclass` → sofrito-masterclass
- [ ] `meal-prep` → boricua-meal-prep
- [ ] `air-fryer` → air-fryer-boricua
- [ ] `pernil-playbook` → pernil-playbook
- [ ] `breakfast-bundle` → breakfast-bundle
- [ ] `street-food-bundle` → street-food-bundle
- [ ] `holiday-bundle` → holiday-bundle
- [ ] `complete-kitchen` → complete-kitchen
- [ ] `thanksgiving-boricua` → thanksgiving-boricua
- [ ] `navidad-boricua` → navidad-boricua
- [ ] `coquito-guide` → coquito-guide
- [ ] `course` → mofongo-course
- [ ] `membership-monthly` → membership-monthly
- [ ] `membership-yearly` → membership-yearly

> **Note:** `mesa`, `kitchen-bundle`, and `full-table` are already live.
> **Note:** bundle prices were corrected on 2026-08-17 to be below sum-of-parts
> (Breakfast $16.99 / Street Food $16.99 / Holiday $17.99 / Complete Kitchen $59).
> **Note:** the add-on CTA ("Add to Order — $12") is currently wired to the
> Holiday Bundle page (#16); give the add-on its own Gumroad product if you'd
> rather sell it standalone.