/**
 * Sofrito Studio — Cloudflare Worker (edge)
 *
 * Combines two jobs in one edge worker:
 *   1. Fast 301/302 redirects -> dynamic Gumroad checkout pages
 *   2. Recipe JSON-LD schema injection on static HTML pages (SEO)
 *
 * Local test:  npx wrangler dev src/index.js --port 8787
 * Deploy:      npx wrangler deploy
 */

import { handleWebhook } from "./webhook.js";
import { runAutomation, sendResend } from "./automation.js";
import { renderEmail } from "./emails.js";
import { RECIPE_UNLOCKS } from "./recipe-unlocks.js";
import { RECIPE_SCHEMA } from "./recipe-schema.js";
import { getComments, postComment, likeComment } from "./comments.js";

// ------------------------------------------------------------------
// 1) REDIRECTS — friendly short-links -> Gumroad checkout
// 301 = permanent (SEO). 302 = temporary (offers/experiments).
// ------------------------------------------------------------------
const REDIRECTS = new Map([
  // "Buy" short-links -> Gumroad checkout
  ["/buy/starter", "https://sofritostudio.gumroad.com/l/sofrito-starter-kit"],
  ["/buy/mesa", "https://sofritostudio.gumroad.com/l/cmfkg"],
  ["/buy/bundle", "https://sofritostudio.gumroad.com/l/razabs"],
  ["/buy/full-table", "https://sofritostudio.gumroad.com/l/dodbtn"],
  ["/buy/breakfasts", "https://sofritostudio.gumroad.com/l/boricua-breakfasts"],
  ["/buy/coquito", "https://sofritostudio.gumroad.com/l/coquito-guide"],
  ["/buy/mofongo", "https://sofritostudio.gumroad.com/l/cmfkg"],
  ["/buy/membership", "https://sofritostudio.gumroad.com/l/membership-monthly"],

  // Legacy anchors that moved to new product pages
  ["/products.html#la-mesa-boricua", "https://sofritostudio.com/products/la-mesa-boricua-sales.html"],
  ["/products.html#starter-kit", "https://sofritostudio.com/products/starter-kit.html"],
  ["/products.html#kitchen-bundle", "https://sofritostudio.com/products/kitchen-bundle.html"],
  ["/products.html#full-table", "https://sofritostudio.com/products/full-table.html"],

  // Swap-guide alias used by regional social captions
  ["/blog/mainland-substitutions.html", "https://sofritostudio.com/blog/mainland-ingredients.html"],

  // A/B "offer" link re-pointable without editing site HTML
  ["/offer", "https://sofritostudio.com/products/la-mesa-boricua-sales.html"],
]);

// Legacy hash mapping for /products.html#<anchor> (server can't see the #)
const HASH_REDIRECTS = {
  "starter-kit": "/products/starter-kit.html",
  "la-mesa-boricua": "/products/la-mesa-boricua-sales.html",
  "kitchen-bundle": "/products/kitchen-bundle.html",
  "full-table": "/products/full-table.html",
};

// ------------------------------------------------------------------
// 2) SITE CONSTANTS
// ------------------------------------------------------------------
const SITE_URL = "https://sofritostudio.com";

