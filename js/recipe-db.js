/* ======== Recipe Database — search + visual tag filters ========
 * Loads /data/recipes.json, renders a prominent search bar, clickable
 * tag chips (meal type / cultural origin / ingredients), and sortable,
 * filterable recipe cards. Localized EN/ES.
 */
(function () {
  "use strict";
  var root = document.getElementById("recipeDb");
  if (!root) return;

  var lang = /\/es(\/|$)/.test(location.pathname) ? "es" : "en";
  try { if (localStorage.getItem("sofrito.lang") === "es") lang = "es"; } catch (e) {}

  var L = lang === "es" ? {
    title: "Índice de Recetas", sub: "Busca por plato, ingrediente o herencia — filtra y ordena las recetas boricuas.",
    searchPh: "Buscar recetas, ingredientes…", meal: "Tipo de comida", origin: "Herencia", ingredients: "Ingredientes",
    avail: "Disponibilidad",
    sort: "Ordenar", sortName: "A–Z", sortMeal: "Tipo de comida", sortTime: "Tiempo", sortIngred: "Menos ingredientes", sortAvail: "Más disponibles",
    results: "recetas", clear: "Limpiar filtros", view: "Ver receta", pdf: "PDF", all: "Todas",
    empty: "Sin resultados — prueba otra búsqueda o limpia los filtros.", loading: "Cargando recetas…", prep: "prep", cook: "cocción", min: "min", ingred: "ingredientes",
  } : {
    title: "Recipe Index", sub: "Search by dish, ingredient, or heritage — filter and sort the boricua recipe library.",
    searchPh: "Search recipes, ingredients…", meal: "Meal type", origin: "Heritage", ingredients: "Ingredients",
    avail: "Availability",
    sort: "Sort", sortName: "A–Z", sortMeal: "Meal type", sortTime: "Time", sortIngred: "Fewest ingredients", sortAvail: "Most available",
    results: "recipes", clear: "Clear filters", view: "View recipe", pdf: "PDF", all: "All",
    empty: "No results — try another search or clear the filters.", loading: "Loading recipes…", prep: "prep", cook: "cook", min: "min", ingred: "ingredients",
  };

  var state = { q: "", meals: [], origins: [], ingredients: [], availability: [], sort: "name" };

  root.innerHTML =
    '<div class="rdb-shell">' +
    '<header class="rdb-head"><h1>' + L.title + '</h1><p class="sub">' + L.sub + '</p></header>' +
    '<div class="rdb-search"><input id="rdbSearch" type="search" placeholder="' + L.searchPh + '" aria-label="' + L.searchPh + '"></div>' +
    '<div class="rdb-filters" id="rdbFilters"></div>' +
    '<div class="rdb-toolbar"><span id="rdbCount"></span>' +
    '<select id="rdbSort" aria-label="' + L.sort + '">' +
    '<option value="name">' + L.sortName + '</option>' +
    '<option value="meal">' + L.sortMeal + '</option>' +
    '<option value="time">' + L.sortTime + '</option>' +
    '<option value="ingred">' + L.sortIngred + '</option>' +
    '<option value="avail">' + L.sortAvail + '</option>' +
    '</select>' +
    '<button class="btn btn-ghost" id="rdbClear" style="padding:6px 12px;font-size:0.85rem;">' + L.clear + '</button>' +
    '</div>' +
    '<div class="rdb-grid" id="rdbGrid"><p class="rdb-empty">' + L.loading + '</p></div>' +
    '</div>';

  var searchEl = document.getElementById("rdbSearch");
  var filtersEl = document.getElementById("rdbFilters");
  var gridEl = document.getElementById("rdbGrid");
  var countEl = document.getElementById("rdbCount");
  var sortEl = document.getElementById("rdbSort");
  var clearBtn = document.getElementById("rdbClear");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pick(o) { return (o && o[lang]) || (o && o.en) || (o && o.es) || o || ""; }

  var MEAL_ORDER = ["breakfast", "lunch", "dinner", "side", "snack", "dessert", "drink"];
  var AVAIL_ORDER = ["pantry", "easy", "latin"];

  function buildFilters(data) {
    var meals = {}, origins = {}, ingredients = {}, avail = {};
    data.forEach(function (r) {
      meals[r.meal_type] = (meals[r.meal_type] || 0) + 1;
      origins[r.cultural_origin] = (origins[r.cultural_origin] || 0) + 1;
      avail[r.availability] = (avail[r.availability] || 0) + 1;
      r.ingredients.forEach(function (i) { ingredients[i] = (ingredients[i] || 0) + 1; });
    });
    var html = "";
    html += group(L.meal, "meal", MEAL_ORDER
      .filter(function (m) { return meals[m]; })
      .map(function (m) { return chip("meal", m, pick(MEAL_LABELS[m]), meals[m]); }).join(""));
    html += group(L.origin, "origin", Object.keys(origins)
      .map(function (o) { return chip("origin", o, pick(ORIGIN_LABELS[o]) || o, origins[o]); }).join(""));
    html += group(L.avail, "availability", AVAIL_ORDER
      .filter(function (a) { return avail[a]; })
      .map(function (a) { return chip("availability", a, pick(AVAIL_LABELS[a]), avail[a]); }).join(""));
    html += group(L.ingredients, "ingredient", Object.keys(ingredients)
      .sort(function (a, b) { return ingredients[b] - ingredients[a]; })
      .map(function (i) { return chip("ingredient", i, pick(INGREDIENT_LABELS[i]) || i, ingredients[i]); }).join(""));
    filtersEl.innerHTML = html;
  }

  function group(label, groupKey, chips) {
    return '<div class="rdb-group" data-group="' + groupKey + '"><span class="rdb-group-label">' + esc(label) +
      '</span><div class="rdb-chips">' + chips + '</div></div>';
  }
  function chip(groupKey, value, label, count) {
    return '<button type="button" class="rdb-chip" data-group="' + groupKey + '" data-value="' + esc(value) +
      '" aria-pressed="false"><span class="rdb-chip-label">' + esc(label) +
      '</span><span class="rdb-chip-count">' + count + "</span></button>";
  }

  function matches(r) {
    var q = state.q.trim().toLowerCase();
    if (q) {
      var hay = [r.title.en, r.title.es, r.description.en, r.description.es,
        r.meal_label.en, r.meal_label.es, r.cultural_origin,
        (r.ingredient_labels ? Object.keys(r.ingredient_labels) : []).join(" ")].join(" ").toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    if (state.meals.length && state.meals.indexOf(r.meal_type) === -1) return false;
    if (state.origins.length && state.origins.indexOf(r.cultural_origin) === -1) return false;
    if (state.availability.length && state.availability.indexOf(r.availability) === -1) return false;
    if (state.ingredients.length && !state.ingredients.every(function (i) { return r.ingredients.indexOf(i) !== -1; })) return false;
    return true;
  }

  function render(data) {
    var list = data.filter(matches);
    var order = {
      name: function (a, b) { return pick(a.title).localeCompare(pick(b.title)); },
      meal: function (a, b) {
        var ia = MEAL_ORDER.indexOf(a.meal_type), ib = MEAL_ORDER.indexOf(b.meal_type);
        return (ia - ib) || pick(a.title).localeCompare(pick(b.title));
      },
      time: function (a, b) { return (a.prep_min + a.cook_min) - (b.prep_min + b.cook_min); },
      ingred: function (a, b) { return a.ingredient_count - b.ingredient_count || pick(a.title).localeCompare(pick(b.title)); },
      avail: function (a, b) {
        var ia = AVAIL_ORDER.indexOf(a.availability), ib = AVAIL_ORDER.indexOf(b.availability);
        return (ia - ib) || pick(a.title).localeCompare(pick(b.title));
      },
    }[state.sort] || function (a, b) { return a.id.localeCompare(b.id); };
    list.sort(order);

    countEl.textContent = list.length + " " + L.results;
    if (!list.length) {
      gridEl.innerHTML = '<p class="rdb-empty">' + L.empty + "</p>";
      return;
    }
    gridEl.innerHTML = list.map(function (r) {
      var img = '<div class="rdb-card-img" style="background-image:url(' + "/" + esc(r.image) + ');"></div>';
      var ing = r.ingredients.map(function (i) {
        return '<span class="rdb-tag">' + esc(pick((r.ingredient_labels && r.ingredient_labels[i]) || i)) + "</span>";
      }).join("");
      var time = (r.prep_min || r.cook_min) ? '<span class="rdb-time">' +
        (r.prep_min ? r.prep_min + " " + L.min + " " + L.prep : "") +
        (r.cook_min ? " · " + r.cook_min + " " + L.min + " " + L.cook : "") + "</span>" : "";
      var pdf = r.pdf ? '<a class="rdb-pdf" href="/' + esc(r.pdf) + '" target="_blank" rel="noopener">' + L.pdf + "</a>" : "";
      return '<article class="rdb-card">' + img +
        '<div class="rdb-card-body">' +
        '<div class="rdb-badges"><span class="rdb-badge rdb-badge-meal">' + esc(pick(r.meal_label)) + '</span>' +
        '<span class="rdb-badge rdb-badge-origin">' + esc(pick(r.origin_label)) + "</span>" +
        '<span class="rdb-badge rdb-badge-avail">' + esc(pick(r.availability_label)) + "</span></div>" +
        '<h3>' + esc(r.title.en) + "</h3>" +
        (r.title.es !== r.title.en ? '<p class="rdb-es">' + esc(r.title.es) + "</p>" : "") +
        '<p class="rdb-desc">' + esc(pick(r.description)) + "</p>" +
        '<div class="rdb-tags">' + ing + "</div>" +
        '<div class="rdb-actions">' + time + '<span class="rdb-spacer"></span>' +
        pdf +
        '<a class="btn" href="/' + esc(r.url) + '">' + L.view + "</a>" +
        "</div></div></article>";
    }).join("");
  }

  filtersEl.addEventListener("click", function (e) {
    var chipEl = e.target.closest(".rdb-chip");
    if (!chipEl) return;
    var group = chipEl.getAttribute("data-group");
    var value = chipEl.getAttribute("data-value");
    var arr = state[group + "s"] || (state[group + "s"] = []);
    var i = arr.indexOf(value);
    if (i === -1) arr.push(value); else arr.splice(i, 1);
    chipEl.classList.toggle("active", i === -1);
    chipEl.setAttribute("aria-pressed", i === -1 ? "true" : "false");
    render(DATA);
  });

  var debounce;
  searchEl.addEventListener("input", function () {
    clearTimeout(debounce);
    var v = searchEl.value;
    debounce = setTimeout(function () { state.q = v; render(DATA); }, 120);
  });
  sortEl.addEventListener("change", function () { state.sort = sortEl.value; render(DATA); });
  clearBtn.addEventListener("click", function () {
    state = { q: "", meals: [], origins: [], ingredients: [], availability: [], sort: sortEl.value };
    searchEl.value = "";
    filtersEl.querySelectorAll(".rdb-chip").forEach(function (c) {
      c.classList.remove("active"); c.setAttribute("aria-pressed", "false");
    });
    render(DATA);
  });

  // Tag vocab (mirrors data/recipes.json labels)
  var MEAL_LABELS = {
    breakfast: { en: "Breakfast", es: "Desayuno" }, lunch: { en: "Lunch", es: "Almuerzo" },
    dinner: { en: "Dinner", es: "Cena" }, side: { en: "Side", es: "Acompañante" },
    dessert: { en: "Dessert", es: "Postre" }, drink: { en: "Drink", es: "Bebida" },
    snack: { en: "Snack", es: "Merienda" },
  };
  var ORIGIN_LABELS = {
    "Puerto Rican": { en: "Puerto Rican", es: "Puertorriqueño" },
    "Afro-Caribbean": { en: "Afro-Caribbean", es: "Afrocaribeño" },
    "Taino heritage": { en: "Taino heritage", es: "Herencia taína" },
  };
  var AVAIL_LABELS = {
    pantry: { en: "Pantry staples", es: "Despensa básica" },
    easy: { en: "Any supermarket", es: "Cualquier supermercado" },
    latin: { en: "Latin grocer", es: "Tienda latina" },
  };
  var INGREDIENT_LABELS = {
    plantain: { en: "Plantain", es: "Plátano" }, pork: { en: "Pork", es: "Cerdo" },
    garlic: { en: "Garlic", es: "Ajo" }, coconut: { en: "Coconut", es: "Coco" },
    cornmeal: { en: "Cornmeal", es: "Harina de maíz" }, sugar: { en: "Sugar", es: "Azúcar" },
    rice: { en: "Rice", es: "Arroz" }, milk: { en: "Milk", es: "Leche" },
    ginger: { en: "Ginger", es: "Jengibre" }, beans: { en: "Beans", es: "Habichuelas" },
    sofrito: { en: "Sofrito", es: "Sofrito" }, chicken: { en: "Chicken", es: "Pollo" },
    peas: { en: "Peas", es: "Guisantes" }, oats: { en: "Oats", es: "Avena" },
    cinnamon: { en: "Cinnamon", es: "Canela" }, cod: { en: "Cod", es: "Bacalao" },
    flour: { en: "Flour", es: "Harina" }, egg: { en: "Egg", es: "Huevo" },
    coffee: { en: "Coffee", es: "Café" }, chocolate: { en: "Chocolate", es: "Chocolate" },
    beef: { en: "Beef", es: "Carne de res" }, potato: { en: "Potato", es: "Papa" },
    herbs: { en: "Herbs", es: "Hierbas" }, "puff pastry": { en: "Puff pastry", es: "Hojaldre" },
    "cream cheese": { en: "Cream cheese", es: "Queso crema" }, yuca: { en: "Yuca", es: "Yuca" },
    corn: { en: "Corn", es: "Maíz" }, pepper: { en: "Pepper", es: "Pimiento" },
    onion: { en: "Onion", es: "Cebolla" }, pasta: { en: "Pasta", es: "Fideos" },
    cheese: { en: "Cheese", es: "Queso" }, rum: { en: "Rum", es: "Ron" },
    butter: { en: "Butter", es: "Mantequilla" }, sauce: { en: "Sauce", es: "Salsa" },
    cornstarch: { en: "Cornstarch", es: "Maicena" },
  };

  var DATA = [];
  fetch("/data/recipes.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; })
    .then(function (d) {
      DATA = (d && d.recipes) || [];
      buildFilters(DATA);
      render(DATA);
    });
})();