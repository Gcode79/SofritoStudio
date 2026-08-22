# YOUR TURN — step-by-step (cross-referenced with the repo)

Everything below is blocked on **your** dashboard access. Each step names the
exact file/command that consumes it. Tick them off; once they're done, the
automation runs itself.

Reference files:
- `config/.env` — the one place you paste values (variable names must match exactly)
- `scripts/set_worker_secrets.ps1` — pushes `.env` secrets to the Worker (must run with `pwsh`)
- `marketing/setup-creds.md` — where each value comes from
- `marketing/post_to_meta.py`, `marketing/post_to_pinterest.py` — publishers
- `marketing/content/queue.json` — the posting queue
- `scripts/sync_gumroad.py` — prints the same manual steps below

> Rule of thumb: paste → `pwsh -File scripts\set_worker_secrets.ps1` → test with the `--dry-run` shown.

---

## Step 1 · Gumroad coupons (3) — unblocks all discounts
These power the Action-1 email (`SOFRITO15`), the Day-3 upgrade (`UPGRADE9`),
and the post-purchase upsell (`UPGRADE35`). Without them the discount links
show full price.

Dashboard: `gumroad.com` → **Products** → open the product → **Discounts** → **Create discount**.

| Code | On product | Type | Value | Purpose |
|---|---|---|---|---|
| `SOFRITO15` | Starter Kit (`sofrito-starter-kit`) | Percent | 15% | welcome email |
| `UPGRADE9` | Kitchen Bundle (`razabs`) | Fixed | $9 off | Starter-Kit buyers, Day 3 |
| `UPGRADE35` | Full Table (`dodbtn`) | Fixed | $62 off → $35 | La Mesa → Full Table upsell |

Verify: open `https://sofritostudio.gumroad.com/l/sofrito-starter-kit?coupon=SOFRITO15`
→ price shows $7.65. (Cross-ref: `scripts/sync_gumroad.py` manual-steps section.)

---

## Step 2 · Meta — publish the queue + daily action
1. **Get a long-lived token** — developers.facebook.com → App → Graph API Explorer;
   add `instagram_basic`, `instagram_content_publish`, `pages_show_list`,
   `pages_manage_posts`; extend via the Access Token Debugger (long-lived).
2. Paste into `config/.env` (page + IG ids are **optional** — auto-resolved from the token):
   ```
   META_ACCESS_TOKEN=EAAG...
   META_PAGE_ID=
   META_INSTAGRAM_ACCOUNT_ID=
   ```
3. Publish what's due now (`ig-001` + `fb-001`, plus the rolling queue):
   ```
   python marketing/post_to_meta.py --dry-run      # preview
   python marketing/post_to_meta.py --publish      # actually post
   ```
4. Activate the daily action — add 3 **GitHub repo secrets**
   (github.com/Gcode79/SofritoStudio → Settings → Secrets and variables → Actions → New repository secret):
   `META_ACCESS_TOKEN`, `META_PAGE_ID`, `META_INSTAGRAM_ACCOUNT_ID`.
   The workflow `.github/workflows/social-poster.yml` runs daily at 12:00 UTC
   (it first tops up the queue via `marketing/calendar_to_queue.py`, then posts).

---

## Step 3 · Pinterest — publish the 10 ready pins
1. Create your board(s) in Pinterest.
2. Get an access token (business hub → access / developer portal), then find your
   board's numeric id: developers.pinterest.com → **API explorer** → `GET /v5/boards`.
3. Paste into `config/.env`:
   ```
   PINTEREST_ACCESS_TOKEN=<token>
   PINTEREST_BOARD_ID=<numeric board id>
   ```
4. Publish the manifest (`marketing/pins.json` — 10 pins, all `posted: false`):
   ```
   python marketing/post_to_pinterest.py --dry-run
   python marketing/post_to_pinterest.py --publish
   ```

---

## Step 4 · Gumroad course + free product + custom field
1. **Upload the lesson videos** — Dashboard → Products → **Mofongo & More (Course)** → Content:
   - `course\pilot\BoricuaCourse-01-Sofrito-1080p.mp4` (Lesson 1 · Sofrito)
   - `course\lessons\arroz-con-pollo\arroz-con-pollo.mp4` (Lesson 2 · Arroz con Pollo)
   - `course\lessons\mofongo\mofongo.mp4` (Lesson 3 · Mofongo — already built)
   The price is already $29 (set via API). Click **Publish** when ready.
2. **Free lead magnet** — Products → **Create product**:
   - Name: `Sofrito 101: Master Your Base`, price **FREE**, permalink `sofrito-101`
   - Upload `freebies\Sofrito-101.pdf` as content → Publish
   (Cross-ref: `scripts/sync_gumroad.py` free-lead-magnet step.)
3. **Custom checkout field** — for each paid product: Product → **Checkout settings** →
   Custom fields → add **"Mainland Location"** (optional).
4. Course landing copy on `products.html` / `data/products.json` already says
   "2 lessons" — update to 3 after uploading, if you want.

---

## Step 5 · OPTIONAL — turn on SMS + bounce tracking
Only if you want SMS abandoned-cart and Resend bounce suppression:
1. Twilio: create a phone number, paste into `config/.env`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_FROM_NUMBER=+1...
   ```
2. Resend: Dashboard → Webhooks → create → endpoint `https://sofritostudio.com/api/webhooks/resend`
   → copy the signing secret (`whsec_…`) into `config/.env`:
   ```
   RESEND_WEBHOOK_SECRET=whsec_...
   ```

---

## Step 6 · Push secrets + final verify (after ANY step above)
1. Push every filled secret to the Worker (PowerShell 7+, **not** `powershell.exe`):
   ```
   pwsh -File scripts\set_worker_secrets.ps1
   ```
2. Confirm the pipeline end-to-end:
   ```
   curl https://sofritostudio.com/api/cron/run          # expect JSON with salesProcessed/digest
   curl https://sofritostudio.com/health                # expect {"status":"ok"}
   python scripts\verify_all.py                         # expect "all green" (pre-commit also runs this)
   ```

After Step 1 + 2 you're live: every sale gets receipt/Day-3/Day-14 emails, the
queue posts daily, and you get the daily digest. Steps 3–5 add Pinterest, the
course, and SMS on top.