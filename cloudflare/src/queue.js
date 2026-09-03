/**
 * Sofrito Studio — Cloudflare Queue consumer for Gumroad sales
 *
 * NEW async pipeline (matches /api/webhook in events.js):
 *   Gumroad posts to /api/webhook -> signature-verified payload lands on the
 *   SOFRITO_QUEUE queue -> this consumer fans a sale out (in parallel) to:
 *
 *     1. Meta Conversions API (Purchase, SHA-256 email hash + click IDs)
 *     2. Buttondown GET-then-PATCH tag surgery — removes `lead-sofrito-101`
 *        (kills the welcome sequence) and appends the buyer-tier tag; creates
 *        a fresh buyer subscriber when the email isn't already on the list
 *     3. Google Apps Script CRM (order logs / revenue) via GOOGLE_SCRIPT_URL
 *     4. Resend Automations exit event `kitchen_bundle_purchased`
 *
 * Plus the same KV housekeeping + instant post-purchase email the legacy
 * processSale does, so switching Gumroad's webhook to /api/webhook loses
 * nothing. Per-sale KV dedup (`sale:{id}`) is shared with the cron poll and
 * the legacy webhook path — whichever processes the sale first wins.
 *
 * Queue config (wrangler.toml): max_batch_size=10, max_batch_timeout=5,
 * max_retries=3. On failure the message is retried (up to the configured cap);
 * on success it is acked.
 */

import { sendCapiEvent } from "./meta-capi.js";
import { renderEmail, tierForProduct, START_HERE, CONTENTS } from "./emails.js";
import { sendResend, recordPurchase, markPurchased } from "./automation.js";

const BUTTONDOWN_API = "https://api.buttondown.com/v1";
// Resend Automations API — "custom events" (exit conditions / triggers)
const RESEND_EVENTS_API = "https://api.resend.com/events/send";

// ------------------------------------------------------------------
// Batch handler — wired as the Worker's `queue` export in index.js
// ------------------------------------------------------------------
export async function handleQueueBatch(batch, env) {
  const summary = { total: batch.messages.length, ok: 0, retried: 0, skipped: 0, errors: [] };
  for (const message of batch.messages) {
    try {
      const res = await processQueueSale(env, message.body);
      if (res && res.skipped) summary.skipped++;
      await message.ack();
      summary.ok++;
    } catch (err) {
      summary.retried++;
      summary.errors.push(String((err && err.message) || err).slice(0, 300));
      await message.retry();
    }
  }
  if (!summary.errors.length) delete summary.errors;
  console.log("queue batch", JSON.stringify(summary));
  return summary;
}

// ------------------------------------------------------------------
// Normalize a queued message body into a Gumroad sale object.
// Accepts the raw Gumroad payload ({ resource, data, ... }) or the sale itself.
// ------------------------------------------------------------------
export function toSale(body) {
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return null; }
  }
  if (!body || typeof body !== "object") return null;
  if (body.resource && body.resource !== "sale") return null; // non-sale events: ignore
  return body.data || body;
}

// Buyer-tier tag (used for the Buttondown tag surgery + CRM).
// Mirrors the tier/product mapping so tags stay meaningful and human-readable.
function buyerTagFor(productName) {
  const n = String(productName || "").toLowerCase();
  if (/full table|masterclass|sofrito-97|dodbtn/.test(n)) return "buyer-full-table";
  if (/kitchen bundle|bundle|sofrito-67|razabs/.test(n)) return "buyer-kitchen-bundle";
  if (/la mesa|family|mesa|sofrito-47|sofrito-19|cmfkg/.test(n)) return "buyer-la-mesa";
  if (/starter|breakfast|sofrito-9/.test(n)) return "buyer-starter";
  return "buyer-starter"; // sensible default for unknown products
}

// Detect language from Gumroad's custom_fields (mirrors automation.js).
function detectLang(sale) {
  const cf = sale.custom_fields;
  if (Array.isArray(cf)) {
    for (const f of cf) {
      if (String(f?.name).toLowerCase() === "language" && String(f?.value).toLowerCase().startsWith("es")) return "es";
    }
  } else if (cf && typeof cf === "object" && String(cf.language || "").toLowerCase().startsWith("es")) {
    return "es";
  }
  return "en";
}

// Campaign origin from Gumroad checkout metadata (url_parameters).
function saleOrigin(sale) {
  const up = sale.url_parameters || (sale.purchase && sale.purchase.url_parameters) || {};
  const campaign = up.utm_campaign || up.campaign;
  if (!campaign) return "Direct / Organic";
  return String(up.utm_source || "social") + " / " + String(campaign);
}

