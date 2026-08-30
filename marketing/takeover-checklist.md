# Sofrito Studio — Takeover Checklist
Everything on the engineering side is DONE and deployed. These are the
dashboard-side steps only you can do. Each is ~5–10 minutes.

## 1. Pinterest — finish the token (write scopes)
1. Open `developers.pinterest.com/apps/` → your app.
2. Wait for **Upgrade to Standard access** to change from `pending` → approved
   (this is the video demo review — `gumroad-uploads\pinterest-demo.mp4` was the upload,
   but any video demo works).
3. Once approved, **Generate access token** with ALL scopes ticked:
   `boards:read`, `boards:write`, `pins:read`, `pins:write`.
4. Paste the new token here (or edit `config/.env` → `PINTEREST_ACCESS_TOKEN=`).
5. Create a board in Pinterest (e.g. "Boricua Recipes"). Copy its **board id**
   (from the board URL — the long number after `/`). Give it to me, or set
   `config/.env` → `PINTEREST_BOARD_ID=` and `marketing/pins.json`.
6. Then either I run `python marketing/post_to_pinterest.py --publish`, or add
   the two GitHub secrets (below) and the daily workflow does it.

## 2. GitHub repo secrets (needed for the automations to run on schedule)
Install the GitHub CLI (`winget install GitHub.cli`), then `gh auth login`, or
add them in the repo: Settings → Secrets and variables → Actions:
- `PINTEREST_ACCESS_TOKEN` = the write-scope Pinterest token
- `PINTEREST_BOARD_ID` = the board id
- `META_ACCESS_TOKEN`, `META_PAGE_ID`, `META_INSTAGRAM_ACCOUNT_ID` = the Meta
  token (step 3) + your Page id (Page → About → Page ID) + IG account id
  (IG → Professional dashboard → Account ID)

Workflows already wired: `social-poster.yml` (Meta, daily 12:00 UTC),
`pinterest-poster.yml` (new, daily 12:30 UTC), `marketing-daily.yml`,
`email-automation.yml`, plus the blog/package/welcome/reengagement flows.

## 3. Facebook / Instagram posting (Meta)
1. Confirm the developer account (avatar → Settings → Identity → add phone).
2. Create the app: `developers.facebook.com/apps/` → Create App → **Business**.
3. Add it to your Business Portfolio: `business.facebook.com/settings/apps`.
4. Business settings → Users → **System users** → Add ("publisher", Admin) →
   **Generate token** → app + Page → scopes: `pages_manage_posts`,
   `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`.
5. Paste the token; I verify + wire it.
6. Instagram: make sure the IG account is **Professional/Business** and is
   claimed: Business settings → Accounts → Instagram accounts → Add. Then link
   it to the Page (Page settings → Linked accounts → Instagram). The
   "UnclaimedBusinessUser FromPool" entry clears once it's claimed.

## 4. Gumroad in-checkout upsell (dashboard)
In `app.gumroad.com` → Product → **Upsells** (or Edit → Upsell): create an
"Add to order" for La Mesa Boricua on the Starter Kit checkout, and Full Table
on the La Mesa checkout. This adds the order bump the audit recommended.

## 5. Hand-off confirmations
- Checkout: all buy buttons → live Gumroad URLs; UTM params auto-appended;
  no-JS fallback on all product pages. ✅ done.
- Comments: D1 system on recipe pages + community page. ✅ done.
- Heroes, nav, community page, recipe submission form. ✅ done.

## Done = revenue pipeline live
- Products: all 15 have real files (PDF+EPUB+thumb). ✅
- Coupons: SOFRITO15 / UPGRADE9 / UPGRADE35 — verify each renders the right
  price on a test checkout.
- Traffic: Pinterest (step 1) + Meta (step 3) are the two channels that turn
  the site on. GSC submission (sitemap is ready) adds organic.