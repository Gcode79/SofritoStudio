/**
 * Sofrito Studio — Funnel page integration (self-contained, no deps)
 *
 *   1. getTrackingCookies()  — reads Meta `_fbp` + GA4 `_ga` cookies
 *   2. wireLeadForm()        — intercepts #sofrito-101-form, posts the lead to
 *                              POST /api/events (Resend `sofrito_101_downloaded`
 *                              + KV capture) instead of letting the raw
 *                              Buttondown embed swallow the submit
 *   3. augmentGumroadLinks() — appends _fbp/_ga onto every Gumroad checkout
 *                              link so the click IDs ride through to Gumroad's
 *                              url_parameters and back into the Purchase
 *                              CAPI event in the queue consumer
 *
 * Works on the Pages funnel (site/) via window.SOFRITO_CONFIG.apiBase, and
 * same-origin when served by the worker. Tailwind-powered page, no build step.
 */
(function () {
  "use strict";

  if (window.__SOFRITO_SCRIPT__) return;
  window.__SOFRITO_SCRIPT__ = true;

  var API_BASE = (window.SOFRITO_CONFIG && window.SOFRITO_CONFIG.apiBase) || "";
  var FORM_SELECTOR = "#sofrito-101-form";

  // ------------------------------------------------------------------
  // 1) Tracking cookies
  // ------------------------------------------------------------------
  function getTrackingCookies() {
    var out = { fbp: "", ga: "" };
    if (!document || typeof document.cookie !== "string") return out;
    var parts = document.cookie.split(";");
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i].trim().split("=");
      var key = pair[0] || "";
      var value = decodeURIComponent(pair.slice(1).join("=") || "").trim();
      if (!value) continue;
      if ((key === "_fbp" || key === "fbp") && !out.fbp) out.fbp = value;
      if ((key === "_ga" || key === "ga") && !out.ga) out.ga = value;
    }
    return out;
  }

  // ------------------------------------------------------------------
  // 2) Lead form interception
  // ------------------------------------------------------------------
  function wireLeadForm() {
    var form = document.querySelector(FORM_SELECTOR);
    if (!form) return;

    var emailInput = form.querySelector('input[name="email"]');
    if (!emailInput) return;

    function setBusy(busy) {
      var btn = form.querySelector('input[type="submit"], button[type="submit"]');
      if (!btn) return;
      if (!btn.getAttribute("data-original-value")) btn.setAttribute("data-original-value", btn.value);
      btn.disabled = busy;
      btn.value = busy ? "Sending…" : btn.getAttribute("data-original-value");
    }

    function showStatus(cls, text) {
      var status = form.querySelector(".sofrito-form-status");
      if (!status) {
        status = document.createElement("p");
        status.className = "sofrito-form-status text-sm mt-2 font-medium";
        form.appendChild(status);
      }
      status.className = "sofrito-form-status text-sm mt-2 font-medium " + cls;
      status.textContent = text;
    }

    // The email form has no action fallback when the API is unreachable — the
    // Buttondown embed URL the form was styled around (its original action).
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      if (!email || !/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        showStatus("text-red-600", "Please enter a valid email address.");
        return;
      }
      var cookies = getTrackingCookies();
      var payload = {
        email: email,
        fbp: cookies.fbp,
        ga: cookies.ga,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      };
      setBusy(true);
      showStatus("text-[#1F2937]", "Sending…");
      fetch(API_BASE + "/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          if (!r.ok) throw new Error("api " + r.status);
          return r.json();
        })
        .then(function (res) {
          setBusy(false);
          if (res.status === "ok") {
            showStatus("text-green-700", "Check your inbox for Sofrito 101!");
            form.hidden = true;
          } else {
            showStatus("text-red-600", "Hmm, something went wrong — try again.");
          }
        })
        .catch(function () {
          setBusy(false);
          showStatus("text-red-600", "Couldn't reach the server — try again.");
        });
    });
  }

  // ------------------------------------------------------------------
  // 3) Gumroad checkout links — carry _fbp/_ga through to the sale
  // ------------------------------------------------------------------
  function augmentGumroadLinks() {
    var links = document.querySelectorAll('a[href*="gumroad.com/l/"], a[href*="gumroad.com/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = (a.getAttribute("href") || "").trim();
      if (!href || a.getAttribute("data-sofrito-augmented")) continue;
      try {
        var url = new URL(href, window.location.origin);
        if (!/gumroad\.com$/i.test(url.hostname) && !/\.gumroad\.com$/i.test(url.hostname)) continue;
        var cookies = getTrackingCookies();
        if (cookies.fbp && !url.searchParams.get("_fbp")) url.searchParams.set("_fbp", cookies.fbp);
        if (cookies.ga && !url.searchParams.get("_ga")) url.searchParams.set("_ga", cookies.ga);
        a.setAttribute("href", url.toString());
        a.setAttribute("data-sofrito-augmented", "1");
      } catch (e) {
        // leave the link untouched on malformed hrefs
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      wireLeadForm();
      augmentGumroadLinks();
    });
  } else {
    wireLeadForm();
    augmentGumroadLinks();
  }
})();