window.SofritoCheckout = (function () {
  "use strict";

  var STORE_KEY = "sofrito.cart";
  var items = [];

  try {
    items = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  } catch (e) {
    items = [];
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  function emit() {
    window.dispatchEvent(new CustomEvent("sofrito:cart", { detail: { count: count() } }));
  }

  function add(item) {
    var existing = items.filter(function (i) {
      return i.type === item.type && i.sku === item.sku;
    });
    if (existing.length) {
      existing[0].qty = (existing[0].qty || 1) + (item.qty || 1);
    } else {
      var entry = Object.assign({}, item);
      entry.qty = item.qty || 1;
      entry.id = entry.type + ":" + entry.sku + ":" + Date.now();
      items.push(entry);
    }
    save();
    emit();
    return items;
  }

  function remove(id) {
    items = items.filter(function (i) { return i.id !== id; });
    save();
    emit();
  }

  function clear() {
    items = [];
    save();
    emit();
  }

  function get() {
    return items.slice();
  }

  function count() {
    return items.reduce(function (n, i) { return n + (i.qty || 1); }, 0);
  }

  function total() {
    return items.reduce(function (sum, i) { return sum + (i.price || 0) * (i.qty || 1); }, 0);
  }

  function config() {
    var cfg = window.SITE_CONFIG && window.SITE_CONFIG.checkout;
    return cfg || {};
  }

  function addRecipeIngredients(recipe, lang) {
    var name = recipe.name && typeof recipe.name === "object"
      ? (recipe.name[lang] || recipe.name.en)
      : recipe.name;
    var payload = {
      type: "recipe_ingredients",
      sku: recipe.slug,
      name: name,
      qty: 1,
      price: 0,
      route: recipe.cart && recipe.cart.url ? recipe.cart.url : null,
      items: (recipe.ingredients || []).reduce(function (list, g) {
        return list.concat(g.items.map(function (i) {
          return { name: i.name[lang] || i.name.en, qty: i.qty, unit: i.unit };
        }));
      }, [])
    };
    add(payload);
    if (typeof window.ssTrack === "function") {
      window.ssTrack("add_to_cart", { items: 1, type: "recipe_ingredients", slug: recipe.slug });
    }
    return payload;
  }

  function expressSupported() {
    return !!(window.PaymentRequest && window.PaymentRequest.prototype && window.PaymentRequest.prototype.show);
  }

  function checkout() {
    var cfg = config();
    var first = items[0];
    if (first && first.route) {
      window.location.href = first.route;
      return Promise.resolve("routed");
    }
    if (cfg.affiliateUrl) {
      window.location.href = cfg.affiliateUrl;
      return Promise.resolve("affiliate");
    }
    return Promise.reject(new Error("checkout: no payment route configured"));
  }

  return {
    add: add,
    addRecipeIngredients: addRecipeIngredients,
    remove: remove,
    clear: clear,
    get: get,
    count: count,
    total: total,
    expressSupported: expressSupported,
    checkout: checkout
  };
})();
