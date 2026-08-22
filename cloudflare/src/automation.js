/**
 * Sofrito Studio — conversion email automation (edge, KV-backed)
 *
 * Runs on the same Worker:
 *   - Captures leads (freebie / discount-modal / cart) into KV
 *   - Marks a lead as "purchased" when a Gumroad sale arrives (stops
 *     abandoned-cart emails)
 *   - Records purchases into KV for post-purchase sequences
 *   - Hourly cron sweep (scheduled): abandoned checkout (1h / 24h) and
 *     post-purchase Day 3 upgrade / Day 14 review emails
 *   - POST /api/webhooks/resend  — Resend delivery events (Svix signed)
 *
 * KV keys:
 *   lead:{email}     -> { email, lang, source, intent, product, created_at, a1_sent, a2_sent, purchased }
 *   purchase:{email} -> { email, lang, product_name, tier, price, purchased_at, d3_sent, d14_sent }
 */

import { renderEmail, tierForProduct, slugify, START_HERE, CONTENTS } from "./emails.js";

const RESEND_API = "https://api.resend.com/emails";
const BUTTONDOWN_API = "https://api.buttondown.com/v1";
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

// ------------------------------------------------------------------
// KV helpers
// ------------------------------------------------------------------
async function kvGet(env, key) {
  const raw = await env.SOFRITO_STATE.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function kvPut(env, key, obj) {
  await env.SOFRITO_STATE.put(key, JSON.stringify(obj));
}

function leadKey(email) { return `lead:${String(email).trim().toLowerCase()}`; }
function purchaseKey(email) { return `purchase:${String(email).trim().toLowerCase()}`; }

// ------------------------------------------------------------------
// Lead capture (Action 1 + abandoned-cart tracking)
// ------------------------------------------------------------------
export async function captureLead(env, { email, lang = "en", source = "sofrito-101", intent = "freebie", product = "starter-kit", phone = "" }) {
  const key = leadKey(email);
  const existing = await kvGet(env, key);
  const now = new Date().toISOString();
  const lead = existing || { email, lang, source, intent, product, created_at: now, a1_sent: false, a2_sent: false, purchased: false };
  if (phone) lead.phone = phone;
  if (!existing) await kvPut(env, key, lead);
  return lead;
}

export async function markPurchased(env, email) {
  const key = leadKey(email);
  const lead = await kvGet(env, key);
  if (lead) {
    lead.purchased = true;
    await kvPut(env, key, lead);
  }
  return !!lead;
}

export async function recordPurchase(env, { email, lang = "en", product_name, tier = "product", price = 0 }) {
  const key = purchaseKey(email);
  const now = new Date().toISOString();
  const existing = await kvGet(env, key);
  if (existing) return existing;
  const rec = { email, lang, product_name, tier, price, purchased_at: now, last_purchase_at: now, d3_sent: false, d14_sent: false };
  await kvPut(env, key, rec);
  return rec;
}

// ------------------------------------------------------------------
// Email send (Resend)
// ------------------------------------------------------------------
async function sendResend(env, to, subject, text) {
  if (!env.RESEND_API_KEY) return { sent: false, reason: "no-resend-key" };
  const fromAddr = env.RESEND_FROM || "hello@sofritostudio.com";
  const fromName = env.RESEND_FROM_NAME || "Sofrito Studio";
  const resp = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "sofrito-studio-worker/1.0",
    },
    body: JSON.stringify({ from: `${fromName} <${fromAddr}>`, to: [to], subject, text }),
  });
  if (resp.ok) return { sent: true };
  return { sent: false, status: resp.status };
}

export { sendResend };

// ------------------------------------------------------------------
// Gumroad sale processor — shared by the (optional) webhook accelerator
// and the authoritative Gumroad sales-API poll. Sends the instant
// post-purchase email via Resend, records the purchase for the Day 3 /
// Day 14 sequences, and stops abandoned-cart emails for that buyer.
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

