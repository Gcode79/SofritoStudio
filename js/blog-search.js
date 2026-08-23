/* ======== Blog page — live search + multi-select tag filters ========
 * Upgrades /blog.html: a search bar + toggleable category chips that
 * instantly filter the card grid client-side (no page reloads).
 * Handles the existing data-cat categories plus "Under 30 Min" (parsed
 * from each card's time meta).
 */
(function () {
  "use strict";
  var grid = document.getElementById("blogList");
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".blog-list-card"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".blog-filter"));
  if (!chips.length) return;

  function cardText(card) {
    return (card.innerText || card.textContent || "").toLowerCase();
  }
  function cardTimeMin(card) {
    var meta = card.querySelector(".blog-meta");
    if (!meta) return null;
    var t = meta.querySelector("span") ? meta.querySelector("span").textContent : "";
    var m = t.match(/(\d+)\s*min/);
    if (m) return parseInt(m[1], 10);
    var h = t.match(/(\d+)\s*hrs?/);
    if (h) return parseInt(h[1], 10) * 60;
    return null;
  }

  // Search bar above the chips
  var wrap = document.createElement("div");
  wrap.className = "blog-search";
  wrap.innerHTML = '<input type="search" id="blogSearch" placeholder="Search recipes, ingredients…" aria-label="Search recipes">';
  var filters = document.querySelector(".blog-filters");
  if (filters) filters.parentNode.insertBefore(wrap, filters);

  var countEl = document.createElement("div");
  countEl.className = "blog-count";
  if (filters && filters.nextSibling) filters.parentNode.insertBefore(countEl, filters.nextSibling);
  else if (filters) filters.parentNode.appendChild(countEl);

  var state = { q: "", cats: [] };

  function matches(card) {
    if (state.q && cardText(card).indexOf(state.q) === -1) return false;
    if (!state.cats.length) return true;
    return state.cats.some(function (c) {
      if (c === "quick") {
        var t = cardTimeMin(card);
        return t !== null && t <= 30;
      }
      return card.dataset.cat === c;
    });
  }

  function render() {
    var shown = 0;
    cards.forEach(function (card) {
      var on = matches(card);
      card.style.display = on ? "" : "none";
      if (on) shown++;
    });
    countEl.textContent = shown + " of " + cards.length + " recipes";
  }

  var debounce;
  var input = document.getElementById("blogSearch");
  if (input) {
    input.addEventListener("input", function () {
      var v = this.value.toLowerCase().trim();
      clearTimeout(debounce);
      debounce = setTimeout(function () { state.q = v; render(); }, 120);
    });
  }

  chips.forEach(function (chip) {
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");
    chip.addEventListener("click", function () {
      var cat = chip.dataset.cat;
      var allChip = chips.find(function (c) { return c.dataset.cat === "all"; });
      if (cat === "all") {
        state.cats = [];
        chips.forEach(function (c) { c.classList.remove("active"); });
        if (allChip) allChip.classList.add("active");
      } else {
        var i = state.cats.indexOf(cat);
        if (i === -1) state.cats.push(cat); else state.cats.splice(i, 1);
        chip.classList.toggle("active");
        if (allChip) allChip.classList.remove("active");
      }
      render();
    });
  });

  render();
})();