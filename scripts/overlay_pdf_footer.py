# -*- coding: utf-8 -*-
"""Overlay the standards-compliant legal footer + running header + page numbers
onto hand-built PDFs (preserves all original content).

For every page it draws:
  - running header line (doc title + bilingual tag)
  - footer rule with "© 2026 Sofrito Studio (sofritostudio.com) ..." left and
    "Page X of Y" right
  - the full legal block above the footer rule

Usage: python scripts/overlay_pdf_footer.py <path-to.pdf> [title] [header_tag]
Overwrites the file in place (backup kept as <name>.bak)."""

import shutil
import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter

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


def make_overlay(page_size, title, header_tag, page_num, total):
    import io
    w_pt, h_pt = float(page_size[0]), float(page_size[1])
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(w_pt, h_pt))
    m = 0.85 * 72
    # Running header
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.line(m, h_pt - 0.55 * 72, w_pt - m, h_pt - 0.55 * 72)
    c.setFont("Helvetica", 8)
    c.setFillColor(SOFT)
    c.drawString(m, h_pt - 0.48 * 72, title)
    c.drawRightString(w_pt - m, h_pt - 0.48 * 72, header_tag)
    # Footer rule
    c.line(m, 0.55 * 72, w_pt - m, 0.55 * 72)
    c.setFont("Helvetica", 7)
    c.drawString(m, 0.44 * 72,
                 "© 2026 Sofrito Studio (sofritostudio.com) — La Mesa Boricua "
                 "/ Cocina Boricua Digital Series. All rights reserved.")
    c.drawRightString(w_pt - m, 0.44 * 72, f"Page {page_num} of {total}")
    # Full legal block
    c.setFont("Helvetica", 6.5)
    max_chars = int((w_pt - 2 * m) / (6.5 * 0.5 * 1.0))
    for i, ln in enumerate(wrap(LEGAL, max_chars)):
        c.drawString(m, 0.30 * 72 - i * 9, ln)
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


def process(path, title=None, header_tag="Bilingual Recipe Guide | English & Español"):
    path = Path(path)
    reader = PdfReader(str(path))
    writer = PdfWriter()
    total = len(reader.pages)
    t = title or path.stem.replace("-", " ")
    for i, page in enumerate(reader.pages, 1):
        mb = page.mediabox
        ov = make_overlay((mb.width, mb.height), t, header_tag, i, total)
        page.merge_page(ov)
        writer.add_page(page)
    # backup original
    bak = path.with_suffix(path.suffix + ".bak")
    shutil.copy2(path, bak)
    with open(path, "wb") as fh:
        writer.write(fh)
    print(f"{path.name}: stamped {total} pages (backup: {bak.name})")


if __name__ == "__main__":
    # targets + optional titles
    ROOT = Path(__file__).resolve().parent.parent
    TARGETS = [
        ("deploy/products/printables/La-Mesa-Boricua.pdf",
         "La Mesa Boricua — The Complete Bilingual Cookbook"),
        ("deploy/products/printables/Boricua-Weeknights.pdf",
         "Boricua Weeknights — 14 Mainland-Proof Dinners"),
        ("deploy/products/printables/Kitchen-Bundle-Printables.pdf",
         "The Kitchen Bundle — Bilingual Printable Set"),
        ("deploy/freebies/Sofrito-101.pdf",
         "Sofrito 101 — Master the Base"),
    ]
    if len(sys.argv) > 1:
        TARGETS = [(sys.argv[1], None)]
    for rel, title in TARGETS:
        p = ROOT / rel
        if p.exists():
            process(p, title)
        else:
            print(f"MISSING {rel}")