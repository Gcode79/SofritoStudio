window.SofritoCatalog = (function () {
  "use strict";

  var products = [];

  function load(url) {
    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        products = data.products || data || [];
        window.dispatchEvent(new CustomEvent("sofrito:catalog", { detail: { products: products } }));
        return products;
      });
  }

  function get(sku) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].sku === sku) return products[i];
    }
    return null;
  }

  function all() {
    return products.slice();
  }

  return { load: load, get: get, all: all };
})();