export async function processSale(env, sale) {
  const saleId = sale.id || sale.sale_id || "";
  const refundedNow = !!(sale.refunded || sale.fully_refunded);
  if (saleId) {
    const seen = await env.SOFRITO_STATE.get("sale:" + saleId);
    if (seen === "ok" && refundedNow) {
      await handleRefund(env, sale);
      await env.SOFRITO_STATE.put("sale:" + saleId, "refunded");
      return { status: "refunded" };
    }
    if (seen) return { status: "duplicate" };
  }
  const email = sale.email || sale.buyer_email;
  if (!email || !email.includes("@")) return { status: "no-email" };

  const productName = sale.product_name || "unknown";
  const price = (sale.price || 0) / 100.0;
  const lang = detectLang(sale);
  const tier = tierForProduct(productName);
  const tags = [`customer:${tier}`, `product:${slugify(productName)}`, `lang:${lang}`, "customer"];
  const metadata = { product: productName, tier, price, lang, flow: "post_purchase" };

  let capture = { added: false };
  if (env.BUTTONDOWN_API_KEY) {
    capture = await addSubscriber(env, email, tags, `Purchased: ${productName} @ $${price.toFixed(2)}`, metadata);
  }

  let emailResult = { sent: false };
  if (env.RESEND_API_KEY) {
    const { subject, text } = renderEmail("post_purchase", lang, {
      product_name: productName,
      tip: (START_HERE[tier] || START_HERE.product)[lang],
      contents: (CONTENTS[tier] || CONTENTS.product)[lang],
    });
    emailResult = await sendResend(env, email, subject, text);
  }

  // Purchase record (tracks last_purchase_at for the win-back scan)
  const existing = await kvGet(env, purchaseKey(email));
  if (existing) {
    existing.last_purchase_at = new Date().toISOString();
    await kvPut(env, purchaseKey(email), existing);
  } else {
    await recordPurchase(env, { email, lang, product_name: productName, tier, price });
  }
  await markPurchased(env, email);
  if (saleId) await env.SOFRITO_STATE.put("sale:" + saleId, refundedNow ? "refunded" : "ok");

  // Owner sale alert (Resend)
  await sendOwnerAlert(env, { product_name: productName, price: price.toFixed(2), tier, lang });

  return { status: "ok", captured: capture.added, emailed: emailResult.sent };
}

// ------------------------------------------------------------------
// Authoritative post-purchase trigger: poll the Gumroad sales API on each
// cron sweep. No webhook dependency — works even if Gumroad webhooks are
// never configured. GUMROAD_ACCESS_TOKEN is a worker secret.
// ------------------------------------------------------------------
export async function sweepGumroadSales(env) {
  const token = env.GUMROAD_ACCESS_TOKEN;
  if (!token) return { processed: 0, reason: "no-token" };
  const after = (await env.SOFRITO_STATE.get("meta:last_sale_cursor")) || "";
  const before = new Date().toISOString();
  let processed = 0;
  for (let page = 1; page <= 5; page++) {
    const url = new URL("https://api.gumroad.com/v2/sales");
    url.searchParams.set("access_token", token);
    url.searchParams.set("page", String(page));
    if (after) url.searchParams.set("after", after);
    let data;
    try {
      const r = await fetch(url, { headers: { "User-Agent": "sofrito-studio-worker/1.0" } });
      data = await r.json();
    } catch {
      break;
    }
    const sales = data.sales || [];
    for (const s of sales) {
      const res = await processSale(env, s);
      if (res.status === "ok") processed++;
    }
    if (sales.length < 50) break;
  }
  await env.SOFRITO_STATE.put("meta:last_sale_cursor", before);
  return { processed, cursor: before };
}

// ------------------------------------------------------------------
// Conversion sweep (cron)
// ------------------------------------------------------------------
// Owner alerts + refunds + win-back + daily digest
// ------------------------------------------------------------------
function ownerEmail(env) {
  return env.OWNER_EMAIL || "j.ortiz1148@gmail.com";
}

async function sendOwnerAlert(env, vars, lang = "en") {
  if (!env.RESEND_API_KEY) return { sent: false };
  const { subject, text } = renderEmail("owner_alert", lang, vars);
  return sendResend(env, ownerEmail(env), subject, text);
}

async function handleRefund(env, sale) {
  const email = sale.email || sale.buyer_email;
  const productName = sale.product_name || "unknown";
  if (email && email.includes("@")) {
    // Suppress Day-3 / Day-14 / win-back for this buyer
    const rec = await kvGet(env, purchaseKey(email));
    if (rec) {
      rec.refunded = true;
      rec.d3_sent = true;
      rec.d14_sent = true;
      await kvPut(env, purchaseKey(email), rec);
    }
    // "What went wrong?" survey (Resend)
    if (env.RESEND_API_KEY) {
      const { subject, text } = renderEmail("refund_survey", "en", { product_name: productName });
      await sendResend(env, email, subject, text);
    }
  }
  // Flag to the owner
  await sendOwnerAlert(env, {
    product_name: "REFUNDED: " + productName,
    price: "refund",
    tier: "n/a",
    lang: "en",
  });
}

