# -*- coding: utf-8 -*-
"""Full remediation pass for the remaining non-compliant deliverables:

1. Stamp the 5 custom editorial guides (Air-Fryer, Meal-Prep, Navidad,
   Masterclass, Thanksgiving) in deploy/ + products/printables/
2. Stamp Sofrito-101-Preview.pdf
3. Inject legal footer into every EPUB (deploy/ + products/printables)
4. Sync all stamped PDFs into Desktop\\Sofrito-Gumroad-Uploads\\All-Products
"""
import re
import shutil
import zipfile
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent.parent
DESKTOP = Path(r"C:\Users\josho\Desktop\Sofrito-Gumroad-Uploads\All-Products")

GOLD = HexColor("#9A7318")
SOFT = HexColor("#6B5B4C")
LEGAL = ("© 2026 Sofrito Studio (sofritostudio.com). All rights reserved. "
         "La Mesa Boricua / Cocina Boricua Digital Series. No part of this "
         "publication may be reproduced, distributed, or transmitted in any "
         "form or by any means — electronic, mechanical, photocopying, "
         "recording, or otherwise — without prior written permission from the "
         "publisher.")


def wrap(text, max_chars):
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


def make_overlay(w_pt, h_pt, title, header_tag, page_num, total):
    import io
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(w_pt, h_pt))
    m = 0.85 * 72
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.line(m, h_pt - 0.55 * 72, w_pt - m, h_pt - 0.55 * 72)
    c.setFont("Helvetica", 8)
    c.setFillColor(SOFT)
    c.drawString(m, h_pt - 0.48 * 72, title)
    c.drawRightString(w_pt - m, h_pt - 0.48 * 72, header_tag)
    c.line(m, 0.55 * 72, w_pt - m, 0.55 * 72)
    c.setFont("Helvetica", 7)
    c.drawString(m, 0.44 * 72,
                 "© 2026 Sofrito Studio (sofritostudio.com) — La Mesa Boricua "
                 "/ Cocina Boricua Digital Series. All rights reserved.")
    c.drawRightString(w_pt - m, 0.44 * 72, f"Page {page_num} of {total}")
    c.setFont("Helvetica", 6.5)
    max_chars = int((w_pt - 2 * m) / (6.5 * 0.5 * 1.0))
    for i, ln in enumerate(wrap(LEGAL, max_chars)):
        c.drawString(m, 0.30 * 72 - i * 9, ln)
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


def stamp_pdf(path, title, header_tag="Bilingual Recipe Guide | English & Español"):
    path = Path(path)
    reader = PdfReader(str(path))
    writer = PdfWriter()
    total = len(reader.pages)
    for i, page in enumerate(reader.pages, 1):
        mb = page.mediabox
        ov = make_overlay(mb.width, mb.height, title, header_tag, i, total)
        page.merge_page(ov)
        writer.add_page(page)
    with open(path, "wb") as fh:
        writer.write(fh)
    print(f"stamped {path}")


def stamp_epub(path):
    """Inject a legal footer into every XHTML page of the EPUB."""
    import io
    path = Path(path)
    tmp = path.with_suffix(".epub.tmp")
    with zipfile.ZipFile(str(path), "r") as zin:
        items = zin.infolist()
        data = {i.filename: zin.read(i.filename) for i in items}
    footer = (
        '<div class="ss-legal" style="margin-top:2em;padding-top:0.75em;'
        'border-top:1px solid #9A7318;font-size:0.72em;color:#6B5B4C;'
        'font-style:italic;">'
        '© 2026 Sofrito Studio (sofritostudio.com). All rights reserved. '
        'La Mesa Boricua / Cocina Boricua Digital Series. No part of this '
        'publication may be reproduced, distributed, or transmitted in any '
        'form or by any means — electronic, mechanical, photocopying, '
        'recording, or otherwise — without prior written permission from the '
        'publisher.</div>'
    )
    changed = 0
    for name in list(data):
        if not name.endswith((".xhtml", ".html", ".htm")):
            continue
        text = data[name].decode("utf-8", errors="ignore")
        if "ss-legal" in text:
            continue
        # inject just before </body>
        if "</body>" in text:
            text = text.replace("</body>", footer + "\n</body>", 1)
        else:
            text += footer
        data[name] = text.encode("utf-8")
        changed += 1
    with zipfile.ZipFile(str(tmp), "w", zipfile.ZIP_DEFLATED) as zout:
        # mimetype must be first & stored
        zout.writestr("mimetype", data["mimetype"], compress_type=zipfile.ZIP_STORED)
        for name in data:
            if name == "mimetype":
                continue
            zout.writestr(name, data[name])
    shutil.move(str(tmp), str(path))
    print(f"epub {path} ({changed} pages footered)")


