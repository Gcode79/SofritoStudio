# -*- coding: utf-8 -*-
"""Build EPUB3 for Boricua Weeknights from the PDF's structured content.
Mirrors the existing guide EPUBs (mimetype-first zip, nav.xhtml, styled XHTML,
legal footer on every page)."""
import uuid
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "deploy" / "products" / "printables" / "Boricua-Weeknights.epub"
SRC_OUT = ROOT / "products" / "printables" / "Boricua-Weeknights.epub"

TITLE = "Boricua Weeknights — 14 Mainland-Proof Dinners"
LEGAL = ("© 2026 Sofrito Studio (sofritostudio.com). All rights reserved. "
         "La Mesa Boricua / Cocina Boricua Digital Series. No part of this "
         "publication may be reproduced, distributed, or transmitted in any "
         "form or by any means — electronic, mechanical, photocopying, "
         "recording, or otherwise — without prior written permission from the "
         "publisher.")

ACCENT = "#C03D2A"
GOLD = "#9A7318"
INK = "#2B2118"
SOFT = "#6B5B4C"
CREAM = "#FFF7EE"

CSS = f"""body {{ font-family: Georgia, 'Times New Roman', serif; line-height: 1.55;
  color: {INK}; margin: 5%; }}
h1 {{ color: {ACCENT}; font-size: 1.5em; border-bottom: 2px solid {GOLD};
  padding-bottom: 0.25em; }}
h2 {{ color: {GOLD}; font-size: 1.2em; margin-top: 1.5em; }}
h3 {{ color: {INK}; font-size: 1.05em; margin-top: 1.2em; }}
.meta {{ font-style: italic; color: {SOFT}; font-size: 0.9em; }}
.cover {{ text-align: center; }}
.cover h1 {{ border: none; font-size: 1.8em; margin-top: 2em; }}
.cover .sub {{ color: {INK}; font-size: 1.1em; }}
.cover .intro {{ color: {INK}; margin: 2em 1em; font-size: 1em; }}
ul {{ margin: 0; padding-left: 1.2em; }}
ol {{ padding-left: 1.4em; }}
li {{ margin-bottom: 0.4em; }}
table {{ border-collapse: collapse; width: 100%; margin: 1em 0; }}
th, td {{ border: 1px solid {GOLD}; padding: 0.4em 0.6em; text-align: left;
  font-size: 0.92em; }}
th {{ background: {CREAM}; }}
.legal {{ margin-top: 2em; padding-top: 0.75em; border-top: 1px solid {GOLD};
  font-size: 0.72em; color: {SOFT}; font-style: italic; }}
.step {{ margin-bottom: 0.8em; }}
.step b {{ color: {ACCENT}; }}
.blocks {{ background: {CREAM}; padding: 0.8em 1em; border-left: 3px solid {GOLD};
  margin: 1em 0; }}
"""


