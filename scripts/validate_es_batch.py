"""Validate all ES recipe pages (nesting + JSON-LD) + EN hreflang pairs + sitemap."""
from pathlib import Path
import json
import re
from html.parser import HTMLParser

ES_BLOG = Path("deploy/es/blog")
EN_BLOG = Path("deploy/blog")

ES_SLUGS = ['alcapurrias', 'arepas-de-coco', 'arroz-con-dulce', 'arroz-con-gandules',
            'arroz-con-pollo', 'asopao', 'avena', 'bacalaitos', 'besitos-de-coco',
            'cafe-con-leche', 'chocolate-caliente', 'chuletas', 'coquito', 'empanadillas',
            'flan', 'habichuelas', 'majarete', 'mallorcas', 'mofongo', 'nochebuena-menu',
            'papa-rellena', 'pastelillos', 'pernil', 'pinchos', 'quesitos', 'sancocho',
            'sofrito', 'sopa-de-fideo', 'surullitos', 'tembleque', 'tostones']


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


fail = False
for slug in ES_SLUGS:
    f = ES_BLOG / f"{slug}.html"
    if not f.exists():
        print(f"MISSING es page: {slug}")
        fail = True
        continue
    html = f.read_text(encoding="utf-8", errors="ignore")
    clean = re.sub(r"<script.*?</script>|<style.*?</style>", "", html, flags=re.S)
    n = Nest()
    n.feed(clean)
    ld_bad = []
    for i, m in enumerate(re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)):
        try:
            json.loads(m.group(1))
        except Exception as e:
            ld_bad.append(f"ld#{i}: {e}")
    # required markers
    markers = {
        'lang=es': 'lang="es"' in html,
        'canonical': 'rel="canonical"' in html,
        'hreflang': html.count('hreflang=') >= 3,
        'recipe ld': '"@type": "Recipe"' in html,
        'faq ld': '"@type": "FAQPage"' in html,
        'og:locale': 'og:locale' in html,
        'ing-scaler': 'scaler-bar' in html,
        'comments hook': 'data-recipe-id' not in html,  # edge injects
    }
    ok = not n.errors and n.div_balance == 0 and not ld_bad and all(markers.values())
    if not ok:
        fail = True
    print(f"{slug:22} {'OK' if ok else 'FAIL'} div={n.div_balance} {n.errors[:1]} {ld_bad[:1]} "
          f"{[k for k, v in markers.items() if not v]}")

# EN hreflang pairs
for slug in ES_SLUGS:
    en = EN_BLOG / f"{slug}.html"
    if not en.exists():
        continue
    h = en.read_text(encoding="utf-8", errors="ignore")
    if slug in ('nochebuena-menu',) and h.count('hreflang=') < 3:
        continue  # guide page handled separately
    if h.count('hreflang=') < 3:
        print(f"EN missing hreflang: {slug} ({h.count('hreflang=')})")
        fail = True

# sitemap count
sm = (Path("deploy/sitemap.xml")).read_text(encoding="utf-8")
n = len(re.findall(r'<loc>', sm))
print(f"sitemap urls: {n}")
if n != 131:
    print(f"  expected 131, got {n}")
    fail = True

raise SystemExit(1 if fail else 0)