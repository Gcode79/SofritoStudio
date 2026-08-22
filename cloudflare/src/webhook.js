/**
 * Sofrito Studio — edge webhook handlers (Gumroad sales + leads)
 *
 * Runs on the same Cloudflare Worker as the redirects/JSON-LD logic:
 *   POST /gumroad/webhook  (Gumroad "Sale" event)
 *   POST /lead/webhook     (freebie signups)
 *   GET  /health
 *
 * On a sale it (1) adds the buyer to Buttondown with metadata + tags and
 * (2) sends the instant personalized post-purchase email via Resend
 * (Gmail SMTP is not possible from Workers — HTTPS APIs only).
 *
 * Secrets (npx wrangler secret put <NAME>):
 *   BUTTONDOWN_API_KEY
 *   RESEND_API_KEY
 * Vars (wrangler.toml [vars]):
 *   RESEND_FROM=hello@sofritostudio.com
 *   RESEND_FROM_NAME=Sofrito Studio
 */

import { renderEmail, tierForProduct, slugify, START_HERE, CONTENTS } from "./emails.js";
import {
  captureLead,
  recordPurchase,
  markPurchased,
  handleResendWebhook,
  validateGumroadSignature,
} from "./automation.js";

const BUTTONDOWN_API = "https://api.buttondown.com/v1";
const RESEND_API = "https://api.resend.com/emails";

