# Fix product pages with real HTML content
for name in ['la-mesa-boricua-sales', 'kitchen-bundle', 'full-table']:
    path = f'C:/Users/josho/SofritoStudio/deploy/products/{name}.html'
    with open(path, 'r') as f:
        content = f.read()
    old = '<div id="product-root"></div>'
    if name == 'la-mesa-boricua-sales':
        new = '<div class="section"><div class="wrap center"><h1>La Mesa Boricua — The Complete Bilingual Cookbook</h1><p class="sub">30 authentic Puerto Rican recipes — bilingual (EN/ES), mainland-tested, with ingredient swaps and a holiday menu builder. $47.</p><div class="price">$47</div><a class="btn btn-primary-big" href="https://sofritostudio.gumroad.com/l/cmfkg">Get La Mesa Boricua — $47</a><ul><li>30 recipes across 6 chapters</li><li>Bilingual EN/ES throughout</li><li>Ingredient finder + mainland swaps</li><li>Holiday Nochebuena menu builder</li></ul></div></div>\n<div id="product-root"></div>'
    elif name == 'kitchen-bundle':
        new = '<div class="section"><div class="wrap center"><h1>The Kitchen Bundle — Cookbook + Printables</h1><p class="sub">Everything in La Mesa Boricua plus 8 printable recipe cards, meal planner, and shopping lists. $67.</p><div class="price">$67</div><a class="btn btn-primary-big" href="https://sofritostudio.gumroad.com/l/razabs">Get the Bundle — $67</a><ul><li>Everything in La Mesa Boricua</li><li>8 printable recipe cards (EN/ES)</li><li>Bilingual meal planner + shopping lists</li><li>Sofrito batch cheat sheet</li></ul></div></div>\n<div id="product-root"></div>'
    else:
        new = '<div class="section"><div class="wrap center"><h1>The Full Table — Complete Kitchen System</h1><p class="sub">The whole kitchen: cookbook, printables, and the Boricua Weeknights 30-minute dinner system. $97.</p><div class="price">$97 <small><s>$133</s></small></div><a class="btn btn-primary-big" href="https://sofritostudio.gumroad.com/l/dodbtn">Get the Full Table — $97</a><ul><li>Everything in the Kitchen Bundle</li><li>50 no-recipe 30-minute dinners</li><li>6-step planning-to-table workflow</li><li>Grocery-to-menu tool + pantry checklist</li></ul></div></div>\n<div id="product-root"></div>'
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('Fixed:', name)
