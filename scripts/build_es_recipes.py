# -*- coding: utf-8 -*-
"""Build deploy/es/blog/<slug>.html for the remaining 23 recipes from ES data
modules + schema metadata. Matches es/blog/pernil.html conventions."""
import importlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ES_BLOG = ROOT / "deploy" / "es" / "blog"
SITE = "https://sofritostudio.com"

sys.path.insert(0, str(ROOT / "scripts"))
from es_data_b1 import DATA as B1
from es_data_b2 import DATA as B2
from es_data_b3 import DATA as B3
from es_data_b4 import DATA as B4
from es_data_b5 import DATA as B5
from es_data_flan import DATA as FLAN
from es_data_tostones import DATA as TOSTONES

DATA = {}
for mod in (B1, B2, B3, B4, B5, FLAN, TOSTONES):
    DATA.update(mod)

SCHEMA = json.load(open(Path.home() / "AppData/Local/Temp/opencode/schema_info.json", encoding="utf-8"))

CAT_TRANS = {
    "Snack": "Snack", "Dessert": "Postres", "Side": "Acompañantes",
    "Dinner": "Platos principales", "Breakfast": "Desayunos", "Drink": "Bebidas",
    "Lunch": "Platos principales", "Frituras": "Frituras", "Mains": "Platos principales",
}
CUISINE_TRANS = {
    "Puerto Rican": "Puertorriqueña",
    "Afro-Caribbean": "Afrocaribeña",
    "Taino heritage": "Herencia taína",
    "Taíno heritage": "Herencia taína",
}

