// Converts each individual product page in deploy/products/*.html into a
// data-driven shell rendered from data/products.json (SKU auto-detected from
// filename). Idempotent: skips files already converted (they contain the
// product-root marker).
//
// Usage: node tools/convert-products.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
// The live web root pages live at <repo>/products/. deploy/products/ is a
// build-snapshot artifact (deploy/js & deploy/css are empty) and is excluded.
const PRODUCTS_DIR = process.env.SOFRI_TO_PRODUCTS_DIR
  ? process.env.SOFRI_TO_PRODUCTS_DIR
  : path.join(ROOT, "products");
const SKIP = ["product.html"];

// filename (without .html) -> catalog sku
const SKU_MAP = {
  "la-mesa-boricua-sales": "mesa"
};

const CATALOG_JS = [
  '../js/i18n.js',
  '../js/seo/jsonld.js',
  '../js/checkout.js',
  '../js/catalog.js',
  '../js/product-page.js'
];

const BOOT = `
  <script>
    (function () {
      var sku = (function () {
        var file = window.location.pathname.split('/').pop().replace('.html', '');
        return (window.__SOFRITO_SKU_MAP__ && window.__SOFRITO_SKU_MAP__[file]) || file;
      })();
      var lang = 'en';
      try {
        if (window.location.pathname.indexOf('/es/') === 0) lang = 'es';
        else lang = localStorage.getItem('sofrito.lang') || 'en';
      } catch (e) {}
      if (lang !== 'es') lang = 'en';
      SofritoI18n.setLang(lang);

      function boot() {
        SofritoCatalog.load('../data/products.json').then(function () {
          var product = SofritoCatalog.get(sku);
          var root = document.getElementById('product-root');
          if (!product) {
            root.innerHTML = '<div class="section"><div class="wrap center"><h2>Product not found</h2><p>Back to <a href="../products.html">all products</a>.</p></div></div>';
            return;
          }
          var canonical = document.querySelector('link[rel="canonical"]');
          if (canonical) canonical.href = 'https://sofritostudio.com/products/' + product.sku + '.html';
          new Sofrito.ProductPage(root, product, { lang: SofritoI18n.getLang() });
        }).catch(function () {
          document.getElementById('product-root').innerHTML =
            '<div class="section"><div class="wrap center"><p>Catalog failed to load. Serve the site over HTTP and reload.</p></div></div>';
        });
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
      else boot();
    })();
  </script>
`;

const MOUNT = `
  <main id="main-content">
    <div id="product-root"></div>
    <noscript>
      <div class="section"><div class="wrap center"><p>JavaScript is required to view this product. <a href="../products.html">Browse all products</a> instead.</p></div></div>
    </noscript>
  </main>
`;

function convert(file) {
  const rel = path.relative(PRODUCTS_DIR, file).replace(/\\/g, "/");
  if (rel.includes("/")) return "skip (subfolder)";
  if (SKIP.includes(path.basename(file))) return "skip (reserved)";

  let html = fs.readFileSync(file, "utf8");
  const already = html.includes("product-root");
  const base = path.basename(file, ".html");
  const sku = SKU_MAP[base] || base;
  const esHref = "https://sofritostudio.com/es/products/" + (SKU_MAP[base] === "mesa" ? "la-mesa-boricua-sales" : base) + ".html";
  if (already) {
    let changed = false;
    // Idempotent pass: ensure the component stylesheet is present.
    if (!html.includes('css/product-page.css')) {
      html = html.replace(
        '  <link rel="stylesheet" href="../css/style.css">',
        '  <link rel="stylesheet" href="../css/style.css">\n  <link rel="stylesheet" href="../css/product-page.css">'
      );
      changed = true;
    }
    // Ensure the Spanish hreflang alternate is present.
    if (!html.includes('hreflang="es"')) {
      html = html.replace(
        '  <link rel="alternate" hreflang="en" href="https://sofritostudio.com/products/' + base + '.html">',
        '  <link rel="alternate" hreflang="en" href="https://sofritostudio.com/products/' + base + '.html">\n  <link rel="alternate" hreflang="es" href="' + esHref + '">'
      );
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(file, html, "utf8");
      return "patched";
    }
    return "skip (already converted)";
  }

  // 1. Replace the <main>...</main> block with the mount point.
  const mainOpen = html.indexOf('<main id="main-content">');
  const mainClose = html.indexOf("</main>");
  if (mainOpen === -1 || mainClose === -1) return "skip (no <main>)";
  html = html.slice(0, mainOpen) + MOUNT + html.slice(mainClose + "</main>".length);

  // 2. Inject catalog scripts before </body>.
  const scriptTags = CATALOG_JS.map(function (s) {
    return "  <script src=\"" + s + "\"></script>";
  }).join("\n");
  html = html.replace(
    "  <script src=\"../js/main.js\"></script>",
    "  <script src=\"../js/main.js\"></script>\n" + scriptTags + BOOT
  );

  // 3. Ensure the component stylesheet is loaded (idempotent).
  if (!html.includes('css/product-page.css')) {
    html = html.replace(
      '  <link rel="stylesheet" href="../css/style.css">',
      '  <link rel="stylesheet" href="../css/style.css">\n  <link rel="stylesheet" href="../css/product-page.css">'
    );
  }

  // 4. Tag the sku map for the boot script.
  html = html.replace(
    "<script src=\"../js/main.js\"></script>",
    "<script>window.__SOFRITO_SKU_MAP__ = " + JSON.stringify(SKU_MAP) + ";</script>\n  <script src=\"../js/main.js\"></script>"
  );

  fs.writeFileSync(file, html, "utf8");
  return "converted -> sku:" + sku;
}

let summary = [];
fs.readdirSync(PRODUCTS_DIR).forEach(function (name) {
  if (!name.endsWith(".html")) return;
  const file = path.join(PRODUCTS_DIR, name);
  const res = convert(file);
  summary.push({ name, res });
});

summary.forEach(function (s) {
  console.log(s.name.padEnd(28), s.res);
});
console.log("\nDone. " + summary.filter((s) => s.res.startsWith("converted")).length + " converted.");
