// Cloudflare Function: Gumroad Webhook -> Meta CAPI
// Path: /gumroad/webhook
// Receives Gumroad ping, validates HMAC, forwards purchase event to Meta CAPI

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== "/gumroad/webhook") {
      return new Response("Not found", { status: 404 });
    }

    // Only accept POST
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Read raw body for HMAC verification
    const bodyText = await request.text();
    const payload = JSON.parse(bodyText);

    // Verify HMAC signature (Gumroad sends x-gumroad-signature header)
    const signature = request.headers.get("x-gumroad-signature");
    const secret = env.GUMROAD_WEBHOOK_SECRET || "";

    if (secret && signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );
      const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        encoder.encode(signature),
        encoder.encode(bodyText)
      );
      if (!valid) {
        return new Response("Invalid signature", { status: 401 });
      }
    }

    // Extract purchase data
    const email = payload.email || payload.purchaser_email || "";
    const productId = payload.product_id || payload.permalink || "";
    const amount = parseFloat(payload.amount || payload.price || "0");
    const currency = payload.currency || "USD";

    // Forward to Meta CAPI (server-to-server)
    const metaToken = env.META_ACCESS_TOKEN || "";
    if (metaToken && email) {
      try {
        const metaResponse = await fetch("https://graph.facebook.com/v18.0/1080764457765905/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${metaToken}`,
          },
          body: JSON.stringify({
            data: [
              {
                event_name: "Purchase",
                event_time: Math.floor(Date.now() / 1000),
                event_id: `gumroad_${productId}_${Date.now()}`,
                action_source: "website",
                user_data: {
                  em: email,
                },
                custom_data: {
                  currency: currency,
                  value: amount,
                  content_ids: [productId],
                  content_type: "product",
                },
              },
            ],
          }),
        });

        const metaResult = await metaResponse.json();
        console.log("Meta CAPI response:", metaResult);
      } catch (err) {
        console.error("Meta CAPI error:", err);
      }
    }

    // Log conversion to D1 (optional)
    if (env.DB) {
      try {
        await env.DB.prepare(
          "INSERT INTO conversions (email, product_id, amount, currency, ts) VALUES (?, ?, ?, ?, ?)"
        ).bind(email, productId, amount, currency, new Date().toISOString()).run();
      } catch (dbErr) {
        console.error("D1 log error:", dbErr);
      }
    }

    // Return success to Gumroad
    return new Response(JSON.stringify({ status: "ok", meta_sent: !!metaToken }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
