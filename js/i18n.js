window.SofritoI18n = (function () {
  "use strict";

  var DEFAULT = "en";
  var state = { lang: DEFAULT, dict: {} };

  function setLang(lang, dict) {
    state.lang = lang === "es" ? "es" : "en";
    if (dict) state.dict = dict;
    document.documentElement.setAttribute("lang", state.lang === "es" ? "es-PR" : "en-US");
    try { localStorage.setItem("sofrito.lang", state.lang); } catch (e) {}
    return state.lang;
  }

  function getLang() {
    return state.lang;
  }

  function pick(obj) {
    if (obj && typeof obj === "object") {
      if (obj[state.lang]) return obj[state.lang];
      if (obj[DEFAULT]) return obj[DEFAULT];
      if (obj.en) return obj.en;
      if (obj.es) return obj.es;
    }
    return obj;
  }

  function t(key, vars) {
    var s = state.dict[key] != null ? state.dict[key] : key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{{" + k + "}}").join(vars[k]);
      });
    }
    return s;
  }

  function applyDom(root) {
    var scope = root || document;
    var i, node;
    var texts = scope.querySelectorAll("[data-i18n]");
    for (i = 0; i < texts.length; i++) {
      node = texts[i];
      node.textContent = t(node.getAttribute("data-i18n"));
    }
    var attrs = scope.querySelectorAll("[data-i18n-attr]");
    for (i = 0; i < attrs.length; i++) {
      node = attrs[i];
      var pair = node.getAttribute("data-i18n-attr").split(":");
      if (pair.length === 2) node.setAttribute(pair[0], t(pair[1]));
    }
    return scope;
  }

  return { setLang: setLang, getLang: getLang, pick: pick, t: t, applyDom: applyDom };
})();
