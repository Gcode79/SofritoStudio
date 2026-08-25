"""
Sofrito Studio — package-specific follow-up sequences.

Each package group (tier) gets a tailored Day-2 and Day-7 email after
purchase, in addition to the instant post-purchase email. Delivered by
.github/workflows/package-sequences.yml, which queries Gumroad sales and
sends the right sequence for the purchased package.

Content lives here (not the edge worker) because follow-ups are cron-side.
"""

# Tier -> product keywords (mirrors cloudflare/src/webhook.js + worker)
TIER_KEYWORDS = {
    "tripwire": ["starter", "breakfast", "breakfasts"],
    "core": ["la mesa", "mesa", "cookbook"],
    "bundle": ["full table", "kitchen bundle", "complete", "bundle"],
    "addon": ["add-on", "addon", "holiday & coquito"],
    "seasonal": ["thanksgiving", "navidad", "coquito guide", "holiday"],
    "membership": ["membership"],
    "course": ["mofongo", "course"],
}


def tier_for_product(name: str) -> str:
    n = (name or "").lower()
    for tier, keywords in TIER_KEYWORDS.items():
        if any(k in n for k in keywords):
            return tier
    return "product"


def tier_label(tier: str, lang: str) -> str:
    labels = {
        "tripwire": ("your quick guides", "tus guías rápidas"),
        "core": ("your cookbook", "tu libro de cocina"),
        "bundle": ("your bundle", "tu paquete"),
        "addon": ("your holiday companion", "tu compañero navideño"),
        "seasonal": ("your holiday guide", "tu guía navideña"),
        "course": ("your course", "tu curso"),
        "membership": ("your membership", "tu membresía"),
        "product": ("your download", "tu descarga"),
    }
    return labels.get(tier, labels["product"])[0 if lang == "en" else 1]


