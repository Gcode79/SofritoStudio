"""Add seasonal cross-link cards to YMAL grids on coquito / nochebuena-menu /
arroz-con-dulce. Idempotent: skips if the target href already in the file."""
from pathlib import Path

BLOG = Path("deploy/blog")

def card(href, img, tag, title, alt=None):
    alt = alt or title
    return (
        f'\n          <a href="{href}" style="background: var(--white); border: 1px solid var(--cream-dark); '
        f'border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.3s, box-shadow 0.3s; '
        f'text-decoration: none; color: var(--ink);">\n'
        f'            <picture><source srcset="../images/{img}.webp" type="image/webp">'
        f'<img src="../images/{img}.jpg" alt="{alt}" style="width: 100%; aspect-ratio: 16/10; object-fit: cover;" loading="lazy"></picture>\n'
        f'            <div style="padding: 14px 16px;">\n'
        f'              <span class="tag" style="font-size: 0.7rem;">{tag}</span>\n'
        f'              <h4 style="font-size: 0.95rem; margin-top: 6px; line-height: 1.3; color: var(--ink);">{title}</h4>\n'
        f"            </div>\n"
        f"          </a>"
    )

JOBS = {
    "coquito": [
        card("nochebuena-menu.html", "rec-pernil-course", "Holiday",
             "The Nochebuena Menu"),
    ],
    "nochebuena-menu": [
        card("arroz-con-dulce.html", "rec-arroz-con-dulce", "Dessert",
             "Arroz con Dulce"),
    ],
    "arroz-con-dulce": [
        card("coquito.html", "rec-coquito", "Drinks", "Coquito"),
        card("nochebuena-menu.html", "rec-pernil-course", "Holiday",
             "The Nochebuena Menu"),
    ],
}

for slug, cards in JOBS.items():
    f = BLOG / f"{slug}.html"
    html = f.read_text(encoding="utf-8", errors="ignore")
    new = [c for c in cards if c.split('href="')[1].split('"')[0] not in html]
    if not new:
        print(f"{slug}: already linked")
        continue
    # insert before the closing </div> of the YMAL grid (3-col grid div)
    i = html.find("You Might Also Like")
    gi = html.find('repeat(3, 1fr)', i)
    close = html.find("</div>", gi) + len("</div>")
    html = html[:close - len("</div>")] + "".join(new) + "\n        " + html[close - len("</div>"):]
    f.write_text(html, encoding="utf-8")
    print(f"{slug}: added {len(new)} card(s)")
