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
import { runAutomation } from "./automation.js";
import { RECIPE_UNLOCKS } from "./recipe-unlocks.js";

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
  ["/buy/mofongo", "https://sofritostudio.gumroad.com/l/mofongo-course"],
  ["/buy/membership", "https://sofritostudio.gumroad.com/l/membership-monthly"],

  // Legacy anchors that moved to new product pages
  ["/products.html#la-mesa-boricua", "/products/la-mesa-boricua-sales.html"],
  ["/products.html#starter-kit", "/products/starter-kit.html"],
  ["/products.html#kitchen-bundle", "/products/kitchen-bundle.html"],
  ["/products.html#full-table", "/products/full-table.html"],

  // A/B "offer" link re-pointable without editing site HTML
  ["/offer", "/products/la-mesa-boricua-sales.html"],
]);

// Legacy hash mapping for /products.html#<anchor> (server can't see the #)
const HASH_REDIRECTS = {
  "starter-kit": "/products/starter-kit.html",
  "la-mesa-boricua": "/products/la-mesa-boricua-sales.html",
  "kitchen-bundle": "/products/kitchen-bundle.html",
  "full-table": "/products/full-table.html",
};

// ------------------------------------------------------------------
// 2) JSON-LD RECIPE SCHEMA — dish -> structured data
// Injected into the <head> of matching pages for rich results.
// ------------------------------------------------------------------
const SITE_URL = "https://sofritostudio.com";
const RECIPES = {
  "/blog/mofongo.html": {
    name: "Mofongo",
    description: "Authentic Puerto Rican mofongo — green plantains, garlic, and chicharrón.",
    prepTime: "PT20M", cookTime: "PT25M", totalTime: "PT45M",
    recipeYield: "4 servings",
    ingredients: ["4 green plantains", "4 garlic cloves", "1/4 cup olive oil", "Salt to taste"],
    steps: ["Peel and cut plantains into chunks.", "Fry until golden, mash with garlic and oil.", "Shape into a dome and serve."],
  },
  "/blog/coquito.html": {
    name: "Coquito",
    description: "Puerto Rican coconut holiday drink with cinnamon and rum.",
    prepTime: "PT10M", cookTime: "PT5M", totalTime: "PT15M",
    recipeYield: "8 servings",
    ingredients: ["2 cans coconut milk", "1 can condensed milk", "1 can evaporated milk", "1 cup rum", "1 tsp cinnamon"],
    steps: ["Blend all ingredients until smooth.", "Chill for at least 4 hours.", "Serve over ice with cinnamon."],
  },
};

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

    // 0.5) Manual automation run — GET /api/cron/run[?digest=1] (guard with CRON_KEY if set)
    if (path === "/api/cron/run" && request.method === "GET") {
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

    // 2) Legacy hash redirect on /products.html
    if (path === "/products.html") {
      return handleHashRedirect(request);
    }

    // 3) Blog recipe pages: inject an in-context "unlock the full guide" CTA
    // (data-cart-add opens the site's cart drawer — no page reload)
    const cta = await maybeInjectRecipeCta(request, env, path);
    if (cta) return cta;

    // 3.5) JSON-LD schema injection for featured recipe pages
    if (RECIPES[path]) {
      return injectSchema(request, env, path, RECIPES[path]);
    }

    // 4) Everything else serves the static site (deploy/) via ASSETS
    return env.ASSETS.fetch(request);
  },

  // 5) Cron — run the conversion-automation sweep (abandoned cart,
  //    Day 3 upgrade, Day 14 review). Wrangler cron: "0 * * * *".
  async scheduled(event, env, ctx) {
    const summary = await runAutomation(env);
    ctx.waitUntil(Promise.resolve());
    console.log("automation sweep", JSON.stringify(summary));
  },
};

function handleHashRedirect(request) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <script>(function(){var m=${JSON.stringify(HASH_REDIRECTS)};
      var h=(location.hash||"").replace('#','');
      location.replace(m[h]||"/products.html");
    })();</script></head><body>Redirecting…</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function injectSchema(request, env, path, recipe) {
  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const schema = JSON.stringify(buildSchema(path, recipe));
  const tag = `\n<script type="application/ld+json">${schema}</script>\n</head>`;
  const injected = html.replace("</head>", tag);

  return new Response(injected, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function buildSchema(path, data) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: data.name,
    description: data.description,
    image: `${SITE_URL}/images/og-default.jpg`,
    author: { "@type": "Person", name: "Josh Ortiz" },
    datePublished: new Date().toISOString().split("T")[0],
    prepTime: data.prepTime,
    cookTime: data.cookTime,
    totalTime: data.totalTime,
    recipeYield: data.recipeYield,
    recipeCategory: "Puerto Rican",
    recipeCuisine: "Puerto Rican",
    keywords: `${data.name.toLowerCase()}, puerto rican recipe`,
    recipeIngredient: data.ingredients,
    recipeInstructions: data.steps.map((text) => ({ "@type": "HowToStep", text })),
  };
}

// ------------------------------------------------------------------
// Blog recipe unlock CTA — injects an in-context "Get the full guide"
// button (data-cart-add opens the cart drawer) on every recipe post that
// has a paid-tier unlock. Uses the embedded RECIPE_UNLOCKS catalog so the
// edge never does a runtime data fetch.
// ------------------------------------------------------------------
async function maybeInjectRecipeCta(request, env, path) {
  if (!path.startsWith("/blog/") && !path.startsWith("/es/blog/")) return null;
  const slug = path.split("/").pop().replace(".html", "");
  const unlock = RECIPE_UNLOCKS[slug];
  if (!unlock) return null;

  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;
  const html = await response.text();
  const isEs = path.startsWith("/es/");
  const label = isEs ? unlock.label.es : unlock.label.en;
  const cta = buildUnlockCta(unlock, label, isEs);
  const injected = html.replace("</main>", cta + "\n</main>");
  return new Response(injected, {
    status: response.status,
    headers: { ...Object.fromEntries(response.headers), "Content-Type": "text/html; charset=utf-8" },
  });
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
