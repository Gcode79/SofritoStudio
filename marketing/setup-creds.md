# Credentials setup — paste values into `config/.env`, then run one command.

| Secret / var | Where to get it | Used by |
|---|---|---|
| `RESEND_WEBHOOK_SECRET` | Resend → Webhooks → **Create webhook** → endpoint `https://sofritostudio.com/api/webhooks/resend` → copy the signing secret (`whsec_…`) | Worker `/api/webhooks/resend` (Svix/ed25519 validation) |
| `GUMROAD_ACCESS_TOKEN` | Gumroad → Settings → **Access tokens** (already in `config/.env`) | Worker hourly sales-API poll → post-purchase emails |
| `META_ACCESS_TOKEN` | developers.facebook.com → App → **Graph API Explorer / long-lived token** (scopes: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_manage_posts`) | `marketing/post_to_meta.py` |
| `META_PAGE_ID` | (optional) Page → About → Page ID — **auto-resolved** from the token if blank | same |
| `META_INSTAGRAM_ACCOUNT_ID` | (optional) Instagram → Professional dashboard → Account ID — **auto-resolved** from the page if blank | same |

`RESEND_API_KEY`, `BUTTONDOWN_API_KEY`, and `GUMROAD_ACCESS_TOKEN` are already set and live.

---

## Email architecture (Resend-first, no Gumroad webhook needed)
All emails go through **Resend**. Post-purchase triggers do **not** depend on a
Gumroad webhook — the Worker's hourly cron **polls the Gumroad sales API**
(`/v2/sales`) with `GUMROAD_ACCESS_TOKEN`, processes each new sale (instant
receipt email, purchase record, Day 3 upgrade / Day 14 review scheduling), and
stops abandoned-cart emails for that buyer. A Gumroad sale webhook, if you ever
wire one to `/gumroad/webhook`, only accelerates that processing — it's
optional and idempotent.

## 1 · Push webhook secrets to the Worker
1. Paste `RESEND_WEBHOOK_SECRET` into `config/.env`.
2. Run (PowerShell 7+ — `pwsh`, not `powershell.exe`):
   ```
   pwsh -File scripts\set_worker_secrets.ps1
   ```
   It uploads every non-empty secret to `sofrito-edge` (live — no redeploy needed).

## 2 · Meta social posting
1. Paste `META_ACCESS_TOKEN` into `config/.env` (page/IG ids are auto-resolved).
2. Preview what's due:
   ```
   python marketing/post_to_meta.py --dry-run
   ```
3. Publish the due queue (ig-001 + fb-001 are already due):
   ```
   python marketing/post_to_meta.py --publish
   ```
4. To run it automatically every day, the GitHub Action is already wired at
   `.github/workflows/social-poster.yml` (daily 12:00 UTC). Add the three Meta
   values as **GitHub repo secrets** (Settings → Secrets and variables →
   Actions): `META_ACCESS_TOKEN`, `META_PAGE_ID`, `META_INSTAGRAM_ACCOUNT_ID`.
   Page/IG ids are optional — the publisher auto-resolves them from the token.

> Note: the Worker's `/api/webhooks/gumroad` accepts unsigned payloads — Gumroad
> webhooks don't carry signatures. Processing is idempotent and backed by the
> hourly sales-API poll, so there's nothing extra to configure for sales emails.