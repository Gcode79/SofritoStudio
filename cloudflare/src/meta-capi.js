// Meta Conversions API (server-side) client.
//
// Sends Purchase / Lead events straight to Meta's CAPI endpoint so ad
// optimization + retargeting get reliable conversion signal even when the
// browser pixel is blocked or the user hasn't consented. Uses the same
// SHA-256 email hash as the browser Enhanced Match (consent.js), so server
// and browser events deduplicate correctly.
//
// Requires worker secrets/vars:
//   META_ACCESS_TOKEN   (a token with business_management + ads scopes)
//   META_PIXEL_ID       (already in wrangler.toml [vars])
// Fire-and-forget: failures never throw — CAPI must not break checkout.

const API = "https://graph.facebook.com/v21.0";

// SHA-256 hex of a lowercased email — matches browser Enhanced Match.
export async function sha256Hex(text) {
  try {
    const data = new TextEncoder().encode(String(text).trim().toLowerCase());
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "";
  }
}

// Normalize an event payload to the shape Meta expects, then POST.
// `userData` accepts: { em: "<email>", ph: "<phone>", ip, ua, fbp, fbc }
export async function sendCapiEvent(
  env,
  { eventName, eventId, email, value, currency = "USD",
    ip, ua, fbp, fbc, productName, contentIds }
) {
  const token = env.META_CAPI_ACCESS_TOKEN || env.META_ACCESS_TOKEN || "";
  const pixel = (env.META_PIXEL_ID || "").trim();
  if (!token || !pixel) return { sent: false, reason: "no-creds" };
  if (!email || !email.includes("@")) return { sent: false, reason: "no-email" };

  const em = await sha256Hex(email);
  if (!em) return { sent: false, reason: "hash-failed" };

  const userData = { em: [em] };
  if (ip) userData.client_ip_address = ip;
  if (ua) userData.client_user_agent = ua;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const event = {
    event_name: eventName,           // Purchase | Lead
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_id: eventId || `ss-${eventName}-${Date.now()}`,
    user_data: userData,
  };
  if (typeof value === "number") {
    event.custom_data = { value, currency, content_name: productName };
    if (contentIds && contentIds.length) event.custom_data.content_ids = contentIds;
  }

  const body = JSON.stringify({ data: [event], access_token: token });
  try {
    const r = await fetch(`${API}/${pixel}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const res = await r.json().catch(() => ({}));
    return { sent: res.events_received > 0, received: res.events_received, raw: res };
  } catch (e) {
    return { sent: false, reason: String(e && e.message || e) };
  }
}

// Dedicated helpers so callers read clean.
export async function sendPurchaseEvent(env, { email, value, currency, productName, contentIds }) {
  return sendCapiEvent(env, {
    eventName: "Purchase", email, value, currency, productName, contentIds,
    eventId: `ss-Purchase-${Date.now()}`,
  });
}

export async function sendLeadEvent(env, { email, contentIds }) {
  return sendCapiEvent(env, {
    eventName: "Lead", email, contentIds,
    eventId: `ss-Lead-${Date.now()}`,
  });
}