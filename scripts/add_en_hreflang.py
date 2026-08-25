from pathlib import Path
import re

slugs = ['alcapurrias', 'arepas-de-coco', 'asopao', 'avena', 'bacalaitos',
         'besitos-de-coco', 'cafe-con-leche', 'chocolate-caliente', 'chuletas',
         'empanadillas', 'flan', 'habichuelas', 'majarete', 'mallorcas',
         'papa-rellena', 'pastelillos', 'pinchos', 'quesitos', 'sancocho',
         'sofrito', 'sopa-de-fideo', 'surullitos', 'tostones']
for s in slugs:
    f = Path('deploy/blog') / (s + '.html')
    t = f.read_text(encoding='utf-8', errors='ignore')
    if 'hreflang="es"' in t:
        print(s, 'already has hreflang')
        continue
    canon = re.search(r'<link rel="canonical" href="([^"]+)">', t)
    if not canon:
        print('NO CANON', s)
        continue
    url = canon.group(1)
    es_url = url.replace('/blog/', '/es/blog/')
    add = (f'  <link rel="alternate" hreflang="en" href="{url}">\n'
           f'  <link rel="alternate" hreflang="es" href="{es_url}">\n'
           f'  <link rel="alternate" hreflang="x-default" href="{url}">\n')
    t = t.replace(canon.group(0), canon.group(0) + '\n' + add, 1)
    f.write_text(t, encoding='utf-8')
    print('added hreflang', s)