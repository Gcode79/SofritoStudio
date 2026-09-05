// ============================================================
// Sofrito Studio — Pivot Worker (single entry point)
// Job: 1d + 2
// MCP: cloudflare-bindings, cloudflare-observability
// Last updated: 2026-09-04
// Purpose: /api/* edge logic + queue consumers + scheduled CRM
//          automation. Static site serves from public/ via ASSETS.
//
// Routes:
//   GET  /api/health                 -> liveness
//   GET  /api/packages               -> service tiers (KV truth)
//   POST /api/contact                -> lead capture + scoring (D1 + queues)
//   POST /api/newsletter             -> Buttondown subscribe
//   POST /api/events                 -> server-side analytics events
//   GET  /api/dashboard              -> CRM summary (admin)
//   GET  /api/leads                  -> lead list (admin, filters)
//   PATCH /api/leads/:id             -> update status/notes (admin)
//   GET  /api/revenue                -> revenue report (admin)
//   POST /api/stripe-webhook        -> revenue logging (verifies stripe-signature)
//   POST /api/gumroad-webhook       -> revenue logging (verifies X-Gumroad-Signature)
//
// Queue consumers:
//   EMAIL_QUEUE     {kind:'email', ...}  -> Resend send + emails_sent log
//   WEBHOOK_QUEUE   {topic, payload}     -> Make.com fire-and-forget
//
// Scheduled (hourly cron "0 * * * *"):
//   lead drip (day 2/5/9), 24h owner reminder, day-14 check-in,
//   day-30 testimonial ask, Monday 8am weekly digest.
// ============================================================

import { timingSafeEqual } from 'node:crypto';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS, ...headers },
  });

const fail = (msg, status = 400) => json({ ok: false, error: msg }, status);

const readJson = async (request) => {
  const raw = await request.text();
  return JSON.parse(raw);
};

const hmacSha256 = (secret, body) =>
  crypto.subtle
    .importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then((k) => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(body)))
    .then((sig) => [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join(''));

const safeEqual = (a, b) => {
  const A = new TextEncoder().encode(String(a));
  const B = new TextEncoder().encode(String(b));
  if (A.byteLength !== B.byteLength) return false;
  return timingSafeEqual(A, B);
};

const authorized = (env, request) => {
  const key = env.ADMIN_KEY;
  if (!key) return false;
  const header = request.headers.get('authorization') || '';
  return header.startsWith('Bearer ') && safeEqual(header.slice(7), key);
};

const substitute = (html, data = {}) =>
  html.replace(/{{\s*([\w.]+)\s*}}/g, (_, k) => {
    const v = k.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), data);
    return v != null ? String(v) : '';
  });

const uuid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

// ------------------------------------------------------------
// Legacy retail redirects (shelved 2026-09-05)
// The assets `_redirects` engine cannot express these safely: its globs apply
// to real files too, so `/privacy*` → /privacy.html loops, and `/blog/*` would
// swallow /blog/*.html posts. The Worker runs first, so it can redirect only
// the paths that are NOT real assets on disk.
// ------------------------------------------------------------
const LEGACY_REDIRECTS = [
  { match: (p) => p.startsWith('/privacy'), to: '/privacy.html' },
  { match: (p) => p.startsWith('/terms'), to: '/terms.html' },
  { match: (p) => p.startsWith('/blog/'), to: '/blog/index.html' },
  { match: (p) => p.startsWith('/posts/'), to: '/blog/index.html' },
];

function legacyRedirectFor(pathname) {
  for (const rule of LEGACY_REDIRECTS) {
    if (rule.match(pathname)) return rule.to;
  }
  return null;
}

// ------------------------------------------------------------
// Lead scoring (KV weights, static-first)
// ------------------------------------------------------------
const DEFAULT_WEIGHTS = {
  package_specific: 30,
  budget_set: 20,
  message_length_30: 25,
  business_name: 15,
  phone: 10,
  max: 100,
};