export async function handleWebhook(request, env, url) {
  const path = url.pathname;

  if (path === "/health") {
    return json({ status: "ok" });
  }

  if (request.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  if (path === "/gumroad/webhook" || path === "/api/webhooks/gumroad") {
    return gumroadWebhook(request, env, path === "/api/webhooks/gumroad");
  }
  if (path === "/lead/webhook" || path === "/api/leads") {
    return leadWebhook(request, env);
  }
  if (path === "/api/webhooks/resend") {
    return handleResendWebhook(request, env);
  }

  return json({ error: "not found" }, 404);
}

// ------------------------------------------------------------------
// Gumroad sale
// ------------------------------------------------------------------
async function gumroadWebhook(request, env, requireSignature) {
  let payload;
  if (requireSignature) {
    const check = await validateGumroadSignature(request, env);
    if (!check.valid) {
      return json({ error: "invalid signature" }, 401);
    }
    try {
      payload = JSON.parse(check.rawBody);
    } catch {
      return json({ error: "invalid json" }, 400);
    }
  } else {
    try {
      payload = await request.json();
    } catch {
      return json({ error: "invalid json" }, 400);
    }
  }

  // Support both { resource, data } (new) and flat sale payloads
  if (payload.resource && payload.resource !== "sale") {
    return json({ status: "ignored", reason: `resource=${payload.resource}` });
  }
  const sale = payload.data || payload;
  const email = sale.email || sale.buyer_email;
  if (!email || !email.includes("@")) {
    return json({ error: "no email in payload" }, 400);
  }

  const productName = sale.product_name || "unknown";
  const price = (sale.price || 0) / 100.0; // cents -> USD
  const lang = detectLanguage(payload, sale);
  const tier = tierForProduct(productName);

  const tags = [
    `customer:${tier}`,
    `product:${slugify(productName)}`,
    `lang:${lang}`,
    "customer",
  ];
  const metadata = {
    product: productName,
    tier,
    price,
    lang,
    tip: (START_HERE[tier] || START_HERE.product)[lang],
    contents: (CONTENTS[tier] || CONTENTS.product)[lang],
    flow: "post_purchase",
    purchased_at: new Date().toISOString(),
  };

  // 1) Capture to Buttondown (best-effort; never blocks the sale)
  let capture = { added: false };
  if (env.BUTTONDOWN_API_KEY) {
    capture = await addSubscriber(env, email, tags, `Purchased: ${productName} @ $${price.toFixed(2)}`, metadata);
  }

  // 2) Instant post-purchase email via Resend
  let emailResult = { sent: false };
  if (env.RESEND_API_KEY) {
    const { subject, text } = renderEmail("post_purchase", lang, {
      product_name: productName,
      tip: (START_HERE[tier] || START_HERE.product)[lang],
      contents: (CONTENTS[tier] || CONTENTS.product)[lang],
    });
    emailResult = await sendResend(env, email, subject, text);
  }

  // 3) Record purchase + stop any abandoned-cart emails for this buyer
  await recordPurchase(env, { email, lang, product_name: productName, tier, price });
  await markPurchased(env, email);

  return json({ status: "ok", captured: capture.added, emailed: emailResult.sent });
}

// ------------------------------------------------------------------
// Lead (freebie signup / discount modal / cart drawer)
// ------------------------------------------------------------------
async function leadWebhook(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const email = (body.email || "").trim();
  if (!email.includes("@")) {
    return json({ error: "invalid email" }, 400);
  }

  const lang = String(body.lang || "en").toLowerCase().startsWith("es") ? "es" : "en";
  const source = String(body.source || "sofrito-101").slice(0, 40);
  // intent: "freebie" (Sofrito 101) or "checkout" (discount modal / cart drawer)
  const intent = body.intent === "checkout" ? "checkout" : "freebie";
  const product = String(body.product || "starter-kit").slice(0, 40);
  const phone = String(body.phone || "").slice(0, 20);
  const tags = [`lead:${slugify(source)}`, `lang:${lang}`, intent === "checkout" ? "cart-abandoner" : "freebie"];
  const metadata = { source, lang, intent, flow: intent === "checkout" ? "abandoned_cart" : "welcome" };

  // 1) Capture to Buttondown (best-effort; never blocks)
  let capture = { added: false };
  if (env.BUTTONDOWN_API_KEY) {
    capture = await addSubscriber(env, email, tags, `Lead magnet: ${source} (${intent})`, metadata);
  }

  // 2) Action 1 — instant email with the PDF link + 15% Starter Kit code
  let emailResult = { sent: false };
  if (env.RESEND_API_KEY) {
    const { subject, text } = renderEmail("welcome_15", lang);
    emailResult = await sendResend(env, email, subject, text);
  }

  // 3) KV tracking — powers the abandoned-checkout (1h/24h) sequence
  await captureLead(env, { email, lang, source, intent, product, phone });

  return json({ status: "ok", captured: capture.added, emailed: emailResult.sent, intent });
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function detectLanguage(payload, sale) {
  for (const cf of [payload.custom_fields, sale.custom_fields]) {
    if (!cf) continue;
    if (Array.isArray(cf)) {
      for (const f of cf) {
        if (String(f?.name).toLowerCase() === "language" && String(f?.value).toLowerCase().startsWith("es")) {
          return "es";
        }
      }
    } else if (typeof cf === "object") {
      if (String(cf?.language || "").toLowerCase().startsWith("es")) return "es";
    }
  }
  return "en";
}

async function addSubscriber(env, email, tags, notes, metadata) {
  const headers = {
    Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
    "Content-Type": "application/json",
  };
  let resp = await fetch(`${BUTTONDOWN_API}/subscribers`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email_address: email, tags, notes, metadata }),
  });
  if (resp.ok) return { added: true };

  // Free plan rejects tags (403) — retry without them, keep metadata
  if (resp.status === 403) {
    resp = await fetch(`${BUTTONDOWN_API}/subscribers`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: email, notes, metadata }),
    });
    if (resp.ok) return { added: true, tagsSkipped: true };
  }
  return { added: false, status: resp.status };
}

async function sendResend(env, to, subject, text) {
  const fromAddr = env.RESEND_FROM || "hello@sofritostudio.com";
  const fromName = env.RESEND_FROM_NAME || "Sofrito Studio";
  const resp = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "sofrito-studio-worker/1.0", // Resend blocks requests without a UA (403/1010)
    },
    body: JSON.stringify({ from: `${fromName} <${fromAddr}>`, to: [to], subject, text }),
  });
  if (resp.ok) return { sent: true };
  return { sent: false, status: resp.status };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}