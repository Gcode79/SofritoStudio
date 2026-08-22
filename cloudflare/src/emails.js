/**
 * Sofrito Studio — email content for the edge webhook
 *
 * Mirrors buttondown/templates/*.md so the Worker can send the same copy.
 * Rendered server-side at the edge (no customer data ever leaves the sale).
 */

// Product "start here" guidance per offer tier (EN/ES)
export const START_HERE = {
  tripwire: {
    en: "Batch the sofrito first — one batch is a month of flavor in the freezer, and it makes every dish easier.",
    es: "Haz un lote de sofrito primero — un lote es un mes de sabor en el congelador y hace cada plato más fácil.",
  },
  core: {
    en: "Start with the sofrito, then arroz con gandules — the two dishes that anchor every Puerto Rican table.",
    es: "Empieza con el sofrito y luego el arroz con gandules — los dos platos que anclan toda mesa boricua.",
  },
  bundle: {
    en: "Start with the sofrito, then arroz con pollo — your first no-fail weeknight dinner.",
    es: "Empieza con el sofrito y luego el arroz con pollo — tu primera cena infalible de entre semana.",
  },
  addon: {
    en: "Start with the sofrito and the coquito — toast your spices first for the deepest holiday flavor.",
    es: "Empieza con el sofrito y el coquito — tuesta las especias primero para el mejor sabor navideño.",
  },
  seasonal: {
    en: "Start with the sofrito and the pernil timeline — everything else on the table follows from there.",
    es: "Empieza con el sofrito y la línea de tiempo del pernil — todo lo demás en la mesa sigue desde ahí.",
  },
  course: {
    en: "Start with the sofrito and fried green plantains — mofongo is all about the mash technique.",
    es: "Empieza con el sofrito y los plátanos verdes fritos — el mofongo es todo técnica de machacar.",
  },
  membership: {
    en: "Welcome to the club — start with the sofrito, then cook this month's featured recipe.",
    es: "Bienvenido al club — empieza con el sofrito y luego cocina la receta destacada del mes.",
  },
  product: {
    en: "Start with the sofrito — it's the base of everything. Master it once and every dish gets a step easier.",
    es: "Empieza con el sofrito — es la base de todo. Domínalo una vez y cada plato se vuelve un paso más fácil.",
  },
};

// What's included, per tier
export const CONTENTS = {
  tripwire: {
    en: "5 essential dishes, bilingual, with mainland ingredient swaps.",
    es: "5 platos esenciales, bilingüe, con swaps de ingredientes para el mainland.",
  },
  core: {
    en: "30 bilingual recipes, ingredient swaps, holiday menus, and a full Nochebuena timeline.",
    es: "30 recetas bilingües, swaps de ingredientes, menús navideños y una línea de tiempo completa de Nochebuena.",
  },
  bundle: {
    en: "The complete cookbook plus every printable — pantry lists, timelines, and cheat sheets.",
    es: "El libro completo más todos los imprimibles — listas de despensa, líneas de tiempo y guías rápidas.",
  },
  addon: {
    en: "The holiday companion — menus, timelines, and the coquito guide.",
    es: "El compañero navideño — menús, líneas de tiempo y la guía del coquito.",
  },
  seasonal: {
    en: "A full holiday menu with step-by-step timeline and printable shopping list.",
    es: "Un menú navideño completo con línea de tiempo paso a paso y lista de compras imprimible.",
  },
  course: {
    en: "The complete video course with recipes and techniques, plus the cookbook.",
    es: "El curso completo en video con recetas y técnicas, más el libro.",
  },
  membership: {
    en: "Member-only recipes and printables, plus every new release.",
    es: "Recetas e imprimibles solo para miembros, más cada nuevo lanzamiento.",
  },
  product: {
    en: "Your new download, ready in your Gumroad library.",
    es: "Tu nueva descarga, lista en tu biblioteca de Gumroad.",
  },
};

// Tier keywords -> tier (mirrors webhook_server/main.py)
const TIER_KEYWORDS = [
  ["tripwire", ["starter", "breakfast", "breakfasts"]],
  ["core", ["la mesa", "mesa", "cookbook"]],
  ["bundle", ["full table", "kitchen bundle", "complete", "bundle"]],
  ["addon", ["add-on", "addon", "holiday & coquito"]],
  ["seasonal", ["thanksgiving", "navidad", "coquito guide", "holiday"]],
  ["membership", ["membership"]],
  ["course", ["mofongo", "course"]],
];

