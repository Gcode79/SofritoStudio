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
  nurture_swaps: {
    en: {
      subject: "The swap your abuela never had to make",
      body: `Hola! You've got the sofrito base — now here's the part every mainland cook needs: the swaps.

**The swaps that actually work**
- Recao (culantro) missing? Double the cilantro and add a pinch of salt.
- No aji dulce? A sweet banana pepper + a whisper of heat gets you close.
- No gandules? Black-eyed peas or chickpeas, same earthy body.
- No sazon? Paprika + garlic powder + cumin + oregano.

Every recipe in La Mesa Boricua ships with these mainland swaps built in — 30 bilingual recipes, holiday menus, and the full Nochebuena timeline:

https://sofritostudio.com/products/la-mesa-boricua-sales.html

Cooking from Hawaii? We have an island-to-island guide too:
https://sofritostudio.com/blog/hawaii-adaptations.html

Buen provecho,
— The Ortiz kitchen, Sofrito Studio`,
    },
    es: {
      subject: "El swap que tu abuela nunca tuvo que hacer",
      body: `¡Hola! Ya tienes la base de sofrito — ahora viene la parte que todo cocinero del mainland necesita: los swaps.

**Los swaps que de verdad funcionan**
- ¿Falta recao (culantro)? Duplica el cilantro y añade una pizca de sal.
- ¿Sin ají dulce? Un chile banana dulce + un toque de picante se acerca.
- ¿Sin gandules? Guisantes de ojo negro o garbanzos, mismo cuerpo terroso.
- ¿Sin sazón? Pimentón + ajo en polvo + comino + orégano.

Cada receta de La Mesa Boricua incluye estos swaps para el mainland — 30 recetas bilingües, menús navideños y la línea de tiempo completa de Nochebuena:

https://sofritostudio.com/products/la-mesa-boricua-sales.html

¿Cocinas desde Hawái? También tenemos una guía de isla a isla:
https://sofritostudio.com/blog/hawaii-adaptations.html

Buen provecho,
— La cocina Ortiz, Sofrito Studio`,
    },
  },
  nurture_heritage: {
    en: {
      subject: "Keep the tradition alive — wherever you live",
      body: `Hola! This is the part that matters most.

Your abuela's recipes aren't just food — they're your family's story, and every time you cook one, you keep it going.

That's why every recipe here is tested in the Ortiz kitchen, written bilingually, and swap-proofed for mainland and island kitchens. Boricua food shouldn't depend on where you live.

**Ready to go deeper?** La Mesa Boricua is the full 30-recipe cookbook — sofrito to pernil to flan, with every swap and the holiday timeline:

https://sofritostudio.com/products/la-mesa-boricua-sales.html

Or browse the free recipe library:
https://sofritostudio.com/recipe-db.html

Cooks across the diaspora started exactly where you are — one sofrito, one batch, one dish at a time. Yours can be the next one.

Buen provecho,
— Josh, Sofrito Studio`,
    },
    es: {
      subject: "Mantén viva la tradición — dondequiera que vivas",
      body: `¡Hola! Esta es la parte que más importa.

Las recetas de tu abuela no son solo comida — son la historia de tu familia, y cada vez que cocinas una, la mantienes viva.

Por eso cada receta aquí está probada en la cocina Ortiz, escrita en dos idiomas, y a prueba de swaps para el mainland y la isla. La comida boricua no debería depender de dónde vivas.

**¿Listo para ir más profundo?** La Mesa Boricua es el libro completo de 30 recetas — de sofrito a pernil a flan, con cada swap y la línea de tiempo navideña:

https://sofritostudio.com/products/la-mesa-boricua-sales.html

O explora la biblioteca de recetas gratis:
https://sofritostudio.com/recipe-db.html

Cocineros de toda la diáspora empezaron exactamente donde estás — un sofrito, un lote, un plato a la vez. El tuyo puede ser el siguiente.

Buen provecho,
— Josh, Sofrito Studio`,
    },
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

// Tier keywords -> tier (mirrors legacy-webhook-server/main.py)
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
    .replace(/^#{1,3}\s+/gm, "") // headings only when a space follows the hash (keeps "#1")
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
  welcome_15: {
    en: {
      subject: "Your sofrito guide + 15% off the Starter Kit",
      body: `Hola! Here's your Sofrito 101 guide plus a little welcome gift.

**Your free guide**
https://sofritostudio.com/freebies/Sofrito-101.pdf

The sofrito base is the flavor foundation of every Puerto Rican dish — this guide walks you through the ingredients, mainland swaps, and a 20-minute batch plan for a month of flavor.

**Your 15% welcome discount**
Use code **SOFRITO15** for 15% off the $9 Sofrito Starter Kit — your first 5 essential boricua recipes:

https://sofritostudio.com/products/starter-kit.html?coupon=SOFRITO15

The offer's yours for the next 7 days. No rush — the recipes aren't going anywhere.

Buen provecho,
— The Ortiz kitchen, Sofrito Studio
sofritostudio.com`,
    },
    es: {
      subject: "Tu guía de sofrito + 15% de descuento en el Kit de Inicio",
      body: `¡Hola! Aquí tienes tu guía de Sofrito 101 más un pequeño regalo de bienvenida.

**Tu guía gratuita**
https://sofritostudio.com/freebies/Sofrito-101.pdf

La base del sofrito es el sabor que le da identidad a cada plato puertorriqueño — esta guía te lleva por los ingredientes, los swaps para el mainland y un plan de lote de 20 minutos para un mes de sabor.

**Tu descuento de bienvenida del 15%**
Usa el código **SOFRITO15** para 15% de descuento en el Kit de Inicio de $9 — tus primeras 5 recetas boricuas esenciales:

https://sofritostudio.com/products/starter-kit.html?coupon=SOFRITO15

La oferta es tuya por los próximos 7 días. Sin prisa — las recetas no se van a ningún lado.

Buen provecho,
— La cocina Ortiz, Sofrito Studio
sofritostudio.com`,
    },
  },
  abandoned_1h: {
    en: {
      subject: "Did you leave your sofrito base behind?",
      body: `Hola! You were one click away from starting your Puerto Rican cooking journey.

Your cart is still waiting for you:

{recovery_link}

The Starter Kit is 5 essential bilingual recipes — sofrito, arroz con pollo, pernil, tostones, and flan — with mainland ingredient swaps. Instant download, 30-day guarantee.

**Don't forget your 15% code: SOFRITO15** — good on the Starter Kit through this week.

No pressure — but your first boricua dinner is closer than you think.

Buen provecho,
— The Ortiz kitchen, Sofrito Studio`,
    },
    es: {
      subject: "¿Dejaste tu base de sofrito atrás?",
      body: `¡Hola! Estuviste a un clic de empezar tu viaje de cocina puertorriqueña.

Tu carrito te sigue esperando:

{recovery_link}

El Kit de Inicio son 5 recetas esenciales bilingües — sofrito, arroz con pollo, pernil, tostones y flan — con swaps de ingredientes para el mainland. Descarga instantánea, garantía de 30 días.

**No olvides tu código del 15%: SOFRITO15** — válido en el Kit de Inicio durante esta semana.

Sin presión — pero tu primera cena boricua está más cerca de lo que crees.

Buen provecho,
— La cocina Ortiz, Sofrito Studio`,
    },
  },
  abandoned_24h: {
    en: {
      subject: "30,000 home cooks started the same way",
      body: `Hola! A quick note from the kitchen — this is what people say once they start:

> "I grew up eating mofongo but never dared to make it. The Sofrito Starter Kit walks you through the base — so your first batch tastes right."

The kit is 5 recipes, bilingual, and tested in the Ortiz kitchen. Still waiting for you here:

{recovery_link}

**A little incentive:** reply to this email with "BONUS" and I'll add $5 in store credit toward your order — on the house.

The 15% code (SOFRITO15) still applies on the Starter Kit too.

Buen provecho,
— The Ortiz kitchen, Sofrito Studio`,
    },
    es: {
      subject: "30,000 cocineros caseros empezaron igual",
      body: `¡Hola! Una nota rápida de la cocina — esto es lo que dice la gente cuando empieza:

> "Crecí comiendo mofongo pero nunca me atreví a hacerlo. El Kit de Inicio Sofrito te guía por la base — para que tu primer lote sepa bien."

El kit son 5 recetas, bilingüe y probadas en la cocina Ortiz. Te sigue esperando aquí:

{recovery_link}

**Un pequeño incentivo:** responde a este correo con "BONUS" y añado $5 de crédito a tu orden — de parte de la casa.

El código del 15% (SOFRITO15) también sigue válido en el Kit de Inicio.

Buen provecho,
— La cocina Ortiz, Sofrito Studio`,
    },
  },
  day3_upgrade: {
    en: {
      subject: "You're 3 days in — ready to go further?",
      body: `Hola! You've had your {product_name} for a few days now — hope your first batch tasted amazing.

Here's what cooks who started where you did do next: they go deeper.

**Upgrade to {upgrade_name} — {upgrade_credit}**
{upgrade_link}

{upgrade_blurb}

Instant download. 30-day guarantee. If it's not the right fit, reply and we'll sort it out.

Buen provecho,
— The Ortiz kitchen, Sofrito Studio`,
    },
    es: {
      subject: "Llevas 3 días — ¿listo para ir más lejos?",
      body: `¡Hola! Ya tienes tu {product_name} desde hace unos días — espero que tu primer lote haya sido increíble.

Esto es lo que hacen los cocineros que empezaron donde empezaste tú: ir más profundo.

**Mejora a {upgrade_name} — {upgrade_credit}**
{upgrade_link}

{upgrade_blurb}

Descarga instantánea. Garantía de 30 días. Si no es lo correcto, responde y lo resolvemos.

Buen provecho,
— La cocina Ortiz, Sofrito Studio`,
    },
  },
  day14_review: {
    en: {
      subject: "How did your first boricua meal go?",
      body: `Hola! It's been two weeks since your {product_name} purchase.

If you've cooked something from it, I'd love to hear how it went. A two-line review is enough — it genuinely helps other home cooks decide.

Reply to this email with your thoughts (and a photo if you have one!). Or leave a quick rating here:

https://sofritostudio.com/products.html

Thank you for cooking boricua with us — your review keeps the tradition going.

Buen provecho,
— The Ortiz kitchen, Sofrito Studio`,
    },
    es: {
      subject: "¿Cómo te fue con tu primera comida boricua?",
      body: `¡Hola! Ya pasaron dos semanas desde tu compra de {product_name}.

Si has cocinado algo de ahí, me encantaría saber cómo te fue. Una reseña de dos líneas es suficiente — de verdad ayuda a otros cocineros caseros a decidir.

Responde a este correo con tus comentarios (¡y una foto si tienes!). O deja una valoración rápida aquí:

https://sofritostudio.com/products.html

Gracias por cocinar boricua con nosotros — tu reseña mantiene viva la tradición.

Buen provecho,
— La cocina Ortiz, Sofrito Studio`,
    },
  },
  owner_alert: {
    en: {
      subject: "🛒 {product_name} sold — {price}",
      body: `New order on sofritostudio.com.

Product: {product_name}
Price: {price}
Tier: {tier}
Language: {lang}
Origin: {origin}

Day-3 upgrade + Day-14 review sequences are scheduled automatically.

— Sofrito Studio bot`,
    },
    es: {
      subject: "🛒 Se vendió {product_name} — {price}",
      body: `Nueva orden en sofritostudio.com.

Producto: {product_name}
Precio: {price}
Nivel: {tier}
Idioma: {lang}
Origen: {origin}

Las secuencias de mejora del Día 3 y reseña del Día 14 están programadas automáticamente.

— Bot de Sofrito Studio`,
    },
  },
  refund_survey: {
    en: {
      subject: "We're sorry — help us make it right",
      body: `Hola, this is Josh from Sofrito Studio.

I saw a refund came through on your {product_name} order, and honestly — I'd rather know what went wrong than lose you quietly.

If you have two minutes, reply with one line: was it the recipes, the format, or just not the right fit?

Whatever it is, I'll take it seriously. If you'd rather try a different product or the bundle at no extra cost, reply and I'll set it up personally.

Buen provecho,
— Josh, Sofrito Studio`,
    },
    es: {
      subject: "Lo sentimos — ayúdanos a hacerlo bien",
      body: `¡Hola! Soy Josh, de Sofrito Studio.

Vi que llegó un reembolso por tu compra de {product_name}, y honestamente — prefiero saber qué salió mal que perderte en silencio.

Si tienes dos minutos, responde con una línea: ¿fueron las recetas, el formato, o simplemente no era lo correcto?

Sea lo que sea, lo tomo en serio. Si prefieres probar otro producto o el paquete sin costo extra, responde y lo configuro personalmente.

Buen provecho,
— Josh, Sofrito Studio`,
    },
  },
  winback: {
    en: {
      subject: "Your kitchen misses you",
      body: `Hola! It's been a little while since your {product_name} order.

The stove's still warm — and this is the best time to go deeper: upgrade to The Kitchen Bundle and get the full system (cookbook + every printable + meal planners) at your upgrade credit.

{upgrade_link}

Instant download, 30-day guarantee, and your credit is applied automatically. No pressure — the recipes aren't going anywhere.

Buen provecho,
— The Ortiz kitchen, Sofrito Studio`,
    },
    es: {
      subject: "Tu cocina te extraña",
      body: `¡Hola! Ya pasó un tiempo desde tu pedido de {product_name}.

La estufa sigue caliente — y este es el mejor momento para ir más profundo: mejora a The Kitchen Bundle y consigue el sistema completo (libro + todos los imprimibles + planificadores de comidas) con tu crédito de mejora.

{upgrade_link}

Descarga instantánea, garantía de 30 días, y tu crédito se aplica automáticamente. Sin presión — las recetas no se van a ningún lado.

Buen provecho,
— La cocina Ortiz, Sofrito Studio`,
    },
  },
  daily_digest: {
    en: {
      subject: "Sofrito Studio — daily digest {date}",
      body: `Daily summary for {date}:

Revenue: {revenue}
Orders: {orders}
Top product: {top_product}
Course orders: {course_orders}
Subscribers: {subscribers}
Abandoned-cart emails sent: {abandoned_sent}
Refunds today: {refunds}
MTD Revenue: {mtd_revenue} ({mtd_orders} orders)

Top campaigns today:
{campaign_breakdown}

Product breakdown:
{product_breakdown}

**Month-to-Date Top Campaigns:**
{mtd_breakdown}

All sequences (receipt, Day 3, Day 14, win-back) are handled automatically.

— Sofrito Studio bot`,
    },
    es: {
      subject: "Sofrito Studio — resumen diario {date}",
      body: `Resumen diario para {date}:

Ingresos: {revenue}
Órdenes: {orders}
Producto top: {top_product}
Órdenes del curso: {course_orders}
Suscriptores: {subscribers}
Correos de carrito abandonado enviados: {abandoned_sent}
Reembolsos hoy: {refunds}
Ingresos MTD: {mtd_revenue} ({mtd_orders} pedidos)

Mejores campañas hoy:
{campaign_breakdown}

Desglose de productos:
{product_breakdown}

**Mejores campañas del mes a la fecha:**
{mtd_breakdown}

Todas las secuencias (recibo, Día 3, Día 14, win-back) se manejan automáticamente.

— Bot de Sofrito Studio`,
    },
  },
  seasonal: {
    en: {
      subject: "{guide_name} season is here",
      body: `Hola! The holidays are coming, and this is the best time to get ahead of the table.

{guide_name} is ready for you — {guide_blurb}.

Get it here:
{guide_link}

Batched, timed, and stress-free. You'll be glad you started now.

Buen provecho,
— The Ortiz kitchen, Sofrito Studio`,
    },
    es: {
      subject: "Llegó la temporada de {guide_name}",
      body: `¡Hola! Se acercan las fiestas, y este es el mejor momento para adelantarte a la mesa.

{guide_name} está listo para ti — {guide_blurb}.

Consíguelo aquí:
{guide_link}

En lote, con tiempos, y sin estrés. Te alegrarás de haber empezado ya.

Buen provecho,
— La cocina Ortiz, Sofrito Studio`,
    },
  }
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
