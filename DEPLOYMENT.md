# Sofrito Studio — Deployment Guide

Step-by-step instructions to take everything live. Each section is independent.

---

## 1. Deploy the Website (Cloudflare Pages) — ~5 min

The site code lives in `deploy/` (132 files). It's what the internet sees.

> **NOTE (Aug 2026):** `deploy2/` is the updated version — recipe-specific photos on every
> page, broken image fixes, mobile footer improvements, updated photo credits. Until the
> folders are consolidated, **drag `deploy2/` to Cloudflare Pages**, not `deploy/`.

1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Upload assets**
2. Name it `sofritostudio` (or your existing project)
3. **Drag the `deploy2` folder** into the upload area
4. Click **Deploy**
5. Add your custom domain `sofritostudio.com` under **Custom domains** (Cloudflare handles DNS)

> Every time the site code changes, re-drag the `deploy` folder to update it.

---

## 2. Deploy the Webhook Server (Render) — ~15 min

The webhook server turns Gumroad sales into Buttondown subscribers + emails. It needs a **public URL** so Gumroad can reach it.

**Option A — Render (recommended):**
1. Push this project to a GitHub repo (or use Render's "Deploy from repo")
2. In Render dashboard → **New** → **Blueprint** → select your repo
3. Render reads `render.yaml` and creates the service automatically
4. In Render → your service → **Environment**, set:
   - `BUTTONDOWN_API_KEY` = your key
5. Render gives you a URL like `https://sofrito-webhook.onrender.com`

**Option B — any Python host (Railway/Fly.io/VPS):**
- Use the `Procfile` (start command) or `Dockerfile`-equivalent
- Set `BUTTONDOWN_API_KEY` env var
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Verify it's up:** visit `https://<your-app>/health` → should return `{"status":"ok"}`

---

## 3. Wire Gumroad Webhook — ~2 min

Now connect Gumroad to your deployed webhook server.

1. Go to https://gumroad.com → log in as `joshortiz4`
2. **Settings** (avatar top-right) → **Advanced**
3. Scroll to **Webhooks**
4. Set the URL to: `https://<your-app>.onrender.com/gumroad/webhook`
5. Make sure the **Sale** event is enabled
6. Save

Now every sale automatically:
- Adds the buyer to Buttondown (with tags on the paid plan)
- Sends the post-purchase welcome email

---

## 4. Deploy the Cloudflare Worker — ~10 min

The worker adds `/buy/*` short-links → Gumroad + injects Recipe JSON-LD for SEO.

```bash
cd cloudflare
npm install
npx wrangler login        # opens browser to authorize
npx wrangler deploy        # deploy src/index.js
```

Or set `CF_API_TOKEN` in `config/.env` and I can run the deploy.

Then attach the worker to your Pages domain (Workers & Pages → your project → **Settings** → **Functions**, or **Workers Routes**).

---

## 5. Push GitHub Actions (email automation) — ~10 min

The email automation + welcome workflows need to run from GitHub.

1. Push this project to a GitHub repo (e.g. `gcode79/sofrito-studio`)
2. Go to repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
3. Name: `BUTTONDOWN_API_KEY` → paste your Buttondown key
4. The workflows (`.github/workflows/`) will run on schedule:
   - `welcome.yml` — sends welcome email to new subscribers
   - `email-automation.yml` — runs email flows on schedule (or manual trigger)
   - `marketing-daily.yml` — daily metrics + weekly content calendar

---

## 6. Create remaining Gumroad products — tomorrow

Gumroad caps product creation at **10/day**. 10 are already created. The remaining 10 (Starter Kit, seasonal, course, memberships) get created by re-running:

```bash
python gumroad_creator.py
```

The script is idempotent — it detects existing products and only creates missing ones.

---

## 7. Attach PDFs to products — ~10 min

Gumroad's API can't upload content files. For each of the 10 live products, log into Gumroad and attach the matching PDF:

| Product | PDF (in products/printables or packages/) |
| :--- | :--- |
| Boricua Breakfasts | (breakfast PDF) |
| ... | ... |

---

## Secrets checklist
- `BUTTONDOWN_API_KEY` → config/.env + GitHub secret + Render env
- `GUMROAD_ACCESS_TOKEN` → config/.env (already set)
- `CF_API_TOKEN` → config/.env (for wrangler) or use `wrangler login`
