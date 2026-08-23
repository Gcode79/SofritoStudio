var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-5XmFX7/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/emails.js
var START_HERE = {
  tripwire: {
    en: "Batch the sofrito first \u2014 one batch is a month of flavor in the freezer, and it makes every dish easier.",
    es: "Haz un lote de sofrito primero \u2014 un lote es un mes de sabor en el congelador y hace cada plato m\xE1s f\xE1cil."
  },
  core: {
    en: "Start with the sofrito, then arroz con gandules \u2014 the two dishes that anchor every Puerto Rican table.",
    es: "Empieza con el sofrito y luego el arroz con gandules \u2014 los dos platos que anclan toda mesa boricua."
  },
  bundle: {
    en: "Start with the sofrito, then arroz con pollo \u2014 your first no-fail weeknight dinner.",
    es: "Empieza con el sofrito y luego el arroz con pollo \u2014 tu primera cena infalible de entre semana."
  },
  addon: {
    en: "Start with the sofrito and the coquito \u2014 toast your spices first for the deepest holiday flavor.",
    es: "Empieza con el sofrito y el coquito \u2014 tuesta las especias primero para el mejor sabor navide\xF1o."
  },
  seasonal: {
    en: "Start with the sofrito and the pernil timeline \u2014 everything else on the table follows from there.",
    es: "Empieza con el sofrito y la l\xEDnea de tiempo del pernil \u2014 todo lo dem\xE1s en la mesa sigue desde ah\xED."
  },
  course: {
    en: "Start with the sofrito and fried green plantains \u2014 mofongo is all about the mash technique.",
    es: "Empieza con el sofrito y los pl\xE1tanos verdes fritos \u2014 el mofongo es todo t\xE9cnica de machacar."
  },
  membership: {
    en: "Welcome to the club \u2014 start with the sofrito, then cook this month's featured recipe.",
    es: "Bienvenido al club \u2014 empieza con el sofrito y luego cocina la receta destacada del mes."
  },
  product: {
    en: "Start with the sofrito \u2014 it's the base of everything. Master it once and every dish gets a step easier.",
    es: "Empieza con el sofrito \u2014 es la base de todo. Dom\xEDnalo una vez y cada plato se vuelve un paso m\xE1s f\xE1cil."
  }
};
var CONTENTS = {
  tripwire: {
    en: "5 essential dishes, bilingual, with mainland ingredient swaps.",
    es: "5 platos esenciales, biling\xFCe, con swaps de ingredientes para el mainland."
  },
  core: {
    en: "30 bilingual recipes, ingredient swaps, holiday menus, and a full Nochebuena timeline.",
    es: "30 recetas biling\xFCes, swaps de ingredientes, men\xFAs navide\xF1os y una l\xEDnea de tiempo completa de Nochebuena."
  },
  bundle: {
    en: "The complete cookbook plus every printable \u2014 pantry lists, timelines, and cheat sheets.",
    es: "El libro completo m\xE1s todos los imprimibles \u2014 listas de despensa, l\xEDneas de tiempo y gu\xEDas r\xE1pidas."
  },
  addon: {
    en: "The holiday companion \u2014 menus, timelines, and the coquito guide.",
    es: "El compa\xF1ero navide\xF1o \u2014 men\xFAs, l\xEDneas de tiempo y la gu\xEDa del coquito."
  },
  seasonal: {
    en: "A full holiday menu with step-by-step timeline and printable shopping list.",
    es: "Un men\xFA navide\xF1o completo con l\xEDnea de tiempo paso a paso y lista de compras imprimible."
  },
  course: {
    en: "The complete video course with recipes and techniques, plus the cookbook.",
    es: "El curso completo en video con recetas y t\xE9cnicas, m\xE1s el libro."
  },
  membership: {
    en: "Member-only recipes and printables, plus every new release.",
    es: "Recetas e imprimibles solo para miembros, m\xE1s cada nuevo lanzamiento."
  },
  product: {
    en: "Your new download, ready in your Gumroad library.",
    es: "Tu nueva descarga, lista en tu biblioteca de Gumroad."
  }
};
var TIER_KEYWORDS = [
  ["tripwire", ["starter", "breakfast", "breakfasts"]],
  ["core", ["la mesa", "mesa", "cookbook"]],
  ["bundle", ["full table", "kitchen bundle", "complete", "bundle"]],
  ["addon", ["add-on", "addon", "holiday & coquito"]],
  ["seasonal", ["thanksgiving", "navidad", "coquito guide", "holiday"]],
  ["membership", ["membership"]],
  ["course", ["mofongo", "course"]]
];
function tierForProduct(name) {
  const n = (name || "").toLowerCase();
  for (const [tier, keywords] of TIER_KEYWORDS) {
    if (keywords.some((k) => n.includes(k)))
      return tier;
  }
  return "product";
}
__name(tierForProduct, "tierForProduct");
function slugify(name) {
  const s = (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "product";
}
__name(slugify, "slugify");
function mdToText(md) {
  return md.replace(/\*\*/g, "").replace(/^#{1,3}\s*/gm, "").replace(/^[-*]\s+/gm, "\u2022 ").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)").split("\n").map((l) => l.trimEnd()).join("\n").trim();
}
__name(mdToText, "mdToText");
var TEMPLATES = {
  post_purchase: {
    en: {
      subject: "{product_name} is yours \u2014 welcome to the table!",
      body: `Thanks for grabbing {product_name} \u2014 welcome to the family kitchen.

**Your download**
Your files are in your Gumroad library (gumroad.com/library) and in the receipt email from Gumroad. If anything didn't arrive or feels off, just reply to this email and I'll fix it fast.

**Start here**
{tip}

**What you've got**
{contents}

Need help with an ingredient or a step? Hit reply \u2014 real person, quick answer. Your order: {product_name}.

Buen provecho,
\u2014 The Ortiz kitchen, Sofrito Studio
sofritostudio.com`
    },
    es: {
      subject: "{product_name} es tuyo \u2014 \xA1bienvenido a la mesa!",
      body: `Gracias por comprar {product_name} \u2014 bienvenido a la cocina de la familia.

**Tu descarga**
Tus archivos est\xE1n en tu biblioteca de Gumroad (gumroad.com/library) y en el correo de recibo de Gumroad. Si algo no lleg\xF3 o algo se siente mal, responde a este correo y lo arreglo r\xE1pido.

**Empieza aqu\xED**
{tip}

**Lo que tienes**
{contents}

\xBFNecesitas ayuda con un ingrediente o un paso? Responde a este correo \u2014 persona real, respuesta r\xE1pida. Tu orden: {product_name}.

Buen provecho,
\u2014 La cocina Ortiz, Sofrito Studio
sofritostudio.com`
    }
  },
  welcome: {
    en: {
      subject: "Your free Puerto Rican recipes are on the way",
      body: `Hola! Welcome to Sofrito Studio \u2014 I'm really glad you're here.

Your free Sofrito 101 starter kit is ready to download:

https://sofritostudio.com/freebies/Sofrito-101.pdf

It covers the sofrito base \u2014 the flavor foundation of every Puerto Rican dish \u2014 with easy mainland ingredient swaps and a 20-minute batch plan for a month of flavor.

Here's how to make the most of the next few days:

1. **Today** \u2014 grab your download and read the sofrito base. That's the one recipe everything else builds on.
2. **Tomorrow** \u2014 batch it. One batch of sofrito = a month of flavor in the freezer.
3. **Day 3** \u2014 cook your first dish: arroz con pollo. You'll feel unstoppable.

If it doesn't arrive, check spam and add us to your contacts so the recipes keep coming.

Buen provecho,
\u2014 The Ortiz kitchen, Sofrito Studio
sofritostudio.com`
    },
    es: {
      subject: "Tus recetas boricuas gratis van en camino",
      body: `\xA1Hola! Bienvenido a Sofrito Studio \u2014 me alegra mucho que est\xE9s aqu\xED.

Tu gu\xEDa gratuita de Sofrito 101 est\xE1 lista para descargar:

https://sofritostudio.com/freebies/Sofrito-101.pdf

Cubre la base del sofrito \u2014 el sabor que le da identidad a cada plato puertorrique\xF1o \u2014 con swaps de ingredientes f\xE1ciles para el mainland y un plan de lote de 20 minutos para un mes de sabor.

As\xED aprovechas los pr\xF3ximos d\xEDas:

1. **Hoy** \u2014 descarga la gu\xEDa y lee la base del sofrito. Esa es la receta sobre la que todo lo dem\xE1s se construye.
2. **Ma\xF1ana** \u2014 haz un lote grande. Un lote de sofrito = un mes de sabor en el congelador.
3. **D\xEDa 3** \u2014 cocina tu primer plato: arroz con pollo. Te vas a sentir imparable.

Si no llega, revisa el spam y agr\xE9ganos a tus contactos para que las recetas sigan llegando.

Buen provecho,
\u2014 La cocina Ortiz, Sofrito Studio
sofritostudio.com`
    }
  },
  welcome_15: {
    en: {
      subject: "Your sofrito guide + 15% off the Starter Kit",
      body: `Hola! Here's your Sofrito 101 guide plus a little welcome gift.

**Your free guide**
https://sofritostudio.com/freebies/Sofrito-101.pdf

The sofrito base is the flavor foundation of every Puerto Rican dish \u2014 this guide walks you through the ingredients, mainland swaps, and a 20-minute batch plan for a month of flavor.

**Your 15% welcome discount**
Use code **SOFRITO15** for 15% off the $9 Sofrito Starter Kit \u2014 your first 5 essential boricua recipes:

https://sofritostudio.com/products/starter-kit.html?coupon=SOFRITO15

The offer's yours for the next 7 days. No rush \u2014 the recipes aren't going anywhere.

Buen provecho,
\u2014 The Ortiz kitchen, Sofrito Studio
sofritostudio.com`
    },
    es: {
      subject: "Tu gu\xEDa de sofrito + 15% de descuento en el Kit de Inicio",
      body: `\xA1Hola! Aqu\xED tienes tu gu\xEDa de Sofrito 101 m\xE1s un peque\xF1o regalo de bienvenida.

**Tu gu\xEDa gratuita**
https://sofritostudio.com/freebies/Sofrito-101.pdf

La base del sofrito es el sabor que le da identidad a cada plato puertorrique\xF1o \u2014 esta gu\xEDa te lleva por los ingredientes, los swaps para el mainland y un plan de lote de 20 minutos para un mes de sabor.

**Tu descuento de bienvenida del 15%**
Usa el c\xF3digo **SOFRITO15** para 15% de descuento en el Kit de Inicio de $9 \u2014 tus primeras 5 recetas boricuas esenciales:

https://sofritostudio.com/products/starter-kit.html?coupon=SOFRITO15

La oferta es tuya por los pr\xF3ximos 7 d\xEDas. Sin prisa \u2014 las recetas no se van a ning\xFAn lado.

Buen provecho,
\u2014 La cocina Ortiz, Sofrito Studio
sofritostudio.com`
    }
  },
  abandoned_1h: {
    en: {
      subject: "Did you leave your sofrito base behind?",
      body: `Hola! You were one click away from starting your Puerto Rican cooking journey.

Your cart is still waiting for you:

{recovery_link}

The Starter Kit is 5 essential bilingual recipes \u2014 sofrito, arroz con pollo, pernil, tostones, and flan \u2014 with mainland ingredient swaps. Instant download, 30-day guarantee.

**Don't forget your 15% code: SOFRITO15** \u2014 good on the Starter Kit through this week.

No pressure \u2014 but your first boricua dinner is closer than you think.

Buen provecho,
\u2014 The Ortiz kitchen, Sofrito Studio`
    },
    es: {
      subject: "\xBFDejaste tu base de sofrito atr\xE1s?",
      body: `\xA1Hola! Estuviste a un clic de empezar tu viaje de cocina puertorrique\xF1a.

Tu carrito te sigue esperando:

{recovery_link}

El Kit de Inicio son 5 recetas esenciales biling\xFCes \u2014 sofrito, arroz con pollo, pernil, tostones y flan \u2014 con swaps de ingredientes para el mainland. Descarga instant\xE1nea, garant\xEDa de 30 d\xEDas.

**No olvides tu c\xF3digo del 15%: SOFRITO15** \u2014 v\xE1lido en el Kit de Inicio durante esta semana.

Sin presi\xF3n \u2014 pero tu primera cena boricua est\xE1 m\xE1s cerca de lo que crees.

Buen provecho,
\u2014 La cocina Ortiz, Sofrito Studio`
    }
  },
  abandoned_24h: {
    en: {
      subject: "30,000 home cooks started the same way",
      body: `Hola! A quick note from the kitchen \u2014 this is what people say once they start:

> "I grew up eating mofongo but never dared to make it. The Sofrito Starter Kit walks you through the base \u2014 so your first batch tastes right."

The kit is 5 recipes, bilingual, and tested in the Ortiz kitchen. Still waiting for you here:

{recovery_link}

**A little incentive:** reply to this email with "BONUS" and I'll add $5 in store credit toward your order \u2014 on the house.

The 15% code (SOFRITO15) still applies on the Starter Kit too.

Buen provecho,
\u2014 The Ortiz kitchen, Sofrito Studio`
    },
    es: {
      subject: "30,000 cocineros caseros empezaron igual",
      body: `\xA1Hola! Una nota r\xE1pida de la cocina \u2014 esto es lo que dice la gente cuando empieza:

> "Crec\xED comiendo mofongo pero nunca me atrev\xED a hacerlo. El Kit de Inicio Sofrito te gu\xEDa por la base \u2014 para que tu primer lote sepa bien."

El kit son 5 recetas, biling\xFCe y probadas en la cocina Ortiz. Te sigue esperando aqu\xED:

{recovery_link}

**Un peque\xF1o incentivo:** responde a este correo con "BONUS" y a\xF1ado $5 de cr\xE9dito a tu orden \u2014 de parte de la casa.

El c\xF3digo del 15% (SOFRITO15) tambi\xE9n sigue v\xE1lido en el Kit de Inicio.

Buen provecho,
\u2014 La cocina Ortiz, Sofrito Studio`
    }
  },
  day3_upgrade: {
    en: {
      subject: "You're 3 days in \u2014 ready to go further?",
      body: `Hola! You've had your {product_name} for a few days now \u2014 hope your first batch tasted amazing.

Here's what cooks who started where you did do next: they go deeper.

**Upgrade to {upgrade_name} \u2014 {upgrade_credit}**
{upgrade_link}

{upgrade_blurb}

Instant download. 30-day guarantee. If it's not the right fit, reply and we'll sort it out.

Buen provecho,
\u2014 The Ortiz kitchen, Sofrito Studio`
    },
    es: {
      subject: "Llevas 3 d\xEDas \u2014 \xBFlisto para ir m\xE1s lejos?",
      body: `\xA1Hola! Ya tienes tu {product_name} desde hace unos d\xEDas \u2014 espero que tu primer lote haya sido incre\xEDble.

Esto es lo que hacen los cocineros que empezaron donde empezaste t\xFA: ir m\xE1s profundo.

**Mejora a {upgrade_name} \u2014 {upgrade_credit}**
{upgrade_link}

{upgrade_blurb}

Descarga instant\xE1nea. Garant\xEDa de 30 d\xEDas. Si no es lo correcto, responde y lo resolvemos.

Buen provecho,
\u2014 La cocina Ortiz, Sofrito Studio`
    }
  },
  day14_review: {
    en: {
      subject: "How did your first boricua meal go?",
      body: `Hola! It's been two weeks since your {product_name} purchase.

If you've cooked something from it, I'd love to hear how it went. A two-line review is enough \u2014 it genuinely helps other home cooks decide.

Reply to this email with your thoughts (and a photo if you have one!). Or leave a quick rating here:

https://sofritostudio.com/products.html

Thank you for cooking boricua with us \u2014 your review keeps the tradition going.

Buen provecho,
\u2014 The Ortiz kitchen, Sofrito Studio`
    },
    es: {
      subject: "\xBFC\xF3mo te fue con tu primera comida boricua?",
      body: `\xA1Hola! Ya pasaron dos semanas desde tu compra de {product_name}.

Si has cocinado algo de ah\xED, me encantar\xEDa saber c\xF3mo te fue. Una rese\xF1a de dos l\xEDneas es suficiente \u2014 de verdad ayuda a otros cocineros caseros a decidir.

Responde a este correo con tus comentarios (\xA1y una foto si tienes!). O deja una valoraci\xF3n r\xE1pida aqu\xED:

https://sofritostudio.com/products.html

Gracias por cocinar boricua con nosotros \u2014 tu rese\xF1a mantiene viva la tradici\xF3n.

Buen provecho,
\u2014 La cocina Ortiz, Sofrito Studio`
    }
  },
  owner_alert: {
    en: {
      subject: "\u{1F6D2} {product_name} sold \u2014 {price}",
      body: `New order on sofritostudio.com.

Product: {product_name}
Price: {price}
Tier: {tier}
Language: {lang}

Day-3 upgrade + Day-14 review sequences are scheduled automatically.

\u2014 Sofrito Studio bot`
    },
    es: {
      subject: "\u{1F6D2} Se vendi\xF3 {product_name} \u2014 {price}",
      body: `Nueva orden en sofritostudio.com.

Producto: {product_name}
Precio: {price}
Nivel: {tier}
Idioma: {lang}

Las secuencias de mejora del D\xEDa 3 y rese\xF1a del D\xEDa 14 est\xE1n programadas autom\xE1ticamente.

\u2014 Bot de Sofrito Studio`
    }
  },
  refund_survey: {
    en: {
      subject: "We're sorry \u2014 help us make it right",
      body: `Hola, this is Josh from Sofrito Studio.

I saw a refund came through on your {product_name} order, and honestly \u2014 I'd rather know what went wrong than lose you quietly.

If you have two minutes, reply with one line: was it the recipes, the format, or just not the right fit?

Whatever it is, I'll take it seriously. If you'd rather try a different product or the bundle at no extra cost, reply and I'll set it up personally.

Buen provecho,
\u2014 Josh, Sofrito Studio`
    },
    es: {
      subject: "Lo sentimos \u2014 ay\xFAdanos a hacerlo bien",
      body: `\xA1Hola! Soy Josh, de Sofrito Studio.

Vi que lleg\xF3 un reembolso por tu compra de {product_name}, y honestamente \u2014 prefiero saber qu\xE9 sali\xF3 mal que perderte en silencio.

Si tienes dos minutos, responde con una l\xEDnea: \xBFfueron las recetas, el formato, o simplemente no era lo correcto?

Sea lo que sea, lo tomo en serio. Si prefieres probar otro producto o el paquete sin costo extra, responde y lo configuro personalmente.

Buen provecho,
\u2014 Josh, Sofrito Studio`
    }
  },
  winback: {
    en: {
      subject: "Your kitchen misses you",
      body: `Hola! It's been a little while since your {product_name} order.

The stove's still warm \u2014 and this is the best time to go deeper: upgrade to The Kitchen Bundle and get the full system (cookbook + every printable + meal planners) at your upgrade credit.

{upgrade_link}

Instant download, 30-day guarantee, and your credit is applied automatically. No pressure \u2014 the recipes aren't going anywhere.

Buen provecho,
\u2014 The Ortiz kitchen, Sofrito Studio`
    },
    es: {
      subject: "Tu cocina te extra\xF1a",
      body: `\xA1Hola! Ya pas\xF3 un tiempo desde tu pedido de {product_name}.

La estufa sigue caliente \u2014 y este es el mejor momento para ir m\xE1s profundo: mejora a The Kitchen Bundle y consigue el sistema completo (libro + todos los imprimibles + planificadores de comidas) con tu cr\xE9dito de mejora.

{upgrade_link}

Descarga instant\xE1nea, garant\xEDa de 30 d\xEDas, y tu cr\xE9dito se aplica autom\xE1ticamente. Sin presi\xF3n \u2014 las recetas no se van a ning\xFAn lado.

Buen provecho,
\u2014 La cocina Ortiz, Sofrito Studio`
    }
  },
  daily_digest: {
    en: {
      subject: "Sofrito Studio \u2014 daily digest {date}",
      body: `Daily summary for {date}:

Revenue: {revenue}
Orders: {orders}
Top product: {top_product}
Course orders: {course_orders}
Subscribers: {subscribers}
Abandoned-cart emails sent: {abandoned_sent}
Refunds today: {refunds}

All sequences (receipt, Day 3, Day 14, win-back) are handled automatically.

\u2014 Sofrito Studio bot`
    },
    es: {
      subject: "Sofrito Studio \u2014 resumen diario {date}",
      body: `Resumen diario para {date}:

Ingresos: {revenue}
\xD3rdenes: {orders}
Producto top: {top_product}
\xD3rdenes del curso: {course_orders}
Suscriptores: {subscribers}
Correos de carrito abandonado enviados: {abandoned_sent}
Reembolsos hoy: {refunds}

Todas las secuencias (recibo, D\xEDa 3, D\xEDa 14, win-back) se manejan autom\xE1ticamente.

\u2014 Bot de Sofrito Studio`
    }
  },
  seasonal: {
    en: {
      subject: "{guide_name} season is here",
      body: `Hola! The holidays are coming, and this is the best time to get ahead of the table.

{guide_name} is ready for you \u2014 {guide_blurb}.

Get it here:
{guide_link}

Batched, timed, and stress-free. You'll be glad you started now.

Buen provecho,
\u2014 The Ortiz kitchen, Sofrito Studio`
    },
    es: {
      subject: "Lleg\xF3 la temporada de {guide_name}",
      body: `\xA1Hola! Se acercan las fiestas, y este es el mejor momento para adelantarte a la mesa.

{guide_name} est\xE1 listo para ti \u2014 {guide_blurb}.

Cons\xEDguelo aqu\xED:
{guide_link}

En lote, con tiempos, y sin estr\xE9s. Te alegrar\xE1s de haber empezado ya.

Buen provecho,
\u2014 La cocina Ortiz, Sofrito Studio`
    }
  }
};
function renderEmail(name, lang = "en", vars = {}) {
  const t = (TEMPLATES[name] || TEMPLATES.post_purchase)[lang] || TEMPLATES[name].en;
  let subject = t.subject;
  let body = t.body;
  for (const [k, v] of Object.entries(vars)) {
    subject = subject.split(`{${k}}`).join(String(v));
    body = body.split(`{${k}}`).join(String(v));
  }
  return { subject, text: mdToText(body) };
}
__name(renderEmail, "renderEmail");

// src/automation.js
var RESEND_API = "https://api.resend.com/emails";
var BUTTONDOWN_API = "https://api.buttondown.com/v1";
var HOUR = 3600 * 1e3;
var DAY = 24 * HOUR;
async function kvGet(env, key) {
  const raw = await env.SOFRITO_STATE.get(key);
  if (!raw)
    return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
__name(kvGet, "kvGet");
async function kvPut(env, key, obj) {
  await env.SOFRITO_STATE.put(key, JSON.stringify(obj));
}
__name(kvPut, "kvPut");
function leadKey(email) {
  return `lead:${String(email).trim().toLowerCase()}`;
}
__name(leadKey, "leadKey");
function purchaseKey(email) {
  return `purchase:${String(email).trim().toLowerCase()}`;
}
__name(purchaseKey, "purchaseKey");
async function captureLead(env, { email, lang = "en", source = "sofrito-101", intent = "freebie", product = "starter-kit", phone = "" }) {
  const key = leadKey(email);
  const existing = await kvGet(env, key);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const lead = existing || { email, lang, source, intent, product, created_at: now, a1_sent: false, a2_sent: false, purchased: false };
  if (phone)
    lead.phone = phone;
  if (!existing)
    await kvPut(env, key, lead);
  return lead;
}
__name(captureLead, "captureLead");
async function markPurchased(env, email) {
  const key = leadKey(email);
  const lead = await kvGet(env, key);
  if (lead) {
    lead.purchased = true;
    await kvPut(env, key, lead);
  }
  return !!lead;
}
__name(markPurchased, "markPurchased");
async function recordPurchase(env, { email, lang = "en", product_name, tier = "product", price = 0 }) {
  const key = purchaseKey(email);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = await kvGet(env, key);
  if (existing)
    return existing;
  const rec = { email, lang, product_name, tier, price, purchased_at: now, last_purchase_at: now, d3_sent: false, d14_sent: false };
  await kvPut(env, key, rec);
  return rec;
}
__name(recordPurchase, "recordPurchase");
async function sendResend(env, to, subject, text) {
  if (!env.RESEND_API_KEY)
    return { sent: false, reason: "no-resend-key" };
  const fromAddr = env.RESEND_FROM || "hello@sofritostudio.com";
  const fromName = env.RESEND_FROM_NAME || "Sofrito Studio";
  const resp = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "sofrito-studio-worker/1.0"
    },
    body: JSON.stringify({ from: `${fromName} <${fromAddr}>`, to: [to], subject, text })
  });
  if (resp.ok)
    return { sent: true };
  return { sent: false, status: resp.status };
}
__name(sendResend, "sendResend");
function normalizePhone(p) {
  let n = String(p || "").replace(/[^0-9+]/g, "");
  if (n.startsWith("+"))
    return n.length >= 11 ? n : "";
  return n.length === 10 ? "+1" + n : "";
}
__name(normalizePhone, "normalizePhone");
async function sendSms(env, to, text) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    return { sent: false, reason: "no-twilio" };
  }
  const phone = normalizePhone(to);
  if (!phone)
    return { sent: false, reason: "bad-phone" };
  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.TWILIO_ACCOUNT_SID)}/Messages.json`;
  const auth = "Basic " + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const body = new URLSearchParams({ To: phone, From: env.TWILIO_FROM_NUMBER, Body: text });
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "sofrito-studio-worker/1.0" },
      body
    });
    return { sent: r.ok, status: r.status };
  } catch (err) {
    return { sent: false, reason: "error" };
  }
}
__name(sendSms, "sendSms");
async function addSubscriber(env, email, tags, notes, metadata) {
  const headers = {
    Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
    "Content-Type": "application/json"
  };
  let resp = await fetch(`${BUTTONDOWN_API}/subscribers`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email_address: email, tags, notes, metadata })
  });
  if (resp.ok)
    return { added: true };
  if (resp.status === 403) {
    resp = await fetch(`${BUTTONDOWN_API}/subscribers`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: email, notes, metadata })
    });
    if (resp.ok)
      return { added: true, tagsSkipped: true };
  }
  return { added: false, status: resp.status };
}
__name(addSubscriber, "addSubscriber");
function detectLang(sale) {
  const cf = sale.custom_fields;
  if (Array.isArray(cf)) {
    for (const f of cf) {
      if (String(f?.name).toLowerCase() === "language" && String(f?.value).toLowerCase().startsWith("es"))
        return "es";
    }
  } else if (cf && typeof cf === "object" && String(cf.language || "").toLowerCase().startsWith("es")) {
    return "es";
  }
  return "en";
}
__name(detectLang, "detectLang");
async function processSale(env, sale) {
  const saleId = sale.id || sale.sale_id || "";
  const refundedNow = !!(sale.refunded || sale.fully_refunded);
  if (saleId) {
    const seen = await env.SOFRITO_STATE.get("sale:" + saleId);
    if (seen === "ok" && refundedNow) {
      await handleRefund(env, sale);
      await env.SOFRITO_STATE.put("sale:" + saleId, "refunded");
      return { status: "refunded" };
    }
    if (seen)
      return { status: "duplicate" };
  }
  const email = sale.email || sale.buyer_email;
  if (!email || !email.includes("@"))
    return { status: "no-email" };
  const productName = sale.product_name || "unknown";
  const price = (sale.price || 0) / 100;
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
      contents: (CONTENTS[tier] || CONTENTS.product)[lang]
    });
    emailResult = await sendResend(env, email, subject, text);
  }
  const existing = await kvGet(env, purchaseKey(email));
  if (existing) {
    existing.last_purchase_at = (/* @__PURE__ */ new Date()).toISOString();
    await kvPut(env, purchaseKey(email), existing);
  } else {
    await recordPurchase(env, { email, lang, product_name: productName, tier, price });
  }
  await markPurchased(env, email);
  if (saleId)
    await env.SOFRITO_STATE.put("sale:" + saleId, refundedNow ? "refunded" : "ok");
  await sendOwnerAlert(env, { product_name: productName, price: price.toFixed(2), tier, lang });
  return { status: "ok", captured: capture.added, emailed: emailResult.sent };
}
__name(processSale, "processSale");
async function sweepGumroadSales(env) {
  const token = env.GUMROAD_ACCESS_TOKEN;
  if (!token)
    return { processed: 0, reason: "no-token" };
  const after = await env.SOFRITO_STATE.get("meta:last_sale_cursor") || "";
  const before = (/* @__PURE__ */ new Date()).toISOString();
  let processed = 0;
  for (let page = 1; page <= 5; page++) {
    const url = new URL("https://api.gumroad.com/v2/sales");
    url.searchParams.set("access_token", token);
    url.searchParams.set("page", String(page));
    if (after)
      url.searchParams.set("after", after);
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
      if (res.status === "ok")
        processed++;
    }
    if (sales.length < 50)
      break;
  }
  await env.SOFRITO_STATE.put("meta:last_sale_cursor", before);
  return { processed, cursor: before };
}
__name(sweepGumroadSales, "sweepGumroadSales");
function ownerEmail(env) {
  return env.OWNER_EMAIL || "j.ortiz1148@gmail.com";
}
__name(ownerEmail, "ownerEmail");
async function sendOwnerAlert(env, vars, lang = "en") {
  if (!env.RESEND_API_KEY)
    return { sent: false };
  const { subject, text } = renderEmail("owner_alert", lang, vars);
  return sendResend(env, ownerEmail(env), subject, text);
}
__name(sendOwnerAlert, "sendOwnerAlert");
async function handleRefund(env, sale) {
  const email = sale.email || sale.buyer_email;
  const productName = sale.product_name || "unknown";
  if (email && email.includes("@")) {
    const rec = await kvGet(env, purchaseKey(email));
    if (rec) {
      rec.refunded = true;
      rec.d3_sent = true;
      rec.d14_sent = true;
      await kvPut(env, purchaseKey(email), rec);
    }
    if (env.RESEND_API_KEY) {
      const { subject, text } = renderEmail("refund_survey", "en", { product_name: productName });
      await sendResend(env, email, subject, text);
    }
  }
  await sendOwnerAlert(env, {
    product_name: "REFUNDED: " + productName,
    price: "refund",
    tier: "n/a",
    lang: "en"
  });
}
__name(handleRefund, "handleRefund");
async function scanRefunds(env) {
  const token = env.GUMROAD_ACCESS_TOKEN;
  if (!token)
    return 0;
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
      if (!sid)
        continue;
      const state = await env.SOFRITO_STATE.get("sale:" + sid);
      if (state === "ok" && (s.refunded || s.fully_refunded)) {
        await handleRefund(env, s);
        await env.SOFRITO_STATE.put("sale:" + sid, "refunded");
        refunded++;
      }
    }
    if (sales.length < 50)
      break;
  }
  return refunded;
}
__name(scanRefunds, "scanRefunds");
async function sendWinbacks(env) {
  let sent = 0;
  const list = await env.SOFRITO_STATE.list({ prefix: "purchase:" });
  for (const { name } of list.keys) {
    const rec = await kvGet(env, name);
    if (!rec || rec.refunded || rec.winback_sent)
      continue;
    const last = new Date(rec.last_purchase_at || rec.purchased_at).getTime();
    if (Date.now() - last < 60 * DAY)
      continue;
    const { subject, text } = renderEmail("winback", rec.lang, {
      product_name: rec.product_name,
      upgrade_link: "https://sofritostudio.com/buy/bundle"
    });
    const res = await sendResend(env, rec.email, subject, text);
    if (res.sent) {
      rec.winback_sent = true;
      rec.winback_at = (/* @__PURE__ */ new Date()).toISOString();
      await kvPut(env, name, rec);
      sent++;
    }
  }
  return sent;
}
__name(sendWinbacks, "sendWinbacks");
async function fetchDailyStats(env) {
  const stats = { revenue: 0, orders: 0, topProduct: "-", courseOrders: 0, refunds: 0, subscribers: 0, abandonedSent: 0 };
  const token = env.GUMROAD_ACCESS_TOKEN;
  const startOfDay = /* @__PURE__ */ new Date();
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
        if (s.refunded || s.fully_refunded) {
          stats.refunds++;
          continue;
        }
        stats.orders++;
        stats.revenue += (s.price || 0) / 100;
        const name = s.product_name || "unknown";
        counts[name] = (counts[name] || 0) + 1;
        if (/mofongo|course/i.test(name))
          stats.courseOrders++;
      }
      stats.topProduct = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "-";
      if (sales.length < 50)
        break;
    }
  }
  if (env.BUTTONDOWN_API_KEY) {
    try {
      const r = await fetch("https://api.buttondown.com/v1/subscribers", { headers: { Authorization: "Token " + env.BUTTONDOWN_API_KEY } });
      const d = await r.json();
      stats.subscribers = d.count || 0;
    } catch (err) {
    }
  }
  const leads = await env.SOFRITO_STATE.list({ prefix: "lead:" });
  for (const { name } of leads.keys) {
    const lead = await kvGet(env, name);
    if (lead && (lead.a1_sent || lead.a2_sent))
      stats.abandonedSent++;
  }
  return stats;
}
__name(fetchDailyStats, "fetchDailyStats");
async function sendDailyDigest(env) {
  if (!env.RESEND_API_KEY)
    return { sent: false, reason: "no-resend" };
  const dateKey = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
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
    refunds: String(stats.refunds)
  });
  const res = await sendResend(env, ownerEmail(env), subject, text);
  if (res.sent)
    await env.SOFRITO_STATE.put("meta:digest:" + dateKey, "1");
  return res;
}
__name(sendDailyDigest, "sendDailyDigest");
var SEASONAL_EVENTS = [
  {
    key: "thanksgiving",
    month: 11,
    day: 1,
    vars: {
      guide_name: "Thanksgiving Boricua",
      guide_blurb: "the full holiday menu with a step-by-step timeline and printable shopping list",
      guide_link: "https://sofritostudio.gumroad.com/l/thanksgiving-boricua"
    }
  },
  {
    key: "navidad",
    month: 11,
    day: 15,
    vars: {
      guide_name: "Navidad Boricua",
      guide_blurb: "the complete Nochebuena plan \u2014 menus, timelines, and the coquito guide",
      guide_link: "https://sofritostudio.gumroad.com/l/navidad-boricua"
    }
  },
  {
    key: "coquito",
    month: 12,
    day: 1,
    vars: {
      guide_name: "The Coquito Guide",
      guide_blurb: "the perfect coconut holiday drink, batch-ready and stress-free",
      guide_link: "https://sofritostudio.gumroad.com/l/coquito-guide"
    }
  }
];
async function runSeasonal(env) {
  if (!env.RESEND_API_KEY)
    return 0;
  const now = /* @__PURE__ */ new Date();
  const year = now.getUTCFullYear();
  let sent = 0;
  for (const ev of SEASONAL_EVENTS) {
    if (now.getUTCMonth() + 1 !== ev.month || now.getUTCDate() !== ev.day)
      continue;
    const guardKey = `meta:seasonal:${ev.key}:${year}`;
    if (await env.SOFRITO_STATE.get(guardKey))
      continue;
    const buyers = await env.SOFRITO_STATE.list({ prefix: "purchase:" });
    for (const { name } of buyers.keys) {
      const rec = await kvGet(env, name);
      if (!rec || rec.refunded)
        continue;
      const { subject, text } = renderEmail("seasonal", rec.lang || "en", ev.vars);
      const res = await sendResend(env, rec.email, subject, text);
      if (res.sent)
        sent++;
    }
    await env.SOFRITO_STATE.put(guardKey, "1");
  }
  return sent;
}
__name(runSeasonal, "runSeasonal");
async function runAutomation(env, opts = {}) {
  const now = Date.now();
  const summary = { leads: 0, abandoned1: 0, abandoned2: 0, purchases: 0, day3: 0, day14: 0, salesProcessed: 0, refunds: 0, winbacks: 0, seasonal: 0, digest: "no" };
  const sweep = await sweepGumroadSales(env);
  summary.salesProcessed = sweep.processed || 0;
  summary.refunds = await scanRefunds(env);
  const leadList = await env.SOFRITO_STATE.list({ prefix: "lead:" });
  for (const { name } of leadList.keys) {
    const lead = await kvGet(env, name);
    if (!lead || lead.purchased)
      continue;
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
      if (lead.phone && !lead.sms1_sent) {
        const sms = await sendSms(
          env,
          lead.phone,
          lead.lang === "es" ? "\xBFDejaste tu sofrito atr\xE1s? C\xF3digo SOFRITO15 \xB7 Pago en 1 clic: " + recovery : "Did you leave your sofrito base behind? Code SOFRITO15 \xB7 1-click checkout: " + recovery
        );
        if (sms.sent) {
          lead.sms1_sent = true;
          await kvPut(env, name, lead);
          summary.abandoned1++;
        }
      }
    } else if (age >= DAY && !lead.a2_sent) {
      const { subject, text } = renderEmail("abandoned_24h", lead.lang, { recovery_link: recovery });
      const res = await sendResend(env, lead.email, subject, text);
      if (res.sent) {
        lead.a2_sent = true;
        await kvPut(env, name, lead);
        summary.abandoned2++;
      }
      if (lead.phone && !lead.sms2_sent) {
        const sms = await sendSms(
          env,
          lead.phone,
          lead.lang === "es" ? "Tu carrito sigue aqu\xED + $5 de cr\xE9dito. Responde BONUS: " + recovery : "Your cart is still waiting + $5 credit. Reply BONUS: " + recovery
        );
        if (sms.sent) {
          lead.sms2_sent = true;
          await kvPut(env, name, lead);
          summary.abandoned2++;
        }
      }
    }
  }
  const purchaseList = await env.SOFRITO_STATE.list({ prefix: "purchase:" });
  for (const { name } of purchaseList.keys) {
    const rec = await kvGet(env, name);
    if (!rec)
      continue;
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
          upgrade_blurb: upgrade.blurb
        };
        const { subject, text } = renderEmail("day3_upgrade", rec.lang, vars);
        const res = await sendResend(env, rec.email, subject, text);
        if (res.sent) {
          rec.d3_sent = true;
          await kvPut(env, name, rec);
          summary.day3++;
        }
      } else {
        rec.d3_sent = true;
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
  summary.winbacks = await sendWinbacks(env);
  summary.seasonal = await runSeasonal(env);
  const is8am = (/* @__PURE__ */ new Date()).getUTCHours() === 8;
  if (is8am || opts.forceDigest) {
    const digest = await sendDailyDigest(env);
    summary.digest = digest.sent ? "sent" : digest.reason || "no";
  }
  return summary;
}
__name(runAutomation, "runAutomation");
function recoveryLink(lead) {
  const product = lead.product || "starter-kit";
  return `https://sofritostudio.com/buy/${encodeURIComponent(product)}`;
}
__name(recoveryLink, "recoveryLink");
function upgradeOffer(tier, lang) {
  const es = lang === "es";
  if (tier === "tripwire") {
    return {
      name: es ? "The Kitchen Bundle" : "The Kitchen Bundle",
      credit: es ? "con tu cr\xE9dito de $9 del Starter Kit ya aplicado" : "your $9 Starter Kit credit already applied",
      link: "https://sofritostudio.gumroad.com/l/razabs?coupon=UPGRADE9",
      blurb: es ? "El libro completo m\xE1s todos los imprimibles \u2014 listas de despensa, l\xEDneas de tiempo y gu\xEDas r\xE1pidas." : "The complete cookbook plus every printable \u2014 pantry lists, timelines, and cheat sheets."
    };
  }
  if (tier === "core") {
    return {
      name: es ? "The Full Table" : "The Full Table",
      credit: es ? "oferta de mejora de $35" : "$35 delta upgrade offer",
      link: "https://sofritostudio.gumroad.com/l/dodbtn?coupon=UPGRADE35",
      blurb: es ? "El sistema completo: libro, imprimibles y el flujo de Boricua Weeknights para cenas de 30 minutos." : "The complete system: cookbook, printables, and the Boricua Weeknights workflow for 30-minute dinners."
    };
  }
  return null;
}
__name(upgradeOffer, "upgradeOffer");
async function handleResendWebhook(request, env) {
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
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const type = payload.type || "";
  if (type === "email.bounced" || type === "email.complained") {
    const email = payload.data && payload.data.to || "";
    if (email) {
      await env.SOFRITO_STATE.put(`bounce:${String(email).toLowerCase()}`, String(Date.now()));
    }
  }
  return json({ status: "ok", type });
}
__name(handleResendWebhook, "handleResendWebhook");
async function verifySvix(headers, rawBody, secret) {
  const id = headers.get("svix-id");
  const ts = headers.get("svix-timestamp");
  const sigHeader = headers.get("svix-signature");
  if (!id || !ts || !sigHeader)
    return false;
  const secretBytes = base64ToBytes(secret.replace(/^whsec_/, ""));
  if (!secretBytes)
    return false;
  const msg = new TextEncoder().encode(`${id}.${ts}.${rawBody}`);
  const cryptoImpl = globalThis.crypto;
  const key = await cryptoImpl.subtle.importKey("raw", secretBytes, { name: "Ed25519" }, false, ["verify"]);
  const sigs = sigHeader.split(" ").map((s) => s.split(",")[1] || "").filter(Boolean);
  for (const sig of sigs) {
    const sigBytes = base64ToBytes(sig);
    if (!sigBytes)
      continue;
    const ok = await cryptoImpl.subtle.verify("Ed25519", key, sigBytes, msg);
    if (ok)
      return true;
  }
  return false;
}
__name(verifySvix, "verifySvix");
function base64ToBytes(b64) {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++)
      bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}
