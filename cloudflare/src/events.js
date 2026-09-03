/**
 * Sofrito Studio — event + Gumroad webhook endpoints (Queue-backed)
 *
 *   OPTIONS       CORS preflight (ACAO:*, POST, OPTIONS, Content-Type)
 *   POST /api/events   Ingest lead capture — validates the email, fires the
 *                      Resend `sofrito_101_downloaded` custom event, and logs
 *                      the lead into KV (abandoned-cart state).
 *   POST /api/webhook  Gumroad webhook — reads the raw body, verifies the
 *                      `x-gumroad-signature` header (HMAC-SHA256 via the Web
 *                      Crypto API against env.GUMROAD_WEBHOOK_SECRET), then
 *                      pushes the verified payload onto env.SOFRITO_QUEUE and
 *                      returns 200 immediately. The queue consumer
 *                      (src/queue.js) does the downstream fan-out async.
 *
 * Secrets: GUMROAD_WEBHOOK_SECRET, RESEND_API_KEY (npx wrangler secret put)
 * Vars:    RESEND_FROM, RESEND_FROM_NAME
 */

import { captureLead } from "./automation.js";
import { validateGumroadSignature } from "./automation.js";
import { sendInitiateCheckoutEvent } from "./meta-capi.js";

const RESEND_EVENTS_API = "https://api.resend.com/events/send";
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status = 200, sweep = false) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign({ "Content-Type": "application/json", "Cache-Control": "no-store" }, corsHeaders()),
  });
}

// ------------------------------------------------------------------
// CORS preflight
// ------------------------------------------------------------------
export function corsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// ------------------------------------------------------------------
// POST /api/events — lead capture from the funnel page
// Body: { email, fbp, ga, page_url, user_agent }
//   email      required, validated
//   fbp        Meta browser pixel (from _fbp cookie) — passed to the Resend event
//   ga         GA4 _ga cookie value
//   page_url   page the signup happened on
//   user_agent browser UA (server CAPI attribution)
// The `sofrito_101_downloaded` custom event triggers the Resend Automation
// that delivers the free PDF. The KV capture keeps the abandoned-cart sweep
// aware of the lead. The legacy Buttondown subscribe + welcome email still run
// on /lead/webhook; this endpoint is the new funnel's event path.
// ------------------------------------------------------------------
export async function handleLeadEvent(request, env) {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const email = String((body && body.email) || "")
    .trim()
    .toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ error: "invalid email" }, 400);
  }

  const result = { status: "ok", emailed: false, captured: false };

  // 1) Fire the Resend custom event that delivers the Sofrito 101 PDF.
  if (env.RESEND_API_KEY) {
    const payload = {
      source: "sofrito-101",
      fbp: String(body.fbp || "").slice(0, 255),
      ga: String(body.ga || "").slice(0, 255),
      page_url: String(body.page_url || "").slice(0, 500),
      user_agent: String(body.user_agent || "").slice(0, 500),
      signed_up_at: new Date().toISOString(),
    };
    try {
      const resp = await fetch(RESEND_EVENTS_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "sofrito-studio-worker/1.0",
        },
        body: JSON.stringify({ event: "sofrito_101_downloaded", email, payload }),
      });
      result.emailed = resp.ok;
      if (!resp.ok) result.event_status = resp.status;
    } catch (err) {
      result.event_error = String((err && err.message) || err).slice(0, 200);
    }
  }

  // 2) KV tracking — powers the abandoned-cart / nurture sweeps.
  try {
    await captureLead(env, { email, lang: "en", source: "sofrito-101", intent: "freebie", product: "sofrito-101" });
    result.captured = true;
  } catch (err) {
    result.capture_error = String((err && err.message) || err).slice(0, 200);
  }

  return json(result);
}

// ------------------------------------------------------------------
// POST /api/webhook — Gumroad sale -> Queue (200 immediately)
// ------------------------------------------------------------------
export async function handleGumroadWebhook(request, env) {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);

  if (!env.SOFRITO_QUEUE) {
    return json({ error: "queue not configured" }, 501);
  }

  // Read the raw body + verify the HMAC-SHA256 signature (Web Crypto API).
  const check = await validateGumroadSignature(request, env);
  if (!check.valid) {
    return json({ error: "invalid signature" }, 401);
  }

  let payload;
  try {
    payload = JSON.parse(check.rawBody);
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  // Ignore non-sale resources (ping, etc.) without burning a queue message.
  if (payload.resource && payload.resource !== "sale") {
    return json({ status: "ignored", reason: `resource=${payload.resource}` });
  }

  const sale = payload.data || payload;
  try {
    await env.SOFRITO_QUEUE.send(sale);
  } catch (err) {
    return json({ error: "queue send failed" }, 502);
  }

  // Return 200 immediately — the queue consumer does the rest async.
  return json({ status: "ok", queued: true, sale_id: sale.id || sale.sale_id || null });
}

// ------------------------------------------------------------------
// POST /api/events/checkout — server InitiateCheckout (CAPI)
// Body: { type: "initiate_checkout", sku, value, currency, email?, fbp, fbc, page_url, user_agent }
//   sku       required, the product slug
//   value     required, numeric USD price
//   email     optional — most InitiateCheckout fires have no email yet
//   fbp/fbc   Meta browser cookies (from document.cookie on the client)
//   page_url  where the checkout started
//   user_agent browser UA
// Returns 200 even when CAPI is unconfigured — the browser pixel already
// fired, so this is best-effort dedup, never a blocker.
// ------------------------------------------------------------------
export async function handleCheckoutEvent(request, env) {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const sku = String((body && body.sku) || "").trim().slice(0, 64);
  if (!sku) return json({ error: "missing sku" }, 400);

  const valueNum = Number(body && body.value);
  if (!isFinite(valueNum) || valueNum < 0) return json({ error: "invalid value" }, 400);

  const currency = String((body && body.currency) || "USD").trim().slice(0, 8) || "USD";
  const email = body && body.email ? String(body.email).trim().toLowerCase().slice(0, 254) : "";
  const fbp = String((body && body.fbp) || "").trim().slice(0, 255);
  const fbc = String((body && body.fbc) || "").trim().slice(0, 255);
  const pageUrl = String((body && body.page_url) || "").trim().slice(0, 500);
  const ua = String((body && body.user_agent) || "").trim().slice(0, 500);
  const ip = (request.headers.get("cf-connecting-ip") || "").trim().slice(0, 64);

  // Best-effort — never throw to the client. If CAPI creds are absent, the
  // browser pixel still covers the event; this endpoint is the server-side
  // mirror for iOS14+ resilience + retargeting.
  let result = { sent: false, reason: "skipped" };
  try {
    result = await sendInitiateCheckoutEvent(env, {
      email: email || undefined,
      value: valueNum,
      currency,
      productName: sku,
      contentIds: [sku],
      fbp: fbp || undefined,
      fbc: fbc || undefined,
      ip: ip || undefined,
      ua: ua || undefined,
    });
  } catch (err) {
    result = { sent: false, reason: String((err && err.message) || err).slice(0, 200) };
  }

  return json({ status: "ok", capi: result, page_url: pageUrl || undefined });
}