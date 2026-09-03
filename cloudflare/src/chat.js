/**
 * Sofrito Studio — POST /api/chat (conversation-suggestion assistant)
 *
 * Serves the chat widget's conversation suggestions. Two paths:
 *   1. LLM mode   — GROQ_API_KEY present: proxies to Groq's chat.completions
 *                   (override model/base via GROQ_MODEL / GROQ_BASE_URL vars;
 *                   GROQ_BASE_URL can point at the AI Gateway).
 *   2. Offline    — no key (or an LLM error): answers from the built-in
 *                   knowledge base seeded from the Grok "Sofrito Studio Profit
 *                   Potential" eval (trends, visibility plays, products) so the
 *                   widget works on day one before any key is configured.
 *
 * Both modes return { reply, suggestions, llm } where `suggestions` are the
 * follow-up conversation-suggestion chips rendered under the reply.
 *
 * Rate limit: per-IP daily + hourly buckets in KV (SOFRITO_STATE).
 * Secrets: GROQ_API_KEY (npx wrangler secret put GROQ_API_KEY)
 * Vars:    GROQ_MODEL, GROQ_BASE_URL
 */

const GROQ_DEFAULT_MODEL = "openai/gpt-oss-120b";
const GROQ_DEFAULT_BASE = "https://api.groq.com/openai/v1";
const CHAT_ENDPOINT = "/chat/completions";

// ------------------------------------------------------------------
// CORS / helpers (mirrors events.js)
// ------------------------------------------------------------------
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign({ "Content-Type": "application/json", "Cache-Control": "no-store" }, corsHeaders()),
  });
}

function preflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// ------------------------------------------------------------------
// Conversation knowledge — distilled from the Grok eval + trend reads
// ------------------------------------------------------------------
const KNOWLEDGE = {
  products:
    "Sofrito Studio (sofritostudio.com) sells bilingual Puerto Rican cooking resources from the Ortiz kitchen: " +
    "Starter Kit ($9, 5 core recipes: sofrito/recaito base, arroz con pollo, pernil, tostones, flan); " +
    "La Mesa Boricua ($47, 30 bilingual recipes + swaps + Nochebuena builder); " +
    "Kitchen Bundle ($67, above + printable cards, planners, shopping lists); " +
    "Full Table ($97, above + a 50 'no-recipe' 30-minute weeknight system); " +
    "plus $12-20 seasonal add-ons (Thanksgiving Boricua, Navidad, Coquito Guide, Boricua Breakfasts) and a " +
    "free 'Sofrito 101' lead magnet (master base recipe + mainland swaps + batch plan). " +
    "Positioning: Abuela's cooking from the Ortiz kitchen, bilingual EN/ES, tested for mainland US kitchens " +
    "with ingredient swaps (recao/culantro, ají dulce), instant download, lifetime access, 30-day guarantee. " +
    "Buy links: /buy/starter, /buy/mesa, /buy/bundle, /buy/full-table, /buy/coquito, /buy/breakfasts.",
  eval:
    "A Grok market eval rated the niche strong: real cultural demand (~5.6-6.1M mainland Puerto Ricans), " +
    "near-100% margins on digital products, tiered upsell path and seasonal hooks are textbook info-product design. " +
    "Realistic near-term: low five figures in revenue for a focused solo operator; success depends on distribution " +
    "(ads, SEO, email list-building, community) more than product quality. Mainland-swap differentiation is the advantage.",
  trends:
    "2026 trends in the niche (from the Grok read): " +
    "(1) coquito + Puerto Rican rum is the hottest search cluster (a ~504% spike) and is now year-round, not just Christmas; " +
    "(2) classic comfort dishes — mofongo, arroz con gandules/pollo, pernil, alcapurrias — do well when shown with mainland practicality; " +
    "(3) beans/legumes (habichuelas, gandules) framed as cultural + healthy; " +
    "(4) cultural-pride/identity content riding the Bad Bunny wave — 'keeping the tradition alive off-island'; " +
    "(5) holiday prep starts early (freeze sofrito cubes in August; pernil timelines). " +
    "Formats that work: TikTok/Reels/Shorts process videos with Spanglish captions, long-tail search intent " +
    "('Puerto Rican [dish] recipe easy', 'mainland substitutes for X'), diaspora Facebook groups + Reddit, and the email list.",
};