export function tierForProduct(name) {
  const n = (name || "").toLowerCase();
  for (const [tier, keywords] of TIER_KEYWORDS) {
    if (keywords.some((k) => n.includes(k))) return tier;
  }
  return "product";
}

export function slugify(name) {
  const s = (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "product";
}

// Light markdown -> plain text (Gmail/Resend friendly)
function mdToText(md) {
  return md
    .replace(/\*\*/g, "")
    .replace(/^#{1,3}\s*/gm, "")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .split("\n").map((l) => l.trimEnd()).join("\n").trim();
}

const TEMPLATES = {
  post_purchase: {
    en: {
      subject: "{product_name} is yours — welcome to the table!",
      body: `Thanks for grabbing {product_name} — welcome to the family kitchen.

**Your download**
Your files are in your Gumroad library (gumroad.com/library) and in the receipt email from Gumroad. If anything didn't arrive or feels off, just reply to this email and I'll fix it fast.

**Start here**
{tip}

**What you've got**
{contents}

Need help with an ingredient or a step? Hit reply — real person, quick answer. Your order: {product_name}.

Buen provecho,
— The Ortiz kitchen, Sofrito Studio
sofritostudio.com`,
    },
    es: {
      subject: "{product_name} es tuyo — ¡bienvenido a la mesa!",
      body: `Gracias por comprar {product_name} — bienvenido a la cocina de la familia.

**Tu descarga**
Tus archivos están en tu biblioteca de Gumroad (gumroad.com/library) y en el correo de recibo de Gumroad. Si algo no llegó o algo se siente mal, responde a este correo y lo arreglo rápido.

**Empieza aquí**
{tip}

**Lo que tienes**
{contents}

¿Necesitas ayuda con un ingrediente o un paso? Responde a este correo — persona real, respuesta rápida. Tu orden: {product_name}.

Buen provecho,
— La cocina Ortiz, Sofrito Studio
sofritostudio.com`,
    },
  },
  welcome: {
    en: {
      subject: "Your free Puerto Rican recipes are on the way",
      body: `Hola! Welcome to Sofrito Studio — I'm really glad you're here.

Your free Sofrito 101 starter kit is ready to download:

https://sofritostudio.com/freebies/Sofrito-101.pdf

It covers the sofrito base — the flavor foundation of every Puerto Rican dish — with easy mainland ingredient swaps and a 20-minute batch plan for a month of flavor.

Here's how to make the most of the next few days:

1. **Today** — grab your download and read the sofrito base. That's the one recipe everything else builds on.
2. **Tomorrow** — batch it. One batch of sofrito = a month of flavor in the freezer.
3. **Day 3** — cook your first dish: arroz con pollo. You'll feel unstoppable.

If it doesn't arrive, check spam and add us to your contacts so the recipes keep coming.

Buen provecho,
— The Ortiz kitchen, Sofrito Studio
sofritostudio.com`,
    },
    es: {
      subject: "Tus recetas boricuas gratis van en camino",
      body: `¡Hola! Bienvenido a Sofrito Studio — me alegra mucho que estés aquí.

Tu guía gratuita de Sofrito 101 está lista para descargar:

https://sofritostudio.com/freebies/Sofrito-101.pdf

Cubre la base del sofrito — el sabor que le da identidad a cada plato puertorriqueño — con swaps de ingredientes fáciles para el mainland y un plan de lote de 20 minutos para un mes de sabor.

Así aprovechas los próximos días:

1. **Hoy** — descarga la guía y lee la base del sofrito. Esa es la receta sobre la que todo lo demás se construye.
2. **Mañana** — haz un lote grande. Un lote de sofrito = un mes de sabor en el congelador.
3. **Día 3** — cocina tu primer plato: arroz con pollo. Te vas a sentir imparable.

Si no llega, revisa el spam y agréganos a tus contactos para que las recetas sigan llegando.

Buen provecho,
— La cocina Ortiz, Sofrito Studio
sofritostudio.com`,
    },
  },
};

/**
 * Render an email template. Returns { subject, text }.
 * @param {"post_purchase"|"welcome"} name
 * @param {string} lang
 * @param {Record<string,string>} vars
 */
export function renderEmail(name, lang = "en", vars = {}) {
  const t = (TEMPLATES[name] || TEMPLATES.post_purchase)[lang] || TEMPLATES[name].en;
  let subject = t.subject;
  let body = t.body;
  for (const [k, v] of Object.entries(vars)) {
    subject = subject.split(`{${k}}`).join(String(v));
    body = body.split(`{${k}}`).join(String(v));
  }
  return { subject, text: mdToText(body) };
}