# Related-recipe cards (href in EN blog, image, tag, title) — 3 per page
RELATED = {
    "alcapurrias": [("bacalaitos.html", "rec-bacalaitos", "Frituras", "Bacalaítos"),
                    ("empanadillas.html", "rec-empanadillas", "Frituras", "Empanadillas"),
                    ("tostones.html", "rec-tostones", "Frituras", "Tostones")],
    "arepas-de-coco": [("surullitos.html", "rec-surullitos", "Frituras", "Surullitos"),
                       ("bacalaitos.html", "rec-bacalaitos", "Frituras", "Bacalaítos"),
                       ("tostones.html", "rec-tostones", "Frituras", "Tostones")],
    "asopao": [("arroz-con-pollo.html", "rec-arroz", "Platos principales", "Arroz con Pollo"),
               ("sancocho.html", "rec-sancocho", "Platos principales", "Sancocho"),
               ("arroz-con-gandules.html", "rec-arroz-gandules", "Acompañantes", "Arroz con Gandules")],
    "avena": [("cafe-con-leche.html", "rec-cafe-con-leche", "Bebidas", "Café con Leche"),
              ("coquito.html", "rec-coquito", "Bebidas", "Coquito"),
              ("chocolate-caliente.html", "rec-chocolate", "Bebidas", "Chocolate Caliente")],
    "bacalaitos": [("alcapurrias.html", "rec-alcapurrias", "Frituras", "Alcapurrias"),
                   ("surullitos.html", "rec-surullitos", "Frituras", "Surullitos"),
                   ("arepas-de-coco.html", "rec-arepas-coco", "Frituras", "Arepas de Coco")],
    "besitos-de-coco": [("tembleque.html", "rec-tembleque", "Postres", "Tembleque"),
                        ("flan.html", "rec-flan", "Postres", "Flan"),
                        ("majarete.html", "rec-majarete", "Postres", "Majarete")],
    "cafe-con-leche": [("mallorcas.html", "rec-mallorcas", "Desayunos", "Mallorcas"),
                       ("avena.html", "rec-avena", "Bebidas", "Avena"),
                       ("quesitos.html", "rec-quesitos", "Postres", "Quesitos")],
    "chocolate-caliente": [("coquito.html", "rec-coquito", "Bebidas", "Coquito"),
                           ("quesitos.html", "rec-quesitos", "Postres", "Quesitos"),
                           ("avena.html", "rec-avena", "Bebidas", "Avena")],
    "chuletas": [("pernil.html", "pernil-course", "Platos principales", "Pernil Asado"),
                 ("pinchos.html", "rec-pinchos", "Platos principales", "Pinchos"),
                 ("arroz-con-gandules.html", "rec-arroz-gandules", "Acompañantes", "Arroz con Gandules")],
    "empanadillas": [("pastelillos.html", "rec-pastelillos", "Frituras", "Pastelillos"),
                     ("alcapurrias.html", "rec-alcapurrias", "Frituras", "Alcapurrias"),
                     ("papa-rellena.html", "rec-papa-rellena", "Frituras", "Papa Rellena")],
    "flan": [("tembleque.html", "rec-tembleque", "Postres", "Tembleque"),
             ("besitos-de-coco.html", "rec-besitos-coco", "Postres", "Besitos de Coco"),
             ("arroz-con-dulce.html", "rec-arroz-con-dulce", "Postres", "Arroz con Dulce")],
    "habichuelas": [("arroz-con-gandules.html", "rec-arroz-gandules", "Acompañantes", "Arroz con Gandules"),
                    ("arroz-con-pollo.html", "rec-arroz", "Platos principales", "Arroz con Pollo"),
                    ("pernil.html", "pernil-course", "Platos principales", "Pernil Asado")],
    "majarete": [("tembleque.html", "rec-tembleque", "Postres", "Tembleque"),
                 ("besitos-de-coco.html", "rec-besitos-coco", "Postres", "Besitos de Coco"),
                 ("arroz-con-dulce.html", "rec-arroz-con-dulce", "Postres", "Arroz con Dulce")],
    "mallorcas": [("cafe-con-leche.html", "rec-cafe-con-leche", "Bebidas", "Café con Leche"),
                  ("quesitos.html", "rec-quesitos", "Postres", "Quesitos"),
                  ("chocolate-caliente.html", "rec-chocolate", "Bebidas", "Chocolate Caliente")],
    "papa-rellena": [("empanadillas.html", "rec-empanadillas", "Frituras", "Empanadillas"),
                     ("alcapurrias.html", "rec-alcapurrias", "Frituras", "Alcapurrias"),
                     ("tostones.html", "rec-tostones", "Frituras", "Tostones")],
    "pastelillos": [("empanadillas.html", "rec-empanadillas", "Frituras", "Empanadillas"),
                    ("quesitos.html", "rec-quesitos", "Postres", "Quesitos"),
                    ("alcapurrias.html", "rec-alcapurrias", "Frituras", "Alcapurrias")],
    "pinchos": [("chuletas.html", "rec-chuletas", "Platos principales", "Chuletas Kan Kan"),
                ("pernil.html", "pernil-course", "Platos principales", "Pernil Asado"),
                ("tostones.html", "rec-tostones", "Frituras", "Tostones")],
    "quesitos": [("mallorcas.html", "rec-mallorcas", "Desayunos", "Mallorcas"),
                 ("flan.html", "rec-flan", "Postres", "Flan"),
                 ("cafe-con-leche.html", "rec-cafe-con-leche", "Bebidas", "Café con Leche")],
    "sancocho": [("asopao.html", "rec-asopao", "Platos principales", "Asopao de Pollo"),
                 ("arroz-con-pollo.html", "rec-arroz", "Platos principales", "Arroz con Pollo"),
                 ("habichuelas.html", "rec-habichuelas", "Acompañantes", "Habichuelas Guisadas")],
    "sofrito": [("arroz-con-gandules.html", "rec-arroz-gandules", "Acompañantes", "Arroz con Gandules"),
                ("habichuelas.html", "rec-habichuelas", "Acompañantes", "Habichuelas Guisadas"),
                ("arroz-con-pollo.html", "rec-arroz", "Platos principales", "Arroz con Pollo")],
    "sopa-de-fideo": [("asopao.html", "rec-asopao", "Platos principales", "Asopao de Pollo"),
                      ("habichuelas.html", "rec-habichuelas", "Acompañantes", "Habichuelas Guisadas"),
                      ("sancocho.html", "rec-sancocho", "Platos principales", "Sancocho")],
    "surullitos": [("arepas-de-coco.html", "rec-arepas-coco", "Frituras", "Arepas de Coco"),
                   ("bacalaitos.html", "rec-bacalaitos", "Frituras", "Bacalaítos"),
                   ("tostones.html", "rec-tostones", "Frituras", "Tostones")],
    "tostones": [("mofongo.html", "rec-mofongo", "Platos principales", "Mofongo"),
                 ("pernil.html", "pernil-course", "Platos principales", "Pernil Asado"),
                 ("arroz-con-gandules.html", "rec-arroz-gandules", "Acompañantes", "Arroz con Gandules")],
}