def page(title, body, cls=""):
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>{title}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
<div class="{cls}">
{body}
<div class="legal">{LEGAL}</div>
</div>
</body>
</html>"""


def build():
    pages = {}

    # Cover
    pages["cover.xhtml"] = page("Cover", f"""
    <h1>Boricua Weeknights</h1>
    <p class="sub">Ortiz family recipes on your table in 30 minutes, every night — no recipe required.</p>
    <p class="intro">The 6-step planning-to-table workflow · The 30-minute template that makes any dinner ·
    50 "no-recipe" dinners, five categories · Grocery-to-menu matching tool · Pantry checklist + shopping trip planner.</p>
    <p class="meta">Bilingual EN/ES · Mainland-tested · From the Ortiz kitchen · sofritostudio.com</p>
    """, "cover")

    # 2 — The 6-Step Workflow
    steps = [
        ("1", "Master the base", "20 MIN, ONCE A MONTH",
         "Batch your sofrito and freeze 28 cubes. This is the engine of the whole system — every single dinner starts with one cube."),
        ("2", "Stock the pantry", "20 MIN, ONCE A MONTH",
         "Check the pantry list and top up. Rice, beans, sofrito, oil, garlic and onions cover 80% of the 50 dinners."),
        ("3", "Plan from the 50", "10 MIN, SUNDAY",
         "Pick 3–5 dinners from the 50 list. Write them on the weekly planner — done in minutes because there's no recipe to read."),
        ("4", "Match to your fridge", "2 MIN",
         "Use the matching tool: what you already have decides tonight. Leftover rice? You're 20 minutes from mampostiao."),
        ("5", "Prep the base", "60 MIN, SUNDAY",
         "One pot of arroz blanco, one pot of habichuelas, one tray of seasoned chicken. Pre-cooked bases turn 30-minute dinners into 15."),
        ("6", "Cook the template", "30 MIN, EVERY NIGHT",
         "Never memorize a recipe again — run the 30-minute template. Sofrito + protein + starch + rest, every time."),
    ]
    s_html = "".join(
        f'<div class="step"><p><b>STEP {n} — {name}</b> · <span class="meta">{t}</span></p>'
        f'<p>{d}</p></div>' for n, name, t, d in steps)
    pages["workflow.xhtml"] = page("The 6-Step Workflow", f"""
    <h1>The 6-Step Workflow</h1>
    <p class="meta">Del plan a la mesa, sin estrés</p>
    <p>Boricua cooking isn't hard — it's built on one base and a lot of repetition. Do these six steps once, and dinner answers itself all week.</p>
    {s_html}
    <div class="blocks"><p><b>The weekly rhythm:</b> Sunday = plan + prep (90 min total). Monday–Friday = cook only (30 min). Saturday = the fun one — mofongo, alcapurrias, or a proper pernil day.</p></div>
    """)

    # 3 — The 30-Minute Template
    template = [
        ("1 — SOFRITO", "The base", "1 cube in hot oil", "2 min"),
        ("2 — PROTEIN", "The star", "chicken, beef, pork, fish, beans", "5–8 min"),
        ("3 — SAUCE", "The flavor", "tomato, broth, olives, calabaza", "5 min"),
        ("4 — STARCH", "The comfort", "pre-made rice, or rice into the pot", "10–15 min"),
        ("5 — REST", "The payoff", "5 min off heat, then fluff &amp; plate", "5 min"),
    ]
    t_rows = "".join(
        f"<tr><td><b>{n}</b></td><td>{r}</td><td>{d}</td><td>{t}</td></tr>"
        for n, r, d, t in template)
    pages["template.xhtml"] = page("The 30-Minute Template", f"""
    <h1>The 30-Minute Template</h1>
    <p class="meta">La plantilla que nunca falla</p>
    <p>Every boricua weeknight dinner is this same five-move pattern with different players. Learn the template, and the 50 dinners write themselves.</p>
    <table>
      <tr><th>Move</th><th>Role</th><th>Players</th><th>Time</th></tr>
      {t_rows}
    </table>
    <h3>Swap any player</h3>
    <p><b>Protein:</b> chicken, ground beef, pork chops, fish, shrimp, beans</p>
    <p><b>Sauce:</b> tomato sauce, broth, sofrito + water, calabaza purée</p>
    <p><b>Starch:</b> arroz blanco, gandules rice, leftover rice, tostones</p>
    <div class="blocks"><p><b>Seasoning shortlist:</b> adobo on every protein (the default) · sazón for color in rice and guisos · oregano + bay leaf for stews · alcaparrado whenever you want a pop.</p>
    <p><b>Pro tip:</b> if the protein is pre-seasoned, skip the adobo — you're already at 20 minutes.</p></div>
    """)

    # 4 + 5 — The 50 No-Recipe Dinners
    cats = [
        ("A · ARROZ & HABICHUELAS (1–10)", [
            "Arroz con Pollo — chicken, sofrito, rice, broth",
            "Arroz con Gandules — gandules, sofrito, rice",
            "Arroz con Salchichas — sausages, tomato, rice",
            "Arroz Blanco + Habichuelas — the daily plate",
            "Mampostiao — leftover rice + beans, fried crisp",
            "Mampostiao + Pollo Guisado — double leftovers, double win",
            "Arroz con Bacalao — salt cod, sofrito, rice",
            "Arroz con Maíz Dulce — sweet corn folded in",
            "Arroz con Frijoles Negros — island-style black beans",
            "Arroz con Cilantro y Ajo — bright green side-star as a main",
        ]),
        ("B · GUISOS & ONE-POTS (11–20)", [
            "Pollo Guisado — stewed chicken, potato, calabaza",
            "Carne Guisada — stewed beef, deep color",
            "Habichuelas con Papa — beans + potatoes, thicker sauce",
            "Bacalao Guisado — salt cod, peppers, tomato",
            "Sancocho de Res — roots + corn, a Sunday-long one",
            "Picadillo — ground beef, olives, raisins",
            "Picadillo con Huevo Frito — the crowning fried egg",
            "Pollo en Salsa — saucy chicken over rice",
            "Costillas Guisadas — stewed ribs, fall-apart",
            "Chuletas Guisadas — pork chops in guiso",
        ]),
        ("C · SKILLET, GRILL & FRITURA MAINS (21–30)", [
            "Bistec Encebollado — steak + onions, plate licking",
            "Chuletas a la Plancha + Maduros — grilled chops, sweet plantain",
            "Pollo al Horno + Amarillos — baked adobo chicken",
            "Pollo Frito + Tostones — the kiosk combo at home",
            "Mofongo con Sopa de Pollo — plantain dome + broth",
            "Mofongo Relleno de Camarones — stuffed, saucy shrimp",
            "Tostones con Guiso — crisp disks + beef stew",
            "Sorullos con Queso — cornmeal sticks, cheese core",
            "Bacalaitos con Aguacate — cod fritters + creamy avocado",
            "Alcapurrias Night — batch-fry a big platter",
        ]),
        ("D · EGGS, QUICK & BREAKFAST-FOR-DINNER (31–40)", [
            "Huevos Revueltos + Salchichas + Amarillos — the 15-minute plate",
            "Tortilla de Papa y Cebolla — the Spanish classic, boricua-style",
            "Huevos Guisados con Arroz — eggs in guiso over rice",
            "Revuelto de Bacalao — salt cod + eggs scramble",
            "Arepas de Maíz con Queso — corn cakes, melty center",
            "Sándwich de Pernil — leftover roast + mayo-kétchup",
            "Quesadilla Boricua — pernil or pollo + maduros inside",
            "Pizza de Tostones — plantain rounds, sauce, cheese",
            "Arroz Frito Boricua — leftover rice, egg, peas, sofrito",
            "Empanadillas — frozen dough + any guiso filling",
        ]),
        ("E · SEAFOOD & MEATLESS (41–50)", [
            "Camarones al Ajillo — garlic shrimp, fast",
            "Camarones Guisados — shrimp in guiso + rice",
            "Pescado Guisado — white fish, tomato, olives",
            "Pescado Frito + Tostones — the beach-plate dinner",
            "Sopa de Mariscos — seafood stew, island warmth",
            "Habichuelas con Calabaza — vegan guiso, creamy depth",
            "Arroz con Gandules Vegetariano — skip the pork, keep the flavor",
            "Ensalada de Garbanzos — chickpeas, olive oil, lime",
            "Mofongo Vegano + Guiso de Habichuelas — no chicharrón, all soul",
            "Arroz con Coco — sweet-salty island rice, alone it wins",
        ]),
    ]
    cats_html = ""
    for name, items in cats:
        cats_html += f"<h2>{name}</h2><ul>" + "".join(f"<li>{i}</li>" for i in items) + "</ul>"
    pages["fifty.xhtml"] = page("The 50 No-Recipe Dinners", f"""
    <h1>The 50 No-Recipe Dinners</h1>
    <p class="meta">No measuring. No cards. Each line is a pattern your sofrito cube already knows how to run.</p>
    {cats_html}
    <div class="blocks"><p>That's the fifty. Five categories, ten each. You only ever need three a week — the other forty-seven are insurance against a boring Monday.</p></div>
    """)

    # 6 — Grocery-to-Menu Matching Tool
    match = [
        ("Chicken + rice + sofrito", "Arroz con Pollo (1)"),
        ("Ground beef + sofrito + olives", "Picadillo (16) — or stuffed empanadillas (40)"),
        ("Pork chops + sofrito", "Chuletas Guisadas (20)"),
        ("White fish or shrimp + sofrito", "Pescado/Camarones Guisados (42–43)"),
        ("Shrimp + garlic + butter", "Camarones al Ajillo (41)"),
        ("Pink beans + calabaza", "Habichuelas con Calabaza (46)"),
        ("Leftover arroz blanco + beans", "Mampostiao (5)"),
        ("Leftover rice + eggs + peas", "Arroz Frito Boricua (39)"),
        ("Green plantains + broth", "Mofongo con Sopa de Pollo (25)"),
        ("Ripe plantains + eggs + salchichas", "Huevos + Amarillos (31)"),
        ("Salt cod + tomato + peppers", "Bacalao Guisado (14)"),
        ("Salt cod + flour + cornmeal", "Bacalaitos (29)"),
        ("Frozen empanada dough + any guiso", "Empanadillas (40)"),
        ("Black beans + rice", "Arroz con Frijoles Negros (9)"),
        ("Cornmeal + cheese", "Sorullos (28)"),
        ("Leftover pernil", "Sándwich de Pernil (36) — celebrate"),
    ]
    m_rows = "".join(f"<tr><td>{a}</td><td><b>{b}</b></td></tr>" for a, b in match)
    pages["matching.xhtml"] = page("Grocery-to-Menu Matching Tool", f"""
    <h1>Grocery-to-Menu Matching Tool</h1>
    <p class="meta">Qué tienes en la nevera → qué cenas</p>
    <p>The reverse way to plan: look at what you actually have, not what a recipe demands. Tonight's dinner is one row away.</p>
    <table>
      <tr><th>In your fridge / pantry</th><th>Tonight's dinner</th></tr>
      {m_rows}
    </table>
    <p class="meta">How to use it: scan the left column before you shop. Whatever you land on three times = your three dinners this week. The tool kills the "what's for dinner?" panic because it starts from the truth of your fridge.</p>
    """)

    # 7 — Pantry Staple Checklist
    pantry = {
        "Bases & seasonings": ["Sofrito cubes (28 in the freezer)", "Sazón with annatto", "Adobo",
                               "Dried oregano & bay leaves", "Ground cumin & coriander", "Black pepper & salt",
                               "Garlic (always two heads)"],
        "Rice & beans": ["Medium-grain rice (5 lb)", "Canned gandules (pigeon peas)", "Pink beans, canned or dried",
                         "Black beans", "Chickpeas (garbanzos)"],
        "Cans & jars": ["Tomato sauce", "Tomato paste", "Diced tomatoes", "Alcaparrado (olives + capers)",
                        "Chicken & beef broth", "Olive oil & canola oil", "Distilled vinegar",
                        "Mayonnaise & ketchup (the classic sauce)"],
        "Fresh (weekly)": ["Yellow onions", "Green & red bell peppers", "Fresh cilantro / culantro",
                           "Green plantains", "Ripe plantains", "Calabaza (tropical pumpkin)",
                           "Potatoes", "Limes & avocados"],
        "Frozen & fridge": ["Chicken thighs & breasts", "Ground beef & pork chops", "Shrimp (quick thaw)",
                            "Vienna sausages / smoked links", "Eggs (dozen)", "Frozen empanada dough",
                            "Butter & queso blanco"],
        "Weekend & holidays": ["Pork shoulder (pernil)", "Salt cod (bacalao)", "Cornmeal", "All-purpose flour",
                               "Coconut milk", "Condensed & evaporated milk", "White rum (coquito season)"],
    }
    p_html = "".join(
        f"<h2>{name}</h2><ul>" + "".join(f"<li>{i}</li>" for i in items) + "</ul>"
        for name, items in pantry.items())
    pages["pantry.xhtml"] = page("Pantry Staple Checklist", f"""
    <h1>Pantry Staple Checklist</h1>
    <p class="meta">Lo que siempre tienes que tener</p>
    <p>Stock this once and 80% of the 50 dinners are always an option. Print it, magnet it to the fridge, cross things off as you run low.</p>
    {p_html}
    """)

    # 8 — Shopping Trip Planner
    pages["shopping.xhtml"] = page("Shopping Trip Planner", f"""
    <h1>Shopping Trip Planner</h1>
    <p class="meta">Una sola vuelta, toda la semana</p>
    <p>One trip a week, never a sad empty fridge on a Tuesday. Fill this in Sunday, shop Monday, cook all week.</p>
    <ol>
      <li>Menu picks (from the 50)</li>
      <li>Out of pantry stock?</li>
      <li>Produce this week</li>
      <li>Protein</li>
      <li>Frozen &amp; fridge</li>
      <li>Everything else</li>
    </ol>
    <h3>This week's menu</h3>
    <ul>
      <li>Monday:</li><li>Tuesday:</li><li>Wednesday:</li>
      <li>Thursday:</li><li>Friday:</li><li>Saturday (the fun one):</li>
    </ul>
    <div class="blocks"><p>Copy the whole system to your fridge: print the pantry checklist, the matching tool, and this planner — three pages, zero decision fatigue all month.</p></div>
    """)

    # 9 — Back cover / upsell
    pages["back.xhtml"] = page("The System", f"""
    <h1>The System</h1>
    <p>You've got fifty dinners in your back pocket.</p>
    <p>Plan once on Sunday, prep for an hour, cook 30 minutes a night — no recipes, no panic, no cereal for dinner.</p>
    <ul>
      <li>+ La Mesa Boricua — full 30-recipe cookbook $47</li>
      <li>+ The Kitchen Bundle — printables pack $67</li>
      <li>The Full Table — cookbook + weeknights + printables $97</li>
      <li>Mofongo &amp; More — the 6-week course $197</li>
    </ul>
    <p class="meta">¡Pa'lante! Plan it, cook it, enjoy it. Con amor, de la cocina Ortiz.</p>
    """)

    # Build EPUB (mimetype first, stored)
    nav_items = [
        ("cover.xhtml", "Cover"), ("workflow.xhtml", "The 6-Step Workflow"),
        ("template.xhtml", "The 30-Minute Template"), ("fifty.xhtml", "The 50 No-Recipe Dinners"),
        ("matching.xhtml", "Grocery-to-Menu Matching Tool"), ("pantry.xhtml", "Pantry Staple Checklist"),
        ("shopping.xhtml", "Shopping Trip Planner"), ("back.xhtml", "The System"),
    ]
    nav_li = "".join(f'<li><a href="{f}">{t}</a></li>' for f, t in nav_items)
    nav = f"""<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Contents</title></head>