# ------------------------------------------------------------------
# Day 2 — the first cooking win (per package)
# ------------------------------------------------------------------
D2 = {
    "tripwire": {
        "en": ("Batch the sofrito — the 20-minute trick",
               "One batch of sofrito = a month of flavor in the freezer.\n\n"
               "Grab a big container, double the sofrito recipe, and spend 20 minutes making it once. "
               "Every dish this week gets a step easier.\n\n"
               "That's the habit every boricua home cook swears by — start it now."),
        "es": ("Haz el sofrito en lote — el truco de 20 minutos",
               "Un lote de sofrito = un mes de sabor en el congelador.\n\n"
               "Busca un envase grande, duplica la receta de sofrito y dedica 20 minutos a hacerlo una vez. "
               "Cada plato de esta semana se vuelve un paso más fácil.\n\n"
               "Ese es el hábito de toda cocina boricua — empieza ahora."),
    },
    "core": {
        "en": ("Start with the anchor dish: arroz con gandules",
               "If you only cook one recipe this week, make it arroz con gandules.\n\n"
               "It's the dish that anchors every Puerto Rican table — sofrito, pigeon peas, "
               "and that perfect golden rice. Get the rice right and everything else follows.\n\n"
               "Take a photo and reply — I'd love to see it."),
        "es": ("Empieza con el plato ancla: arroz con gandules",
               "Si solo cocinas una receta esta semana, que sea arroz con gandules.\n\n"
               "Es el plato que ancla toda mesa boricua — sofrito, gandules y ese arroz dorado perfecto. "
               "Si logras el arroz, todo lo demás viene solo.\n\n"
               "Sácale una foto y respóndeme — me encantaría verlo."),
    },
    "bundle": {
        "en": ("The printables are your shortcut",
               "Your bundle came with printables — shopping lists, timelines, cheat sheets.\n\n"
               "Print the pantry checklist and the 20-minute sofrito timeline. Stick them on the fridge. "
               "That's the whole point: less thinking, more cooking.\n\n"
               "Then make arroz con pollo — your first no-fail dinner."),
        "es": ("Los imprimibles son tu atajo",
               "Tu paquete incluye imprimibles — listas de compras, líneas de tiempo, guías rápidas.\n\n"
               "Imprime la lista de despensa y la línea de tiempo del sofrito. Pégalas en la nevera. "
               "Esa es la idea: menos pensar, más cocinar.\n\n"
               "Luego haz arroz con pollo — tu primera cena infalible."),
    },
    "addon": {
        "en": ("Toast your spices first",
               "The secret to the holiday companion: toast your spices before you blend.\n\n"
               "Cinnamon, clove, star anise — 30 seconds in the pan wakes them up completely. "
               "Try it in the coquito and taste the difference.\n\n"
               "That one move upgrades everything in the guide."),
        "es": ("Tuesta las especias primero",
               "El secreto del compañero navideño: tuesta las especias antes de licuar.\n\n"
               "Canela, clavo, anís estrellado — 30 segundos en la sartén los despierta por completo. "
               "Prueba en el coquito y nota la diferencia.\n\n"
               "Ese solo paso mejora todo lo de la guía."),
    },
    "seasonal": {
        "en": ("Start the pernil timeline today",
               "The biggest holiday mistake is starting too late.\n\n"
               "Open your guide's timeline and check today's step — the marinade is where it all starts. "
               "24 hours in the mojo is the difference between good and unforgettable.\n\n"
               "Mark day one on your calendar and commit."),
        "es": ("Empieza la línea de tiempo del pernil hoy",
               "El error más grande de las fiestas es empezar tarde.\n\n"
               "Abre la línea de tiempo de tu guía y revisa el paso de hoy — el marinado es donde todo empieza. "
               "24 horas en el mojo es la diferencia entre bueno e inolvidable.\n\n"
               "Marca el día uno en tu calendario y comprométete."),
    },
    "course": {
        "en": ("Watch Lesson 1 before you cook",
               "Before any cooking: watch Lesson 1 on the sofrito base.\n\n"
               "It's the foundation everything in the course builds on — the batch, the blend, the freeze. "
               "Ten minutes now saves you an hour of fumbling later.\n\n"
               "Then grab plantains — next session is mofongo."),
        "es": ("Mira la Lección 1 antes de cocinar",
               "Antes de cocinar: mira la Lección 1 sobre la base del sofrito.\n\n"
               "Es la base sobre la que todo el curso se construye — el lote, la mezcla, el congelado. "
               "Diez minutos ahora te ahorran una hora de dudas después.\n\n"
               "Luego compra plátanos — la próxima sesión es mofongo."),
    },
    "membership": {
        "en": ("Your first member recipe is waiting",
               "Welcome to the club — your first member-only recipe is up.\n\n"
               "Start with the sofrito base if you haven't, then cook this month's featured dish. "
               "New recipes drop every month, and you get every future release as part of this.\n\n"
               "Reply with what you're cooking — I read everything."),
        "es": ("Tu primera receta de miembro te espera",
               "Bienvenido al club — tu primera receta solo para miembros ya está publicada.\n\n"
               "Empieza con la base del sofrito si aún no lo has hecho, y luego cocina el plato destacado del mes. "
               "Cada mes llegan recetas nuevas, y todos los lanzamientos futuros son parte de esto.\n\n"
               "Responde con lo que estás cocinando — leo todo."),
    },
    "product": {
        "en": ("Start with the sofrito",
               "No matter which dish you tackle first, start with the sofrito.\n\n"
               "It's the flavor base of everything in your download — make it once, taste the difference, "
               "and every recipe gets a step easier.\n\n"
               "Then pick your first dish and go."),
        "es": ("Empieza con el sofrito",
               "Sin importar qué plato hagas primero, empieza con el sofrito.\n\n"
               "Es la base de sabor de todo lo que hay en tu descarga — hazlo una vez, nota la diferencia "
               "y cada receta se vuelve un paso más fácil.\n\n"
               "Luego elige tu primer plato y dale."),
    },
}

