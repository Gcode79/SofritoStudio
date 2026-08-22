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

import { renderEmail, slugify } from "./emails.js";
import {
  captureLead,
  processSale,
  handleResendWebhook,
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

  // Gumroad webhooks are NOT signed. Both paths feed processSale(), which is
  // idempotent (per-sale dedup) — the hourly sales-API poll is authoritative.
  if (path === "/gumroad/webhook" || path === "/api/webhooks/gumroad") {
    return gumroadWebhook(request, env);
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
// Gumroad sale — optional low-latency accelerator. The hourly cron poll
// (sweepGumroadSales) is the source of truth; this just catches the sale
// immediately when a webhook does fire.
// ------------------------------------------------------------------
async function gumroadWebhook(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  if (payload.resource && payload.resource !== "sale") {
    return json({ status: "ignored", reason: `resource=${payload.resource}` });
  }
  const sale = payload.data || payload;
  const res = await processSale(env, sale);
  return json({ status: "ok", ...res });
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