__name(base64ToBytes, "base64ToBytes");
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json, "json");

// src/webhook.js
var BUTTONDOWN_API2 = "https://api.buttondown.com/v1";
var RESEND_API2 = "https://api.resend.com/emails";
async function handleWebhook(request, env, url) {
  const path = url.pathname;
  if (path === "/health") {
    return json2({ status: "ok" });
  }
  if (request.method !== "POST") {
    return json2({ error: "method not allowed" }, 405);
  }
  if (path === "/gumroad/webhook" || path === "/api/webhooks/gumroad") {
    return gumroadWebhook(request, env);
  }
  if (path === "/lead/webhook" || path === "/api/leads") {
    return leadWebhook(request, env);
  }
  if (path === "/api/webhooks/resend") {
    return handleResendWebhook(request, env);
  }
  return json2({ error: "not found" }, 404);
}
__name(handleWebhook, "handleWebhook");
async function gumroadWebhook(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json2({ error: "invalid json" }, 400);
  }
  if (payload.resource && payload.resource !== "sale") {
    return json2({ status: "ignored", reason: `resource=${payload.resource}` });
  }
  const sale = payload.data || payload;
  const res = await processSale(env, sale);
  return json2({ status: "ok", ...res });
}
__name(gumroadWebhook, "gumroadWebhook");
async function leadWebhook(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json2({ error: "invalid json" }, 400);
  }
  const email = (body.email || "").trim();
  if (!email.includes("@")) {
    return json2({ error: "invalid email" }, 400);
  }
  const lang = String(body.lang || "en").toLowerCase().startsWith("es") ? "es" : "en";
  const source = String(body.source || "sofrito-101").slice(0, 40);
  const intent = body.intent === "checkout" ? "checkout" : "freebie";
  const product = String(body.product || "starter-kit").slice(0, 40);
  const phone = String(body.phone || "").slice(0, 20);
  const tags = [`lead:${slugify(source)}`, `lang:${lang}`, intent === "checkout" ? "cart-abandoner" : "freebie"];
  const metadata = { source, lang, intent, flow: intent === "checkout" ? "abandoned_cart" : "welcome" };
  let capture = { added: false };
  if (env.BUTTONDOWN_API_KEY) {
    capture = await addSubscriber2(env, email, tags, `Lead magnet: ${source} (${intent})`, metadata);
  }
  let emailResult = { sent: false };
  if (env.RESEND_API_KEY) {
    const { subject, text } = renderEmail("welcome_15", lang);
    emailResult = await sendResend2(env, email, subject, text);
  }
  await captureLead(env, { email, lang, source, intent, product, phone });
  return json2({ status: "ok", captured: capture.added, emailed: emailResult.sent, intent });
}
__name(leadWebhook, "leadWebhook");
async function addSubscriber2(env, email, tags, notes, metadata) {
  const headers = {
    Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
    "Content-Type": "application/json"
  };
  let resp = await fetch(`${BUTTONDOWN_API2}/subscribers`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email_address: email, tags, notes, metadata })
  });
  if (resp.ok)
    return { added: true };
  if (resp.status === 403) {
    resp = await fetch(`${BUTTONDOWN_API2}/subscribers`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: email, notes, metadata })
    });
    if (resp.ok)
      return { added: true, tagsSkipped: true };
  }
  return { added: false, status: resp.status };
}
__name(addSubscriber2, "addSubscriber");
async function sendResend2(env, to, subject, text) {
  const fromAddr = env.RESEND_FROM || "hello@sofritostudio.com";
  const fromName = env.RESEND_FROM_NAME || "Sofrito Studio";
  const resp = await fetch(RESEND_API2, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "sofrito-studio-worker/1.0"
      // Resend blocks requests without a UA (403/1010)
    },
    body: JSON.stringify({ from: `${fromName} <${fromAddr}>`, to: [to], subject, text })
  });
  if (resp.ok)
    return { sent: true };
  return { sent: false, status: resp.status };
}
__name(sendResend2, "sendResend");
function json2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json2, "json");

