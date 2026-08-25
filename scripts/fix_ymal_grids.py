"""Repair YMAL grids broken by add_seasonal_links.py (cards were inserted
inside the first card's padding div -> nested anchors). Rebuilds each grid
as flat sibling <a> cards."""
from pathlib import Path
import re

BLOG = Path("deploy/blog")
GRID_OPEN = (
    '<h2>You Might Also Like</h2>\n'
    '        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 16px 0 32px;">\n'
)

def find_grid(html):
    i = html.find("You Might Also Like")
    if i == -1:
        return None
    start = html.rfind("<h2", 0, i)
    # grid ends at the </div> that precedes the next top-level sibling after
    # the cards; we scan forward for balanced closing
    j = html.find("</div>", i)
    depth = 0
    k = html.find("<div", i)
    pos = i
    # walk tokens to find matching close of the grid div
    opens = []
    m = re.compile(r'<div\b|</div>').search(html, html.find('<div', i))
    while m:
        if m.group(0) == "</div>":
            if depth == 1:
                return start, m.end()
            depth -= 1
        else:
            depth += 1
        m = re.compile(r'<div\b|</div>').search(html, m.end())
    return None

def card(href, img_base, tag, title):
    img_jpg = f"../images/{img_base}.jpg"
    img_webp = f"../images/{img_base}.webp"
    pic = (
        f'<picture><source srcset="{img_webp}" type="image/webp">'
        f'<img src="{img_jpg}" alt="{title}" style="width: 100%; aspect-ratio: 16/10; object-fit: cover;" loading="lazy"></picture>'
        if Path("deploy/images", f"{img_base}.webp").exists()
        else f'<img src="{img_jpg}" alt="{title}" style="width: 100%; aspect-ratio: 16/10; object-fit: cover;" loading="lazy">'
    )
    return (
        f'          <a href="{href}" style="background: var(--white); border: 1px solid var(--cream-dark); '
        f"border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.3s, box-shadow 0.3s; "
        f'text-decoration: none; color: var(--ink);">\n'
        f"            {pic}\n"
        f'            <div style="padding: 14px 16px;">\n'
        f'              <span class="tag" style="font-size: 0.7rem;">{tag}</span>\n'
        f'              <h4 style="font-size: 0.95rem; margin-top: 6px; line-height: 1.3; color: var(--ink);">{title}</h4>\n'
        f"            </div>\n"
        f"          </a>"
    )

# slug -> [(href, image base, tag, title)]
GRIDS = {
    "coquito": [
        ("chocolate-caliente.html", "rec-chocolate", "Drinks", "Chocolate Caliente"),
        ("avena.html", "rec-avena", "Drinks", "Avena"),
        ("cafe-con-leche.html", "rec-cafe-con-leche", "Drinks", "Café con Leche"),
        ("nochebuena-menu.html", "pernil-course", "Holiday", "The Nochebuena Menu"),
    ],
    "arroz-con-dulce": [
        ("tembleque.html", "rec-tembleque", "Desserts", "Tembleque"),
        ("coquito.html", "rec-coquito", "Drinks", "Coquito"),
        ("nochebuena-menu.html", "pernil-course", "Holiday", "The Nochebuena Menu"),
        ("flan.html", "rec-flan", "Desserts", "Flan"),
        ("majarete.html", "rec-majarete", "Desserts", "Majarete"),
    ],
    "nochebuena-menu": [
        ("pernil.html", "pernil-course", "Centerpiece", "Pernil Asado"),
        ("arroz-con-gandules.html", "rec-arroz-gandules", "The Anchor", "Arroz con Gandules"),
        ("coquito.html", "rec-coquito", "The Drink", "Coquito"),
        ("arroz-con-dulce.html", "rec-arroz-con-dulce", "Dessert", "Arroz con Dulce"),
    ],
}

for slug, cards in GRIDS.items():
    f = BLOG / f"{slug}.html"
    html = f.read_text(encoding="utf-8", errors="ignore")
    span = find_grid(html)
    assert span, slug
    new_section = GRID_OPEN + "\n".join(card(*c) for c in cards) + "\n        </div>"
    html = html[: span[0]] + new_section + html[span[1]:]
    f.write_text(html, encoding="utf-8")
    print(f"{slug}: rebuilt ({len(cards)} cards)")

# verify no nested anchors remain anywhere
for slug in list(GRIDS) + ["nochebuena-menu"]:
    html = (BLOG / f"{slug}.html").read_text(encoding="utf-8", errors="ignore")
    bad = re.search(r"<a [^>]*>\s*<picture>[^<]*(?:<[^/a][^>]*)*<a ", html)
    # simpler check: count <a vs </a inside grid
    i = html.find("You Might Also Like")
    seg = html[i:html.find("</div>", html.find("</div>", i) + 1) + 6]
    a_open, a_close = seg.count("<a "), seg.count("</a>")
    div_open = len(re.findall(r"<div\b", seg))
    div_close = seg.count("</div>")
    status = "OK" if (a_open == a_close and div_open == div_close) else "BROKEN"
    print(f"{slug}: <a {a_open}/{a_close} <div {div_open}/{div_close} -> {status}")