# ------------------------------------------------------------------
# Day 7 — next step + a personal note
# ------------------------------------------------------------------
D7 = {
    "tripwire": {
        "en": ("Ready for the next level?",
               "A week in — how's it going? The 5 essential dishes are under your belt by now.\n\n"
               "When you're ready for more, La Mesa Boricua is the full cookbook: 30 bilingual recipes, "
               "ingredient swaps, and holiday menus.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Reply anytime — I'm here."),
        "es": ("¿Listo para el siguiente nivel?",
               "Una semana adentro — ¿cómo va? Los 5 platos esenciales ya están bajo tu brazo.\n\n"
               "Cuando estés listo para más, La Mesa Boricua es el libro completo: 30 recetas bilingües, "
               "swaps de ingredientes y menús navideños.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Responde cuando quieras — estoy aquí."),
    },
    "core": {
        "en": ("What did you cook this week?",
               "A week in — have you made the arroz con gandules yet? I want to hear about it.\n\n"
               "Once you've got the base dishes down, the Nochebuena menu in your cookbook is the next "
               "big win — it's the chapter readers come back to every year.\n\n"
               "Reply with a photo or a question. Buen provecho."),
        "es": ("¿Qué cocinaste esta semana?",
               "Una semana adentro — ¿ya hiciste el arroz con gandules? Quiero saber.\n\n"
               "Cuando domines los platos base, el menú de Nochebuena de tu libro es la próxima gran "
               "victoria — es el capítulo al que los lectores vuelven cada año.\n\n"
               "Responde con una foto o una pregunta. Buen provecho."),
    },
    "bundle": {
        "en": ("The Full Table is the complete experience",
               "You've got the bundle — here's how to get everything out of it.\n\n"
               "The 50 no-recipe 30-minute dinners are the weeknight engine; the printables keep your "
               "pantry stocked. Run both for a week and feel the difference.\n\n"
               "https://sofritostudio.com/products/full-table.html\n\n"
               "Tell me how week one went."),
        "es": ("La Mesa Completa es la experiencia total",
               "Tienes el paquete — así sacas todo de él.\n\n"
               "Las 50 cenas de 30 minutos sin receta son el motor de la semana; los imprimibles mantienen "
               "tu despensa llena. Combínalos una semana y nota la diferencia.\n\n"
               "https://sofritostudio.com/products/full-table.html\n\n"
               "Cuéntame cómo fue la primera semana."),
    },
    "addon": {
        "en": ("Make it a full holiday spread",
               "Your holiday companion pairs best with the cookbook's Nochebuena menu.\n\n"
               "Run the timeline from the cookbook and slot in the coquito from your companion — "
               "that's the full spread, no stress.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Happy cooking — share a photo if you make it."),
        "es": ("Haz una mesa navideña completa",
               "Tu compañero navideño combina perfecto con el menú de Nochebuena del libro.\n\n"
               "Sigue la línea de tiempo del libro y agrega el coquito de tu compañero — "
               "esa es la mesa completa, sin estrés.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Feliz cocina — comparte una foto si lo haces."),
    },
    "seasonal": {
        "en": ("The table is almost ready",
               "A week out and you've followed the timeline — the table is going to be incredible.\n\n"
               "Final tip: prep the sides the day before so the big day is just the star dishes. "
               "Your guide has the exact list.\n\n"
               "Share a photo of your table when it comes together. Feliz Navidad."),
        "es": ("La mesa casi está lista",
               "A una semana y siguiendo la línea de tiempo — la mesa va a estar increíble.\n\n"
               "Tip final: prepara los acompañantes el día antes para que el gran día sea solo el plato "
               "principal. Tu guía tiene la lista exacta.\n\n"
               "Comparte una foto de tu mesa cuando esté lista. Feliz Navidad."),
    },
    "course": {
        "en": ("You've got the mash — now the whole course",
               "A week in, the mofongo technique should feel natural.\n\n"
               "The rest of the course builds on it — each lesson one skill you'll keep forever. "
               "Finish lesson 5 and you'll cook like you've been at this for years.\n\n"
               "Reply with your best mofongo photo. Buen provecho."),
        "es": ("Ya tienes la técnica — ahora el curso completo",
               "Una semana adentro, la técnica del mofongo ya debería sentirse natural.\n\n"
               "El resto del curso se construye sobre ella — cada lección es una habilidad para siempre. "
               "Termina la lección 5 y cocinarás como si llevaras años en esto.\n\n"
               "Responde con tu mejor foto de mofongo. Buen provecho."),
    },
    "membership": {
        "en": ("A month of member recipes awaits",
               "One week in — the monthly recipe drop is the rhythm of this club.\n\n"
               "Each month brings a new dish, printable, and seasonal bonus. Mark your calendar for "
               "the first of the month and cook along.\n\n"
               "Questions, requests, or a photo of what you made — reply anytime."),
        "es": ("Un mes de recetas de miembro te espera",
               "Una semana adentro — el lanzamiento mensual de recetas es el ritmo de este club.\n\n"
               "Cada mes llega un plato nuevo, imprimible y bonus de temporada. Marca el día 1 del mes "
               "en tu calendario y cocina junto con nosotros.\n\n"
               "Preguntas, pedidos o una foto de lo que hiciste — responde cuando quieras."),
    },
    "product": {
        "en": ("One week in — what's next?",
               "A week in, you've had time for at least one dish. How did it go?\n\n"
               "When you're ready to go deeper, La Mesa Boricua is the full cookbook readers love — "
               "30 bilingual recipes and holiday menus.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Reply with a question or a photo. I read everything."),
        "es": ("Una semana adentro — ¿y ahora?",
               "Una semana adentro, ya tuviste tiempo para al menos un plato. ¿Cómo fue?\n\n"
               "Cuando quieras ir más profundo, La Mesa Boricua es el libro completo que los lectores aman — "
               "30 recetas bilingües y menús navideños.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Responde con una pregunta o una foto. Leo todo."),
    },
}


