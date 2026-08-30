/* ======== Sofrito meal-prep calculator ========
 * "How much sofrito base does your household need?"
 * Computes monthly batches, scales the ingredient list, and recommends
 * the matching tier ($47 La Mesa vs $67 Kitchen Bundle).
 */
(function () {
  "use strict";
  var form = document.getElementById("sofritoCalculator");
  if (!form) return;

  var output = document.getElementById("calculatorOutput");
  var CTA_MESA = "mesa";
  var CTA_BUNDLE = "kitchen-bundle";

  // Per ~3-cup batch of sofrito (the Ortiz baseline)
  var BASE_INGREDIENTS = [
    { label: "recao (culantro)", qty: 2, unit: "bunches" },
    { label: "green cubanelle peppers", qty: 2, unit: "" },
    { label: "onion", qty: 1, unit: "large" },
    { label: "garlic", qty: 1, unit: "head" },
    { label: "cilantro", qty: 0.5, unit: "bunch" },
    { label: "aji dulce (optional)", qty: 1, unit: "" },
    { label: "olive oil", qty: 0.5, unit: "cup" },
    { label: "vinegar", qty: 0.25, unit: "cup" },
    { label: "salt", qty: 1, unit: "tsp" }
  ];

  function fmtQty(n) {
    var r = Math.round(n * 10) / 10;
    return r % 1 === 0 ? String(r) : r.toFixed(1).replace(/\.0$/, "");
  }

  function recompute() {
    var size = parseInt(form.querySelector("[name=household]").value, 10) || 4;
    var meals = parseInt(form.querySelector("[name=meals]").value, 10) || 5;
    var mealPrep = form.querySelector("[name=mealprep]").checked;

    var familyFactor = 1 + (Math.max(0, size - 2)) * 0.15;
    var cupsPerMonth = meals * 4.3 * 0.25 * familyFactor; // 1/4 cup per dish
    var batches = Math.max(1, Math.ceil(cupsPerMonth / 3)); // ~3 cups per batch

    var rows = BASE_INGREDIENTS.map(function (ing) {
      var q = ing.qty * batches;
      return "<li><b>" + fmtQty(q) + " " + ing.unit + "</b> " + ing.label + "</li>";
    }).join("");

    var bundle = size >= 4 || mealPrep;
    var recName = bundle ? "The Kitchen Bundle" : "La Mesa Boricua";
    var recPrice = bundle ? "$67" : "$47";
    var recSku = bundle ? CTA_BUNDLE : CTA_MESA;
    var recBlurb = bundle
      ? "Meal planners, shopping lists, and the weeknight system — built for a kitchen this size."
      : "The 30-recipe bilingual cookbook — the perfect fit for your household.";

    output.hidden = false;
    output.innerHTML =
      '<div class="calc-summary">' +
      "<span>Your household needs roughly <b>" + fmtQty(cupsPerMonth) + " cups</b> of sofrito a month</span>" +
      "<span>That's <b>" + batches + " batch" + (batches > 1 ? "es" : "") + "</b> of 3 cups &mdash; freeze for up to 3 months</span>" +
      "</div>" +
      "<div class='calc-col'>" +
      "<h3>Your batch ingredient list</h3>" +
      "<ul class='calc-ingredients'>" + rows + "</ul>" +
      "</div>" +
      "<div class='calc-rec'>" +
      "<h3>We recommend</h3>" +
      "<p class='calc-rec-name'>" + recName + " <span>" + recPrice + "</span></p>" +
      "<p class='calc-rec-blurb'>" + recBlurb + "</p>" +
      '<a class="btn btn-primary-big" href="#" data-cart-add="' + recSku + '">Get ' + recName + " &mdash; " + recPrice + "</a>" +
      "<p class='form-note'>Instant download &middot; 30-day guarantee</p>" +
      "</div>";
  }

  form.addEventListener("input", recompute);
  form.addEventListener("change", recompute);
  recompute();
})();