// Meta click IDs forwarded by the frontend onto the Gumroad checkout links
// (script.js adds _fbp/_ga; Gumroad echoes them back in url_parameters).
function clickIds(sale) {
  const up = sale.url_parameters || (sale.purchase && sale.purchase.url_parameters) || {};
  return {
    fbp: up._fbp || up.fbp || "",
    fbc: up._fbc || up.fbc || up._ga || up.ga || "",
  };
}

// ------------------------------------------------------------------
// One sale through the whole pipeline — runs the downstream legs in
// parallel (Promise.all). Any thrown error -> message.retry().
// ------------------------------------------------------------------
export async function processQueueSale(env, body) {
  const sale = toSale(body);
  if (!sale) return { skipped: true };

  const saleId = sale.id || sale.sale_id || "";
  const refundedNow = !!(sale.refunded || sale.fully_refunded);
  if (saleId) {
    const seen = await env.SOFRITO_STATE.get("sale:" + saleId);
    if (seen === "ok" && refundedNow) {
      await env.SOFRITO_STATE.put("sale:" + saleId, "refunded");
      return { skipped: true, reason: "queue-refund" };
    }
    if (seen) return { skipped: true, reason: "duplicate" };
  }

  const email = sale.email || sale.buyer_email;
  if (!email || !email.includes("@")) return { skipped: true, reason: "no-email" };

  const productName = sale.product_name || "unknown";
  const price = (sale.price || 0) / 100.0;
  const lang = detectLang(sale);
  const tier = tierForProduct(productName);
  const buyerTag = buyerTagFor(productName);
  const { fbp, fbc } = clickIds(sale);
  const origin = saleOrigin(sale);

  // Parallel downstream — every leg is independent and wrapped so a single
  // provider outage doesn't abort the others. Legs that fail throw so the
  // message is retried (each leg is idempotent / KV-guarded on retry).
  const [, bd, crm, exit, emailRes, ownerRes] = await Promise.all([
    metaPurchase(env, { saleId, email, price, productName, tier, fbp, fbc }),
    buttondownTagSurgery(env, { email, buyerTag, productName, price, lang, tier }),
    crmLog(env, { sale, saleId, email, productName, price, tier, buyerTag, fbp, fbc, lang, origin }),
    resendExitEvent(env, { email, saleId, productName, price, tier, buyerTag }),
    postPurchaseEmail(env, { email, productName, price, tier, lang }),
    ownerAlert(env, { productName, price, tier, lang, origin }),
  ]);

  // KV state — same records the cron post-purchase sequences read
  const existing = await env.SOFRITO_STATE.get("purchase:" + String(email).trim().toLowerCase());
  if (existing) {
    const rec = safeParse(existing);
    if (rec) {
      rec.last_purchase_at = new Date().toISOString();
      await env.SOFRITO_STATE.put("purchase:" + String(email).trim().toLowerCase(), JSON.stringify(rec));
    }
  } else {
    await recordPurchase(env, { email, lang, product_name: productName, tier, price });
  }
  await markPurchased(env, email);
  if (saleId) await env.SOFRITO_STATE.put("sale:" + saleId, "ok");

  return { ok: true, email, product: productName, buttondown: bd, crm: crm, exit: exit, emailed: emailRes.sent, owner: ownerRes.sent };
}