async function scoreLead(env, lead) {
  const raw = await env.CONFIG.get('scoring/weights');
  const w = raw ? { ...DEFAULT_WEIGHTS, ...JSON.parse(raw) } : DEFAULT_WEIGHTS;
  let score = 0;
  if (lead.package_interest) score += w.package_specific;
  if (lead.budget) score += w.budget_set;
  if ((lead.message || '').trim().length >= 30) score += w.message_length_30;
  if (lead.business_name) score += w.business_name;
  if (lead.phone) score += w.phone;
  return Math.min(score, w.max);
}

const PACKAGE_FALLBACK = {
  sofrito: { name: 'The Sofrito', description: 'Brand Identity', price_cents: 250000, billing: 'one_time' },
  plato: { name: 'The Plato', description: 'Brand + Website', price_cents: 500000, billing: 'one_time' },
  'la-mesa': { name: 'La Mesa', description: 'Full Brand Launch', price_cents: 750000, billing: 'one_time' },
  essentials: { name: 'Essentials', description: 'Content Retainer', price_cents: 150000, billing: 'monthly' },
  growth: { name: 'Growth', description: 'Content Retainer', price_cents: 250000, billing: 'monthly' },
  fractional: { name: 'Fractional', description: 'Brand Director Retainer', price_cents: 400000, billing: 'monthly' },
  session: { name: 'Sofrito Session', description: '1:1 brand session', price_cents: 40000, billing: 'one_time' },
};

// ------------------------------------------------------------
// Queue helpers
// ------------------------------------------------------------
async function enqueueEmail(env, job) {
  await env.EMAIL_QUEUE.send(job);
  if (job.template && job.lead_id) {
    await env.DB.prepare(
      `INSERT INTO emails_sent (id, created_at, to_email, template, subject, status, metadata)
       VALUES (?, ?, ?, ?, ?, 'queued', ?)`
    )
      .bind(uuid(), nowIso(), job.to, job.template, job.subject, JSON.stringify({ lead_id: job.lead_id }))
      .run();
  }
}

async function enqueueWebhook(env, topic, payload) {
  await env.WEBHOOK_QUEUE.send({ topic, payload, ts: nowIso() });
}

