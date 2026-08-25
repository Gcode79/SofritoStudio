/* Sofrito Studio — consent manager (GDPR/CCPA).
   Loaded via <script defer> injected by the edge worker on every page.
   Owns analytics consent + Google Analytics 4 loading. main.js only
   pushes events through window.gtag when present (already guarded). */
(function () {
  "use strict";

  var KEY = "ss_consent";
  var GA_ID = (window.SITE_CONFIG && window.SITE_CONFIG.ga4Id) || null;
  var state = null;
  try { state = localStorage.getItem(KEY); } catch (e) {}
  if (state !== "granted" && state !== "denied") state = null;
  window.SS_CONSENT = state || "pending";

  function loadGA() {
    if (!GA_ID || window.__ss_ga_loaded) return;
    window.__ss_ga_loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    try {
      gtag("js", new Date());
      gtag("config", GA_ID);
    } catch (e) {}
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  // Pinterest Tag — fires alongside GA4 after consent, enables conversion
  // tracking + retargeting audiences when ads are eventually run.
  var PIN_TAG_ID = "2614155421519";
  function loadPinterest() {
    if (window.__ss_pin_loaded) return;
    window.__ss_pin_loaded = true;
    !function (e) {
      if (!window.pintrk) {
        window.pintrk = function () { window.pintrk.queue.push(Array.prototype.slice.call(arguments)); };
        var n = window.pintrk; n.queue = []; n.version = "3.0";
        var t = document.createElement("script");
        t.async = true; t.src = e;
        var r = document.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(t, r);
      }
    }("https://s.pinimg.com/ct/core.js");
    pintrk("load", PIN_TAG_ID);
    pintrk("page");
  }

  // Enhanced Match — hash the visitor's email (SHA-256) and fire a Pinterest
  // page event with it, so Pinterest can attribute conversions to the right
  // person. Called after email form submissions site-wide.
  function pinEnhancedMatch(email) {
    if (!email || !window.pintrk) return;
    var clean = String(email).trim().toLowerCase();
    // SHA-256 via SubtleCrypto (async) then fire
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(clean)).then(function (buf) {
      var hex = Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      pintrk("track", "pagevisit", { em: hex });
    }).catch(function () {});
  }
  window.ssPinEnhancedMatch = pinEnhancedMatch;

  // Fire Enhanced Match on any form submission that includes an email input —
  // catches lead magnets, popups, quiz, affiliate, and contact forms site-wide.
  document.addEventListener("submit", function (e) {
    var emailInput = e.target && e.target.querySelector && e.target.querySelector('input[type="email"]');
    if (emailInput && emailInput.value && window.SS_CONSENT === "granted") {
      pinEnhancedMatch(emailInput.value);
    }
  }, true);

  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    window.SS_CONSENT = v;
  }

  function isEs() {
    return /\/es(\/|$)/.test(location.pathname);
  }

  function texts() {
    if (isEs()) {
      return {
        title: "Respetamos tu privacidad",
        body: "Usamos cookies analíticas para entender cómo se usa Sofrito Studio. Puedes aceptarlas o rechazarlas.",
        accept: "Aceptar",
        decline: "Rechazar",
        privacy: "Política de privacidad"
      };
    }
    return {
      title: "Your privacy matters",
      body: "We use analytics cookies to understand how Sofrito Studio is used. You can accept or decline — no tracking runs until you accept.",
      accept: "Accept",
      decline: "Decline",
      privacy: "Privacy policy"
    };
  }

  function showBanner() {
    if (document.getElementById("ss-consent-banner")) return;
    var t = texts();
    var css =
      "#ss-consent-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#2b2118;color:#fff7ee;" +
      "font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.5;box-shadow:0 -6px 24px rgba(43,33,24,.25);}" +
      ".ss-cb-inner{max-width:960px;margin:0 auto;padding:16px 20px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;}" +
      ".ss-cb-title{font-weight:700;margin:0 0 2px;}" +
      ".ss-cb-body{margin:0;color:#eadfcf;flex:1 1 320px;}" +
      ".ss-cb-body a{color:#f2c14e;}" +
      ".ss-cb-btns{display:flex;gap:8px;}" +
      ".ss-cb-btn{border:none;border-radius:9px;cursor:pointer;font:inherit;font-weight:700;padding:9px 16px;}" +
      ".ss-cb-accept{background:#b02422;color:#fff;}" +
      ".ss-cb-decline{background:transparent;border:1px solid #eadfcf;color:#fff7ee;}";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    var div = document.createElement("div");
    div.id = "ss-consent-banner";
    div.setAttribute("role", "dialog");
    div.setAttribute("aria-live", "polite");
    div.innerHTML =
      '<div class="ss-cb-inner"><div><p class="ss-cb-title">' + t.title + '</p>' +
      '<p class="ss-cb-body">' + t.body + ' <a href="/privacy.html">' + t.privacy + '</a></p></div>' +
      '<div class="ss-cb-btns">' +
      '<button type="button" class="ss-cb-btn ss-cb-accept" data-act="accept">' + t.accept + '</button>' +
      '<button type="button" class="ss-cb-btn ss-cb-decline" data-act="decline">' + t.decline + '</button>' +
      '</div></div>';
    document.body.appendChild(div);
    div.addEventListener("click", function (e) {
      var act = e.target.getAttribute && e.target.getAttribute("data-act");
      if (act === "accept") {
        save("granted");
        loadGA();
        loadPinterest();
        div.parentNode.removeChild(div);
      } else if (act === "decline") {
        save("denied");
        div.parentNode.removeChild(div);
      }
    });
  }

  if (window.SS_CONSENT === "granted") {
    loadGA();
    loadPinterest();
  } else if (window.SS_CONSENT === "pending") {
    if (document.body) showBanner();
    else document.addEventListener("DOMContentLoaded", showBanner);
  }
})();