window.SofritoSeo = (function () {
  "use strict";

  var SITE = {
    name: "Sofrito Studio",
    nameEs: "Sofrito Cocina Boricua",
    url: "https://sofritostudio.com",
    logo: "https://sofritostudio.com/images/logo.svg"
  };

  function isEs(lang) {
    return lang === "es";
  }

  function langCode(lang) {
    return isEs(lang) ? "es-PR" : "en-US";
  }

  function publisher() {
    return {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: SITE.logo }
    };
  }

  function text(pair, lang, fallback) {
    if (pair && typeof pair === "object") return pair[lang] || pair.en || pair.es || fallback;
    return pair || fallback;
  }

  function ingredientList(recipe, lang) {
    var list = [];
    (recipe.ingredients || []).forEach(function (group) {
      (group.items || []).forEach(function (item) {
        var name = text(item.name, lang, "");
        list.push(String(item.qty) + " " + item.unit + " " + name);
      });
    });
    return list;
  }

  function recipe(recipeData, lang) {
    var es = isEs(lang);
    var node = {
      "@type": "Recipe",
      name: text(recipeData.name, lang),
      description: text(recipeData.description, lang),
      image: Array.isArray(recipeData.image) ? recipeData.image : [recipeData.image],
      inLanguage: langCode(lang),
      recipeCuisine: "Puerto Rican",
      recipeCategory: recipeData.category,
      keywords: recipeData.keywords,
      author: publisher(),
      publisher: publisher(),
      datePublished: recipeData.datePublished,
      recipeYield: text(recipeData.yield, lang),
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      totalTime: recipeData.totalTime,
      recipeIngredient: ingredientList(recipeData, lang),
      recipeInstructions: (recipeData.steps || []).map(function (step, i) {
        return { "@type": "HowToStep", position: i + 1, text: text(step, lang) };
      })
    };
    if (!es && recipeData.name && recipeData.name.es) node.alternateName = recipeData.name.es;
    if (es && recipeData.name && recipeData.name.en) node.alternateName = recipeData.name.en;
    if (recipeData.isAccessibleForFree === true) node.isAccessibleForFree = true;
    if (recipeData.suitableForDiet) node.suitableForDiet = recipeData.suitableForDiet;
    return node;
  }

  function offers(productData, lang) {
    var price = typeof productData.price === "number" ? productData.price : 0;
    var offer = {
      "@type": "Offer",
      price: String(price),
      priceCurrency: "USD",
      url: productData.url || SITE.url,
      itemCondition: "https://schema.org/NewCondition",
      availability: productData.inStock === false
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock"
    };
    if (productData.availabilityDate) offer.availabilityStarts = productData.availabilityDate;
    offer.seller = { "@type": "Organization", name: SITE.name };
    offer.hasMerchantReturnPolicy = {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "US",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 30
    };
    offer.shippingDetails = {
      "@type": "OfferShippingDetails",
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" },
      "shippingRate": { "@type": "MonetaryAmount", "value": 0, "currency": "USD" },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" }
      }
    };
    return offer;
  }

  function product(productData, lang) {
    var node = {
      "@type": "Product",
      name: text(productData.name, lang),
      description: text(productData.description, lang),
      image: Array.isArray(productData.image) ? productData.image : [productData.image],
      inLanguage: langCode(lang),
      brand: { "@type": "Brand", name: SITE.name },
      sku: productData.sku,
      category: productData.kind === "digital" ? "DigitalDownload" : "PhysicalGood",
      offers: offers(productData, lang)
    };
    if (productData.aggregateRating) node.aggregateRating = productData.aggregateRating;
    if (productData.review && productData.review.length) {
      node.review = productData.review.map(function (r) {
        return { "@type": "Review", author: { "@type": "Person", name: r.author }, reviewBody: r.body, reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 } };
      });
    }
    return node;
  }

  function howTo(recipeData, lang) {
    var es = isEs(lang);
    var steps = (recipeData.steps || []).map(function (step, i) {
      return { "@type": "HowToStep", position: i + 1, text: text(step, lang) };
    });
    var node = {
      "@type": "HowTo",
      name: text(recipeData.name, lang),
      description: text(recipeData.description, lang),
      inLanguage: langCode(lang),
      totalTime: recipeData.totalTime,
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      recipeYield: text(recipeData.yield, lang),
      step: steps
    };
    if (!es && recipeData.name && recipeData.name.es) node.alternateName = recipeData.name.es;
    if (es && recipeData.name && recipeData.name.en) node.alternateName = recipeData.name.en;
    return node;
  }

  function graph(items) {
    return { "@context": "https://schema.org", "@graph": items };
  }

  function inject(obj) {
    var el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(obj);
    document.head.appendChild(el);
    return el;
  }

  return { recipe: recipe, product: product, howTo: howTo, graph: graph, inject: inject };
})();