async function sendResend(env, { to, subject, html }) {
  const key = env.RESEND_API_KEY;
  if (!key) return { ok: false, status: 503, body: '{}' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM}>`,
      to: [to],
      subject,
      html,
    }),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

async function processEmailMessage(env, job) {
  const htmlRaw = await env.CONFIG.get(`templates/emails/${job.template}`);
  const html = substitute(htmlRaw || `<p>${job.subject}</p>`, { ...job.data, siteUrl: env.SITE_URL || '' });
  const result = await sendResend(env, { to: job.to, subject: job.subject, html });
  let providerId = null;
  if (result.ok) {
    try {
      providerId = JSON.parse(result.body).id || null;
    } catch {
      providerId = null;
    }
  }
  await env.DB.prepare(`UPDATE emails_sent SET status = ?, provider_id = ? WHERE template = ? AND metadata = ?`)
    .bind(result.ok ? 'sent' : 'failed', providerId, job.template, JSON.stringify({ lead_id: job.lead_id }))
    .run();
  if (!result.ok) throw new Error(`resend ${result.status}`);
}

async function processWebhookMessage(env, job) {
  const url = env.MAKE_WEBHOOK_URL;
  if (!url) {
    console.warn('webhook: MAKE_WEBHOOK_URL not set, dropping');
    return;
  }
  // POST the flat payload (the lead object) so Make sees name/email/score at
  // the top level — not wrapped under { topic, payload, ts }.
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job.payload),
    });
    console.log(`webhook: POST ${res.status} ${res.statusText} topic=${job.topic} id=${job.payload?.id ?? job.id}`);
    if (res.status !== 200 && res.status !== 201 && res.status !== 202) {
      const body = await res.text().catch(() => '');
      console.warn(`webhook: non-ok response: ${body.slice(0, 200)}`);
    }
  } catch (e) {
    console.error('webhook: fetch failed', e.message);
    throw e;
  }
}

// ------------------------------------------------------------
// Public routes
// ------------------------------------------------------------
async function handlePackages(env) {
  const packages = [];
  for (const [slug, fallback] of Object.entries(PACKAGE_FALLBACK)) {
    const raw = await env.CONFIG.get(`packages/${slug}`);
    packages.push({ slug, ...(raw ? { ...fallback, ...JSON.parse(raw) } : fallback) });
  }
  return json({ ok: true, packages });
}

async function handleSiteConfig(env) {
  const fallback = {
    email: 'hello@sofritostudio.com',
    socials: { instagram: 'https://instagram.com/sofritostudio' },
    session_url: null,
    booking_url: null,
  };
  const raw = await env.CONFIG.get('site/config');
  const cfg = raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  return json({ ok: true, ...cfg });
}

async function handleContact(request, env, ctx) {
  let body;
  try {
    body = await readJson(request);
  } catch {
    return fail('Please send valid JSON.', 400);
  }
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const message = String(body.message || '').trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length < 10) {
    return fail('Please include your name, a valid email, and a few words about your business.', 422);
  }

  const rlKey = `rl:contact:${email}`;
  if (await env.CONFIG.get(rlKey)) return fail('You just sent a message. Reply and I will get back to you soon.', 429);
  ctx.waitUntil(env.CONFIG.put(rlKey, nowIso(), { expirationTtl: 300 }));

  const lead = {
    id: uuid(),
    created_at: nowIso(),
    name,
    email,
    phone: String(body.phone || '').trim(),
    business_name: String(body.business_name || '').trim(),
    business_type: String(body.business_type || '').trim(),
    package_interest: String(body.package_interest || '').trim(),
    budget: String(body.budget || '').trim(),
    message,
    source: String(body.source || 'organic').trim(),
    channel: 'contact_form',
  };
  lead.score = await scoreLead(env, lead);
  const lang = (request.headers.get('accept-language') || '').toLowerCase().startsWith('es') ? 'es' : 'en';

  await env.DB.prepare(
    `INSERT INTO leads (id, created_at, name, email, phone, business_name, business_type, package_interest, budget, message, channel, score, status, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`
  )
    .bind(lead.id, lead.created_at, name, email, lead.phone, lead.business_name, lead.business_type, lead.package_interest, lead.budget, message, 'contact_form', lead.score, lead.source)
    .run();

  const baseData = { lead, lang, siteUrl: env.SITE_URL || '' };
  ctx.waitUntil(Promise.all([
    enqueueEmail(env, {
      kind: 'email',
      to: email,
      template: 'form-confirm.html',
      subject: lang === 'es' ? 'Recibimos tu mensaje — Sofrito Studio' : 'Your message is in — Sofrito Studio',
      data: baseData,
      lead_id: lead.id,
    }),
    enqueueEmail(env, {
      kind: 'email',
      to: env.NOTIFICATION_EMAIL || '',
      template: 'new-lead-notify.html',
      subject: `New lead: ${name} · score ${lead.score}`,
      data: baseData,
      lead_id: lead.id,
    }),
  ]));
  ctx.waitUntil(enqueueWebhook(env, 'lead.new', { ...lead, lang }));

  return json({ ok: true, id: lead.id, score: lead.score }, 201);
}

async function handleNewsletter(request, env, ctx) {
  let body;
  try {
    body = await readJson(request);
  } catch {
    return fail('Please send valid JSON.', 400);
  }
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Enter a valid email address.', 422);
  await env.DB.prepare(`INSERT OR IGNORE INTO newsletter_subscribers (id, created_at, email, status, source) VALUES (?, ?, ?, 'subscribed', ?)`)
    .bind(uuid(), nowIso(), email, String(body.source || 'site'))
    .run();
  ctx.waitUntil(
    (async () => {
      const key = env.BUTTONDOWN_API_KEY;
      if (!key) return;
      try {
        await fetch('https://api.buttondown.com/v1/subscribers', {
          method: 'POST',
          headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email_address: email, type: 'regular', referrer_url: body.referrer_url || '' }),
        });
      } catch (e) {
        console.error('buttondown subscribe failed', e);
      }
    })()
  );
  return json({ ok: true });
}

async function handleEvent(request, env, ctx) {
  let body;
  try {
    body = await readJson(request);
  } catch {
    return fail('Please send valid JSON.', 400);
  }
  const name = String(body.name || '').trim();
  if (!name) return fail('event name required', 422);
  ctx.waitUntil(
    env.DB.prepare(`INSERT INTO events (id, created_at, event_name, session, page_url, properties) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(uuid(), nowIso(), name, body.session || null, body.page_url || null, JSON.stringify(body.properties || {}))
      .run()
  );
  return json({ ok: true });
}

