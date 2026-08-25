from pathlib import Path
import json
import re

ES = Path('deploy/es/blog')
TARGETS = ['arroz-con-gandules', 'arroz-con-pollo', 'coquito', 'mofongo', 'pernil']

for slug in TARGETS:
    f = ES / f"{slug}.html"
    t = f.read_text(encoding='utf-8', errors='ignore')
    if '"@type": "FAQPage"' in t:
        print(slug, 'already has FAQPage')
        continue
    # extract Q/A pairs from .faq-item blocks
    pairs = re.findall(
        r'faq-question">\s*(.*?)\s*<svg.*?</svg>\s*</button>\s*<div class="faq-answer"><div class="faq-answer-inner">(.*?)</div>',
        t, re.S)
    if not pairs:
        print(slug, 'no faq pairs found — skip')
        continue
    clean = lambda s: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s)).strip()
    main = [{"@type": "Question", "name": clean(q),
             "acceptedAnswer": {"@type": "Answer", "text": clean(a)}} for q, a in pairs]
    ld = json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": main,
    }, ensure_ascii=False, indent=2)
    script = '\n  <script type="application/ld+json">\n  ' + ld + '\n  </script>\n'
    t = t.replace('</head>', script + '</head>', 1)
    f.write_text(t, encoding='utf-8')
    print(slug, 'added FAQPage ld with', len(main), 'questions')