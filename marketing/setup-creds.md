# Credentials setup — paste values into `config/.env`, then run one command.

| Secret / var | Where to get it | Used by |
|---|---|---|
| `GUMROAD_WEBHOOK_SECRET` | Gumroad → Settings → Webhooks → enable **signature verification**, copy the secret | Worker `/api/webhooks/gumroad` (HMAC validation) |
| `RESEND_WEBHOOK_SECRET` | Resend → Webhooks → **Create webhook** → endpoint `https://sofritostudio.com/api/webhooks/resend` → copy the signing secret (`whsec_…`) | Worker `/api/webhooks/resend` (Svix/ed25519 validation) |
| `META_ACCESS_TOKEN` | developers.facebook.com → App → **Graph API Explorer / long-lived token** (scopes: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_manage_posts`) | `marketing/post_to_meta.py` |
| `META_PAGE_ID` | (optional) Page → About → Page ID — **auto-resolved** from the token if blank | same |
| `META_INSTAGRAM_ACCOUNT_ID` | (optional) Instagram → Professional dashboard → Account ID — **auto-resolved** from the page if blank | same |

`RESEND_API_KEY` and `BUTTONDOWN_API_KEY` are already set and live.

---

## 1 · Push webhook secrets to the Worker
1. Paste `GUMROAD_WEBHOOK_SECRET` and `RESEND_WEBHOOK_SECRET` into `config/.env`.
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

> Note: `GUMROAD_WEBHOOK_SECRET` only becomes enforced once you paste it in BOTH
> Gumroad's dashboard AND `config/.env` — the Worker will reject unsigned
> Gumroad calls until then, so complete both sides before enabling it.