// ------------------------------------------------------------
// Admin routes (Bearer ADMIN_KEY)
// ------------------------------------------------------------
async function handleDashboard(request, env) {
  const [pipeline, leads, revenue, top] = await Promise.all([
    env.DB.prepare(`SELECT * FROM v_pipeline`).first(),
    env.DB.prepare(`SELECT id, created_at, name, email, business_name, package_interest, score, status FROM leads ORDER BY created_at DESC LIMIT 8`).all(),
    env.DB.prepare(`SELECT * FROM v_monthly_revenue LIMIT 6`).all(),
    env.DB.prepare(`SELECT page_url, views FROM v_top_content`).all(),
  ]);
  return json({ ok: true, pipeline, leads: leads.results, revenue: revenue.results, top_content: top.results });
}

async function handleLeads(request, env, url) {
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');
  const stale = url.searchParams.get('stale') === '1';
  let sql = `SELECT id, created_at, name, email, phone, business_name, business_type, package_interest, budget, score, status, source FROM leads`;
  const where = [];
  const binds = [];
  if (stale) {
    where.push(`status = 'new' AND created_at < ?`);
    binds.push(new Date(Date.now() - 24 * 3600 * 1000).toISOString());
  }
  if (status) {
    where.push(`status = ?`);
    binds.push(status);
  }
  if (search) {
    where.push(`(name LIKE ? OR email LIKE ? OR business_name LIKE ?)`);
    const like = `%${search}%`;
    binds.push(like, like, like);
  }
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY created_at DESC LIMIT 100`;
  const res = await env.DB.prepare(sql).bind(...binds).all();
  return json({ ok: true, leads: res.results });
}

async function handleLeadUpdate(request, env, url) {
  const id = url.pathname.split('/').pop();
  let body;
  try {
    body = await readJson(request);
  } catch {
    return fail('Please send valid JSON.', 400);
  }
  const fields = [];
  const binds = [];
  if (body.status) {
    fields.push('status = ?');
    binds.push(body.status);
  }
  if (body.notes !== undefined) {
    fields.push('notes = ?');
    binds.push(body.notes);
  }
  if (!fields.length) return fail('nothing to update', 400);
  fields.push('updated_at = ?');
  binds.push(nowIso());
  binds.push(id);
  await env.DB.prepare(`UPDATE leads SET ${fields.join(', ')} WHERE id = ?`).bind(...binds).run();

  // Closing a deal seeds the pipeline: auto-create the project.
  if (body.status === 'won' || body.status === 'complete') {
    const lead = await env.DB.prepare(`SELECT * FROM leads WHERE id = ?`).bind(id).first();
    if (lead) {
      const pkg = lead.package_interest
        ? await env.CONFIG.get(`packages/${lead.package_interest}`).then((r) => (r ? JSON.parse(r) : null))
        : null;
      await env.DB.prepare(
        `INSERT INTO projects (id, created_at, lead_id, name, package_name, price_cents, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`
      )
        .bind(uuid(), nowIso(), id, lead.business_name || lead.name, lead.package_interest, pkg ? pkg.price_cents : 0)
        .run();
    }
  }
  return json({ ok: true });
}

async function handleRevenue(env) {
  const [rows, byPackage] = await Promise.all([
    env.DB.prepare(`SELECT * FROM v_monthly_revenue LIMIT 12`).all(),
    env.DB.prepare(
      `SELECT COALESCE(NULLIF(description,''), 'no description') AS label, SUM(amount_cents)/100 AS dollars, COUNT(*) AS n
       FROM revenue WHERE paid = 1 GROUP BY description ORDER BY dollars DESC LIMIT 10`
    ).all(),
  ]);
  return json({ ok: true, monthly: rows.results, by_label: byPackage.results });
}

// ------------------------------------------------------------
// Webhooks (idempotent revenue logging)
// ------------------------------------------------------------
async function insertRevenue(env, ctx, row) {
  try {
    await env.DB.prepare(
      `INSERT INTO revenue (id, created_at, occurred_at, source, source_id, project_id, amount_cents, currency, description, metadata, paid)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(uuid(), nowIso(), row.occurred_at, row.source, row.source_id, row.project_id || null, row.amount_cents, row.currency || 'usd', row.description || null, row.metadata ? JSON.stringify(row.metadata) : null, row.paid === false ? 0 : 1)
      .run();
    ctx.waitUntil(
      enqueueEmail(env, {
        kind: 'email',
        to: env.NOTIFICATION_EMAIL || '',
        template: 'revenue-notify.html',
        subject: `Payment logged: $${(row.amount_cents / 100).toFixed(2)}`,
        data: { amount: (row.amount_cents / 100).toFixed(2), source: row.source, description: row.description || '', lead_id: row.project_id || '' },
        lead_id: 'revenue',
      })
    );
    return true;
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return false;
    throw e;
  }
}

