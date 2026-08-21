window.Sofrito = window.Sofrito || {};

Sofrito.RecipeCard = (function () {
  "use strict";

  var I18N = window.SofritoI18n;

  var METRIC = {
    tsp: [5, "ml"],
    tbsp: [15, "ml"],
    cup: [240, "ml"],
    "fl oz": [30, "ml"],
    oz: [28, "g"],
    lb: [454, "g"],
    qt: [946, "ml"],
    gal: [3785, "ml"]
  };

  var LABELS = {
    en: {
      prep: "Prep", cook: "Cook", total: "Total", servings: "Servings",
      ingredients: "Ingredients", instructions: "Instructions", print: "Print Recipe",
      cart: "Add Recipe Ingredients to Cart", us: "US", metric: "Metric"
    },
    es: {
      prep: "Preparación", cook: "Cocción", total: "Total", servings: "Porciones",
      ingredients: "Ingredientes", instructions: "Instrucciones", print: "Imprimir Receta",
      cart: "Añadir Ingredientes al Carrito", us: "US", metric: "Métrico"
    }
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmt(n) {
    var r = Math.round(n * 100) / 100;
    return String(r).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  }

  function pick(obj, lang) {
    if (obj && typeof obj === "object") return obj[lang] || obj.en || obj.es || "";
    return obj || "";
  }

  function labels(lang) {
    return LABELS[lang] || LABELS.en;
  }

  function scaledQty(item, unit, scale) {
    if (unit === "metric") {
      if (item.metric) return { qty: item.metric.qty * scale, unit: item.metric.unit };
      if (METRIC[item.unit]) return { qty: item.qty * METRIC[item.unit][0] * scale, unit: METRIC[item.unit][1] };
    }
    return { qty: item.qty * scale, unit: item.unit };
  }

  function RecipeCard(root, recipe, opts) {
    opts = opts || {};
    this.root = typeof root === "string" ? document.querySelector(root) : root;
    this.recipe = recipe;
    this.slug = recipe.slug || "rc-" + Date.now();
    this.baseServings = (recipe.servings && recipe.servings.base) || 4;
    this.lang = opts.lang || (I18N ? I18N.getLang() : "en");
    this.servings = this.baseServings;
    this.unit = "us";
    this.checked = {};
    this._load();
    this._render();
    this._bind();
    this._onLang = (function (self) {
      return function () {
        if (I18N) self.lang = I18N.getLang();
        self._render();
      };
    })(this);
    window.addEventListener("sofrito:lang", this._onLang);
  }

  RecipeCard.prototype._load = function () {
    try {
      var raw = sessionStorage.getItem("rc:" + this.slug);
      if (raw) {
        var s = JSON.parse(raw);
        if (s.servings) this.servings = s.servings;
        if (s.unit) this.unit = s.unit;
        if (s.checked) this.checked = s.checked;
      }
    } catch (e) {}
  };

  RecipeCard.prototype._save = function () {
    try {
      sessionStorage.setItem("rc:" + this.slug, JSON.stringify({
        servings: this.servings, unit: this.unit, checked: this.checked
      }));
    } catch (e) {}
  };

  RecipeCard.prototype._scale = function () {
    return this.servings / this.baseServings;
  };

  RecipeCard.prototype._metaHtml = function () {
    var L = labels(this.lang);
    var r = this.recipe;
    var out = "";
    var meta = [
      [L.prep, r.prepTime, "pt"],
      [L.cook, r.cookTime, "ct"],
      [L.total, r.totalTime, "tt"]
    ];
    meta.forEach(function (m) {
      out += "<li class='rc-meta-item' data-kind='" + m[2] + "'><span class='rc-meta-label'>" + esc(m[0]) +
        "</span><span class='rc-meta-value'>" + esc(m[1] || "") + "</span></li>";
    });
    out += "<li class='rc-meta-item'><span class='rc-meta-label'>" + esc(L.servings) +
      "</span><span class='rc-meta-value'>" + esc(pick(r.yield, this.lang)) + "</span></li>";
    return "<ul class='rc-meta'>" + out + "</ul>";
  };

  RecipeCard.prototype._ingredientsHtml = function () {
    var self = this;
    var L = labels(this.lang);
    var scale = this._scale();
    var groups = (this.recipe.ingredients || []).map(function (group) {
      var items = group.items.map(function (item, idx) {
        var id = self.slug + "-ing-" + group.gid + "-" + idx;
        var q = scaledQty(item, self.unit, scale);
        var checked = self.checked[id] ? " checked" : "";
        return "<li class='rc-ing-item'>" +
          "<label for='" + esc(id) + "'>" +
          "<input type='checkbox' id='" + esc(id) + "'" + checked + ">" +
          "<span class='rc-ing-box' aria-hidden='true'></span>" +
          "<span class='rc-ing-qty'>" + esc(fmt(q.qty)) + " " + esc(q.unit) + "</span>" +
          "<span class='rc-ing-name'>" + esc(pick(item.name, self.lang)) + "</span>" +
          "</label></li>";
      }).join("");
      return "<div class='rc-group'><h4 class='rc-group-title'>" + esc(pick(group.name, self.lang)) +
        "</h4><ul class='rc-ing-list'>" + items + "</ul></div>";
    }).join("");
    return "<section class='rc-ingredients'><h3 class='rc-h'>" + esc(L.ingredients) + "</h3>" + groups + "</section>";
  };

  RecipeCard.prototype._stepsHtml = function () {
    var self = this;
    var L = labels(this.lang);
    var steps = (this.recipe.steps || []).map(function (step, i) {
      var id = self.slug + "-step-" + i;
      var checked = self.checked[id] ? " checked" : "";
      return "<li class='rc-step'>" +
        "<label for='" + esc(id) + "'>" +
        "<input type='checkbox' id='" + esc(id) + "'" + checked + ">" +
        "<span class='rc-step-num'>" + (i + 1) + "</span>" +
        "<span class='rc-step-text'>" + esc(pick(step, self.lang)) + "</span>" +
        "</label></li>";
    }).join("");
    return "<section class='rc-steps'><h3 class='rc-h'>" + esc(L.instructions) + "</h3><ol class='rc-step-list'>" + steps + "</ol></section>";
  };

  RecipeCard.prototype._render = function () {
    var L = labels(this.lang);
    var r = this.recipe;
    var title = pick(r.name, this.lang);
    var desc = pick(r.description, this.lang);
    var img = r.image && r.image[0] ? r.image[0] : "";
    var heroImg = img ? "<div class='rc-imgwrap'><img class='rc-img' src='" + esc(img) + "' alt='" + esc(title) + "' loading='lazy'></div>" : "";

    this.root.innerHTML =
      "<article class='rc' data-slug='" + esc(this.slug) + "'>" +
        "<div class='rc-hero'>" + heroImg +
          "<div class='rc-hero-body'>" +
            "<p class='rc-kicker'>" + esc(r.category || "") + " &middot; Puerto Rican</p>" +
            "<h2 class='rc-title'>" + esc(title) + "</h2>" +
            (desc ? "<p class='rc-desc'>" + esc(desc) + "</p>" : "") +
            this._metaHtml() +
          "</div>" +
        "</div>" +
        "<div class='rc-controls'>" +
          "<div class='rc-servings'>" +
            "<label class='rc-ctl-label' for='" + esc(this.slug) + "-servings'>" + esc(L.servings) + "</label>" +
            "<div class='rc-stepper'>" +
              "<button type='button' class='rc-step-btn' data-act='minus' aria-label='-'>\u2212</button>" +
              "<input class='rc-servings-input' id='" + esc(this.slug) + "-servings' type='number' min='1' max='99' value='" + this.servings + "'>" +
              "<button type='button' class='rc-step-btn' data-act='plus' aria-label='+'>&#43;</button>" +
            "</div>" +
          "</div>" +
          "<div class='rc-units'>" +
            "<button type='button' class='rc-unit " + (this.unit === "us" ? "is-active" : "") + "' data-unit='us'>" + esc(L.us) + "</button>" +
            "<button type='button' class='rc-unit " + (this.unit === "metric" ? "is-active" : "") + "' data-unit='metric'>" + esc(L.metric) + "</button>" +
          "</div>" +
        "</div>" +
        "<div class='rc-body'>" +
          this._ingredientsHtml() +
          this._stepsHtml() +
        "</div>" +
        "<div class='rc-cta'>" +
          "<button type='button' class='rc-btn rc-btn-ghost' data-act='print'>" + esc(L.print) + "</button>" +
          "<button type='button' class='rc-btn rc-btn-solid' data-act='cart'>" + esc(L.cart) + "</button>" +
        "</div>" +
      "</article>";
  };

  RecipeCard.prototype._bind = function () {
    var self = this;
    this.root.addEventListener("click", function (ev) {
      var el = ev.target.closest("[data-act]");
      if (!el) return;
      var act = el.getAttribute("data-act");
      if (act === "plus") self._setServings(self.servings + 1);
      else if (act === "minus") self._setServings(Math.max(1, self.servings - 1));
      else if (act === "print") self.print();
      else if (act === "cart") self.addToCart();
    });
    this.root.addEventListener("click", function (ev) {
      var unitBtn = ev.target.closest("[data-unit]");
      if (unitBtn) self._setUnit(unitBtn.getAttribute("data-unit"));
    });
    this.root.addEventListener("input", function (ev) {
      if (ev.target.matches(".rc-servings-input")) {
        var v = parseInt(ev.target.value, 10);
        if (!isNaN(v) && v >= 1) self._setServings(v);
      }
    });
    this.root.addEventListener("change", function (ev) {
      if (ev.target.matches('input[type="checkbox"]')) {
        self.checked[ev.target.id] = ev.target.checked;
        self._save();
      }
    });
  };

  RecipeCard.prototype._setServings = function (n) {
    this.servings = Math.max(1, Math.min(99, Math.round(n) || 1));
    this._save();
    this._rerenderAmounts();
  };

  RecipeCard.prototype._setUnit = function (unit) {
    if (unit === this.unit) return;
    this.unit = unit;
    this._save();
    this._rerenderAmounts();
  };

  RecipeCard.prototype._rerenderAmounts = function () {
    var self = this;
    var scale = this._scale();
    var ingList = this.root.querySelectorAll(".rc-ing-item .rc-ing-qty");
    var idx = 0;
    (this.recipe.ingredients || []).forEach(function (group) {
      group.items.forEach(function (item) {
        if (ingList[idx]) {
          var q = scaledQty(item, self.unit, scale);
          ingList[idx].textContent = fmt(q.qty) + " " + q.unit;
        }
        idx++;
      });
    });
  };

  RecipeCard.prototype.print = function () {
    document.body.classList.add("rc-printing");
    window.print();
    window.setTimeout(function () {
      document.body.classList.remove("rc-printing");
    }, 200);
  };

  RecipeCard.prototype.addToCart = function () {
    if (window.SofritoCheckout) {
      window.SofritoCheckout.addRecipeIngredients(this.recipe, this.lang);
    }
    var route = this.recipe.cart && this.recipe.cart.url;
    if (route) {
      window.location.href = route;
      return;
    }
    if (typeof window.ssTrack === "function") {
      window.ssTrack("add_to_cart", { slug: this.slug, servings: this.servings, unit: this.unit });
    }
  };

  RecipeCard.prototype.destroy = function () {
    window.removeEventListener("sofrito:lang", this._onLang);
    this.root.innerHTML = "";
  };

  return RecipeCard;
})();