// src/recipe-unlocks.js
var RECIPE_UNLOCKS = {
  "alcapurrias": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "arepas-de-coco": {
    "sku": "postres-boricuas",
    "link": "https://sofritostudio.gumroad.com/l/postres-boricuas",
    "price": 12,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "arroz-con-dulce": {
    "sku": "postres-boricuas",
    "link": "https://sofritostudio.gumroad.com/l/postres-boricuas",
    "price": 12,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "arroz-con-gandules": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "arroz-con-pollo": {
    "sku": "starter-kit",
    "link": "https://sofritostudio.gumroad.com/l/sofrito-starter-kit",
    "price": 9,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "asopao": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "avena": {
    "sku": "boricua-breakfasts",
    "link": "https://sofritostudio.gumroad.com/l/boricua-breakfasts",
    "price": 12,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "bacalaitos": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "besitos-de-coco": {
    "sku": "postres-boricuas",
    "link": "https://sofritostudio.gumroad.com/l/postres-boricuas",
    "price": 12,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "cafe-con-leche": {
    "sku": "boricua-breakfasts",
    "link": "https://sofritostudio.gumroad.com/l/boricua-breakfasts",
    "price": 12,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "chocolate-caliente": {
    "sku": "boricua-breakfasts",
    "link": "https://sofritostudio.gumroad.com/l/boricua-breakfasts",
    "price": 12,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "chuletas": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "coquito": {
    "sku": "coquito-guide",
    "link": "https://sofritostudio.gumroad.com/l/coquito-guide",
    "price": 12,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "empanadillas": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "flan": {
    "sku": "starter-kit",
    "link": "https://sofritostudio.gumroad.com/l/sofrito-starter-kit",
    "price": 9,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "habichuelas": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "sofrito": {
    "sku": "starter-kit",
    "link": "https://sofritostudio.gumroad.com/l/sofrito-starter-kit",
    "price": 9,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "tostones": {
    "sku": "starter-kit",
    "link": "https://sofritostudio.gumroad.com/l/sofrito-starter-kit",
    "price": 9,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "majarete": {
    "sku": "postres-boricuas",
    "link": "https://sofritostudio.gumroad.com/l/postres-boricuas",
    "price": 12,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "mallorcas": {
    "sku": "boricua-breakfasts",
    "link": "https://sofritostudio.gumroad.com/l/boricua-breakfasts",
    "price": 12,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "mofongo": {
    "sku": "mofongo-course",
    "link": "https://sofritostudio.gumroad.com/l/mofongo-course",
    "price": 29,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "papa-rellena": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "pastelillos": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "pernil": {
    "sku": "starter-kit",
    "link": "https://sofritostudio.gumroad.com/l/sofrito-starter-kit",
    "price": 9,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "pinchos": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "quesitos": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "sancocho": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "sopa-de-fideo": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "surullitos": {
    "sku": "mesa",
    "link": "https://sofritostudio.gumroad.com/l/cmfkg",
    "price": 47,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  },
  "tembleque": {
    "sku": "postres-boricuas",
    "link": "https://sofritostudio.gumroad.com/l/postres-boricuas",
    "price": 12,
    "label": {
      "en": "Get the full guide",
      "es": "Consigue la gu\xEDa completa"
    }
  }
};

// src/index.js
var REDIRECTS = /* @__PURE__ */ new Map([
  // "Buy" short-links -> Gumroad checkout
  ["/buy/starter", "https://sofritostudio.gumroad.com/l/sofrito-starter-kit"],
  ["/buy/mesa", "https://sofritostudio.gumroad.com/l/cmfkg"],
  ["/buy/bundle", "https://sofritostudio.gumroad.com/l/razabs"],
  ["/buy/full-table", "https://sofritostudio.gumroad.com/l/dodbtn"],
  ["/buy/breakfasts", "https://sofritostudio.gumroad.com/l/boricua-breakfasts"],
  ["/buy/coquito", "https://sofritostudio.gumroad.com/l/coquito-guide"],
  ["/buy/mofongo", "https://sofritostudio.gumroad.com/l/mofongo-course"],
  ["/buy/membership", "https://sofritostudio.gumroad.com/l/membership-monthly"],
  // Legacy anchors that moved to new product pages
  ["/products.html#la-mesa-boricua", "/products/la-mesa-boricua-sales.html"],
  ["/products.html#starter-kit", "/products/starter-kit.html"],
  ["/products.html#kitchen-bundle", "/products/kitchen-bundle.html"],
  ["/products.html#full-table", "/products/full-table.html"],
  // A/B "offer" link re-pointable without editing site HTML
  ["/offer", "/products/la-mesa-boricua-sales.html"]
]);
var HASH_REDIRECTS = {
  "starter-kit": "/products/starter-kit.html",
  "la-mesa-boricua": "/products/la-mesa-boricua-sales.html",
  "kitchen-bundle": "/products/kitchen-bundle.html",
  "full-table": "/products/full-table.html"
};
var SITE_URL = "https://sofritostudio.com";
var RECIPES = {
  "/blog/mofongo.html": {
    name: "Mofongo",
    description: "Authentic Puerto Rican mofongo \u2014 green plantains, garlic, and chicharr\xF3n.",
    prepTime: "PT20M",
    cookTime: "PT25M",
    totalTime: "PT45M",
    recipeYield: "4 servings",
    ingredients: ["4 green plantains", "4 garlic cloves", "1/4 cup olive oil", "Salt to taste"],
    steps: ["Peel and cut plantains into chunks.", "Fry until golden, mash with garlic and oil.", "Shape into a dome and serve."]
  },
  "/blog/coquito.html": {
    name: "Coquito",
    description: "Puerto Rican coconut holiday drink with cinnamon and rum.",
    prepTime: "PT10M",
    cookTime: "PT5M",
    totalTime: "PT15M",
    recipeYield: "8 servings",
    ingredients: ["2 cans coconut milk", "1 can condensed milk", "1 can evaporated milk", "1 cup rum", "1 tsp cinnamon"],
    steps: ["Blend all ingredients until smooth.", "Chill for at least 4 hours.", "Serve over ice with cinnamon."]
  }
};
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/health" || path === "/gumroad/webhook" || path === "/api/webhooks/gumroad" || path === "/lead/webhook" || path === "/api/leads" || path === "/api/webhooks/resend") {
      return handleWebhook(request, env, url);
    }
    if (path === "/api/cron/run" && request.method === "GET") {
      if (env.CRON_KEY && request.headers.get("x-cron-key") !== env.CRON_KEY) {
        return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      const forceDigest = url.searchParams.get("digest") === "1";
      const summary = await runAutomation(env, { forceDigest });
      return new Response(JSON.stringify(summary), { headers: { "Content-Type": "application/json" } });
    }
    if (path === "/starter-kit-offer") {
      const url2 = new URL(request.url);
      url2.pathname = "/products/starter-kit.html";
      return env.ASSETS.fetch(new Request(url2, request));
    }
    const target = REDIRECTS.get(path);
    if (target) {
      return Response.redirect(target, 301);
    }
    if (path === "/products.html") {
      return handleHashRedirect(request);
    }
    const cta = await maybeInjectRecipeCta(request, env, path);
    if (cta)
      return cta;
    if (RECIPES[path]) {
      return injectSchema(request, env, path, RECIPES[path]);
    }
    return env.ASSETS.fetch(request);
  },
  // 5) Cron — run the conversion-automation sweep (abandoned cart,
  //    Day 3 upgrade, Day 14 review). Wrangler cron: "0 * * * *".
  async scheduled(event, env, ctx) {
    const summary = await runAutomation(env);
    ctx.waitUntil(Promise.resolve());
    console.log("automation sweep", JSON.stringify(summary));
  }
};
function handleHashRedirect(request) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <script>(function(){var m=${JSON.stringify(HASH_REDIRECTS)};
      var h=(location.hash||"").replace('#','');
      location.replace(m[h]||"/products.html");
    })();<\/script></head><body>Redirecting\u2026</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
__name(handleHashRedirect, "handleHashRedirect");
async function injectSchema(request, env, path, recipe) {
  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html"))
    return response;
  const html = await response.text();
  const schema = JSON.stringify(buildSchema(path, recipe));
  const tag = `
<script type="application/ld+json">${schema}<\/script>
</head>`;
  const injected = html.replace("</head>", tag);
  return new Response(injected, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
__name(injectSchema, "injectSchema");
function buildSchema(path, data) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: data.name,
    description: data.description,
    image: `${SITE_URL}/images/og-default.jpg`,
    author: { "@type": "Person", name: "Josh Ortiz" },
    datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    prepTime: data.prepTime,
    cookTime: data.cookTime,
    totalTime: data.totalTime,
    recipeYield: data.recipeYield,
    recipeCategory: "Puerto Rican",
    recipeCuisine: "Puerto Rican",
    keywords: `${data.name.toLowerCase()}, puerto rican recipe`,
    recipeIngredient: data.ingredients,
    recipeInstructions: data.steps.map((text) => ({ "@type": "HowToStep", text }))
  };
}
__name(buildSchema, "buildSchema");
async function maybeInjectRecipeCta(request, env, path) {
  if (!path.startsWith("/blog/") && !path.startsWith("/es/blog/"))
    return null;
  const slug = path.split("/").pop().replace(".html", "");
  const unlock = RECIPE_UNLOCKS[slug];
  if (!unlock)
    return null;
  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html"))
    return response;
  const html = await response.text();
  const isEs = path.startsWith("/es/");
  const label = isEs ? unlock.label.es : unlock.label.en;
  const cta = buildUnlockCta(unlock, label, isEs);
  const injected = html.replace("</main>", cta + "\n</main>");
  return new Response(injected, {
    status: response.status,
    headers: { ...Object.fromEntries(response.headers), "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(maybeInjectRecipeCta, "maybeInjectRecipeCta");
function buildUnlockCta(unlock, label, isEs) {
  const title = isEs ? "\xBFQuieres la gu\xEDa completa?" : "Want the full guide?";
  const sub = isEs ? "Desbloquea la gu\xEDa completa \u2014 todas las recetas, pasos y swaps del mainland." : "Unlock the full guide \u2014 every recipe, step, and mainland swap, in one download.";
  return '<section class="section"><div class="wrap center"><div class="unlock-cta"><div class="unlock-cta-text"><h3>' + title + "</h3><p>" + sub + '</p></div><a class="btn btn-primary-big" href="' + unlock.link + '" data-cart-add="' + unlock.sku + '">' + label + " \u2014 $" + unlock.price + "</a></div></div></section>";
}
__name(buildUnlockCta, "buildUnlockCta");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-5XmFX7/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-5XmFX7/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