async function handleStripeWebhook(request, env, ctx) {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  const raw = await request.text();
  const header = request.headers.get('stripe-signature');
  if (!secret || !header) return fail('missing signature', 400);
  const [t, ...rest] = header.split(',');
  const ts = t.replace('t=', '');
  const v1 = rest.find((p) => p.startsWith('v1=')).replace('v1=', '');
  const signed = `${ts}.${raw}`;
  const expected = await hmacSha256(secret, signed);
  if (!safeEqual(expected, v1)) return fail('invalid signature', 401);

  const event = JSON.parse(raw);
  let amountCents = 0;
  let description = event.type;
  if (event.type.startsWith('checkout.session.completed')) {
    amountCents = event.data.object.amount_total || 0;
    description = 'stripe checkout';
  } else if (event.type === 'invoice.paid') {
    amountCents = event.data.object.amount_paid || 0;
    description = event.data.object.description || 'invoice';
  } else if (event.type === 'charge.refunded') {
    amountCents = -(event.data.object.amount_refunded || 0);
    description = 'refund';
  }
  if (!amountCents) return json({ ok: true, handled: false });

  const inserted = await insertRevenue(env, ctx, {
    occurred_at: new Date(event.created * 1000).toISOString(),
    source: 'stripe',
    source_id: event.id,
    amount_cents: amountCents,
    currency: event.data.object.currency,
    description,
    metadata: { event_type: event.type },
    paid: amountCents >= 0,
  });
  return json({ ok: true, handled: inserted });
}

async function handleGumroadWebhook(request, env, ctx) {
  const secret = env.GUMROAD_WEBHOOK_SECRET;
  const raw = await request.text();
  const sig = request.headers.get('x-gumroad-signature');
  if (!sig) return fail('missing signature', 400);
  if (secret) {
    const expected = await hmacSha256(secret, raw);
    if (!safeEqual(expected, sig)) return fail('invalid signature', 401);
  }
  const event = JSON.parse(raw);
  const sale = event.sale || {};
  const isRefund = event.type === 'sale.refunded' || sale.refunded;
  const amountCents = Math.round((sale.price || 0) * 100) * (isRefund ? -1 : 1);
  const inserted = await insertRevenue(env, ctx, {
    occurred_at: new Date().toISOString(),
    source: 'gumroad',
    source_id: String(sale.id || event.charge_id || `unq-${event.type}`),
    amount_cents: amountCents,
    currency: 'usd',
    description: sale.product_name || 'gumroad sale',
    metadata: { event_type: event.type, email: sale.email || null },
    paid: !isRefund,
  });
  return json({ ok: true, handled: inserted });
}