<body><nav epub:type="toc"><h1>Contents</h1><ol>{nav_li}</ol></nav></body>
</html>"""
    pages["nav.xhtml"] = nav

    manifest = "".join(
        f'<item id="{Path(f).stem}" href="{f}" media-type="application/xhtml+xml"/>' for f, _ in nav_items)
    manifest += '<item id="css" href="style.css" media-type="text/css"/>'
    spine = "".join(f'<itemref idref="{Path(f).stem}"/>' for f, _ in nav_items)
    uid = str(uuid.uuid4())
    opf = f"""<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">{uid}</dc:identifier>
    <dc:title>{TITLE}</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>Sofrito Studio</dc:creator>
    <dc:rights>{LEGAL}</dc:rights>
    <meta property="dcterms:modified">2026-08-25T00:00:00Z</meta>
  </metadata>
  <manifest>
    {manifest}
  </manifest>
  <spine>
    {spine}
  </spine>
</package>"""

    for out in (OUT, SRC_OUT):
        out.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(str(out), "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("mimetype", "application/epub+zip", compress_type=zipfile.ZIP_STORED)
            z.writestr("META-INF/container.xml",
                       '<?xml version="1.0"?><container version="1.0" '
                       'xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
                       '<rootfiles><rootfile full-path="OEBPS/content.opf" '
                       'media-type="application/oebps-package+xml"/></rootfiles></container>')
            z.writestr("OEBPS/content.opf", opf)
            z.writestr("OEBPS/style.css", CSS)
            z.writestr("OEBPS/nav.xhtml", nav)
            for f, _ in nav_items:
                z.writestr(f"OEBPS/{f}", pages[f])
    print(f"wrote {OUT} and {SRC_OUT}")


if __name__ == "__main__":
    build()