NAV = """  <div class="flagbar-tropical"></div>
  <header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="../../index.html"><img class="brand-logo" src="../../images/logo.svg" alt="Sofrito Studio — Cocina Boricua"></a>
      <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
      <nav aria-label="Main navigation">
      <ul class="nav-links" id="navLinks"><li><a href="/index.html">Home</a></li>
        <li><a href="/products.html">Products</a></li>
        <li><a href="/blog.html" class="active">Recipes</a></li>
        <li><a href="/community.html">Blog</a></li>
        <li><a href="/about.html">About</a></li>
        <li class="nav-social"><a href="https://instagram.com/pr.sofritostudio" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.919 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a><a href="https://www.facebook.com/SofritoStudio" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a></li>
        <li><a class="btn" href="/blog.html#freebie">Get Free Guide</a></li></ul>
      </nav>
    </div>
  </header>"""

FOOTER = """  <footer class="site-footer tropical-footer">
    <div class="wrap">
      <div class="footer-brand">
        <a class="brand" href="../../index.html"><img class="brand-logo" src="../../images/logo-white.svg" alt="Sofrito Studio — Cocina Boricua"></a>
        <img src="../../images/flag.svg" alt="Puerto Rico" class="footer-flag">
        <p class="footer-tagline">La cocina de abuela, de la cocina Ortiz a tu mesa.</p>
      </div>
      <div class="footer-columns">
        <div>
          <h4>Products</h4>
          <ul>
            <li><a href="/products/starter-kit.html">Starter Kit — $9</a></li>
            <li><a href="/products/la-mesa-boricua-sales.html">La Mesa Boricua — $47</a></li>
            <li><a href="/products/kitchen-bundle.html">Kitchen Bundle — $67</a></li>
            <li><a href="/products/full-table.html">Full Table — $97</a></li>
            <li><a href="/index.html#freebie">Free Sofrito 101</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="/about.html">Our Story</a></li>
            <li><a href="/contact.html">Contact</a></li>
            <li><a href="https://sofritostudio.com/membership.html">Membership</a></li>
            <li><a href="https://sofritostudio.com/affiliate.html">Affiliate Program</a></li>
            <li><a href="https://sofritostudio.com/quiz.html">Find Your Fit</a></li>
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="/terms.html">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4>Community</h4>
          <ul>
            <ul class="footer-social-list">
          <li class="footer-social-item"><a href="https://instagram.com/pr.sofritostudio" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.919 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a></li>
          <li class="footer-social-item"><a href="https://www.facebook.com/SofritoStudio" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a></li><li class="footer-social-item"><a href="https://pinterest.com/sofritostudio" target="_blank" rel="noopener" aria-label="Pinterest"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg></a></li>
            </ul></ul>
          </div>
      </div>
      <div class="footer-divider"></div>
      <small>&copy; <span id="year"></span> Sofrito — Cocina Boricua. All rights reserved. Hecho con corazón y sofrito. All prices in USD.</small>
    </div>
  </footer>

  <button class="scroll-top" id="scrollTop" aria-label="Scroll to top">
    <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
  </button>

  <script src="../../js/main.js"></script>
  <script>
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = this.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(el) { el.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });
  </script>"""

FAV = """  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/svg+xml" href="../../images/logo-badge.svg">
  <link rel="stylesheet" href="../../css/style.css">"""


def schema_ingredients(data):
    # use the bold (translated) portion of the ingredient lines
    ing = []
    for item in data["ingredients"]:
        m = re.search(r"<b>(.*?)</b>", item, re.S)
        if m:
            text = re.sub(r"<[^>]+>", "", m.group(1)).strip()
            text = re.sub(r"\s+", " ", text)
            ing.append(text)
    return ing


def recipe_ld(data, slug, d):
    cat = CAT_TRANS.get(d["cat"]) or d["cat"]
    cuisine = CUISINE_TRANS.get(d["cuisine"]) or d["cuisine"]
    img = f"{SITE}/images/{d['img']}"
    name = data["title"].split(" — ")[0].split(" — ")[0]
    desc = data["desc"].split(". ")[0] + "."
    total = (d["prep"] + d["cook"]) or 1
    ings = schema_ingredients(data)
    steps = [
        {"@type": "HowToStep", "text": re.sub(r"<[^>]+>", "", s).strip()[:300]}
        for s in data["steps"]
    ]
    yield_m = data.get("serves", "Para 4 porciones")
    return {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": name,
        "description": desc,
        "image": img,
        "author": {"@type": "Person", "name": "Josh Ortiz"},
        "datePublished": "2026-08-17",
        "prepTime": f"PT{d['prep']}M",
        "cookTime": f"PT{d['cook']}M",
        "totalTime": f"PT{total}M",
        "recipeYield": yield_m,
        "recipeCategory": cat,
        "recipeCuisine": cuisine,
        "inLanguage": "es",
        "keywords": (name + ", receta puertorriqueña, recetas boricuas, " + cuisine.lower()).strip(),
        "recipeIngredient": ings,
        "recipeInstructions": steps,
    }