// ------------------------------------------------------------
// Scheduled CRM automation (hourly cron)
// ------------------------------------------------------------
const DRIP_PLAN = [
  { day: 2, template: 'welcome-1.html', subject: "Día 2 / Day 2 — Your food has a story" },
  { day: 5, template: 'welcome-2.html', subject: "Día 5 / Day 5 — Where most food brands go wrong" },
  { day: 9, template: 'welcome-3.html', subject: "Día 9 / Day 9 — Let's put it on the table" },
];

const daySince = (iso) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

async function sentAlready(env, template, leadId) {
  const row = await env.DB.prepare(
    `SELECT 1 FROM emails_sent WHERE template = ? AND json_extract(metadata, '$.lead_id') = ? AND status = 'sent' LIMIT 1`
  )
    .bind(template, leadId)
    .first();
  return !!row;
}

async function runLeadAutomations(env) {
  const warm = await env.DB.prepare(
    `SELECT id, created_at, name, email, business_name, updated_at, status FROM leads
     WHERE status IN ('new','contacted','qualified','won') ORDER BY created_at ASC LIMIT 200`
  ).all();
  const nowIsoStr = nowIso();

  for (const lead of warm.results) {
    const day = daySince(lead.created_at);

    // Drip: day 2 / 5 / 9
    for (const step of DRIP_PLAN) {
      if (day >= step.day && !(await sentAlready(env, step.template, lead.id))) {
        await enqueueEmail(env, {
          kind: 'email',
          to: lead.email,
          template: step.template,
          subject: step.subject,
          data: { lead, siteUrl: env.SITE_URL || '' },
          lead_id: lead.id,
        });
      }
    }

    // 24h owner reminder (S5) — still 'new' and untouched
    if (lead.status === 'new' && day >= 1 && !(await sentAlready(env, 'follow-up-lead-reminder.html', lead.id))) {
      await enqueueEmail(env, {
        kind: 'email',
        to: env.NOTIFICATION_EMAIL || '',
        template: 'follow-up-lead-reminder.html',
        subject: `24h follow-up needed: ${lead.name}`,
        data: { lead, siteUrl: env.SITE_URL || '' },
        lead_id: lead.id,
      });
      await enqueueWebhook(env, 'lead.reminder', lead);
    }

    // Post-delivery check-in (day 1, status won, from updated_at) and day-30 ask
    if (lead.status === 'won') {
      const sinceClose = daySince(lead.updated_at);
      if (sinceClose === 1 && !(await sentAlready(env, 'follow-up-day1.html', lead.id))) {
        await enqueueEmail(env, {
          kind: 'email',
          to: lead.email,
          template: 'follow-up-day1.html',
          subject: "How's it pouring? / ¿Cómo va servido?",
          data: { lead, siteUrl: env.SITE_URL || '' },
          lead_id: lead.id,
        });
      }
      if (sinceClose === 30 && !(await sentAlready(env, 'follow-up-day30.html', lead.id))) {
        await enqueueEmail(env, {
          kind: 'email',
          to: lead.email,
          template: 'follow-up-day30.html',
          subject: "You at the table / Tú en la mesa",
          data: { lead, siteUrl: env.SITE_URL || '' },
          lead_id: lead.id,
        });
      }
    }
  }
  void nowIsoStr;
}

