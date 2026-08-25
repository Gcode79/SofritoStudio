# -*- coding: utf-8 -*-
"""
Sofrito Studio — Consolidated PDF generator (STANDARDS-COMPLIANT).

Bakes in the project's PDF & Content Generation Standards (see
.opencode/instructions.md):
  - Legal copyright footer on EVERY page
  - Running header (doc title + bilingual section tag)
  - Running footer (legal line left, "Page X of Y" right)
  - Margins >= 0.75in, KeepTogether so recipes/cards never split awkwardly
  - Bilingual separation (EN heading, ES italic sub-line) — never mixed inline

Outputs go to products/printables (gitignored source) and deploy/freebies +
deploy/products/printables (the served assets).
"""
import html as html_mod
import json
import os
import re
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (HRFlowable, KeepTogether, PageBreak,
                                Paragraph, SimpleDocTemplate, Spacer)

ROOT = Path(__file__).resolve().parent.parent
BLOG = ROOT / "deploy" / "blog"
RECIPES_JSON = ROOT / "deploy" / "data" / "recipes.json"
OUT_SRC = ROOT / "products" / "printables"
OUT_DEPLOY_P = ROOT / "deploy" / "products" / "printables"
OUT_DEPLOY_F = ROOT / "deploy" / "freebies"

# ---- Brand palette -------------------------------------------------------
ACCENT = HexColor("#C03D2A")
INK = HexColor("#2B2118")
GOLD = HexColor("#9A7318")
CREAM = HexColor("#FAF6EE")
SOFT = HexColor("#6B5B4C")

LEGAL = ("© 2026 Sofrito Studio (sofritostudio.com). All rights reserved. "
         "La Mesa Boricua / Cocina Boricua Digital Series. No part of this "
         "publication may be reproduced, distributed, or transmitted in any "
         "form or by any means — electronic, mechanical, photocopying, "
         "recording, or otherwise — without prior written permission from the "
         "publisher.")


def sty(name, fontName="Helvetica", fontSize=10.5, leading=16,
        textColor=INK, **kw):
    return ParagraphStyle(name, fontName=fontName, fontSize=fontSize,
                          leading=leading, textColor=textColor, **kw)


def base_styles(cover_size=34, cover_sub=14):
    return {
        "cover_title": sty("ct", fontName="Helvetica-Bold", fontSize=cover_size,
                           leading=cover_size + 6, textColor=ACCENT),
        "cover_sub": sty("cs", fontSize=cover_sub, leading=cover_sub + 6,
                         textColor=INK),
        "cover_small": sty("csm", fontSize=10, leading=15, textColor=SOFT),
        "h1": sty("h1", fontName="Helvetica-Bold", fontSize=20, leading=26,
                  textColor=ACCENT, spaceBefore=16, spaceAfter=2),
        "meta": sty("meta", fontName="Helvetica-Oblique", fontSize=10,
                    leading=14, textColor=SOFT, spaceAfter=6),
        "h2": sty("h2", fontName="Helvetica-Bold", fontSize=13, leading=18,
                  textColor=GOLD, spaceBefore=12, spaceAfter=4),
        "body": sty("body", fontSize=10.5, leading=16),
        "bullet": sty("bullet", leftIndent=16, bulletIndent=4),
        "step": sty("step", leftIndent=16),
        "note": sty("note", fontSize=11, leading=17),
    }


def recipe_data(slug):
    """Pull Recipe JSON-LD from the EN blog page (ingredients + steps)."""
    s = open(BLOG / f"{slug}.html", encoding="utf-8", errors="ignore").read()
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>',
                        s, re.S):
        try:
            d = json.loads(b)
        except Exception:
            continue
        if d.get("@type") == "Recipe":
            return {
                "ingredients": [html_mod.unescape(i)
                                for i in d.get("recipeIngredient", [])],
                "steps": [html_mod.unescape(x.get("text", x))
                          if isinstance(x, dict) else html_mod.unescape(x)
                          for x in d.get("recipeInstructions", [])],
            }
    return None


def recipe_meta(slug):
    """EN + ES title from recipes.json."""
    data = json.load(open(RECIPES_JSON, encoding="utf-8"))
    for r in data["recipes"]:
        if r.get("id") == slug:
            t = r.get("title", {})
            d = r.get("description", {})
            return (t.get("en", slug), t.get("es", ""),
                    d.get("en", ""), d.get("es", ""))
    return (slug, "", "", "")