// Gumroad sales from the last 7 days, checked for refunds (deduped per sale id)
async function scanRefunds(env) {
  const token = env.GUMROAD_ACCESS_TOKEN;
  if (!token) return 0;
  const since = new Date(Date.now() - 7 * DAY).toISOString();
  let refunded = 0;
  for (let page = 1; page <= 3; page++) {
    const url = new URL("https://api.gumroad.com/v2/sales");
    url.searchParams.set("access_token", token);
    url.searchParams.set("after", since);
    url.searchParams.set("page", String(page));
    let data;
    try {
      const r = await fetch(url, { headers: { "User-Agent": "sofrito-studio-worker/1.0" } });
      data = await r.json();
    } catch {
      break;
    }
    const sales = data.sales || [];
    for (const s of sales) {
      const sid = s.id || s.sale_id || "";
      if (!sid) continue;
      const state = await env.SOFRITO_STATE.get("sale:" + sid);
      if (state === "ok" && (s.refunded || s.fully_refunded)) {
        await handleRefund(env, s);
        await env.SOFRITO_STATE.put("sale:" + sid, "refunded");
        refunded++;
      }
    }
    if (sales.length < 50) break;
  }
  return refunded;
}

// Lapsed-customer win-back: past buyers with no purchase in 60+ days
async function sendWinbacks(env) {
  let sent = 0;
  const list = await env.SOFRITO_STATE.list({ prefix: "purchase:" });
  for (const { name } of list.keys) {
    const rec = await kvGet(env, name);
    if (!rec || rec.refunded || rec.winback_sent) continue;
    const last = new Date(rec.last_purchase_at || rec.purchased_at).getTime();
    if (Date.now() - last < 60 * DAY) continue;
    const { subject, text } = renderEmail("winback", rec.lang, {
      product_name: rec.product_name,
      upgrade_link: "https://sofritostudio.com/buy/bundle",
    });
    const res = await sendResend(env, rec.email, subject, text);
    if (res.sent) {
      rec.winback_sent = true;
      rec.winback_at = new Date().toISOString();
      await kvPut(env, name, rec);
      sent++;
    }
  }
  return sent;
}

async function fetchDailyStats(env) {
  const stats = { revenue: 0, orders: 0, topProduct: "-", courseOrders: 0, refunds: 0, subscribers: 0, abandonedSent: 0 };
  const token = env.GUMROAD_ACCESS_TOKEN;
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  if (token) {
    const counts = {};
    for (let page = 1; page <= 3; page++) {
      const url = new URL("https://api.gumroad.com/v2/sales");
      url.searchParams.set("access_token", token);
      url.searchParams.set("after", startOfDay.toISOString());
      url.searchParams.set("page", String(page));
      let data;
      try {
        const r = await fetch(url, { headers: { "User-Agent": "sofrito-studio-worker/1.0" } });
        data = await r.json();
      } catch {
        break;
      }
      const sales = data.sales || [];
      for (const s of sales) {
        if (s.refunded || s.fully_refunded) { stats.refunds++; continue; }
        stats.orders++;
        stats.revenue += (s.price || 0) / 100;
        const name = s.product_name || "unknown";
        counts[name] = (counts[name] || 0) + 1;
        if (/mofongo|course/i.test(name)) stats.courseOrders++;
      }
      stats.topProduct = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "-";
      if (sales.length < 50) break;
    }
  }
  if (env.BUTTONDOWN_API_KEY) {
    try {
      const r = await fetch("https://api.buttondown.com/v1/subscribers", { headers: { Authorization: "Token " + env.BUTTONDOWN_API_KEY } });
      const d = await r.json();
      stats.subscribers = d.count || 0;
    } catch (err) {}
  }
  const leads = await env.SOFRITO_STATE.list({ prefix: "lead:" });
  for (const { name } of leads.keys) {
    const lead = await kvGet(env, name);
    if (lead && (lead.a1_sent || lead.a2_sent)) stats.abandonedSent++;
  }
  return stats;
}

