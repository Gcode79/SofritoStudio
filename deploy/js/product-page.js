window.Sofrito = window.Sofrito || {};

Sofrito.ProductPage = (function () {
  "use strict";

  var I18N = window.SofritoI18n;
  var SEO = window.SofritoSeo;

  var LABELS = {
    en: {
      buy: "Buy Now", preorder: "Pre-order", coming: "Coming Soon",
      waitlist: "Join the Waitlist", whatsInside: "What's Inside",
      included: "What You Get", faq: "FAQ", faqTitle: "Common questions",
      goFurther: "Go Further", readyFull: "Ready for the full system?",
      freeTitle: "Not sure where to start?", freeSub: "Start free. Download Sofrito 101 and cook something boricua tonight.",
      freeCta: "Get the Free Sofrito 101", home: "Home", products: "Products",
      view: "View"
    },
    es: {
      buy: "Comprar", preorder: "Pre-pedido", coming: "Próximamente",
      waitlist: "Únete a la Lista de Espera", whatsInside: "Qué Incluye",
      included: "Qué Recibes", faq: "Preguntas", faqTitle: "Preguntas frecuentes",
      goFurther: "Ir Más Allá", readyFull: "¿Listo para el sistema completo?",
      freeTitle: "¿No sabes por dónde empezar?", freeSub: "Empieza gratis. Descarga Sofrito 101 y cocina algo boricua esta noche.",
      freeCta: "Obtén el Sofrito 101 Gratis", home: "Inicio", products: "Productos",
      view: "Ver"
    }
  };

  function labels(lang) {
    return LABELS[lang] || LABELS.en;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pick(obj, lang, fallback) {
    if (obj && typeof obj === "object") return obj[lang] || obj.en || obj.es || fallback;
    return obj == null ? fallback : obj;
  }

  function fmtPrice(n) {
    return "$" + (Math.round(n * 100) / 100).toFixed(n % 1 === 0 ? 0 : 2);
  }

  function gumroadUrl(key) {
    var cfg = window.SITE_CONFIG && window.SITE_CONFIG.gumroad;
    if (!cfg || !key) return null;
    var url = cfg[key];
    return url && !/YOURGUMROAD/i.test(url) ? url : null;
  }

  function ProductPage(el, product, opts) {
    opts = opts || {};
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    this.product = product;
    this.lang = opts.lang || (I18N ? I18N.getLang() : "en");
    this.siteUrl = opts.siteUrl || "https://sofritostudio.com";
    this._render();
    this._wire();
    this._onLang = (function (self) {
      return function () {
        if (I18N) self.lang = I18N.getLang();
        self._render();
        self._wire();
      };
    })(this);
    window.addEventListener("sofrito:lang", this._onLang);
  }

  ProductPage.prototype._meta = function () {
    var p = this.product;
    var L = labels(this.lang);
    var name = pick(p.name, this.lang);
    var desc = pick(p.tagline, this.lang) || pick(p.description, this.lang);
    document.title = name + " — Sofrito Studio";
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", name);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", desc);
  };

  ProductPage.prototype._injectSeo = function () {
    var self = this;
    var p = this.product;
    document.querySelectorAll("script[data-sofrito-ld]").forEach(function (s) { s.remove(); });
    var url = self.siteUrl + "/products/" + p.sku + ".html";
    var breadcrumb = {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: self.siteUrl + "/" },
        { "@type": "ListItem", position: 2, name: "Products", item: self.siteUrl + "/products.html" },
        { "@type": "ListItem", position: 3, name: pick(p.name, self.lang), item: url }
      ]
    };
    var product = SEO.product({
      sku: p.sku,
      name: p.name,
      description: p.tagline || p.description,
      image: p.image ? [p.image] : [],
      price: p.price,
      url: url,
      kind: p.kind,
      inStock: p.status !== "placeholder" && p.status !== "waitlist"
    }, self.lang);
    var node = SEO.inject(SEO.graph([breadcrumb, product]));
    node.setAttribute("data-sofrito-ld", "1");
  };

  ProductPage.prototype._buyButton = function (L) {
    var p = this.product;
    var url = gumroadUrl(p.gumroadKey || p.sku);
    var label;
    if (p.status === "preorder") label = L.preorder + " — " + fmtPrice(p.price);
    else if (p.status === "waitlist") label = L.waitlist;
    else if (p.status === "placeholder" || !url) label = L.coming;
    else label = L.buy + " — " + fmtPrice(p.price);

    if (url && p.status !== "placeholder" && p.status !== "waitlist") {
      return "<a class='pp-btn pp-btn-solid' href='" + esc(url) + "' data-product='" + esc(p.gumroadKey || p.sku) + "' data-price='" + p.price + "'>" + esc(label) + "</a>";
    }
    return "<button type='button' class='pp-btn pp-btn-solid pp-btn-disabled' disabled>" + esc(label) + "</button>";
  };

  ProductPage.prototype._heroHtml = function (L) {
    var p = this.product;
    var img = p.image ? "<img class='pp-hero-img' src='" + esc(p.image) + "' alt='" + esc(pick(p.name, this.lang)) + "' fetchpriority='high'>" : "";
    var trust = (p.trust || []).map(function (t) {
      return "<span class='pp-hero-trust'>" + esc(pick(t, this.lang)) + "</span>";
    }, this).join("");
    return "<section class='pp-hero'>" + img +
      "<div class='pp-hero-inner'>" +
        "<span class='pp-eyebrow'>" + esc(pick(p.eyebrow, this.lang, p.name)) + "</span>" +
        "<h1 class='pp-title'>" + esc(pick(p.name, this.lang)) + "</h1>" +
        "<p class='pp-lead'>" + esc(pick(p.tagline, this.lang)) + "</p>" +
        (trust ? "<div class='pp-trust'>" + trust + "</div>" : "") +
      "</div></section>";
  };

  ProductPage.prototype._cardHtml = function (L) {
    var p = this.product;
    var img = p.image
      ? "<div class='pp-visual'><img class='pp-cover' src='" + esc(p.image) + "' alt='" + esc(pick(p.name, this.lang)) + "' loading='lazy'></div>"
      : "";
    var includes = (p.includes || []).map(function (i) {
      return "<li class='pp-include'>" + esc(pick(i, this.lang)) + "</li>";
    }, this).join("");
    var trust = (p.trust || []).map(function (t) {
      return "<span class='pp-badge'>" + esc(pick(t, this.lang)) + "</span>";
    }, this).join("");
    var SAMPLES = {
      mesa: "/samples/la-mesa-boricua-sample.html",
      "starter-kit": "/freebies/Sofrito-Starter-Kit-Sample.pdf",
      "coquito-guide": "/freebies/Coquito-Guide-Sample.pdf",
      breakfasts: "/freebies/Boricua-Breakfasts-Sample.pdf",
      postres: "/freebies/Postres-Boricuas-Sample.pdf",
      callejera: "/freebies/Comida-Callejera-Sample.pdf",
      "pernil-playbook": "/freebies/Pernil-Playbook-Sample.pdf"
    };
    var sampleUrl = SAMPLES[p.sku];
    var lookInside = sampleUrl
      ? "<p class='pp-look'><a href='" + esc(sampleUrl) + "'>" +
        (this.lang === "es" ? "Mira por dentro — muestra gratis" : "Look inside — free sample") + "</a></p>"
      : "";
    return "<section class='pp-card'>" + img +
      "<div class='pp-card-body'>" +
        "<span class='pp-tag'>" + esc(pick(p.category, this.lang) || (p.kind === "digital" ? "Digital" : "Product")) + "</span>" +
        "<h2 class='pp-card-title'>" + esc(pick(p.name, this.lang)) + "</h2>" +
        "<div class='pp-price'>" + fmtPrice(p.price) + "</div>" +
        "<p class='pp-desc'>" + esc(pick(p.description, this.lang)) + "</p>" +
        "<ul class='pp-includes'>" + includes + "</ul>" +
        (trust ? "<div class='pp-badges'>" + trust + "</div>" : "") +
        "<div class='pp-buy'>" + this._buyButton(L) + lookInside + "</div>" +
      "</div></section>";
  };

  ProductPage.prototype._insideHtml = function (L) {
    var p = this.product;
    var list = (p.includes || []).map(function (i) {
      return "<li class='pp-line'><b>" + esc(pick(i, this.lang)) + "</b></li>";
    }, this).join("");
    return "<section class='pp-section pp-section-alt'><div class='pp-wrap pp-center'>" +
      "<span class='pp-eyebrow'>" + esc(L.whatsInside) + "</span>" +
      "<h2 class='pp-h2'>" + esc(pick(p.headline, this.lang, L.included)) + "</h2>" +
      "<ul class='pp-lines'>" + list + "</ul>" +
      "</div></section>";
  };

  ProductPage.prototype._faqHtml = function (L) {
    var p = this.product;
    if (!p.faq || !p.faq.length) return "";
    var items = p.faq.map(function (f) {
      return "<details class='pp-faq'><summary>" + esc(pick(f.q, this.lang)) + "</summary><p>" + esc(pick(f.a, this.lang)) + "</p></details>";
    }, this).join("");
    return "<section class='pp-section' id='faq'><div class='pp-wrap pp-center'>" +
      "<span class='pp-eyebrow'>" + esc(L.faq) + "</span>" +
      "<h2 class='pp-h2'>" + esc(L.faqTitle) + "</h2>" +
      "<div class='pp-faqs'>" + items + "</div>" +
      "</div></section>";
  };

  ProductPage.prototype._upsellHtml = function (L) {
    var p = this.product;
    if (!p.upsells || !p.upsells.length || !window.SofritoCatalog) return "";
    var tiers = p.upsells.map(function (sku) {
      var other = window.SofritoCatalog.get(sku);
      if (!other) return "";
      var url = "product.html?sku=" + encodeURIComponent(sku);
      return "<article class='pp-tier'><h3 class='pp-tier-name'>" + esc(pick(other.name, this.lang)) + "</h3>" +
        "<div class='pp-tier-price'>" + fmtPrice(other.price) + "</div>" +
        "<p class='pp-tier-desc'>" + esc(pick(other.tagline, this.lang)) + "</p>" +
        "<a class='pp-btn pp-btn-ghost' href='" + esc(url) + "'>" + esc(L.view) + "</a></article>";
    }, this).join("");
    if (!tiers) return "";
    return "<section class='pp-section pp-section-alt'><div class='pp-wrap pp-center'>" +
      "<span class='pp-eyebrow'>" + esc(L.goFurther) + "</span>" +
      "<h2 class='pp-h2'>" + esc(L.readyFull) + "</h2>" +
      "<div class='pp-tiers'>" + tiers + "</div>" +
      "</div></section>";
  };

  ProductPage.prototype._freeHtml = function (L) {
    return "<section class='pp-section'><div class='pp-wrap pp-center'>" +
      "<h2 class='pp-h2'>" + esc(L.freeTitle) + "</h2>" +
      "<p class='pp-sub'>" + esc(L.freeSub) + "</p>" +
      "<a class='pp-btn pp-btn-ghost' href='../index.html#freebie'>" + esc(L.freeCta) + "</a>" +
      "</div></section>";
  };

  ProductPage.prototype._render = function () {
    var L = labels(this.lang);
    var p = this.product;
    var breadcrumb = "<nav class='pp-crumbs' aria-label='Breadcrumb'><a href='../index.html'>" + esc(L.home) +
      "</a> / <a href='../products.html'>" + esc(L.products) +
      "</a> / <span>" + esc(pick(p.name, this.lang)) + "</span></nav>";
    this.el.innerHTML = breadcrumb +
      this._heroHtml(L) +
      "<div class='pp-wrap'>" + this._cardHtml(L) + "</div>" +
      this._insideHtml(L) +
      this._faqHtml(L) +
      this._upsellHtml(L) +
      this._freeHtml(L);
    this._meta();
    this._injectSeo();
  };

  ProductPage.prototype._wire = function () {
    var self = this;
    this.el.querySelectorAll("[data-product]").forEach(function (btn) {
      var url = gumroadUrl(btn.getAttribute("data-product"));
      if (url) btn.href = url;
      btn.addEventListener("click", function () {
        if (typeof window.ssTrack === "function") {
          window.ssTrack("begin_checkout", { item: btn.getAttribute("data-product"), price: btn.getAttribute("data-price") });
        }
      });
    });
  };

  ProductPage.prototype.destroy = function () {
    window.removeEventListener("sofrito:lang", this._onLang);
    this.el.innerHTML = "";
  };

  return ProductPage;
})();