// ------------------------------------------------------------------
// Sticky Starter Kit bar — geo-targeted copy via request.cf.region.
// The bar itself is client-injected; the Worker hands it the copy through
// a <meta name="ss-offer"> tag that js/main.js reads. Regions:
// HI (Hawaii), East (NY/FL/NJ/PA/CT/MA), West (CA/OR/WA/AK/NV/AZ/ID/MT/UT),
// default otherwise.
//
// DEV-ONLY override: when the wrangler var DEBUG_REGION_OVERRIDE = "1" is set,
// a ?debug_region=HI (or ?region=HI) query param overrides request.cf.region so
// each regional variant can be previewed. This flag is UNSET in production, so
// visitors can never manipulate the offer state via URL. Override responses
// are served with Cache-Control: no-store so previews update instantly.
// ------------------------------------------------------------------
function debugRegion(request, env) {
  if (!env || env.DEBUG_REGION_OVERRIDE !== "1") return null;
  let u;
  try { u = new URL(request.url); } catch (err) { return null; }
  const v = (u.searchParams.get("debug_region") || u.searchParams.get("region") || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(v) ? v : null;
}

function geoOfferCopy(request, env) {
  const fallback = "Start cooking authentic Puerto Rican recipes today\u2014Get the $9 Starter Kit.";
  const dbg = debugRegion(request, env);
  const cf = request.cf;
  const country = dbg ? "US" : (cf && cf.country);
  if (country !== "US") return fallback;
  const region = dbg || (cf && cf.region) || "";
  if (region === "HI") return "Cooking in Hawaii? Grab the $9 Starter Kit + local ingredient swap guide.";
  const east = ["NY", "FL", "NJ", "PA", "CT", "MA"].indexOf(region) !== -1;
  if (east) return "East Coast Boricua? Get the $9 Starter Kit + supermarket swap cheat sheet.";
  const west = ["CA", "OR", "WA", "AK", "NV", "AZ", "ID", "MT", "UT"].indexOf(region) !== -1;
  if (west) return "Mainland cooking made easy: $9 Starter Kit + essential substitutions.";
  return fallback;
}

function geoOfferMeta(request, env) {
  return '<meta name="ss-offer" content="' + geoOfferCopy(request, env).replace(/"/g, "&quot;") + '">';
}

// Consent manager script tag, injected on every served HTML page so the
// GDPR/CCPA banner + gated GA4 load apply site-wide without per-page edits.
function consentScriptTag() {
  return '\n  <script src="/js/consent.js" defer></script>';
}

// Serve a static HTML page with the geo-offer meta injected (deduplicated).
async function servePage(request, env) {
  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;
  const html = await response.text();
  if (html.includes('name="ss-offer"')) return response;
  const headAdd = geoOfferMeta(request, env) + consentScriptTag();
  const injected = html.replace("</head>", "\n  " + headAdd + "\n</head>");
  const headers = { "Content-Type": "text/html; charset=utf-8" };
  if (debugRegion(request, env)) headers["Cache-Control"] = "no-store";
  return new Response(injected, { status: 200, headers });
}

// ------------------------------------------------------------------
// Dev-only email preview — sends a nurture/welcome template immediately to
// the developer's address (OWNER_EMAIL), bypassing the cron schedule.
// Inert in production: DEBUG_REGION_OVERRIDE is not set there.
//   GET /api/cron/run?debug_email=1|2|3[&lang=en|es|both]
// ------------------------------------------------------------------
const PREVIEW_EMAILS = { "1": "welcome_15", "2": "nurture_swaps", "3": "nurture_heritage" };

async function previewEmail(env, which, lang) {
  const template = PREVIEW_EMAILS[which];
  if (!template) return json({ error: "unknown debug_email (use 1, 2, or 3)" }, 400);
  const to = env.OWNER_EMAIL || "j.ortiz1148@gmail.com";
  const langs = lang === "en" ? ["en"] : lang === "es" ? ["es"] : ["en", "es"];
  const sent = [];
  for (const l of langs) {
    const { subject, text } = renderEmail(template, l);
    const res = await sendResend(env, to, subject, text);
    sent.push({ lang: l, sent: res.sent, status: res.status || null });
  }
  return json({ status: "ok", template, to, sent });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

// ------------------------------------------------------------------
// Worker handler
// ------------------------------------------------------------------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 0) Webhook + API endpoints (Gumroad sales, leads, Resend, health)
    if (
      path === "/health" ||
      path === "/gumroad/webhook" ||
      path === "/api/webhooks/gumroad" ||
      path === "/lead/webhook" ||
      path === "/api/leads" ||
      path === "/api/webhooks/resend"
    ) {
      return handleWebhook(request, env, url);
    }

    // 0.5) Daily digest (forces the owner digest + runs the sweep)
    if (path === "/api/cron/daily-digest" && request.method === "GET") {
      const summary = await runAutomation(env, { forceDigest: true });
      return json(summary);
    }

    // 0.4) Recipe comments API — GET /api/comments?recipe_id=&sort=new|top,
    // POST /api/comments (body: recipe_id, author_name, content, parent_id?),
    // POST /api/comments/like (body: id). Sanitized + stored in D1.
    if (path === "/api/comments") {
      if (request.method === "GET") {
        return await getComments(env, url.searchParams.get("recipe_id") || "", url.searchParams.get("sort") || "new");
      }
      if (request.method === "POST") {
        const body = await request.json().catch(() => null);
        return await postComment(env, body);
      }
      return json({ error: "method_not_allowed" }, 405);
    }
    if (path === "/api/comments/like" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      return await likeComment(env, body && body.id);
    }

    // 0.45) Community recipe submission — emails the owner via Resend so the
    // "Email your recipe" CTA works without a desktop mail client.
    if (path === "/api/recipe-submission" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body) return json({ error: "invalid_input" }, 400);
      const name = String(body.name || "").trim().slice(0, 60);
      const email = String(body.email || "").trim().slice(0, 120);
      const recipe = String(body.recipe || "").trim().slice(0, 4000);
      if (!name || !recipe) return json({ error: "missing_fields" }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "invalid_email" }, 400);
      const subject = `Recipe submission from ${name}`;
      const text = `Name: ${name}\nEmail: ${email}\n\n${recipe}`;
      const res = await sendResend(env, env.OWNER_EMAIL, subject, text);
      if (!res.sent) return json({ error: "send_failed" }, 502);
      return json({ ok: true });
    }

    // 0.5) Click tracker — increments a daily per-campaign click counter
    // (fed by the client beacon on UTM'd landings; powers digest CR).
    if (path === "/api/track-click" && (request.method === "GET" || request.method === "POST")) {
      const label = url.searchParams.get("label");
      if (!label || label.length > 120) return json({ error: "bad label" }, 400);
      const dateKey = new Date().toISOString().slice(0, 10);
      const key = `click:${dateKey}:${label}`;
      const cur = parseInt((await env.SOFRITO_STATE.get(key)) || "0", 10);
      await env.SOFRITO_STATE.put(key, String(cur + 1));
      return json({ status: "ok", clicks: cur + 1 });
    }

    // 0.5) Manual automation run — GET /api/cron/run[?digest=1] (guard with CRON_KEY if set)
    if (path === "/api/cron/run" && request.method === "GET") {
      // Dev-only email preview: ?debug_email=1|2|3 (welcome / Day-3 / Day-7),
      // gated behind DEBUG_REGION_OVERRIDE so it is inert in production.
      const dbgEmail = url.searchParams.get("debug_email");
      if (dbgEmail && env.DEBUG_REGION_OVERRIDE === "1") {
        return previewEmail(env, dbgEmail, url.searchParams.get("lang") || "both");
      }
      if (env.CRON_KEY && request.headers.get("x-cron-key") !== env.CRON_KEY) {
        return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      const forceDigest = url.searchParams.get("digest") === "1";
      const summary = await runAutomation(env, { forceDigest });
      return new Response(JSON.stringify(summary), { headers: { "Content-Type": "application/json" } });
    }

    // 0.5) Tripwire — /starter-kit-offer serves the Starter Kit page (the
    // client-side countdown also arms on this path)
    if (path === "/starter-kit-offer") {
      const url = new URL(request.url);
      url.pathname = "/products/starter-kit.html";
      return env.ASSETS.fetch(new Request(url, request));
    }

    // 1) Short-link / exact redirects
    const target = REDIRECTS.get(path);
    if (target) {
      return Response.redirect(target, 301);
    }

    // 3) Blog recipe pages: HTMLRewriter edge transforms — Recipe/Product
    // JSON-LD, ingredient-swap geo banner, and the in-context unlock CTA
    const transformed = await transformBlogRecipe(request, env, path);
    if (transformed) return transformed;

    // 4) Everything else serves the static site (deploy/) via ASSETS, with the
    // geo-targeted sticky-bar copy injected
    return servePage(request, env);
  },

  // 5) Cron — run the conversion-automation sweep (abandoned cart,
  //    Day 3 upgrade, Day 14 review). Wrangler cron: "0 * * * *".
  async scheduled(event, env, ctx) {
    const summary = await runAutomation(env);
    ctx.waitUntil(Promise.resolve());
    console.log("automation sweep", JSON.stringify(summary));
  },
};

