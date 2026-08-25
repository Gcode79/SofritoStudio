from pathlib import Path
import re

sitemap = Path('deploy/sitemap.xml')
t = sitemap.read_text(encoding='utf-8')

existing = set(re.findall(r'<loc>(https://sofritostudio.com/es/blog/[^<]+)</loc>', t))
new_slugs = ['alcapurrias', 'arepas-de-coco', 'asopao', 'avena', 'bacalaitos',
             'besitos-de-coco', 'cafe-con-leche', 'chocolate-caliente', 'chuletas',
             'empanadillas', 'flan', 'habichuelas', 'majarete', 'mallorcas',
             'papa-rellena', 'pastelillos', 'pinchos', 'quesitos', 'sancocho',
             'sofrito', 'sopa-de-fideo', 'surullitos', 'tostones']

entries = []
for s in new_slugs:
    loc = f'https://sofritostudio.com/es/blog/{s}'
    if loc in existing:
        continue
    entries.append(
        f'  <url>\n'
        f'    <loc>{loc}</loc>\n'
        f'    <lastmod>2026-08-25</lastmod>\n'
        f'    <changefreq>weekly</changefreq>\n'
        f'    <priority>0.7</priority>\n'
        f'  </url>'
    )

if entries:
    # insert before closing </urlset>
    block = '\n' + '\n'.join(entries) + '\n'
    t = t.rstrip()
    assert t.endswith('</urlset>')
    t = t[: -len('</urlset>')] + block + '</urlset>\n'
    sitemap.write_text(t, encoding='utf-8')

print('added', len(entries), 'urls')
print('total locs:', len(re.findall(r'<loc>', t)))