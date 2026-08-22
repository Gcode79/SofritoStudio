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

import { renderEmail } from "./emails.js";

const RESEND_API = "https://api.resend.com/emails";
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
  const rec = { email, lang, product_name, tier, price, purchased_at: now, d3_sent: false, d14_sent: false };
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
// Conversion sweep (cron)
// ------------------------------------------------------------------
export async function runAutomation(env) {
  const now = Date.now();
  const summary = { leads: 0, abandoned1: 0, abandoned2: 0, purchases: 0, day3: 0, day14: 0 };

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