STAMP_TITLES = {
    "Sofrito-Studio-Air-Fryer-Boricua.pdf": "Air Fryer Boricua — La fritura sin el lío",
    "Sofrito-Studio-Meal-Prep-Boricua.pdf": "Meal Prep Boricua — Batch It, Freeze It",
    "Sofrito-Studio-Navidad-Boricua.pdf": "Navidad Boricua — Nochebuena en tu cocina",
    "Sofrito-Studio-Sofrito-Masterclass.pdf": "The Sofrito Masterclass — La base de todo",
    "Sofrito-Studio-Thanksgiving-Boricua.pdf": "Thanksgiving Boricua — The Hybrid Feast",
}

# Desktop upload folder mapping (product folder -> file)
DESKTOP_MAP = {
    "Sofrito-Studio-Air-Fryer-Boricua.pdf": "Air Fryer Boricua",
    "Sofrito-Studio-Meal-Prep-Boricua.pdf": "Meal Prep Boricua",
    "Sofrito-Studio-Navidad-Boricua.pdf": "Navidad Boricua",
    "Sofrito-Studio-Sofrito-Masterclass.pdf": "The Sofrito Masterclass",
    "Sofrito-Studio-Thanksgiving-Boricua.pdf": "Thanksgiving Boricua",
    "Sofrito-Starter-Kit.pdf": "Sofrito Starter Kit",
    "Sofrito-Studio-Coquito-Guide.pdf": "The Coquito Guide",
    "Sofrito-Studio-Boricua-Breakfasts.pdf": "Boricua Breakfasts",
    "Sofrito-Studio-Postres-Boricuas.pdf": "Postres Boricuas",
    "Sofrito-Studio-Comida-Callejera.pdf": "Comida Callejera",
    "Sofrito-Studio-Pernil-Playbook.pdf": "The Pernil Playbook",
    "Sofrito-Studio-Holiday-Companion.pdf": "Holiday Companion (Add-on)",
    "La-Mesa-Boricua.pdf": "La Mesa Boricua",
    "Boricua-Weeknights.pdf": "Boricua Weeknights",
    "Kitchen-Bundle-Printables.pdf": "The Kitchen Bundle",
}


def main():
    # 1) stamp the 5 custom editorial guides (both tracked copies)
    for rel in ["deploy/products/printables", "products/printables"]:
        for fname, title in STAMP_TITLES.items():
            p = ROOT / rel / fname
            if p.exists():
                stamp_pdf(p, title)

    # 2) stamp Sofrito-101-Preview.pdf
    p = ROOT / "deploy/freebies/Sofrito-101-Preview.pdf"
    if p.exists():
        stamp_pdf(p, "Sofrito 101 — Preview")

    # 3) EPUB footers
    for rel in ["deploy/products/printables", "products/printables"]:
        for p in (ROOT / rel).glob("*.epub"):
            stamp_epub(p)

    # 4) sync stamped PDFs into Desktop upload folders
    src_root = ROOT / "deploy/products/printables"
    synced = 0
    for fname, folder in DESKTOP_MAP.items():
        src = src_root / fname
        dest_dir = DESKTOP / folder
        if not src.exists() or not dest_dir.exists():
            continue
        shutil.copy2(src, dest_dir / fname)
        synced += 1
    # freebies -> Starter sample + 101 into desktop? starter kit already mapped
    print(f"desktop sync: {synced} files")
    print("done")


if __name__ == "__main__":
    main()