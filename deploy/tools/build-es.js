// Generates the /es/ Spanish-language tree from the data-driven pages.
// - es/products/*.html  <- copy of each root products page, lang="es", hreflang es
// - es/products.html    <- Spanish product grid (renders from catalog, lang es)
// Idempotent. Usage: node tools/build-es.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "products");
const DEST = path.join(ROOT, "es", "products");
const SITE = "https://sofritostudio.com";

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

function productUrl(es, sku) {
  const file = (sku === "mesa") ? "la-mesa-boricua-sales" : sku;
  return SITE + (es ? "/es/products/" : "/products/") + file + ".html";
}

let converted = 0;

fs.readdirSync(SRC).forEach(function (name) {
  if (!name.endsWith(".html")) return;
  if (name === "product.html") return; // template, not a real page
  const sku = name.replace(".html", "");
  const html = fs.readFileSync(path.join(SRC, name), "utf8");
  const dest = path.join(DEST, name);

  let out = html;
  // <html lang="en"> -> es
  out = out.replace('<html lang="en">', '<html lang="es">');
  out = out.replace('<html lang="en-US">', '<html lang="es">');
  // Update hreflang + canonical to Spanish URLs.
  out = out.replace(
    /<link rel="canonical" href="[^"]+">/,
    '<link rel="canonical" href="' + productUrl(true, sku) + '">'
  );
  out = out.replace(
    /<link rel="alternate" hreflang="en" href="[^"]+">/,
    '<link rel="alternate" hreflang="en" href="' + productUrl(false, sku) + '">'
  );
  out = out.replace(
    /<link rel="alternate" hreflang="x-default" href="[^"]+">/,
    '<link rel="alternate" hreflang="x-default" href="' + productUrl(false, sku) + '">'
  );
  // Add es alternate if not present.
  if (!out.includes('hreflang="es"')) {
    out = out.replace(
      /(<link rel="alternate" hreflang="en"[^>]+>)/,
      '$1\n  <link rel="alternate" hreflang="es" href="' + productUrl(true, sku) + '">'
    );
  } else {
    out = out.replace(
      /<link rel="alternate" hreflang="es" href="[^"]+">/,
      '<link rel="alternate" hreflang="es" href="' + productUrl(true, sku) + '">'
    );
  }
  // Fix relative asset paths: root pages use ../css, ../js, ../data. The /es/products/
  // pages are one level deeper at site root, so they need ../../css, ../../js, ../../data.
  out = out.replace(/\.\.\/css\//g, "../../css/");
  out = out.replace(/\.\.\/js\//g, "../../js/");
  out = out.replace(/\.\.\/data\//g, "../../data/");
  out = out.replace(/\.\.\/index\.html/g, "../../index.html");
  out = out.replace(/\.\.\/products\.html/g, "../../products.html");
  out = out.replace(/\.\.\/images\//g, "../../images/");
  out = out.replace(/\.\.\/freebies\//g, "../../freebies/");
  // Top-level site pages have no ES versions yet; point the ES nav/footer to the
  // English originals at the repo root.
  out = out.replace(/\.\.\/about\.html/g, "../../about.html");
  out = out.replace(/\.\.\/blog\.html/g, "../../blog.html");
  out = out.replace(/\.\.\/privacy\.html/g, "../../privacy.html");
  out = out.replace(/\.\.\/terms\.html/g, "../../terms.html");
  out = out.replace(/\.\.\/membership\.html/g, "../../membership.html");
  out = out.replace(/\.\.\/affiliate\.html/g, "../../affiliate.html");

  fs.writeFileSync(dest, out, "utf8");
  converted++;
});

console.log("Generated " + converted + " Spanish product pages in es/products/");

// ---- Spanish products.html grid ----
const gridDest = path.join(ROOT, "es", "products.html");
if (!fs.existsSync(path.join(ROOT, "es"))) fs.mkdirSync(path.join(ROOT, "es"));
const grid = [
  "<!DOCTYPE html>",
  '<html lang="es">',
  "<head>",
  '  <meta charset="UTF-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
  "  <title>Recetarios y Sistemas de Cocina Puertorriqueños | Sofrito Studio</title>",
  '  <meta name="description" content="Compra recetarios digitales, planificadores imprimibles y sistemas de cocina puertorriqueños — La Mesa Boricua, Boricua Weeknights y el curso Mofongo &amp; More. Bilingüe, descarga instantánea, garantía de 30 días.">',
  '  <link rel="canonical" href="' + SITE + '/es/products.html">',
  '  <link rel="alternate" hreflang="en" href="' + SITE + '/products.html">',
  '  <link rel="alternate" hreflang="es" href="' + SITE + '/es/products.html">',
  '  <link rel="alternate" hreflang="x-default" href="' + SITE + '/products.html">',
  '  <meta property="og:locale" content="es_PR">',
  '  <link rel="preconnect" href="https://fonts.googleapis.com">',
  '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">',
  '  <link rel="stylesheet" href="../css/style.css">',
  '  <link rel="stylesheet" href="../css/catalog-grid.css">',
  "</head>",
  "<body>",
  '  <header class="site-header"><div class="wrap nav"><a class="brand" href="../index.html"><img class="brand-logo" src="../images/logo.svg" alt="Sofrito Studio — Cocina Boricua"></a></div></header>',
  '  <main id="main-content">',
  '    <section class="hero product-hero" style="padding:100px 0 60px;">',
  '      <div class="wrap center" style="position:relative;z-index:2;">',
  '        <span class="eyebrow" style="color:rgba(255,255,255,0.85);">Comprar</span>',
  '        <h1 style="color:var(--white);text-shadow:0 2px 20px rgba(0,0,0,0.4);">Tu cocina boricua completa — para cada presupuesto y nivel</h1>',
  '      </div>',
  '    </section>',
  '    <section class="section"><div class="wrap center">',
  '      <span class="eyebrow">Guías Individuales</span>',
  '      <h2>Recetarios de un solo tema</h2>',
  '      <div id="guides-grid" style="max-width:960px;margin:0 auto;"></div>',
  '    </div></section>',
  '    <section class="section section-alt"><div class="wrap center">',
  '      <span class="eyebrow">Paquetes</span>',
  '      <h2>Ahorra al combinar</h2>',
  '      <div id="bundles-grid" class="tiers" style="max-width:960px;margin:0 auto;"></div>',
  '    </div></section>',
  "  </main>",
  '  <footer class="site-footer tropical-footer"><div class="wrap"><small>&copy; <span id="year"></span> Sofrito — Cocina Boricua. Hecho con corazón y sofrito. Precios en USD.</small></div></footer>',
  '  <script>document.getElementById("year").textContent = new Date().getFullYear();</script>',
  '  <script src="../js/i18n.js"></script>',
  '  <script src="../js/catalog.js"></script>',
  '  <script src="../js/catalog-grid.js"></script>',
  "  <script>",
  "    (function () {",
  "      function boot() {",
  '        SofritoCatalog.load("../data/products.json").then(function () {',
  '          SofritoI18n.setLang("es");',
  '          var guides = ["breakfasts","callejera","postres","sofrito-masterclass","meal-prep","air-fryer","pernil-playbook"];',
  '          var bundles = ["breakfast-bundle","street-food-bundle","holiday-bundle","complete-kitchen"];',
  '          var g = document.getElementById("guides-grid");',
  '          var b = document.getElementById("bundles-grid");',
  '          if (g) new Sofrito.CatalogGrid(g, { lang:"es", include: guides, mount:"grid" }).render();',
  '          if (b) new Sofrito.CatalogGrid(b, { lang:"es", include: bundles, mount:"tiers" }).render();',
  "        });",
  "      }",
  '      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();',
  "    })();",
  "  </script>",
  "</body>",
  "</html>"
].join("\n");

fs.writeFileSync(gridDest, grid, "utf8");
console.log("Generated es/products.html");
console.log("Done.");
