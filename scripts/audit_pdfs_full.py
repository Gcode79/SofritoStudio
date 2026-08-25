"""Full audit: EVERY PDF in deploy/products/printables + deploy/freebies +
Desktop uploads + every EPUB — legal footer + page numbers."""
import sys
from pathlib import Path
from pypdf import PdfReader

REQUIRED = ["all rights reserved", "sofritostudio.com", "reproduced", "permission"]

ROOTS = [
    Path("deploy/products/printables"),
    Path("deploy/freebies"),
    Path("C:/Users/josho/Desktop/Sofrito-Gumroad-Uploads"),
]

pdfs = {}
for r in ROOTS:
    if not r.exists():
        continue
    for p in r.rglob("*.pdf"):
        pdfs[p] = None

# check tracked products/printables too (source copies)
for p in Path("products/printables").rglob("*.pdf"):
    pdfs[p] = None

bad = 0
for p in sorted(pdfs):
    try:
        r = PdfReader(str(p))
        n = len(r.pages)
        text = ""
        for i in [0, 1, 2, n - 1]:
            if i < n:
                text += (r.pages[i].extract_text() or "") + "\n"
        low = text.lower()
        missing = [k for k in REQUIRED if k not in low]
        has_page = "page " in low
        ok = not missing and has_page
        if not ok:
            bad += 1
            print(f"BAD  {p} pages={n} missing={missing} pageNum={has_page}")
        else:
            print(f"ok   {p} pages={n}")
    except Exception as e:
        bad += 1
        print(f"ERR  {p}: {e}")

# EPUBs: check for copyright text in the EPUB html
print("\n--- EPUBs ---")
import zipfile
epub_bad = 0
for r in [Path("deploy/products/printables"), Path("products/printables")]:
    for p in r.glob("*.epub"):
        try:
            with zipfile.ZipFile(str(p)) as z:
                names = z.namelist()
                htmls = [x for x in names if x.endswith((".xhtml", ".html", ".htm"))]
                text = ""
                for h in htmls[:6]:
                    text += z.read(h).decode("utf-8", errors="ignore").lower()
                missing = [k for k in REQUIRED if k not in text]
                if missing:
                    epub_bad += 1
                    print(f"BAD-EPUB {p} missing={missing}")
                else:
                    print(f"ok-epub {p}")
        except Exception as e:
            epub_bad += 1
            print(f"ERR-EPUB {p}: {e}")

print(f"\nTOTAL PDF bad: {bad}, EPUB bad: {epub_bad}")