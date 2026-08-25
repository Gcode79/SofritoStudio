"""Validate HTML nesting + JSON-LD on all pages touched this session."""
from pathlib import Path
import json
import re
from html.parser import HTMLParser

class Nest(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.a_stack = 0
        self.errors = []
        self.div_balance = 0
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.a_stack += 1
            if self.a_stack > 1:
                self.errors.append(f"nested <a> line {self.getpos()[0]}")
        elif tag == "div":
            self.div_balance += 1
    def handle_endtag(self, tag):
        if tag == "a":
            self.a_stack = max(0, self.a_stack - 1)
        elif tag == "div":
            self.div_balance -= 1

PAGES = [
    "blog/coquito.html", "blog/arroz-con-dulce.html", "blog/nochebuena-menu.html",
    "blog/pernil.html", "blog/arroz-con-gandules.html", "blog/mofongo.html",
    "blog/sofrito.html", "blog/pastelillos.html", "blog/tostones.html",
    "blog/habichuelas.html", "blog/asopao.html", "blog/sancocho.html",
    "blog/tembleque.html",
    "es/blog/arroz-con-dulce.html", "es/blog/tembleque.html",
    "freebies/5-beginner-recipes.html",
]

fail = False
for p in PAGES:
    f = Path("deploy") / p
    html = f.read_text(encoding="utf-8", errors="ignore")
    clean = re.sub(r"<script.*?</script>|<style.*?</style>", "", html, flags=re.S)
    n = Nest()
    n.feed(clean)
    # JSON-LD blocks must parse as JSON
    ld_bad = []
    for i, m in enumerate(re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)):
        try:
            json.loads(m.group(1))
        except Exception as e:
            ld_bad.append(f"ld#{i}: {e}")
    ok = not n.errors and n.div_balance == 0 and not ld_bad
    if not ok:
        fail = True
    print(f"{p:38} {'OK' if ok else 'FAIL'} div={n.div_balance} {n.errors[:2]} {ld_bad[:2]}")

# substitution sections present in all 10 targets
for slug in ["pernil","arroz-con-gandules","mofongo","sofrito","coquito",
             "pastelillos","tostones","habichuelas","asopao","sancocho"]:
    h = (Path("deploy/blog") / f"{slug}.html").read_text(encoding="utf-8", errors="ignore")
    has = 'id="substitutions"' in h
    if not has:
        fail = True
        print(f"MISSING substitutions: {slug}")
print("substitution sections: all present" if not fail else "")

# hreflang pairs
for slug in ["arroz-con-dulce", "tembleque"]:
    en = Path(f"deploy/blog/{slug}.html").read_text(encoding="utf-8", errors="ignore")
    es = Path(f"deploy/es/blog/{slug}.html").read_text(encoding="utf-8", errors="ignore")
    print(f"hreflang {slug}: en={en.count('hreflang')} es={es.count('hreflang')}")

raise SystemExit(1 if fail else 0)
