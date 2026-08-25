"""Extract structured content from EN recipe pages -> JSON for ES translation.
Usage: python scripts/extract_recipe_content.py <slug> [<slug> ...]
Prints compact JSON per slug."""
import json
import re
import sys
from pathlib import Path

BLOG = Path("deploy/blog")


def strip_tags(html):
    html = re.sub(r"<[^>]+>", "", html)
    return re.sub(r"\s+", " ", html).strip()


def extract(slug):
    html = (BLOG / f"{slug}.html").read_text(encoding="utf-8", errors="ignore")
    out = {"slug": slug}
    out["title"] = strip_tags(re.search(r"<title>(.*?)</title>", html, re.S).group(1))
    m = re.search(r'name="description" content="([^"]+)"', html)
    out["desc"] = m.group(1)
    out["eyebrow"] = strip_tags(re.search(r'class="eyebrow"[^>]*>([^<]+)<', html).group(1))
    # hero trust items (time + difficulty)
    trust = re.findall(r'hero-trust-item[^>]*>(?:<svg.*?</svg>)?\s*([^<]+)<', html)
    out["trust"] = [t.strip() for t in trust]
    # intro paragraph (first big <p> after blog-meta)
    m = re.search(r'blog-meta.*?</p>\s*<p[^>]*>(.*?)</p>', html, re.S)
    out["intro"] = m.group(1) if m else ""
    # what-is section paragraphs (between id="what-is" h2 and next h2)
    m = re.search(r'id="what-is">.*?</h2>(.*?)<h2', html, re.S)
    if m:
        out["whatis"] = re.findall(r"<p>(.*?)</p>", m.group(1), re.S)
    else:
        # tostones-style alternate first h2
        m = re.search(r"<main.*?<h2[^>]*>(.*?)</h2>(.*?)<h2", html, re.S)
        out["whatis"] = re.findall(r"<p>(.*?)</p>", m.group(2), re.S) if m else []
        out["first_h2"] = strip_tags(m.group(1)) if m else None
    # ingredients box lis
    m = re.search(r'id="recipe"[^>]*>(.*?)</div>', html, re.S)
    out["ingredients"] = re.findall(r"<li>(.*?)</li>", m.group(1), re.S) if m else []
    out["serves_h3"] = strip_tags(re.search(r'id="recipe".*?<h3[^>]*>(.*?)</h3>', html, re.S).group(1)) if m else "Serves 8:"
    # optional Mainland Swaps / Variations h3 block
    m = re.search(r"<h3>(?:Mainland Swaps|Variations)</h3>\s*<ul>(.*?)</ul>", html, re.S)
    out["swaps_h3"] = "Mainland Swaps" if (m and "Mainland" in m.group(0)) else ("Variations" if m else None)
    out["swaps"] = re.findall(r"<li>(.*?)</li>", m.group(1), re.S) if m else []
    # steps
    m = re.search(r'id="steps">(.*?)</div>\s*</div>', html, re.S)
    if not m:
        m = re.search(r'<h2 id="steps"[^>]*>.*?</h2>\s*<div[^>]*>(.*)?</div>', html, re.S)
    blocks = re.findall(r"<span[^>]*>\d+</span>\s*<div>(.*?)</div>", html, re.S)
    out["steps"] = blocks
    # tips
    m = re.search(r'id="tips">(.*?)</h2>\s*<ul>(.*?)</ul>', html, re.S)
    if not m:
        m = re.search(r'<h2[^>]*>(Tips[^<]*)</h2>\s*<ul>(.*?)</ul>', html, re.S)
    out["tips_h2"] = strip_tags(m.group(1)) if m else None
    out["tips"] = re.findall(r"<li>(.*?)</li>", m.group(2), re.S) if m else []
    # faqs
    out["faqs"] = [
        {"q": strip_tags(q), "a": strip_tags(a)}
        for q, a in re.findall(
            r'faq-question">\s*(.*?)\s*<svg.*?</svg>\s*</button>\s*<div class="faq-answer"><div class="faq-answer-inner">(.*?)</div>',
            html,
            re.S,
        )
    ]
    # pinterest media image
    m = re.search(r'pin/create/button/\?url=[^&]+&amp;media=([^&]+)', html)
    out["pin_img"] = m.group(1).split("/")[-1] if m else ""
    return out


if __name__ == "__main__":
    for slug in sys.argv[1:]:
        print(json.dumps(extract(slug), ensure_ascii=False))