const SYSTEM_PROMPT = `You are Sofrito Studio's assistant on sofritostudio.com — a warm, concise bilingual (EN/ES) helper for diaspora cooks and anyone interested in Puerto Rican food.

CONVERSATION KNOWLEDGE (facts to answer from):
Products: ${KNOWLEDGE.products}
Market eval: ${KNOWLEDGE.eval}
Trending now: ${KNOWLEDGE.trends}

Rules:
- Reply in the same language the visitor writes in (English, Spanish, or Spanglish echo).
- Keep replies tight: 60-180 words, plain text with short bullet lists when useful. No markdown headings, no emoji.
- Answer from the knowledge above whenever possible. If a reply mentions a product, point to its /buy/<slug> link (from the Products list) — never invent URLs.
- Be a helpful guide, not a salesperson: answer the question first, then offer one relevant next step only if natural.
- For visibility/marketing questions, draw on the Trend + Eval knowledge (coquito year-round, mainland-swap content, early holiday prep, email-list-first advice).
- Return your answer as a single JSON object: {"reply": "...", "suggestions": ["...", ...]}. The "suggestions" field = 2-3 short, tappable follow-up questions (chips) in the SAME language as your reply, each under 60 chars.`;

// ------------------------------------------------------------------
// Safe strings
// ------------------------------------------------------------------
function clean(s, max) {
  const t = String(s || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  return t.slice(0, max || 1000);
}

function looksSpanish(s) {
  return /[¿¡]|(á|é|í|ó|ú|ñ)/i.test(String(s || "")) && !/[^(á|é|í|ó|ú|ñ)]{20}/.test("");
}

// ------------------------------------------------------------------
// Offline knowledge-base answers (no API key / LLM error)
// ------------------------------------------------------------------
const CANNED = [
  {
    keys: ["trend", "trending", "popular", "hot", "viral", "tendencia", "moda"],
    en: "Right now the niche is riding a coquito wave — searches spiked ~504% and coquito is the only trend that went from holiday to year-round. Beyond that: mofongo/arroz con pollo/pernil content with mainland swaps, beans & gandules framed as healthy tradition, and cultural-pride stories (Bad Bunny's residual effect). My evergreen advice stays the same: lead with your mainland ingredients + swaps angle in every piece of content.",
    es: "Ahora mismo el nicho está montado en la ola del coquito — las búsquedas subieron ~504% y es la única tendencia que pasó de navideña a de todo el año. Además: contenido de mofongo/arroz con pollo/pernil con swaps del mainland, habichuelas y gandules como tradición saludable, e historias de orgullo cultural (el efecto residual de Bad Bunny). Mi consejo: en cada contenido lidera con tu ángulo de ingredientes y swaps del mainland.",
    sug: [
      "What are mainland swaps?",
      "Coquito ideas for year-round",
      "Which bundle should I start with?",
    ],
    sugEs: [
      "¿Qué son los swaps del mainland?",
      "Ideas de coquito todo el año",
      "¿Qué bundle me conviene empezar?",
    ],
  },
  {
    keys: ["swap", "replacement", "substitut", "ingredient", "recao", "culantro", "ají", "aji", "mainland", "sustitu", "reemplaz"],
    en: "Mainland swaps are the heart of Sofrito Studio: every recipe tested with what you can actually find at your local store. Examples — recao (culantro) is sold as 'sawtooth coriander' at Asian/Indian markets or frozen at Latin grocers; ají dulce can be swapped with a mild mix of cubanelle + a pinch of habanero; frozen sofrito paste is a fine shortcut for the herb base. The free Sofrito 101 guide and every paid option include these swap tables.",
    es: "Los swaps del mainland son el corazón de Sofrito Studio: cada receta está probada con lo que de verdad encuentras en tu supermercado. Ejemplos — el recao (culantro) se vende como 'sawtooth coriander' en mercados asiáticos o congelado en tiendas latinas; el ají dulce se sustituye con una mezcla suave de cubanelle y una pizca de habanero; el sofrito congelado en pasta es un buen atajo. La guía gratis Sofrito 101 y cada opción de pago incluyen estas tablas de swaps.",
    sug: ["Where can I find recao?", "Best bundles for beginners", "email ideas that get clicks"],
    sugEs: ["¿Dónde consigo recao?", "Mejores bundles para principiantes", "ideas de email que generan ventas"],
  },
  {
    keys: ["market", "marketing", "visibility", "promote", "promocion", "grow", "crecer", "distribute", "market"],
    en: "Treat marketing as the main job. The highest-leverage plays right now: short-form TikTok/Reels process videos (sofrito batch, tostones flip, mofongo smash) with Spanglish captions; long-tail SEO for 'Puerto Rican [dish] recipe easy' and 'mainland substitutes for [ingredient]'; diaspora Facebook groups + Reddit communities; and build the email list off the free Sofrito 101 — that list is what compound sales come from. Coquito content is the single biggest current hook.",
    es: "Trata el marketing como tu trabajo principal. Las jugadas de mayor palanca ahora: videos cortos de proceso en TikTok/Reels (batch de sofrito, voltear tostones, machacar mofongo) con subtítulos bilingües; SEO de cola larga para 'receta fácil de [plato] puertorriqueño' y 'sustitutos en el mainland para [ingrediente]'; grupos de Facebook + Reddit de la diáspora; y construye tu lista de email con la guía gratis Sofrito 101 — esa lista es la que multiplica las ventas. El coquito es el gancho más grande hoy.",
    sug: ["Coquito content ideas", "Sofrito 101 email sequence", "What is Full Table?"],
    sugEs: ["Ideas de contenido de coquito", "Secuencia de emails de Sofrito 101", "¿Qué es Full Table?"],
  },
  {
    keys: ["coquito", "cocktail", "drink", "rum", "ron", "navidad", "holiday", "fiesta"],
    en: "Coquito is the gift that keeps giving: the biggest current search spike (~504%), and it's now a year-round drink. Pairs great with savory food (not just desserts). Lean in with 'coquito year-round', variation recipes, and holiday early-planning content — people start thinking about Nochebuena and pernil timelines as early as August. The Coquito Guide is the perfect home for that content.",
    es: "El coquito es el regalo que no para: es el mayor pico de búsquedas ahora (~504%) y ya no es solo navideño. Marida con comida salada, no solo postres. Aprovecha con 'coquito todo el año', variaciones, y contenido de planificación temprana de las fiestas — la gente empieza a pensar en Nochebuena y los tiempos del pernil desde agosto. La Guía de Coquito es el lugar perfecto para ese contenido.",
    sug: ["Coquito variations + pairings", "Nochebuena menu planner", "Visitor first-timer guide"],
    sugEs: ["Variaciones de coquito + maridajes", "Planificador de menú de Nochebuena", "Guía para primerizos"],
  },
  {
    keys: ["starter", "beginner", "empez", "recommend", "bundle", "bundle", "choose", "cual", "which", "elijo"],
    en: "Start with the Starter Kit ($9) — 5 core recipes including the sofrito base that unlocks everything else. If you cook for family regularly, La Mesa Boricua ($47) with 30 bilingual recipes is the sweet spot; the Kitchen Bundle ($67) adds printable cards, planners and shopping lists; Full Table ($97) adds the 50-recipe 30-minute weeknight system. There's a 30-day guarantee on everything, so risk is low.",
    es: "Empieza con el Starter Kit ($9) — 5 recetas base, incluido el sofrito que desbloquea todo lo demás. Si cocinas para la familia seguido, La Mesa Boricua ($47) con 30 recetas bilingües es el punto dulce; el Kitchen Bundle ($67) añade tarjetas imprimibles, planners y listas de compras; Full Table ($97) añade el sistema de cenas de 30 minutos con 50 recetas. Todo tiene garantía de 30 días, así que el riesgo es bajo.",
    sug: ["What's the Kitchen Bundle?", "Free Sofrito 101 guide", "Do you ship a physical book?"],
    sugEs: ["¿Qué incluye el Kitchen Bundle?", "Guía gratis Sofrito 101", "¿Envían libro físico?"],
  },
  {
    keys: ["holiday", "nochebuena", "thanksgiving", "christmas", "pasteles", "pernil", "navidad", "seasonal", "temporada"],
    en: "Holiday planning starts way earlier than people expect — visitors begin thinking about pasteles, pernil timing and Nochebuena menus by August. Play the season with early-bird content ('start freezing sofrito cubes now', 'pernil timeline for the big day'), and promote the Thanksgiving Boricua and Navidad add-ons as the season opens. Early email wins the season.",
    es: "La planificación de las fiestas empieza mucho antes de lo que la gente cree — los visitantes piensan en pasteles, el tiempo del pernil y el menú de Nochebuena desde agosto. Juega la temporada con contenido temprano ('empieza a congelar cubos de sofrito ya', 'cronograma del pernil para el gran día') y promociona los add-ons de Thanksgiving Boricua y Navidad al abrir la temporada. El email temprano gana la temporada.",
    sug: ["Nochebuena menu planner", "Pernil timeline for the big day", "Coquito year-round ideas"],
    sugEs: ["Planificador de menú de Nochebuena", "Cronograma del pernil para el gran día", "Ideas de coquito todo el año"],
  },
];

const CANNED_DEFAULT = {
  en: "Great question! Here's the short version: Sofrito Studio is a bilingual (EN/ES) Puerto Rican recipe library built for mainland kitchens — every recipe tested with real ingredient swaps, from the Starter Kit ($9) up to Full Table ($97), plus seasonal guides. Want me to walk you through a specific dish, the trends, or which bundle fits you?",
  es: "¡Buena pregunta! La versión corta: Sofrito Studio es una biblioteca bilingüe (EN/ES) de recetas puertorriqueñas para cocinas del mainland — cada receta probada con swaps reales de ingredientes, desde el Starter Kit ($9) hasta Full Table ($97), más guías de temporada. ¿Quieres que te hable de un plato específico, las tendencias o qué bundle te conviene?",
  sug: [
    "What's the difference between the bundles?",
    "Coquito ideas for year-round",
    "What are mainland swaps?",
  ],
  sugEs: [
    "¿Qué diferencia hay entre los bundles?",
    "Ideas de coquito todo el año",
    "¿Qué son los swaps del mainland?",
  ],
};

function cannedAnswer(message) {
  const q = message.toLowerCase();
  const es = looksSpanish(message);
  let best = CANNED_DEFAULT;
  for (const rule of CANNED) {
    if (rule.keys.some((k) => q.includes(k))) {
      best = rule;
      break;
    }
  }
  return {
    reply: es ? best.es : best.en,
    suggestions: es ? best.sugEs : best.sug,
    llm: false,
  };
}

// ------------------------------------------------------------------
// LLM path — Groq chat.completions (JSON mode)
// ------------------------------------------------------------------
async function llmAnswer(env, message, history) {
  const base = (env.GROQ_BASE_URL || GROQ_DEFAULT_BASE).replace(/\/+$/, "");
  const model = env.GROQ_MODEL || GROQ_DEFAULT_MODEL;

  const messages = [{ role: "system", content: SYSTEM_PROMPT }];
  const hist = (Array.isArray(history) ? history : []).slice(-8);
  for (const m of hist) {
    if (m && (m.role === "user" || m.role === "assistant")) {
      messages.push({ role: m.role, content: clean(m.content, 2000) });
    }
  }
  // JSON mode requires the word "json" in the request — appended to the role.
  const finalMessage = clean(message, 1000) + "\n\nReturn JSON only: {\"reply\": string, \"suggestions\": string[]}.";

  const resp = await fetch(base + CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      max_tokens: 600,
      messages: [...messages, { role: "user", content: finalMessage }],
      response_format: { type: "json_object" },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text().catch(() => "");
    const e = new Error("groq " + resp.status);
    e.groqBody = String(err).slice(0, 300);
    throw e;
  }

  const data = await resp.json();
  const text = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  const parsed = parseJsonFrom(text);
  const es = looksSpanish(parsed.reply || "");
  const defaultCanned = CANNED_DEFAULT;
  return {
    reply: clean(parsed.reply || cannedAnswer(message).reply, 1800),
    suggestions: (Array.isArray(parsed.suggestions) ? parsed.suggestions : [])
      .map((s) => clean(s, 60))
      .filter(Boolean)
      .slice(0, 3),
    llm: true,
  };
}

function parseJsonFrom(text) {
  const t = String(text || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : t;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
  }
  return { reply: candidate, suggestions: [] };
}

// ------------------------------------------------------------------
// Rate limiting — per-IP daily (60) + hourly (15) buckets in KV
// ------------------------------------------------------------------
async function rateLimited(env, ip) {
  if (!env.SOFRITO_STATE) return false;
  const now = new Date();
  const dd = now.toISOString().slice(0, 10);
  const hh = now.toISOString().slice(0, 13);

  const dailyKey = `chat:rl:v1:${dd}:${ip}`;
  const daily = parseInt((await env.SOFRITO_STATE.get(dailyKey)) || "0", 10);
  if (daily >= 60) return true;
  await env.SOFRITO_STATE.put(dailyKey, String(daily + 1), { expirationTtl: 86400 * 2 });

  const hourlyKey = `chat:rlh:v1:${hh}:${ip}`;
  const hourly = parseInt((await env.SOFRITO_STATE.get(hourlyKey)) || "0", 10);
  if (hourly >= 15) return true;
  await env.SOFRITO_STATE.put(hourlyKey, String(hourly + 1), { expirationTtl: 2 * 3600 });
  return false;
}

// ------------------------------------------------------------------
// POST /api/chat
// Body: { message, history? }
//   message   required, 1..1000 chars
//   history   optional [{role, content}], last 8 used
// ------------------------------------------------------------------
export async function handleChat(request, env) {
  if (request.method === "OPTIONS") return preflight();
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const message = clean(body && body.message, 1000);
  if (!message) return json({ error: "empty message" }, 400);

  const ip = request.headers.get("cf-connecting-ip") || "anon";
  if (await rateLimited(env, ip)) {
    return json({ error: "rate limited", retry: true }, 429);
  }

  // LLM mode (requires the secret); anything else falls back to offline.
  if (env.GROQ_API_KEY) {
    try {
      const r = await llmAnswer(env, message, body && body.history);
      return json(r);
    } catch (err) {
      console.log("chat llm fallback", String((err && err.message) || err));
    }
  }
  return json(cannedAnswer(message));
}