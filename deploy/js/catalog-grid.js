window.Sofrito = window.Sofrito || {};

// Renders a filterable grid of product cards from the shared catalog
// (data/products.json). Reused on products.html and the /es/ grid.
Sofrito.CatalogGrid = (function () {
  "use strict";

  var I18N = window.SofritoI18n;

  var LABELS = {
    en: { buy: "Get", view: "Learn More", coming: "Coming Soon", waitlist: "Join Waitlist" },
    es: { buy: "Comprar", view: "Ver Más", coming: "Próximamente", waitlist: "Lista de Espera" }
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pick(obj, lang) {
    if (obj && typeof obj === "object") return obj[lang] || obj.en || obj.es || "";
    return obj || "";
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

  function CatalogGrid(el, opts) {
    opts = opts || {};
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    this.lang = opts.lang || (I18N ? I18N.getLang() : "en");
    this.kinds = opts.kinds || ["digital"];
    this.include = opts.include || null;   // array of skus to show, or null for all
    this.exclude = opts.exclude || [];     // skus to hide
    this.featured = opts.featured || {};   // sku -> { badge, badgeClass, compareAt }
    this.mount = opts.mount || "grid";     // 'grid' | 'tiers'
  }

  CatalogGrid.prototype._filtered = function () {
    var self = this;
    var all = (window.SofritoCatalog && SofritoCatalog.all()) || [];
    return all.filter(function (p) {
      if (self.kinds.indexOf(p.kind) === -1) return false;
      if (self.include && self.include.indexOf(p.sku) === -1) return false;
      if (self.exclude.indexOf(p.sku) !== -1) return false;
      return true;
    });
  };

  CatalogGrid.prototype._card = function (p, L) {
    var self = this;
    var feat = this.featured[p.sku] || {};
    var url = "products/" + p.sku + ".html";
    var href = this.mount === "tiers" ? url : url;
    var price = fmtPrice(p.price);
    var compareAt = feat.compareAt ? "<small><s>" + fmtPrice(feat.compareAt) + "</s></small>" : "";
    var badge = feat.badge ? "<span class='cg-tag " + (feat.badgeClass || "gold") + "'>" + esc(feat.badge) + "</span>" : "";

    var cta;
    if (p.status === "preorder") {
      cta = "<span class='cg-btn cg-btn-solid cg-btn-coming'>" + esc(L.coming) + "</span>";
    } else if (p.status === "waitlist") {
      cta = "<span class='cg-btn cg-btn-solid cg-btn-coming'>" + esc(L.waitlist) + "</span>";
    } else {
      var gl = gumroadUrl(p.gumroadKey || p.sku);
      var label = (gl && p.status !== "placeholder") ? esc(L.buy) + " — " + price : esc(L.coming);
      if (gl && p.status !== "placeholder") {
        cta = "<a class='cg-btn cg-btn-solid' href='" + esc(gl) + "' data-product='" + esc(p.gumroadKey || p.sku) + "'>" + label + "</a>";
      } else {
        cta = "<span class='cg-btn cg-btn-solid cg-btn-coming'>" + label + "</span>";
      }
    }

    var tags = (p.trust || []).slice(0, 2).map(function (t) {
      return "<span class='cg-trust'>" + esc(pick(t, self.lang)) + "</span>";
    }).join("");

    var img = p.image
      ? "<a class='cg-img-wrap' href='" + esc(href) + "'><img class='cg-img' src='" + esc(p.image) + "' alt='" + esc(pick(p.name, this.lang)) + "' width='480' height='480' loading='lazy' decoding='async'></a>"
      : "";

    return "<article class='cg-card' data-sku='" + esc(p.sku) + "'>" +
      img +
      badge +
      "<h3 class='cg-name'>" + esc(pick(p.name, this.lang)) + "</h3>" +
      "<div class='cg-price'>" + price + " " + compareAt + "</div>" +
      "<p class='cg-tagline'>" + esc(pick(p.tagline, this.lang)) + "</p>" +
      (tags ? "<div class='cg-trust-row'>" + tags + "</div>" : "") +
      "<div class='cg-cta'>" + cta + "</div>" +
      "<a class='cg-view' href='" + esc(href) + "'>" + esc(L.view) + " &rsaquo;</a>" +
      "</article>";
  };

  CatalogGrid.prototype.render = function () {
    var L = LABELS[this.lang] || LABELS.en;
    var items = this._filtered();
    var html = items.map(function (p) { return this._card(p, L); }, this).join("");
    if (this.mount === "tiers") {
      this.el.innerHTML = "<div class='cg cg-tiers'>" + html + "</div>";
    } else {
      this.el.innerHTML = "<div class='cg cg-grid'>" + html + "</div>";
    }
    return this;
  };

  return CatalogGrid;
})();