def make_canvas_class(header_text, header_tag):
    """Return a reportlab Canvas subclass that draws the running header,
    running footer (legal line left + Page X of Y right) on every page."""
    from reportlab.pdfgen import canvas as _canv

    class _NumberedCanvas(_canv.Canvas):
        def __init__(self, *args, **kwargs):
            _canv.Canvas.__init__(self, *args, **kwargs)
            self._saved_page_states = []
            self.hdr_text = header_text
            self.hdr_tag = header_tag

        def showPage(self):
            self._saved_page_states.append(dict(self.__dict__))
            self._startPage()

        def save(self):
            num_pages = len(self._saved_page_states)
            for state in self._saved_page_states:
                self.__dict__.update(state)
                self._draw_header_footer(num_pages)
                _canv.Canvas.showPage(self)
            _canv.Canvas.save(self)

        def _draw_header_footer(self, page_count):
            self.saveState()
            w, h = letter
            # Running header
            self.setStrokeColor(GOLD)
            self.setLineWidth(0.5)
            self.line(0.85 * inch, h - 0.55 * inch, w - 0.85 * inch,
                      h - 0.55 * inch)
            self.setFont("Helvetica", 8)
            self.setFillColor(SOFT)
            self.drawString(0.85 * inch, h - 0.48 * inch, self.hdr_text)
            self.drawRightString(w - 0.85 * inch, h - 0.48 * inch,
                                 self.hdr_tag)
            # Running footer
            self.setStrokeColor(GOLD)
            self.line(0.85 * inch, 0.55 * inch, w - 0.85 * inch, 0.55 * inch)
            self.setFont("Helvetica", 7)
            self.setFillColor(SOFT)
            self.drawString(
                0.85 * inch, 0.44 * inch,
                "© 2026 Sofrito Studio (sofritostudio.com) — La Mesa Boricua "
                "/ Cocina Boricua Digital Series. All rights reserved.")
            self.drawRightString(w - 0.85 * inch, 0.44 * inch,
                                 f"Page {self._pageNumber} of {page_count}")
            # Full legal block (small, above the footer line)
            self.setFont("Helvetica", 6.5)
            self.setFillColor(SOFT)
            max_chars = int((w - 1.7 * inch) / (6.5 * 0.5 * 1.0))
            lines = _wrap(LEGAL, max_chars)
            for i, ln in enumerate(lines):
                self.drawString(0.85 * inch, 0.30 * inch - i * 9, ln)
            self.restoreState()

    return _NumberedCanvas


def _wrap(text, max_chars):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        if len(cur) + len(w) + 1 > max_chars:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        lines.append(cur)
    return lines


def build_document(out_path, story, header_text, header_tag):
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    CanvasCls = make_canvas_class(header_text, header_tag)
    doc = SimpleDocTemplate(str(out_path), pagesize=letter,
                            leftMargin=0.85 * inch, rightMargin=0.85 * inch,
                            topMargin=0.95 * inch, bottomMargin=0.75 * inch)
    doc.build(story, canvasmaker=CanvasCls)
    return out_path


# ---- recipe section builder (shared by guides/samples) ------------------
def recipe_block(slug, styles, show_es=True):
    meta = recipe_meta(slug)
    data = recipe_data(slug)
    if not data:
        return []
    en, es, den, des = meta
    block = []
    block.append(Paragraph(en, styles["h1"]))
    if show_es and es:
        block.append(Paragraph(es, styles["meta"]))
    if den:
        block.append(Paragraph(den, styles["note"]))
    block.append(HRFlowable(width="100%", thickness=1, color=GOLD))
    block.append(Paragraph("Ingredients", styles["h2"]))
    for i in data["ingredients"]:
        block.append(Paragraph(i, styles["bullet"], bulletText="\u2022"))
    block.append(Paragraph("Steps", styles["h2"]))
    for n, x in enumerate(data["steps"], 1):
        block.append(Paragraph(f"{n}. {x}", styles["step"]))
    block.append(Spacer(1, 8))
    return [KeepTogether(block)]


