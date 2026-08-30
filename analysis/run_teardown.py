import urllib.request, re, os, ssl
ssl._create_default_https_context = ssl._create_unverified_context

def fetch(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.read().decode('utf-8','ignore')
    except Exception as e:
        return f"FAILED: {e}"

os.makedirs("analysis/competitors", exist_ok=True)

sites = {
    "SofritoStudio (YOU)": "https://sofritostudio.com",
    "DelishDlites": "https://www.delishdlites.com",
    "Etsy PR Cookbook": "https://www.etsy.com/search?q=puerto+rican+cookbook+digital"
}

report = "# Competitor Teardown - SofritoStudio\n\n"
report += "| Feature | You | Competitors | Gap | \ Fix |\n"
report += "|---|---|---|---|---|\n"

for name, url in sites.items():
    print(f"Fetching {name}...")
    html = fetch(url)
    title = re.search(r'<title>(.*?)</title>', html, re.I)
    title = title.group(1)[:80] if title else "No title"
    prices = re.findall(r'\$\s?\d{1,3}', html)
    has_email = "email" in html.lower() or "subscribe" in html.lower()
    has_gumroad = "gumroad" in html.lower() or "buy" in html.lower()
    
    # save raw summary
    fname = f"analysis/competitors/{name.replace(' ','_')}.txt"
    open(fname,'w',encoding='utf-8').write(f"URL: {url}\nTITLE: {title}\nPRICES: {prices[:10]}\nHAS_EMAIL: {has_email}\nHAS_CHECKOUT: {has_gumroad}\n")
    report += f"| {name} | {title} | Prices: {prices[:3]} | Email:{has_email} | Use Opencode to copy |\n"

# your specific gaps
report += "\n## Quick Wins for 7.42GB Setup\n"
report += "1. **Pricing**: You have // - keep. Add  bump (Sofrito 101 checklist) -  with Gumroad\n"
report += "2. **Email**: Add Buttondown embed on hero - free 100 subs\n"
report += "3. **Checkout**: Use Gumroad overlay - 10% fee,  upfront\n"
report += "4. **Funnel**: Add /sofrito-101 lead magnet page - build with qwen2.5-coder:3b local\n"

open("analysis/teardown.md","w",encoding="utf-8").write(report)
print("Done - check analysis/teardown.md")