def faq_ld(faqs):
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": f["q"],
             "acceptedAnswer": {"@type": "Answer", "text": f["a"]}}
            for f in faqs
        ],
    }


def breadcrumb_ld(slug):
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "Recetas", "item": f"{SITE}/blog.html"},
            {"@type": "ListItem", "position": 3, "name": slug},
        ],
    }


def li_html(item):
    return f"          <li>{item}</li>\n"


def step_html(idx, text):
    return (
        f'          <div style="display: flex; gap: 16px; margin-bottom: 20px; align-items: flex-start;">\n'
        f'            <span style="background: var(--cta-primary); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;">{idx}</span>\n'
        f"            <div>{text}</div>\n"
        f"          </div>\n"
    )


def ymal_cards(slug):
    cards = ""
    for href, img, tag, title in RELATED[slug]:
        cards += (
            f'          <a href="../../blog/{href}" style="background: var(--white); border: 1px solid var(--cream-dark); '
            f'border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.3s, box-shadow 0.3s; '
            f'text-decoration: none; color: var(--ink);">\n'
            f'            <picture><source srcset="../../images/{img}.webp" type="image/webp">'
            f'<img src="../../images/{img}.jpg" alt="{title}" style="width: 100%; aspect-ratio: 16/10; object-fit: cover;" loading="lazy"></picture>\n'
            f'            <div style="padding: 14px 16px;">\n'
            f'              <span class="tag" style="font-size: 0.7rem;">{tag}</span>\n'
            f'              <h4 style="font-size: 0.95rem; margin-top: 6px; line-height: 1.3; color: var(--ink);">{title}</h4>\n'
            f"            </div>\n"
            f"          </a>\n"
        )
    return cards


def build(slug):
    data = DATA[slug]
    schema = SCHEMA[slug]
    title = data["title"]
    url_es = f"{SITE}/es/blog/{slug}.html"
    url_en = f"{SITE}/blog/{slug}.html"
    img = schema["img"]

    head_lds = "\n  ".join(
        f"<script type=\"application/ld+json\">\n  {json.dumps(obj, ensure_ascii=False, indent=2)}\n  </script>"
        for obj in [recipe_ld(data, slug, schema), breadcrumb_ld(slug), faq_ld(data["faqs"])]
    )

    ingredients = "\n".join(li_html(i) for i in data["ingredients"])
    swaps = ""
    if data.get("swaps"):
        swaps_h3 = data.get("swaps_h3") or "Sustituciones en el Mainland"
        swaps = f"        <h3>{swaps_h3}</h3>\n        <ul>\n" + "\n".join(li_html(i) for i in data["swaps"]) + "        </ul>\n\n"
    steps = "\n".join(step_html(i + 1, s) for i, s in enumerate(data["steps"]))
    tips = "\n".join(li_html(t) for t in data["tips"])
    faqs = "\n".join(
        f'          <div class="faq-item">\n            <button class="faq-question">\n              {f["q"]}\n'
        f'              <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>\n'
        f'            </button>\n            <div class="faq-answer"><div class="faq-answer-inner">{f["a"]}</div></div>\n          </div>\n'
        for f in data["faqs"]
    )

    trust_items = "".join(
        f'          <span class="hero-trust-item" style="color: rgba(255,255,255,0.85);"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> {t}</span>\n'
        for t in data["trust"]
    )

    whatis = "\n".join(f"        <p>{p}</p>\n" for p in data["whatis"])
    first_h2 = data.get("first_h2_es") or "¿Qué es el " + title.split(" — ")[0] + "?"

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{data['desc']}">
  <link rel="canonical" href="{url_es}">
  <link rel="alternate" hreflang="en" href="{url_en}">
  <link rel="alternate" hreflang="es" href="{url_es}">
  <link rel="alternate" hreflang="x-default" href="{url_en}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{data['desc']}">
  <meta property="og:url" content="{url_es}">
  <meta property="og:image" content="{SITE}/images/{img}">
  <meta property="og:locale" content="es_PR">
  <meta name="twitter:card" content="summary_large_image">
{FAV}
  {head_lds}