# ---- guide definitions ---------------------------------------------------
GUIDES = [
    ("Sofrito-Studio-Coquito-Guide.pdf", "The Coquito Guide",
     "El ponche navideño · Bilingual holiday drinks",
     "Coconut, cinnamon, rum — the holiday drink that ends every Nochebuena. "
     "Batch it, store it, serve it with confidence.",
     ["coquito", "arroz-con-dulce", "tembleque"]),
    ("Sofrito-Studio-Boricua-Breakfasts.pdf", "Boricua Breakfasts",
     "Desayunos boricuas",
     "Four mainland-proof morning recipes — warm, comforting, and ready before "
     "the coffee's done.",
     ["avena", "cafe-con-leche", "chocolate-caliente", "mallorcas"]),
    ("Sofrito-Studio-Postres-Boricuas.pdf", "Postres Boricuas",
     "Los dulces de la isla",
     "Five classic island desserts — coconut, corn, and comfort, from "
     "tembleque to arroz con dulce.",
     ["tembleque", "majarete", "arroz-con-dulce", "besitos-de-coco",
      "arepas-de-coco"]),
    ("Sofrito-Studio-Comida-Callejera.pdf", "Comida Callejera",
     "La calle boricua",
     "Six street-food classics — fritters, turnovers, and skewers that taste "
     "like the island's sidewalks.",
     ["alcapurrias", "bacalaitos", "empanadillas", "pastelillos", "pinchos",
      "surullitos"]),
    ("Sofrito-Studio-Pernil-Playbook.pdf", "The Pernil Playbook",
     "El manual del pernil",
     "The slow-roasted pork shoulder playbook: marinade, roast timeline, and "
     "the table it anchors.",
     ["pernil", "arroz-con-gandules", "habichuelas"]),
    ("Sofrito-Studio-Holiday-Companion.pdf", "Holiday Companion",
     "El compañero navideño",
     "The Nochebuena set: coquito, pernil, arroz con gandules, and tembleque — "
     "batched and timed.",
     ["coquito", "pernil", "arroz-con-gandules", "tembleque"]),
]

STARTER_KIT = ("Sofrito-Starter-Kit.pdf", "Sofrito Starter Kit",
               "5 Essential Puerto Rican Recipes",
               "Sofrito, Arroz con Pollo, Pernil, Tostones, Flan. The five "
               "that anchor a Boricua kitchen.",
               ["sofrito", "arroz-con-pollo", "pernil", "tostones", "flan"])


def build_guide(fname, title, sub, intro, slugs, dest, styles=None,
                header_tag="Bilingual Recipe Guide | English & Español",
                sample=False):
    styles = styles or base_styles()
    out = Path(dest) / fname
    story = []
    # cover
    story.append(Spacer(1, 90))
    story.append(Paragraph(title.upper(), styles["cover_title"]))
    story.append(Spacer(1, 8))
    story.append(Paragraph(sub, styles["cover_sub"]))
    story.append(Spacer(1, 26))
    story.append(Paragraph(intro, styles["cover_sub"]))
    story.append(Spacer(1, 44))
    story.append(Paragraph("Mainland-tested · From the Ortiz kitchen",
                           styles["cover_small"]))
    story.append(Paragraph("Hecho con corazón y sofrito · sofritostudio.com",
                           styles["cover_small"]))
    story.append(Spacer(1, 60))
    story.append(HRFlowable(width="100%", thickness=3, color=ACCENT))
    story.append(PageBreak())
    for slug in slugs:
        story.extend(recipe_block(slug, styles))
    if sample:
        story.append(Paragraph(
            "Free sample — the full guide has every recipe, the timeline, and "
            "the swaps at sofritostudio.com.", styles["note"]))
    build_document(out, story, title, header_tag)
    return out