# ------------------------------------------------------------------
# Day 14 — next step / upsell (per package)
# ------------------------------------------------------------------
D14 = {
    "tripwire": {
        "en": ("Two weeks in — time for the full table",
               "Two weeks of boricua cooking under your belt. That's the habit forming.\n\n"
               "When you're ready for the complete experience, La Mesa Boricua is the cookbook "
               "readers come back to: 30 bilingual recipes, ingredient swaps, and holiday menus.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "No pressure — just know it's there when you are. Reply with any question."),
        "es": ("Dos semanas adentro — es hora de la mesa completa",
               "Dos semanas de cocina boricua bajo tu brazo. Ese es el hábito formándose.\n\n"
               "Cuando estés listo para la experiencia completa, La Mesa Boricua es el libro al que "
               "los lectores vuelven: 30 recetas bilingües, swaps de ingredientes y menús navideños.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Sin presión — solo que sepas que está ahí cuando quieras. Responde con cualquier pregunta."),
    },
    "core": {
        "en": ("Ready to go deeper? The Full Table",
               "You've had two weeks with the cookbook — the base dishes should feel like home now.\n\n"
               "The Full Table takes it further: everything in La Mesa Boricua plus 50 no-recipe "
               "30-minute dinners and every printable.\n\n"
               "https://sofritostudio.com/products/full-table.html\n\n"
               "Tell me how the first two weeks went — I genuinely want to know."),
        "es": ("¿Listo para ir más profundo? La Mesa Completa",
               "Llevas dos semanas con el libro — los platos base ya deberían sentirse como en casa.\n\n"
               "La Mesa Completa va más lejos: todo lo de La Mesa Boricua más 50 cenas de 30 minutos "
               "sin receta y todos los imprimibles.\n\n"
               "https://sofritostudio.com/products/full-table.html\n\n"
               "Cuéntame cómo fueron las primeras dos semanas — de verdad quiero saber."),
    },
    "bundle": {
        "en": ("The next layer: membership",
               "Two weeks in, you've got the whole toolkit. The next layer is the membership.\n\n"
               "Member-only recipes and printables every month, plus every new release — it keeps "
               "your kitchen fresh all year.\n\n"
               "https://sofritostudio.com/products/membership-monthly.html\n\n"
               "And if you ever have a question, reply — I answer everything."),
        "es": ("La siguiente capa: la membresía",
               "Dos semanas adentro, ya tienes todo el arsenal. La siguiente capa es la membresía.\n\n"
               "Recetas e imprimibles solo para miembros cada mes, más cada lanzamiento — mantiene "
               "tu cocina fresca todo el año.\n\n"
               "https://sofritostudio.com/products/membership-monthly.html\n\n"
               "Y si alguna vez tienes una pregunta, responde — respondo todo."),
    },
    "addon": {
        "en": ("Two weeks in — let's build the spread",
               "Your holiday companion is in good hands. Here's the natural next step.\n\n"
               "Pair it with the full Nochebuena menu in La Mesa Boricua — the timeline, the "
               "printables, everything in one place.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Send me a photo when your holiday table comes together."),
        "es": ("Dos semanas adentro — armemos la mesa",
               "Tu compañero navideño está en buenas manos. Aquí el paso natural.\n\n"
               "Combínalo con el menú completo de Nochebuena de La Mesa Boricua — la línea de tiempo, "
               "los imprimibles, todo en un lugar.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Mándame una foto cuando tu mesa navideña esté lista."),
    },
    "seasonal": {
        "en": ("The season passed — keep the skills",
               "The holidays came and went, and you cooked like a pro. Keep going.\n\n"
               "Those same techniques carry through every season — and the membership delivers a "
               "new dish and printable every month so the kitchen stays alive year-round.\n\n"
               "https://sofritostudio.com/products/membership-monthly.html\n\n"
               "Here's to year-round flavor. Buen provecho."),
        "es": ("Pasó la temporada — conserva las habilidades",
               "Llegaron y se fueron las fiestas, y cocinaste como un profesional. Sigue así.\n\n"
               "Esas mismas técnicas sirven toda la temporada — y la membresía trae un plato nuevo "
               "e imprimible cada mes para que la cocina siga viva todo el año.\n\n"
               "https://sofritostudio.com/products/membership-monthly.html\n\n"
               "Por el sabor todo el año. Buen provecho."),
    },
    "course": {
        "en": ("You've finished a course's worth of cooking",
               "Two weeks in, the lessons are landing. That's real progress.\n\n"
               "If you want to keep building, the membership adds member recipes and printables "
               "every month — and La Mesa Boricua pairs perfectly with what you've learned.\n\n"
               "https://sofritostudio.com/products/membership-monthly.html\n\n"
               "Show me what you've made — I love seeing it."),
        "es": ("Ya cocinaste el equivalente de un curso",
               "Dos semanas adentro, las lecciones están calando. Eso es progreso real.\n\n"
               "Si quieres seguir construyendo, la membresía suma recetas e imprimibles de miembros "
               "cada mes — y La Mesa Boricua combina perfecto con lo que aprendiste.\n\n"
               "https://sofritostudio.com/products/membership-monthly.html\n\n"
               "Muéstrame lo que hiciste — me encanta verlo."),
    },
    "membership": {
        "en": ("Two weeks in — this is your club",
               "Two weeks in, this club is yours. Here's what to expect: a new recipe, a printable, "
               "and a seasonal bonus every month.\n\n"
               "Share the love — refer a friend and they get 10% off their first month, you get a "
               "free month. Reply and I'll set you up.\n\n"
               "Most of all: keep cooking. It's the best part."),
        "es": ("Dos semanas adentro — este es tu club",
               "Dos semanas adentro, este club es tuyo. Esto es lo que viene: una receta nueva, un "
               "imprimible y un bonus de temporada cada mes.\n\n"
               "Comparte el amor — recomienda a un amigo y recibe 10% en su primer mes, tú ganas un "
               "mes gratis. Responde y te lo activo.\n\n"
               "Sobre todo: sigue cocinando. Es la mejor parte."),
    },
    "product": {
        "en": ("Two weeks in — here's where to go next",
               "Two weeks in, your download is serving you well. Here's the natural next step.\n\n"
               "La Mesa Boricua is the full cookbook: 30 bilingual recipes, ingredient swaps, and "
               "holiday menus — everything that made you try this in the first place, amplified.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Reply with any question — I read every message."),
        "es": ("Dos semanas adentro — aquí está tu siguiente paso",
               "Dos semanas adentro, tu descarga te está rindiendo. Aquí el paso natural.\n\n"
               "La Mesa Boricua es el libro completo: 30 recetas bilingües, swaps de ingredientes y "
               "menús navideños — todo lo que te hizo probar esto, amplificado.\n\n"
               "https://sofritostudio.com/products/la-mesa-boricua-sales.html\n\n"
               "Responde con cualquier pregunta — leo cada mensaje."),
    },
}


def sequence_email(tier: str, day: int, lang: str, product_name: str = "") -> tuple[str, str]:
    """Return (subject, body) for the package's Day-N follow-up."""
    table = D2 if day == 2 else (D7 if day == 7 else D14)
    entry = table.get(tier, table["product"])
    subj, body = entry[lang]
    return subj, body + f"\n\n— The Ortiz kitchen, Sofrito Studio"