async function weeklyDigest(env) {
  const pipe = await env.DB.prepare(`SELECT * FROM v_pipeline`).first();
  const top = await env.DB.prepare(`SELECT page_url, views FROM v_top_content`).all();
  const newLeads = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM leads WHERE created_at >= datetime('now','-7 days')`
  ).first();
  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#0F172A;max-width:600px;margin:0 auto">',
    '<h1 style="font-size:20px">Sofrito Studio — this week</h1>',
    `<p><strong>New leads (7d):</strong> ${newLeads.n}</p>`,
    `<p><strong>Open leads:</strong> ${pipe.open_leads}</p>`,
    `<p><strong>Active projects:</strong> ${pipe.active_projects}</p>`,
    `<p><strong>Revenue MTD:</strong> $${pipe.revenue_mtd_dollars}.00</p>`,
    `<p><strong>Revenue (30d):</strong> $${pipe.revenue_30d_dollars}.00</p>`,
    '<h2 style="font-size:16px">Top pages (7d)</h2><ul>',
    ...top.results.map((t) => `<li>${t.page_url || '(home)'} — ${t.views}</li>`),
    '</ul>',
    '<p><a href="https://dash.cloudflare.com" style="color:#EA580C">Open Cloudflare</a> to dig in.</p>',
    '</div>',
  ].join('');
  const res = await sendResend(env, {
    to: env.NOTIFICATION_EMAIL || '',
    subject: 'Sofrito Studio weekly digest',
    html,
  });
  console.log('digest', res.status);
}

// ------------------------------------------------------------
// Export
// ------------------------------------------------------------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (url.pathname.startsWith('/api/')) {
      try {
        const p = url.pathname;
        if (p === '/api/health') return json({ ok: true, ts: nowIso() });

        if (p === '/api/packages' && request.method === 'GET') return handlePackages(env);
        if (p === '/api/config' && request.method === 'GET') return handleSiteConfig(env);
        if (p === '/api/contact' && request.method === 'POST') return handleContact(request, env, ctx);
        if (p === '/api/newsletter' && request.method === 'POST') return handleNewsletter(request, env, ctx);
        if ((p === '/api/events' || p === '/api/analytics') && request.method === 'POST')
          return handleEvent(request, env, ctx);

        const adm = () => {
          if (!authorized(env, request)) return json({ ok: false, error: 'unauthorized' }, 401);
        };
        if (p === '/api/dashboard' && request.method === 'GET') {
          const g = adm();
          if (g) return g;
          return handleDashboard(request, env);
        }
        if (p === '/api/leads' && request.method === 'GET') {
          const g = adm();
          if (g) return g;
          return handleLeads(request, env, url);
        }
        if (p.startsWith('/api/leads/') && request.method === 'PATCH') {
          const g = adm();
          if (g) return g;
          return handleLeadUpdate(request, env, url);
        }
        if (p === '/api/revenue' && request.method === 'GET') {
          const g = adm();
          if (g) return g;
          return handleRevenue(env);
        }

        if (p === '/api/stripe-webhook' && request.method === 'POST')
          return handleStripeWebhook(request, env, ctx);
        if (p === '/api/gumroad-webhook' && request.method === 'POST')
          return handleGumroadWebhook(request, env, ctx);

        return fail('not_found', 404);
      } catch (e) {
        return fail(`server_error: ${e.message}`, 500);
      }
    }

    // html_handling = "none" means the platform serves exact files only, so map
    // the extensionless root and bare directory names to their .html files here
    // (mirrors every canonical tag + sitemap entry).
    const assetUrl = new URL(request.url);
    if ((request.method === 'GET' || request.method === 'HEAD') && assetUrl.pathname === '/') {
      const req = new Request(assetUrl.origin + '/index.html', request);
      return env.ASSETS.fetch(req);
    }

    // Legacy retail redirects that the _redirects engine can't express (its globs
    // hit real files). Probe ASSETS first: if the path is an actual file, serve
    // it; only redirect the paths that genuinely 404.
    if (request.method === 'GET' || request.method === 'HEAD') {
      const to = legacyRedirectFor(assetUrl.pathname);
      if (to) {
        const probe = await env.ASSETS.fetch(request);
        if (probe.status === 404) {
          return Response.redirect(new URL(to, request.url).toString(), 301);
        }
        return probe;
      }
    }

    return env.ASSETS.fetch(request);
  },

  async queue(batch, env) {
    for (const msg of batch.messages) {
      const job = msg.body;
      try {
        if (job.kind === 'email') await processEmailMessage(env, job);
        else await processWebhookMessage(env, job);
      } catch (e) {
        console.error('queue message failed', e.message);
        msg.retry();
      }
    }
  },

  async scheduled(controller, env, ctx) {
    const now = new Date();
    const utcDay = now.getUTCDay();
    const utcHour = now.getUTCHours();
    try {
      await runLeadAutomations(env);
    } catch (e) {
      console.error('lead automation failed', e.message);
    }
    if (utcDay === 1 && utcHour === 13) {
      try {
        await weeklyDigest(env);
      } catch (e) {
        console.error('digest failed', e.message);
      }
    }
  },
};