def build_starter_kit(dest):
    styles = base_styles(cover_size=38)
    fname, title, sub, intro, slugs = STARTER_KIT
    out = Path(dest) / fname
    story = []
    story.append(Spacer(1, 110))
    story.append(Paragraph("SOFRITO STARTER KIT", styles["cover_title"]))
    story.append(Spacer(1, 8))
    story.append(Paragraph("5 Essential Puerto Rican Recipes",
                           styles["cover_sub"]))
    story.append(Spacer(1, 26))
    story.append(Paragraph("Sofrito · Arroz con Pollo · Pernil · Tostones · "
                           "Flan", styles["cover_sub"]))
    story.append(Spacer(1, 40))
    story.append(Paragraph("Bilingual · Mainland-tested · From the Ortiz "
                           "kitchen", styles["cover_small"]))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Hecho con corazón y sofrito · sofritostudio.com",
                           styles["cover_small"]))
    story.append(Spacer(1, 90))
    story.append(HRFlowable(width="100%", thickness=3, color=ACCENT))
    story.append(Paragraph("How to use this kit", styles["h1"]))
    story.append(Paragraph(
        "Batch the sofrito first — one batch is a month of flavor in the "
        "freezer. Then cook your first dish: arroz con pollo. Every recipe "
        "uses ingredients you can find on the mainland, with swaps where it "
        "counts.", styles["body"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "30-day guarantee · Instant download · Questions? Reply to your "
        "receipt email.", styles["meta"]))
    for slug in slugs:
        story.extend(recipe_block(slug, styles))
    build_document(out, story, title,
                   "Bilingual Recipe Guide | English & Español")
    return out


def main():
    OUT_SRC.mkdir(parents=True, exist_ok=True)
    OUT_DEPLOY_P.mkdir(parents=True, exist_ok=True)
    OUT_DEPLOY_F.mkdir(parents=True, exist_ok=True)

    # 1) Full guides -> products/printables + deploy/products/printables
    for fname, title, sub, intro, slugs in GUIDES:
        src = build_guide(fname, title, sub, intro, slugs, OUT_SRC)
        open(OUT_DEPLOY_P / fname, "wb").write(src.read_bytes())
        print(f"guide {fname}: {src.stat().st_size} bytes")

    # 2) Starter kit
    sk = build_starter_kit(OUT_SRC)
    open(OUT_DEPLOY_P / STARTER_KIT[0], "wb").write(sk.read_bytes())
    print(f"starter {STARTER_KIT[0]}: {sk.stat().st_size} bytes")

    # 3) Samples -> deploy/freebies
    samples = [
        ("Sofrito-Starter-Kit-Sample.pdf", "SOFRITO STARTER KIT",
         "Free sample — 2 of the 5 recipes",
         "Sofrito and Arroz con Pollo, exactly as they appear in the full "
         "Starter Kit: bilingual, mainland-tested, with ingredient swaps. "
         "Get all 5 for $9.",
         ["sofrito", "arroz-con-pollo"], True),
        ("Coquito-Guide-Sample.pdf", "THE COQUITO GUIDE",
         "El ponche navideño · free sample",
         "A free taste of the guide — bilingual, mainland-tested, with "
         "ingredient swaps. Get the full guide at sofritostudio.com.",
         ["coquito", "arroz-con-dulce"], True),
        ("Boricua-Breakfasts-Sample.pdf", "BORICUA BREAKFASTS",
         "Desayunos boricuas · free sample",
         "A free taste of the guide — bilingual, mainland-tested, with "
         "ingredient swaps. Get the full guide at sofritostudio.com.",
         ["avena", "cafe-con-leche"], True),
        ("Postres-Boricuas-Sample.pdf", "POSTRES BORICUAS",
         "Los dulces de la isla · free sample",
         "A free taste of the guide — bilingual, mainland-tested, with "
         "ingredient swaps. Get the full guide at sofritostudio.com.",
         ["tembleque", "majarete"], True),
        ("Comida-Callejera-Sample.pdf", "COMIDA CALLEJERA",
         "La calle boricua · free sample",
         "A free taste of the guide — bilingual, mainland-tested, with "
         "ingredient swaps. Get the full guide at sofritostudio.com.",
         ["alcapurrias", "bacalaitos"], True),
        ("Pernil-Playbook-Sample.pdf", "THE PERNIL PLAYBOOK",
         "El manual del pernil · free sample",
         "A free taste of the guide — bilingual, mainland-tested, with "
         "ingredient swaps. Get the full guide at sofritostudio.com.",
         ["pernil", "arroz-con-gandules"], True),
    ]
    for fname, title, sub, intro, slugs, _ in samples:
        styles = base_styles(cover_size=30, cover_sub=13)
        out = build_guide(fname, title, sub, intro, slugs, OUT_DEPLOY_F,
                          styles=styles, sample=True)
        print(f"sample {fname}: {out.stat().st_size} bytes")


if __name__ == "__main__":
    main()