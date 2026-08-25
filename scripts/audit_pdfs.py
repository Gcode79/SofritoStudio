"""Audit existing PDFs for the mandatory legal footer + page structure."""
import sys
from pathlib import Path
from pypdf import PdfReader

PDFS = [
    Path("deploy/products/printables/La-Mesa-Boricua.pdf"),
    Path("deploy/products/printables/Boricua-Weeknights.pdf"),
    Path("deploy/products/printables/Kitchen-Bundle-Printables.pdf"),
    Path("deploy/products/printables/Sofrito-Starter-Kit.pdf"),
    Path("deploy/products/printables/Sofrito-Studio-Coquito-Guide.pdf"),
    Path("deploy/products/printables/Sofrito-Studio-Postres-Boricuas.pdf"),
    Path("deploy/freebies/Sofrito-101.pdf"),
    Path("deploy/freebies/Sofrito-Starter-Kit-Sample.pdf"),
]

REQUIRED = ["all rights reserved", "sofritostudio.com", "reproduced", "permission"]
for p in PDFS:
    if not p.exists():
        print(f"{p.name:45} MISSING")
        continue
    try:
        r = PdfReader(str(p))
        n = len(r.pages)
        # sample first 3 + last page text
        text = ""
        for i in [0, 1, 2, n - 1]:
            if i < n:
                text += (r.pages[i].extract_text() or "") + "\n"
        low = text.lower()
        missing = [k for k in REQUIRED if k not in low]
        has_pages = "page" in low.lower()
        print(f"{p.name:45} pages={n:3} legal={'OK' if not missing else 'MISSING: ' + ','.join(missing)}"
              f" pageNum={'yes' if has_pages else 'no'}")
    except Exception as e:
        print(f"{p.name:45} ERR {e}")