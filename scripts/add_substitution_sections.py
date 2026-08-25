"""Insert recipe-specific 'Substitutions & Swaps' sections into top blog posts.
Targets long-tail queries: '<ingredient> substitute', '<dish> substitutions'.
Idempotent: skips files that already contain id="substitutions".
"""
from pathlib import Path

BLOG = Path("deploy/blog")

SECTIONS = {
    "pernil": [
        "<b>No saz&oacute;n?</b> Make your own: 1 tsp salt, 1 tsp garlic powder, &frac12; tsp dried oregano, and a pinch of ground achiote. It tastes fresher than the packet anyway.",
        "<b>No achiote (annatto)?</b> It's mostly for color here. A pinch of sweet paprika plus a tiny pinch of turmeric gets you close without changing the flavor.",
        "<b>No pork shoulder?</b> Fresh picnic ham is the closest cut and cooks the same by weight. Avoid loin &mdash; it's too lean and turns out dry at 185&deg;F.",
        "<b>No sour oranges (naranja agria)?</b> The classic swap: half fresh orange juice + half lime juice. That's exactly what mainland kitchens have done for decades.",
    ],
    "arroz-con-gandules": [
        "<b>No canned gandules (pigeon peas)?</b> Dried gandules work if you simmer them tender first (45&ndash;60 min). In a true pinch, black-eyed peas keep the texture, though the flavor shifts.",
        "<b>No saz&oacute;n?</b> Stir in &frac14; tsp achiote powder + &frac12; tsp oregano + a pinch of cumin with the sofrito. Same color, same depth.",
        "<b>No calabaza (calabaza pumpkin)?</b> Butternut squash is the standard mainland swap &mdash; same sweetness, same melt.",
        "<b>Brown rice?</b> Yes, but add 15 minutes and about &frac12; cup more liquid. The texture is nuttier; still legit.",
    ],
    "mofongo": [
        "<b>No green plantains?</b> There's no real substitute for the texture &mdash; but mofongo de yuca (cassava) and mofongo de panap&eacute;n (breadfruit) are both traditional dishes of their own. Yellow plantains make maduros, not mofongo.",
        "<b>No chicharr&oacute;n?</b> Crispy fried bacon is the everyday swap. Vegetarian? Saut&eacute;ed mushrooms with extra garlic carry the dish surprisingly well.",
        "<b>No mortar and pil&oacute;n?</b> A heavy bowl + the bottom of a sturdy glass works. You lose some ritual, not much texture.",
        "<b>No pork cracklings, no bacon?</b> Garlic shrimp on top (mofongo relleno de camarones) turns it into the restaurant version.",
    ],
    "sofrito": [
        "<b>No recao (culantro)?</b> Use double the cilantro &mdash; it's milder and brighter, so the sofrito leans grassier but still authentic. Many mainland boricua families do exactly this.",
        "<b>No aj&iacute; dulce?</b> Cubanelle pepper is the closest match. Never jalape&ntilde;os or serranos &mdash; sofrito is aromatic, not spicy.",
        "<b>No cubanelle peppers?</b> Green bell pepper plus half a red bell pepper covers the sweetness gap.",
        "<b>Blender or food processor?</b> Both work. Pulse rather than liquefy &mdash; you want a rough pestado, not a smoothie. See the <a href=\"../sofrito-recipe.html\">full sofrito guide</a> for texture details.",
    ],
    "coquito": [
        "<b>No cream of coconut (Coco L&oacute;pez)?</b> Mix sweetened condensed milk + coconut cream + a drop of coconut extract. Shake the can &mdash; cream of coconut separates by design.",
        "<b>No white rum?</b> Spiced rum makes it warmer and sweeter; bourbon is untraditional but excellent. For a zero-proof batch, use 1 tsp rum extract + an extra splash of coconut milk.",
        "<b>Egg-free coquito?</b> Traditional coquito has no eggs at all &mdash; if a recipe adds them, that's the eggnog hybrid version. Ours is eggless.",
        "<b>Lactose-free?</b> Swap evaporated milk for more coconut milk and use oat condensed milk. Nobody at Nochebuena will notice.",
    ],
    "pastelillos": [
        "<b>No Goya discos?</b> Any brand of empanada discs works identically &mdash; look for 5-inch, thawed but cold. Homemade dough: flour, butter, water, pinch of salt, rested 30 min.",
        "<b>No ground beef?</b> Ground turkey or chicken works &mdash; season harder (they're leaner). Chicken guisado pastelillos are their own classic.",
        "<b>Baked instead of fried?</b> Brush with beaten egg, bake at 400&deg;F for 20&ndash;22 min. Different animal, still good. The air fryer version lives in our <a href=\"../products/air-fryer.html\">Boricua Air Fryer guide</a>.",
        "<b>Cheese version?</b> Yes &mdash; pastelillos de queso: just cheese, sealed well so it doesn't leak. Kids' favorite at every kiosko.",
    ],
    "tostones": [
        "<b>No green plantains?</b> They're non-negotiable &mdash; yellow plantains are sweet (maduros) and won't smash or fry the same. If only ripe ones are available, make maduros instead.",
        "<b>Air fryer tostones?</b> Spray both sides with oil, 400&deg;F for 8 minutes, smash, then 6&ndash;8 more minutes. About 80% as good, way less oil. Full method in the <a href=\"../products/air-fryer.html\">air fryer guide</a>.",
        "<b>No garlic dip (mojo)?</b> Ketchup + mayo + a splash of the vinegar from pickled onions is the kiosko standby. Mayo-ketchup is the official name. Really.",
        "<b>Can I fry them twice ahead?</b> Fry once, cool, freeze flat. From frozen: second fry straight in hot oil for 2&ndash;3 minutes. Party trick unlocked.",
    ],
    "habichuelas": [
        "<b>No pink beans?</b> Pinto beans are the closest mainland twin &mdash; creamy, similar size. Kidney beans work but stay firmer.",
        "<b>Dried beans instead of canned?</b> Absolutely better: 1 cup dried = ~3 cans worth. Simmer tender first (with bay leaf), then start the recipe from the sofrito step.",
        "<b>No calabaza?</b> Butternut squash, diced small. It melts into the sauce the same way.",
        "<b>No sofrito?</b> Saut&eacute; onion, bell pepper, and 3 cloves garlic as the base, plus a pinch of oregano and achiote. It's a shortcut, not a crime.",
    ],
    "asopao": [
        "<b>No Valencia rice?</b> Arborio or any short-grain rice gives the creamiest body. Long-grain works in a pinch &mdash; use slightly less liquid, expect soupier.",
        "<b>Only boneless chicken?</b> Thighs are better than breasts here &mdash; they hold up to simmering. Boneless cuts ~10 minutes off cook time.",
        "<b>No whole plum tomatoes?</b> Canned crushed tomatoes + a pinch of sugar. Fresh roma, peeled and chopped, also fine.",
        "<b>Frozen mixed vegetables?</b> Traditional asopao doesn't use them &mdash; add peas/carrots at the very end if you must, but the boricua move is peppers + olives + cilantro.",
    ],
    "sancocho": [
        "<b>Can't find yaut&iacute;a?</b> Malanga or taro root is nearly identical. Extra yuca fills any remaining gap &mdash; the stew forgives.",
        "<b>No &ntilde;ame?</b> More yuca + one extra potato. Texture shifts slightly; nobody complains.",
        "<b>No calabaza?</b> Butternut squash &mdash; same sweetness, same golden color it lends the broth.",
        "<b>Meat shortcuts?</b> Sancocho de pollo (chicken-only) is its own respected version and cuts cook time roughly in half. Two-meat minimum for the full experience; seven if it's a Sunday.",
    ],
}

def section_html(items):
    return (
        '\n        <h2 id="substitutions">Substitutions &amp; Swaps</h2>\n'
        "        <ul>\n"
        + "".join(f"          <li>{item}</li>\n" for item in items)
        + "        </ul>\n\n        "
    )

changed, skipped = [], []
for slug, items in SECTIONS.items():
    f = BLOG / f"{slug}.html"
    html = f.read_text(encoding="utf-8", errors="ignore")
    if 'id="substitutions"' in html:
        skipped.append(slug)
        continue
    marker = '<h2 id="faq">Frequently Asked Questions</h2>'
    if marker not in html:
        print(f"!! {slug}: FAQ anchor not found — manual fix needed")
        continue
    html = html.replace(marker, section_html(items) + marker, 1)
    f.write_text(html, encoding="utf-8")
    changed.append(slug)

print("inserted:", ", ".join(changed))
print("skipped (already present):", ", ".join(skipped) or "none")