async function sendDailyDigest(env) {
  if (!env.RESEND_API_KEY) return { sent: false, reason: "no-resend" };
  const dateKey = new Date().toISOString().slice(0, 10);
  if (await env.SOFRITO_STATE.get("meta:digest:" + dateKey)) {
    return { sent: false, reason: "already-sent" };
  }
  const stats = await fetchDailyStats(env);
  const { subject, text } = renderEmail("daily_digest", "en", {
    date: dateKey,
    revenue: stats.revenue.toFixed(2),
    orders: String(stats.orders),
    top_product: stats.topProduct,
    course_orders: String(stats.courseOrders),
    subscribers: String(stats.subscribers),
    abandoned_sent: String(stats.abandonedSent),
    refunds: String(stats.refunds),
  });
  const res = await sendResend(env, ownerEmail(env), subject, text);
  if (res.sent) await env.SOFRITO_STATE.put("meta:digest:" + dateKey, "1");
  return res;
}

// ------------------------------------------------------------------
export async function runAutomation(env, opts = {}) {
  const now = Date.now();
  const summary = { leads: 0, abandoned1: 0, abandoned2: 0, purchases: 0, day3: 0, day14: 0, salesProcessed: 0, refunds: 0, winbacks: 0, digest: "no" };

  // 0) Post-purchase source of truth: poll Gumroad for new sales (no webhook
  //    dependency). Instant receipt email + purchase records land here.
  const sweep = await sweepGumroadSales(env);
  summary.salesProcessed = sweep.processed || 0;

  // 0.5) Refund scan (last 7 days) — stops Day-3/14, sends survey + owner flag
  summary.refunds = await scanRefunds(env);

  // --- Abandoned checkout / intent leads ---
  const leadList = await env.SOFRITO_STATE.list({ prefix: "lead:" });
  for (const { name } of leadList.keys) {
    const lead = await kvGet(env, name);
    if (!lead || lead.purchased) continue;
    summary.leads++;
    const age = now - new Date(lead.created_at).getTime();
    const recovery = recoveryLink(lead);

    if (age >= HOUR && !lead.a1_sent) {
      const { subject, text } = renderEmail("abandoned_1h", lead.lang, { recovery_link: recovery });
      const res = await sendResend(env, lead.email, subject, text);
      if (res.sent) {
        lead.a1_sent = true;
        await kvPut(env, name, lead);
        summary.abandoned1++;
      }
    } else if (age >= DAY && !lead.a2_sent) {
      const { subject, text } = renderEmail("abandoned_24h", lead.lang, { recovery_link: recovery });
      const res = await sendResend(env, lead.email, subject, text);
      if (res.sent) {
        lead.a2_sent = true;
        await kvPut(env, name, lead);
        summary.abandoned2++;
      }
    }
  }

  // --- Post-purchase sequences ---
  const purchaseList = await env.SOFRITO_STATE.list({ prefix: "purchase:" });
  for (const { name } of purchaseList.keys) {
    const rec = await kvGet(env, name);
    if (!rec) continue;
    summary.purchases++;
    const age = now - new Date(rec.purchased_at).getTime();

    if (age >= 3 * DAY && !rec.d3_sent) {
      const upgrade = upgradeOffer(rec.tier, rec.lang);
      if (upgrade) {
        const vars = {
          product_name: rec.product_name,
          upgrade_name: upgrade.name,
          upgrade_credit: upgrade.credit,
          upgrade_link: upgrade.link,
          upgrade_blurb: upgrade.blurb,
        };
        const { subject, text } = renderEmail("day3_upgrade", rec.lang, vars);
        const res = await sendResend(env, rec.email, subject, text);
        if (res.sent) {
          rec.d3_sent = true;
          await kvPut(env, name, rec);
          summary.day3++;
        }
      } else {
        rec.d3_sent = true; // nothing to offer — don't re-attempt
        await kvPut(env, name, rec);
      }
    }

    if (age >= 14 * DAY && !rec.d14_sent) {
      const { subject, text } = renderEmail("day14_review", rec.lang, { product_name: rec.product_name });
      const res = await sendResend(env, rec.email, subject, text);
      if (res.sent) {
        rec.d14_sent = true;
        await kvPut(env, name, rec);
        summary.day14++;
      }
    }
  }

  // Lapsed-customer win-back (60+ days since last purchase)
  summary.winbacks = await sendWinbacks(env);

  // Owner daily digest — once per day, at 08:00 UTC (or forced for testing)
  const is8am = new Date().getUTCHours() === 8;
  if (is8am || opts.forceDigest) {
    const digest = await sendDailyDigest(env);
    summary.digest = digest.sent ? "sent" : (digest.reason || "no");
  }

  return summary;
}

