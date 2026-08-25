from pathlib import Path
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
                self.errors.append(f"nested <a> at line {self.getpos()[0]}")
        elif tag == "div":
            self.div_balance += 1

    def handle_endtag(self, tag):
        if tag == "a":
            self.a_stack = max(0, self.a_stack - 1)
        elif tag == "div":
            self.div_balance -= 1

for slug in ["coquito", "arroz-con-dulce", "nochebuena-menu",
             "pernil", "sofrito", "tostones"]:
    p = Path("deploy/blog") / f"{slug}.html"
    html = p.read_text(encoding="utf-8", errors="ignore")
    # strip script/style content (JS contains strings that confuse parser)
    import re
    html_clean = re.sub(r"<script.*?</script>|<style.*?</style>", "", html, flags=re.S)
    n = Nest()
    n.feed(html_clean)
    print(f"{slug:20} nested-a errors={len(n.errors)} div-balance={n.div_balance} {n.errors[:3]}")