function handleHashRedirect(request, env) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    ${geoOfferMeta(request, env)}
    <script>(function(){var m=${JSON.stringify(HASH_REDIRECTS)};
      var h=(location.hash||"").replace('#','');
      location.replace(m[h]||"/products.html");
    })();</script></head><body>Redirecting…</body></html>`;
  const headers = { "Content-Type": "text/html; charset=utf-8" };
  if (debugRegion(request, env)) headers["Cache-Control"] = "no-store";
  return new Response(html, { headers });
}

// ------------------------------------------------------------------
// Blog recipe edge transforms — HTMLRewriter pass for every recipe post:
//   1. JSON-LD: Product (the unlock tier) always; Recipe only if the page
//      doesn't already carry one (avoids duplicate Recipe schemas).
//   2. Geolocation swap banner (Hawaii / West Coast requests) under the
//      ingredient heading.
//   3. In-context "Get the full guide" CTA (data-cart-add -> cart drawer).
// ------------------------------------------------------------------
async function transformBlogRecipe(request, env, path) {
  if (!path.startsWith("/blog/") && !path.startsWith("/es/blog/")) return null;
  const slug = path.split("/").pop().replace(".html", "");
  const recipe = RECIPE_SCHEMA[slug];
  if (!recipe) return null;
  const unlock = RECIPE_UNLOCKS[slug];

  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();
  const isEs = path.startsWith("/es/");

  // 1) JSON-LD — Product always; Recipe only if the page lacks one
  //    (schema scripts go into <head> via string replace — HTMLRewriter's
  //    head.append is unreliable for <script> content)
  let headAdditions = "";
  if (!html.includes('name="ss-offer"')) headAdditions += geoOfferMeta(request, env);
  if (unlock) headAdditions += productLdScript(unlock, recipe, isEs);
  if (!html.includes('"@type": "Recipe"')) headAdditions += recipeLdScript(recipe, isEs, slug);
  headAdditions += consentScriptTag();
  if (headAdditions) html = html.replace("</head>", "\n  " + headAdditions + "\n</head>");

  // 2) Geolocation swap banner (Hawaii / West Coast / East Coast)
  const banner = geoSwapBanner(request, env);
  let bannerPlaced = false;

  // 3) In-context unlock CTA (opens the cart drawer)
  const label = isEs ? unlock.label.es : unlock.label.en;
  const cta = unlock ? buildUnlockCta(unlock, label, isEs) : "";

  const rewriter = new HTMLRewriter();
  if (banner) {
    rewriter.on("h2", {
      element(el) {
        if (bannerPlaced) return;
        const id = el.getAttribute("id") || "";
        const text = el.text || "";
        if (/ingredient/i.test(id) || /ingredien/i.test(text)) {
          el.after(banner, { html: true });
          bannerPlaced = true;
        }
      },
    });
  }
  if (cta) {
    rewriter.on("main", { element(el) { el.append(cta, { html: true }); } });
  }

  // 4) Comment section — injected (empty) below the recipe so it causes no
  //    layout shift; comments.js fills it after the page loads. The script tag
  //    is async so it never blocks first paint.
  rewriter.on("main", {
    element(el) {
      el.append(`<section id="ss-comments" data-recipe-id="${slug}" aria-label="Comments"></section>`, { html: true });
    },
  });
  if (!html.includes("js/comments.js")) {
    html = html.replace("</head>", '\n  <script src="/js/comments.js" defer></script>\n</head>');
  }

  const headers = { "Content-Type": "text/html; charset=utf-8" };
  if (debugRegion(request, env)) headers["Cache-Control"] = "no-store";
  return rewriter.transform(new Response(html, { status: 200, headers }));
}

function recipeLdScript(recipe, isEs, slug) {
  const total = (recipe.prep_min || 0) + (recipe.cook_min || 0);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.description,
    image: `${SITE_URL}/${recipe.image}`,
    author: { "@type": "Person", name: "Josh Ortiz" },
    datePublished: new Date().toISOString().split("T")[0],
    prepTime: `PT${recipe.prep_min || 0}M`,
    cookTime: `PT${recipe.cook_min || 0}M`,
    totalTime: `PT${total}M`,
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,
    keywords: `${recipe.name.toLowerCase()}, puerto rican recipe, sofrito studio`,
    recipeIngredient: recipe.ingredients,
    mainEntityOfPage: `${SITE_URL}/${recipe.url}`,
  };
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function productLdScript(unlock, recipe, isEs) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: unlock.name,
    description: isEs ? recipe.description : recipe.description,
    image: `${SITE_URL}/${recipe.image}`,
    brand: { "@type": "Organization", name: "Sofrito Studio" },
    offers: {
      "@type": "Offer",
      price: unlock.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: unlock.link,
    },
  };
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

// Geolocation swap banner — shown to Hawaii / US West Coast / East Coast
// diaspora visitors on recipe pages, linking to the local-ingredient guides.
// Regions: HI (Hawaii post); West = CA, OR, WA, AK, NV, AZ, ID, MT, UT;
// East = NY, FL, NJ, PA, CT, MA (mainland swaps guide).
function geoSwapBanner(request, env) {
  const dbg = debugRegion(request, env);
  const cf = request.cf;
  if (!dbg && (!cf || cf.country !== "US")) return null;
  const region = dbg || (cf && cf.region) || "";
  if (region === "HI") {
    return '<div class="swap-banner"><a href="/blog/hawaii-adaptations.html">Cooking from Hawaii? Tap here for local ingredient swaps — taro, kabocha, local fish.</a></div>';
  }
  const west = ["CA", "OR", "WA", "AK", "NV", "AZ", "ID", "MT", "UT"].indexOf(region) !== -1;
  const east = ["NY", "FL", "NJ", "PA", "CT", "MA"].indexOf(region) !== -1;
  if (!west && !east) return null;
  const text = east
    ? "Cooking on the East Coast? Tap here for local supermarket swaps for recao, aj\u00edes dulces, and viandas."
    : "Cooking from the mainland or the West Coast? Tap here for local ingredient swaps.";
  return '<div class="swap-banner"><a href="/blog/mainland-ingredients.html">' + text + "</a></div>";
}

function buildUnlockCta(unlock, label, isEs) {
  const title = isEs ? "¿Quieres la guía completa?" : "Want the full guide?";
  const sub = isEs
    ? "Desbloquea la guía completa — todas las recetas, pasos y swaps del mainland."
    : "Unlock the full guide — every recipe, step, and mainland swap, in one download.";
  return (
    '<section class="section"><div class="wrap center"><div class="unlock-cta">' +
    '<div class="unlock-cta-text"><h3>' + title + "</h3><p>" + sub + "</p></div>" +
    '<a class="btn btn-primary-big" href="' + unlock.link + '" data-cart-add="' + unlock.sku + '">' + label + " — $" + unlock.price + "</a>" +
    "</div></div></section>"
  );
}