function recoveryLink(lead) {
  const product = lead.product || "starter-kit";
  return `https://sofritostudio.com/buy/${encodeURIComponent(product)}`;
}

// ------------------------------------------------------------------
// Day-3 upgrade offer, per purchased tier
// ------------------------------------------------------------------
function upgradeOffer(tier, lang) {
  const es = lang === "es";
  if (tier === "tripwire") {
    return {
      name: es ? "The Kitchen Bundle" : "The Kitchen Bundle",
      credit: es ? "con tu crédito de $9 del Starter Kit ya aplicado" : "your $9 Starter Kit credit already applied",
      link: "https://sofritostudio.gumroad.com/l/razabs?coupon=UPGRADE9",
      blurb: es
        ? "El libro completo más todos los imprimibles — listas de despensa, líneas de tiempo y guías rápidas."
        : "The complete cookbook plus every printable — pantry lists, timelines, and cheat sheets.",
    };
  }
  if (tier === "core") {
    return {
      name: es ? "The Full Table" : "The Full Table",
      credit: es ? "oferta de mejora de $35" : "$35 delta upgrade offer",
      link: "https://sofritostudio.gumroad.com/l/dodbtn?coupon=UPGRADE35",
      blurb: es
        ? "El sistema completo: libro, imprimibles y el flujo de Boricua Weeknights para cenas de 30 minutos."
        : "The complete system: cookbook, printables, and the Boricua Weeknights workflow for 30-minute dinners.",
    };
  }
  return null;
}

// ------------------------------------------------------------------
// POST /api/webhooks/resend — Resend delivery events, Svix-signed
// ------------------------------------------------------------------
export async function handleResendWebhook(request, env) {
  const secret = env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return json({ error: "webhook not configured (RESEND_WEBHOOK_SECRET)" }, 501);
  }

  const raw = await request.text();
  const valid = await verifySvix(request.headers, raw, secret);
  if (!valid) {
    return json({ error: "invalid signature" }, 401);
  }

  let payload;
  try { payload = JSON.parse(raw); } catch { return json({ error: "invalid json" }, 400); }

  // Resend events: email.delivered / email.bounced / email.complained ...
  const type = payload.type || "";
  if (type === "email.bounced" || type === "email.complained") {
    const email = (payload.data && payload.data.to) || "";
    if (email) {
      await env.SOFRITO_STATE.put(`bounce:${String(email).toLowerCase()}`, String(Date.now()));
    }
  }
  return json({ status: "ok", type });
}

async function verifySvix(headers, rawBody, secret) {
  const id = headers.get("svix-id");
  const ts = headers.get("svix-timestamp");
  const sigHeader = headers.get("svix-signature");
  if (!id || !ts || !sigHeader) return false;

  const secretBytes = base64ToBytes(secret.replace(/^whsec_/, ""));
  if (!secretBytes) return false;

  const msg = new TextEncoder().encode(`${id}.${ts}.${rawBody}`);
  const cryptoImpl = globalThis.crypto;
  const key = await cryptoImpl.subtle.importKey("raw", secretBytes, { name: "Ed25519" }, false, ["verify"]);

  const sigs = sigHeader.split(" ").map((s) => s.split(",")[1] || "").filter(Boolean);
  for (const sig of sigs) {
    const sigBytes = base64ToBytes(sig);
    if (!sigBytes) continue;
    const ok = await cryptoImpl.subtle.verify("Ed25519", key, sigBytes, msg);
    if (ok) return true;
  }
  return false;
}

function base64ToBytes(b64) {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch { return null; }
}

// ------------------------------------------------------------------
// POST /api/webhooks/gumroad — sale webhook with signature validation
// (falls back to the unsigned path when the secret isn't configured)
// ------------------------------------------------------------------
export async function validateGumroadSignature(request, env) {
  const secret = env.GUMROAD_WEBHOOK_SECRET;
  const raw = await request.text();
  if (!secret) return { valid: true, rawBody: raw }; // signature not enabled — allow
  const header = request.headers.get("X-Gumroad-Signature") || "";
  const cryptoImpl = globalThis.crypto;
  const key = await cryptoImpl.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
  );
  const mac = await cryptoImpl.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { valid: hex === header.toLowerCase(), rawBody: raw };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}