</head>
<body>
{NAV}

  <main>
  <article>
    <section class="hero" style="padding: 80px 0 48px;">
      <div class="hero-bg" style="background-image: url('../../images/{img}'); filter: brightness(0.4);"></div>
      <div class="wrap center" style="position: relative; z-index: 2;">
        <span class="eyebrow" style="color: rgba(255,255,255,0.85);">{data['eyebrow']}</span>
        <h1 style="color: white; text-shadow: 0 2px 16px rgba(0,0,0,0.4);">{title.split(' — ')[0]}</h1>
        <p class="lead" style="color: rgba(255,255,255,0.9); max-width: 600px; margin: 12px auto 0;">{data['desc']}</p>
        <div class="hero-trust-inline" style="justify-content: center; margin-top: 16px;">
{trust_items}        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap" style="max-width: 760px;">
        <p class="blog-meta" style="margin-bottom: 24px; font-size: 0.88rem; color: var(--ink-soft);">
          <span>Por Josh Ortiz</span><span>&middot;</span><span>Agosto 2026</span><span>&middot;</span><span>10 min de lectura</span>
        </p>

        <p style="font-size: 1.05rem; line-height: 1.8; margin-bottom: 28px;">{data['intro']}</p>

        <div style="text-align: center; margin-bottom: 36px;">
          <a href="#receta" class="btn" style="display: inline-block;">Ir a la Receta</a>
        </div>

        <h2 id="que-es">{first_h2}</h2>
{whatis}
        <h2 id="ingredientes">Ingredientes</h2>
          <div class="scaler-bar">
            <span>Escalar receta:</span>
            <div class="scaler-btns">
              <button class="scaler-btn" data-scale="0.5">&frac12;x</button>
              <button class="scaler-btn active" data-scale="1">1x</button>
              <button class="scaler-btn" data-scale="2">2x</button>
              <button class="scaler-btn" data-scale="4">4x</button>
            </div>
            <span><span class="scaler-serving-count" data-base-servings="8">{data['serves']}</span></span>
          </div>
        <div id="receta" style="background: var(--cream-dark); border-radius: var(--radius); padding: 24px 28px; margin: 16px 0 24px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 12px;">{data['serves']}</h3>
          <ul style="line-height: 2;">
{ingredients}          </ul>
        </div>

{swaps}
        <h2 id="pasos">Instrucciones Paso a Paso</h2>
        <div style="counter-reset: steps;">
{steps}        </div>

        <div style="text-align: center; margin: 32px 0; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.print()" class="btn btn-ghost">Imprimir Receta</button>
          <a href="https://pinterest.com/pin/create/button/?url={url_es}&media={SITE}/images/{img}&description={title.replace(' ', '+')}" target="_blank" rel="noopener" class="btn btn-ghost">Guardar en Pinterest</a>
        </div>

        <h2 id="consejos">{data['tips_h2']}</h2>
        <ul>
{tips}        </ul>

        <div style="background: var(--ink); color: var(--white); border-radius: var(--radius); padding: 32px; text-align: center; margin: 32px 0;">
          <h3 style="color: var(--white); margin-bottom: 8px;">¿Quieres más recetas así?</h3>
          <p style="color: rgba(255,255,255,0.8); margin-bottom: 16px;">La Mesa Boricua — el cookbook bilingüe completo con 30 recetas auténticas puertorriqueñas.</p>
          <a class="btn" href="/products/la-mesa-boricua-sales.html" style="display: inline-block;">Consigue el Cookbook — $47</a>
          <p style="color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-top: 8px;">O empieza con el <a href="/products/starter-kit.html" style="color: var(--gold);">Starter Kit de $9</a></p>
        </div>

        <h2 id="faq">Preguntas Frecuentes</h2>
        <div class="faq">
{faqs}        </div>

        <h2>También te Puede Gustar</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 16px 0 32px;">
{ymal_cards(slug)}        </div>
      </div>
    </section>
  </article>
  </main>

{FOOTER}
</body>
</html>
"""
    return html


def main():
    ES_BLOG.mkdir(parents=True, exist_ok=True)
    for slug in DATA:
        out = build(slug)
        (ES_BLOG / f"{slug}.html").write_text(out, encoding="utf-8")
        print(f"wrote {slug}.html ({len(out)} bytes)")


if __name__ == "__main__":
    main()