function safeParse(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

// ------------------------------------------------------------------
// 1) Meta Conversions API — Purchase (SHA-256 em hash + click IDs)
// ------------------------------------------------------------------
async function metaPurchase(env, { saleId, email, price, productName, tier, fbp, fbc }) {
  const res = await sendCapiEvent(env, {
    eventName: "Purchase",
    eventId: `ss-Purchase-${saleId || Date.now()}`,
    email,
    value: price,
    currency: "USD",
    productName,
    contentIds: tier ? [tier] : undefined,
    fbp: fbp || undefined,
    fbc: fbc || undefined,
  });
  if (res.sent) return res;
  if (res.reason === "no-creds" || res.reason === "no-email" || res.reason === "hash-failed") {
    // Configuration issue — retrying won't fix it; log and move on.
    console.log("meta-capi skipped:", res.reason || "no-cred-reason");
    return res;
  }
  throw new Error("meta-capi: " + JSON.stringify(res));
}

// ------------------------------------------------------------------
// 2) Buttondown GET-then-PATCH tag surgery
//    GET subscriber by email -> remove `lead-sofrito-101`, append the buyer
//    tier tag (sends the full desired tag set: PATCH replaces). On 404 the
//    buyer is created fresh tagged as a buyer. Free-plan tag rejection (403)
//    degrades gracefully to a tag-less update, keeping the current behavior.
// ------------------------------------------------------------------
async function buttondownTagSurgery(env, { email, buyerTag, productName, price, lang, tier }) {
  if (!env.BUTTONDOWN_API_KEY) return { action: "skipped", reason: "no-key" };
  const headers = {
    Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
    "Content-Type": "application/json",
  };
  const metadata = { product: productName, tier, price, lang, flow: "post_purchase", tag: buyerTag };
  const notes = `Purchased: ${productName} @ $${price.toFixed(2)}`;

  // GET — existing subscriber (404 -> create)
  let resp = await fetch(`${BUTTONDOWN_API}/subscribers/${encodeURIComponent(email)}`, { headers });
  if (resp.status === 404) {
    resp = await fetch(`${BUTTONDOWN_API}/subscribers`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: email, tags: [buyerTag], notes, metadata }),
    });
    if (resp.ok) return { action: "created" };
    if (resp.status === 403) {
      // Free plan rejects tags — create without them
      resp = await fetch(`${BUTTONDOWN_API}/subscribers`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email_address: email, notes, metadata }),
      });
      if (resp.ok) return { action: "created", tagsSkipped: true };
    }
    throw new Error("buttondown create: " + resp.status);
  }
  if (!resp.ok) throw new Error("buttondown get: " + resp.status);

  // PATCH — replace tags with the full desired set (drop lead-, keep buyer)
  const sub = await resp.json().catch(() => ({}));
  const current = Array.isArray(sub.tags) ? sub.tags : [];
  const desired = [buyerTag];
  for (const t of current) {
    if (t === "lead-sofrito-101") continue;
    if (!desired.includes(t)) desired.push(t);
  }
  resp = await fetch(`${BUTTONDOWN_API}/subscribers/${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ email_address: email, tags: desired }),
  });
  if (resp.ok) return { action: "patched", removed: current.filter((t) => t === "lead-sofrito-101").length, tagsCount: desired.length };
  if (resp.status === 403) {
    resp = await fetch(`${BUTTONDOWN_API}/subscribers/${encodeURIComponent(email)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ email_address: email }),
    });
    if (resp.ok) return { action: "patched", tagsSkipped: true };
  }
  throw new Error("buttondown patch: " + resp.status);
}

// ------------------------------------------------------------------
// 3) Google Apps Script CRM — full payload POSTed for order logging
// ------------------------------------------------------------------
async function crmLog(env, { sale, saleId, email, productName, price, tier, buyerTag, fbp, fbc, lang, origin }) {
  if (!env.GOOGLE_SCRIPT_URL) return { action: "skipped", reason: "no-url" };
  const payload = {
    source: "gumroad-webhook-queue",
    type: "sale",
    sale_id: saleId,
    email,
    product_name: productName,
    price,
    currency: sale.currency || "USD",
    tier,
    buyer_tag: buyerTag,
    lang,
    origin,
    fbp: fbp || "",
    fbc: fbc || "",
    url_parameters: sale.url_parameters || {},
    created_at: sale.created_at || new Date().toISOString(),
    received_at: new Date().toISOString(),
  };
  const resp = await fetch(String(env.GOOGLE_SCRIPT_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "sofrito-studio-worker/1.0" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok && resp.status !== 302) throw new Error("apps-script crm: " + resp.status);
  return { action: "posted" };
}

// ------------------------------------------------------------------
// 4) Resend Automations exit event — fires `kitchen_bundle_purchased`
//    so any welcome/nurture automation tied to it stops for this buyer.
// ------------------------------------------------------------------
async function resendExitEvent(env, { email, saleId, productName, price, tier, buyerTag }) {
  if (!env.RESEND_API_KEY) return { action: "skipped", reason: "no-key" };
  const resp = await fetch(RESEND_EVENTS_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "sofrito-studio-worker/1.0",
    },
    body: JSON.stringify({
      event: "kitchen_bundle_purchased",
      email,
      payload: {
        sale_id: saleId,
        product_name: productName,
        price,
        tier,
        buyer_tag: buyerTag,
      },
    }),
  });
  if (!resp.ok) throw new Error("resend exit event: " + resp.status);
  return { action: "fired" };
}

// ------------------------------------------------------------------
// Instant post-purchase email (same copy as the legacy processSale path)
// ------------------------------------------------------------------
async function postPurchaseEmail(env, { email, productName, price, tier, lang }) {
  if (!env.RESEND_API_KEY) return { sent: false, reason: "no-key" };
  const { subject, text } = renderEmail("post_purchase", lang, {
    product_name: productName,
    tip: (START_HERE[tier] || START_HERE.product)[lang],
    contents: (CONTENTS[tier] || CONTENTS.product)[lang],
  });
  return sendResend(env, email, subject, text);
}

// ------------------------------------------------------------------
// Owner sale alert (Resend) — same email as the legacy path
// ------------------------------------------------------------------
async function ownerAlert(env, { productName, price, tier, lang, origin }) {
  if (!env.RESEND_API_KEY) return { sent: false };
  const { subject, text } = renderEmail("owner_alert", lang, { product_name: productName, price: price.toFixed(2), tier, origin });
  return sendResend(env, env.OWNER_EMAIL || "j.ortiz1148@gmail.com", subject, text);
}