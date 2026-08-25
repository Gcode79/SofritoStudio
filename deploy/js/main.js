// =============================================================
//  SITE CONFIG — the only place you need to edit
//  Paste your Buttondown username + Gumroad product links below.
// =============================================================
// Flag that the reveal animation script is alive. CSS only hides .reveal
// sections under .js-reveal — so if THIS script is blocked or fails to load,
// the page still renders fully visible instead of going blank.
document.documentElement.classList.add("js-reveal");

const SITE_CONFIG = {
  // Your Buttondown account username (lowercase, from your newsletter URL
  // https://buttondown.com/<username>). Get it free at buttondown.com.
  buttondownUsername: "joshortiz56",

  // Google Analytics 4 measurement ID. Paste your GA4 ID (starts with "G-")
  // here and the script auto-loads + fires every ssTrack() event below.
  // Leave empty ("") to keep analytics fully off.
  ga4Id: "G-7XFBM9JMEV",

  // Your Gumroad product links (from each product's "Share" page).
  // Keys must match the data-product="..." attributes in your HTML.
  gumroad: {
    // ---- Core packages (wired & live) ----
    mesa: "https://sofritostudio.gumroad.com/l/cmfkg",
    "kitchen-bundle": "https://sofritostudio.gumroad.com/l/razabs",
    "full-table": "https://sofritostudio.gumroad.com/l/dodbtn",

    // ---- Individual guides (wired to Gumroad account) ----
    breakfasts: "https://sofritostudio.gumroad.com/l/boricua-breakfasts",
    callejera: "https://sofritostudio.gumroad.com/l/comida-callejera",
    postres: "https://sofritostudio.gumroad.com/l/postres-boricuas",
    "sofrito-masterclass": "https://sofritostudio.gumroad.com/l/sofrito-masterclass",
    "meal-prep": "https://sofritostudio.gumroad.com/l/boricua-meal-prep",
    "air-fryer": "https://sofritostudio.gumroad.com/l/air-fryer-boricua",
    "pernil-playbook": "https://sofritostudio.gumroad.com/l/pernil-playbook",

    // ---- Bundles (wired to Gumroad account) ----
    "breakfast-bundle": "https://sofritostudio.gumroad.com/l/breakfast-bundle",
    "street-food-bundle": "https://sofritostudio.gumroad.com/l/street-food-bundle",
    "holiday-bundle": "https://sofritostudio.gumroad.com/l/holiday-bundle",
    "complete-kitchen": "https://sofritostudio.gumroad.com/l/complete-kitchen",

    // ---- Seasonal (preorder buttons) ----
    "thanksgiving-boricua": "https://sofritostudio.gumroad.com/l/thanksgiving-boricua",
    "navidad-boricua": "https://sofritostudio.gumroad.com/l/navidad-boricua",
    "coquito-guide": "https://sofritostudio.gumroad.com/l/coquito-guide",
    "holiday-addon": "https://sofritostudio.gumroad.com/l/holiday-coquito-addon",

    // ---- Entry / standalone / course / membership ----
    "starter-kit": "https://sofritostudio.gumroad.com/l/sofrito-starter-kit",
    weeknights: "https://sofritostudio.gumroad.com/l/boricua-weeknights",
    course: "https://sofritostudio.gumroad.com/l/mofongo-course",
    "membership-monthly": "https://sofritostudio.gumroad.com/l/membership-monthly",
    "membership-yearly": "https://sofritostudio.gumroad.com/l/membership-yearly",
  },

  // SMS capture: set to your SMS provider webhook (e.g. a Twilio Studio flow URL
  // or Zapier catch-hook) to forward phone numbers captured in the exit popup.
  // Leave null until you have a provider wired up.
  smsWebhook: null,

  // Affiliate application intake. Create a free form at formspree.io (or use a
  // Zapier webhook) and paste the endpoint here. Leave null to keep the mailto
  // fallback behavior.
  affiliateEndpoint: null,
};
// Expose on window: catalog-grid.js and product-page.js resolve Gumroad URLs
// via window.SITE_CONFIG — a top-level `const` is NOT a window property.
window.SITE_CONFIG = SITE_CONFIG;

// ---- UTM + affiliate attribution helpers ----
function sessionUtm() {
  try {
    const u = JSON.parse(sessionStorage.getItem("ss-utm") || "null");
    if (u && u.campaign) return u;
  } catch (err) {}
  return null;
}
function sessionVia() {
  try { return sessionStorage.getItem("ss-via") || ""; } catch (err) { return ""; }
}
function appendUtm(url) {
  const u = sessionUtm();
  if (!url) return url;
  let out = url;
  if (u && out.indexOf("utm_campaign=") === -1) {
    const q = "utm_source=" + encodeURIComponent(u.source || "social") +
      "&utm_medium=" + encodeURIComponent(u.medium || "social") +
      "&utm_campaign=" + encodeURIComponent(u.campaign);
    out += (out.indexOf("?") === -1 ? "?" : "&") + q;
  }
  // Gumroad affiliate attribution: ?via=<creator code> (also powers the
  // affiliate program — a creator's ?via= link is remembered for the session).
  const v = sessionVia();
  if (v && out.indexOf("via=") === -1) {
    out += (out.indexOf("?") === -1 ? "?" : "&") + "via=" + encodeURIComponent(v);
  }
  return out;
}
function patchGumroadUtm() {
  document.querySelectorAll('a[href*="gumroad.com/l/"]').forEach((a) => {
    const h = a.getAttribute("href") || "";
    const patched = appendUtm(h);
    if (patched && patched !== h) a.setAttribute("href", patched);
  });
}

// Privacy-friendly event tracking. No-op until a measurement script (e.g. GA4)
// is enabled in the <head> — then this pushes events through window.gtag.
function ssTrack(eventName, params) {
  if (typeof window.gtag === "function") {
    try { gtag("event", eventName, params || {}); } catch (err) {}
  }
}

// Best-effort language detection for API payloads / UI microcopy.
function pageLang() {
  try {
    if (window.SofritoI18n && typeof window.SofritoI18n.getLang === "function") {
      const l = window.SofritoI18n.getLang();
      if (l === "es") return "es";
    }
    if (/\/es(\/|$)/.test(location.pathname)) return "es";
    return localStorage.getItem("sofrito.lang") || "en";
  } catch (err) {
    return /\/es(\/|$)/.test(location.pathname) ? "es" : "en";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Google Analytics 4 is loaded ONLY by js/consent.js after the visitor grants
  // analytics consent (GDPR/CCPA). main.js just pushes events via window.gtag
  // when present — the ssTrack guards already no-op without it.

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      toggle.innerHTML = open ? "&#10005;" : "&#9776;";
    });
    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = "&#9776;";
      }
    });
  }

  // ---- Gumroad buy buttons ----
  document.querySelectorAll("[data-product]").forEach((btn) => {
    const url = SITE_CONFIG.gumroad[btn.dataset.product];
    if (url) btn.href = appendUtm(url);
    btn.addEventListener("click", () => ssTrack("begin_checkout", { item: btn.dataset.product }));
  });

  // ---- UTM attribution on every Gumroad link ----
  // Appends the session's utm_source/medium/campaign to any Gumroad checkout
  // URL so Gumroad's url_parameters carry attribution (feeds post-purchase
  // digests). A MutationObserver catches links built later by the PDP, catalog
  // grid, and cart drawer.
  patchGumroadUtm();
  const _utmo = new MutationObserver(() => patchGumroadUtm());
  if (document.body) _utmo.observe(document.body, { childList: true, subtree: true });

  // ---- CTA click tracking ----
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const href = btn.getAttribute("href") || "";
      ssTrack("cta_click", { target: href, label: (btn.textContent || "").trim().slice(0, 60) });
    });
  });

  // ---- Affiliate application form ----
  const affiliateForm = document.getElementById("affiliateForm");
  if (affiliateForm) {
    affiliateForm.addEventListener("submit", (e) => {
      if (!SITE_CONFIG.affiliateEndpoint) return;
      e.preventDefault();
      const msg = document.getElementById("affiliateMsg");
      const btn = affiliateForm.querySelector('button[type="submit"]');
      const data = {
        name: (document.getElementById("affiliate-name") || {}).value || "",
        email: (document.getElementById("affiliate-email") || {}).value || "",
        platform: (document.getElementById("affiliate-platform") || {}).value || "",
        audience_size: (document.getElementById("affiliate-audience") || {}).value || "",
      };
      if (btn) { btn.disabled = true; btn.classList.add("loading"); }
      fetch(SITE_CONFIG.affiliateEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data),
      }).then(() => {
        if (btn) { btn.disabled = false; btn.classList.remove("loading"); }
        if (msg) msg.hidden = false;
        affiliateForm.reset();
      }).catch(() => {
        if (btn) { btn.disabled = false; btn.classList.remove("loading"); }
        affiliateForm.action = "mailto:affiliate@sofritostudio.com";
        affiliateForm.method = "post";
        affiliateForm.submit();
      });
    });
  }

  // ---- Sofrito 101 signup -> instant email (PDF + 15% code) + tripwire redirect ----
  const form = document.getElementById("magnetForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("magnetEmail");
      const msg = document.getElementById("formMsg");
      if (!email || !email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        if (email) {
          email.style.borderColor = "#e0653c";
          email.focus();
        }
        return;
      }
      email.style.borderColor = "";
      const btn = form.querySelector('button[type="submit"], .btn');
      if (btn) { btn.disabled = true; btn.classList.add("loading"); }

      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value.trim(),
          lang: pageLang(),
          source: "sofrito-101",
          intent: "freebie",
        }),
      })
        .catch(() => null)
        .finally(() => {
          form.reset();
          if (msg) msg.hidden = true;
          try { localStorage.setItem("ss-subbed", "1"); } catch (err) {}
          ssTrack("generate_lead", { location: "freebie", tripwire: "starter15" });
          window.location.href = "products/starter-kit.html?promo=starter15";
        });
    });
  }

  // ---- Course waitlist form (posts to Buttondown, same pattern as Sofrito 101) ----
  const waitlistForm = document.getElementById("mofongoWaitlistForm");
  if (waitlistForm) {
    waitlistForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = waitlistForm.querySelector('input[type="email"]');
      const msg = document.getElementById("mofongoWaitlistMsg");
      const submitBtn = waitlistForm.querySelector('button[type="submit"]');
      if (!email || !email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        if (email) { email.style.borderColor = "#e0653c"; email.focus(); }
        return;
      }
      email.style.borderColor = "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add("loading"); }
      if (!SITE_CONFIG.buttondownUsername.startsWith("YOUR-")) {
        const iframe = document.createElement("iframe");
        iframe.name = "waitlist-frame";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        waitlistForm.action = "https://buttondown.com/api/emails/embed-subscribe/" + SITE_CONFIG.buttondownUsername;
        waitlistForm.method = "post";
        waitlistForm.target = iframe.name;
        iframe.addEventListener("load", () => {
          waitlistForm.reset();
          if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove("loading"); }
          if (msg) msg.hidden = false;
          ssTrack("generate_lead", { location: "mofongo_waitlist" });
        });
        waitlistForm.submit();
        return;
      }
      waitlistForm.reset();
      if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove("loading"); }
      if (msg) msg.hidden = false;
      ssTrack("generate_lead", { location: "mofongo_waitlist" });
    });
  }

  // ---- Scroll-reveal animations ----
  const revealEls = document.querySelectorAll(".reveal");
  const showAll = () => revealEls.forEach((el) => el.classList.add("visible"));

  if (revealEls.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));

    // Failsafe: if the observer hasn't revealed everything shortly after load
    // (blocked observer, reduced motion, virtual rendering, etc.), force all
    // content visible so the page is never left blank.
    window.setTimeout(() => {
      let anyHidden = false;
      revealEls.forEach((el) => { if (!el.classList.contains("visible")) anyHidden = true; });
      if (anyHidden) showAll();
    }, 1500);
  } else {
    // Fallback: show everything immediately
    showAll();
  }

  // ---- Header scroll effect ----
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---- Scroll-to-top button ----
  const scrollTopBtn = document.getElementById("scrollTop");
  if (scrollTopBtn) {
    const toggleScrollTop = () => {
      scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
    };
    window.addEventListener("scroll", toggleScrollTop, { passive: true });
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    toggleScrollTop();
  }

  // ---- FAQ accordion (animated) ----
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const answer = item.querySelector(".faq-answer");
      const isOpen = item.classList.contains("open");

      // Close all others
      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          openItem.querySelector(".faq-answer").setAttribute("aria-hidden", "true");
        }
      });

      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", !isOpen);
      answer.setAttribute("aria-hidden", isOpen);
    });
  });

  // ---- Image lazy-load skeleton ----
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    if (img.complete) {
      img.classList.add("loaded");
    } else {
      img.addEventListener("load", () => img.classList.add("loaded"));
      img.addEventListener("error", () => img.classList.add("loaded"));
    }
  });

  // ---- Button loading state on form submit ----
  const magnetForm = document.getElementById("magnetForm");
  if (magnetForm) {
    magnetForm.addEventListener("submit", () => {
      const submitBtn = magnetForm.querySelector('button[type="submit"], .btn');
      if (submitBtn) {
        submitBtn.classList.add("loading");
        submitBtn.setAttribute("disabled", "true");
      }
    });
  }

  // ---- Hero parallax (subtle) ----
  const heroBg = document.querySelector(".hero-bg");
  if (heroBg && window.matchMedia("(min-width: 720px)").matches) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < 800) {
            heroBg.style.transform = `translateY(${y * 0.3}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- Exit-intent popup (desktop exit-intent / 25s mobile timer / 14-day dismissal) ----
  const popupOverlay = document.getElementById("popupOverlay");
  const popupClose = document.getElementById("popupClose");
  const popupForm = document.getElementById("popupForm");
  if (popupOverlay) {
    // Opt-in: only arm the overlay once the script is confirmed running.
    document.documentElement.classList.add("popup-enabled");

    // Never open automatically on page load/mount. Respect a 14-day dismissal
    // window stored in localStorage when the visitor closes or converts.
    let popupArmed = false;
    try {
      const dismissedAt = parseInt(localStorage.getItem("ss-popup-dismissed") || "0", 10);
      popupArmed = !(dismissedAt && dismissedAt > Date.now());
    } catch (err) { popupArmed = true; }

    function showPopup() {
      if (!popupArmed) return;
      popupOverlay.classList.add("active");
      popupArmed = false;
    }
    function dismissPopup() {
      popupOverlay.classList.remove("active");
      try { localStorage.setItem("ss-popup-dismissed", String(Date.now() + 14 * 86400000)); } catch (err) {}
    }

    if (popupArmed) {
      const isMobile = window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
      if (isMobile) {
        // Mobile: no exit-intent on touch — wait a minimum of 25s on page.
        setTimeout(showPopup, 25000);
      } else {
        // Desktop: exit-intent only — cursor crosses the top viewport boundary.
        document.addEventListener("mouseout", (e) => {
          if (e.clientY < 5 && !e.relatedTarget) showPopup();
        });
      }
    }
    if (popupClose) {
      popupClose.addEventListener("click", dismissPopup);
    }
    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay) dismissPopup();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") dismissPopup();
    });
    if (popupForm) {
      popupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = popupForm.querySelector('input[type="email"]');
        const msg = popupForm.querySelector(".form-msg");
        const submitBtn = popupForm.querySelector('button[type="submit"]');
        if (!email || !email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
          if (email) { email.style.borderColor = "#e0653c"; email.focus(); }
          return;
        }
        email.style.borderColor = "";
        if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add("loading"); }
        let phone = "";
        const phoneInput = popupForm.querySelector('input[type="tel"]');
        if (phoneInput && phoneInput.value.trim()) {
          phone = phoneInput.value.replace(/[^0-9+]/g, "");
          if (phone.length >= 7) {
            localStorage.setItem("ss-sms-optin", phone);
            const smsHook = SITE_CONFIG.smsWebhook;
            if (smsHook) {
              try {
                fetch(smsHook, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: email.value, phone, source: "exit-popup" })
                });
              } catch (err) {}
            }
          }
        }
        // Action 1: instant email (PDF + 15% code) via the edge API, and
        // record checkout-intent so the abandoned-cart sequence can fire.
        fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.value.trim(),
            lang: pageLang(),
            source: "exit-popup",
            intent: "checkout",
            product: "starter-kit",
            phone,
          }),
        })
          .catch(() => null)
          .finally(() => {
            popupForm.reset();
            if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove("loading"); }
            if (msg) msg.hidden = false;
            try { localStorage.setItem("ss-subbed", "1"); } catch (err) {}
            ssTrack("generate_lead", { location: "exit_popup", intent: "checkout" });
            setTimeout(dismissPopup, 1500);
          });
      });
    }
  }

  // NOTE: the former "urgency counter" (randomized fake live-viewer counts)
  // was removed — no page ever rendered #urgencyCount, and fabricated
  // scarcity claims are an FTC risk. Real social proof belongs in reviews.

  // ---- Video showcase: play/pause, captions, badges ----
  const videoWrapper = document.getElementById("videoWrapper");
  const heroVideo = document.getElementById("heroVideo");
  const videoPlayBtn = document.getElementById("videoPlayBtn");
  const videoCaptions = document.getElementById("videoCaptions");
  const captionText = document.getElementById("captionText");
  const videoProof = document.getElementById("videoProof");

  if (videoWrapper && heroVideo) {
    // Start in paused state
    videoWrapper.classList.add("paused");

    // Play/pause toggle
    function togglePlay() {
      if (heroVideo.paused) {
        heroVideo.play().catch(() => {});
      } else {
        heroVideo.pause();
      }
    }

    // Click video or play button to toggle
    videoWrapper.addEventListener("click", (e) => {
      if (e.target.closest(".btn-overlay") || e.target.closest('a[href]')) return;
      togglePlay();
    });

    if (videoPlayBtn) {
      videoPlayBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    // Track play/pause state
    let proofTimer;
    heroVideo.addEventListener("play", () => {
      videoWrapper.classList.remove("paused");
      videoWrapper.classList.add("playing");
      ssTrack("video_start", { video: "sofrito-tutorial" });
      // Show proof badge after 2s
      if (videoProof) {
        proofTimer = setTimeout(() => videoProof.classList.add("visible"), 2000);
      }
      // Enable native captions
      if (heroVideo.textTracks && heroVideo.textTracks[0]) {
        heroVideo.textTracks[0].mode = "hidden";
      }
    });

    heroVideo.addEventListener("pause", () => {
      videoWrapper.classList.remove("playing");
      videoWrapper.classList.add("paused");
      if (proofTimer) clearTimeout(proofTimer);
      if (videoProof) videoProof.classList.remove("visible");
      if (videoCaptions) videoCaptions.classList.remove("visible");
    });

    heroVideo.addEventListener("ended", () => {
      videoWrapper.classList.remove("playing");
      videoWrapper.classList.add("paused");
      if (videoProof) videoProof.classList.remove("visible");
    });

    // Caption sync via VTT text tracks
    if (heroVideo.textTracks && heroVideo.textTracks[0]) {
      const track = heroVideo.textTracks[0];
      track.mode = "hidden";
      track.addEventListener("cuechange", () => {
        const cue = track.activeCues && track.activeCues[0];
        if (cue && captionText && videoCaptions) {
          captionText.textContent = cue.text;
          videoCaptions.classList.add("visible");
        } else if (videoCaptions) {
          videoCaptions.classList.remove("visible");
        }
      });
    }
  }
});

/* ======== Push notification opt-in (after 3rd pageview) ======== */
// Tracks pageviews in localStorage and, once the visitor has seen 3+ pages,
// asks the browser for push permission — only when OneSignal is loaded in the
// <head> (uncomment the OneSignal snippet in index.html to activate).
document.addEventListener("DOMContentLoaded", () => {
  try {
    const KEY = "ss-pv-count";
    const pv = parseInt(localStorage.getItem(KEY) || "0", 10) + 1;
    localStorage.setItem(KEY, String(pv));
    if (pv === 3 && typeof window.OneSignal !== "undefined") {
      window.OneSignal.push(() => window.OneSignal.registerForPushNotifications());
    }
  } catch (err) {}
});

/* ======== Ingredient Scaler ======== */
document.addEventListener("DOMContentLoaded", () => {
  const scaler = document.querySelector(".scaler-bar");
  if (!scaler) return;

  const btns = scaler.querySelectorAll(".scaler-btn");

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      const factor = parseFloat(btn.dataset.scale);
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".ing-qty").forEach(el => {
        const base = parseFloat(el.dataset.base);
        if (isNaN(base)) return;
        const scaled = base * factor;
        const formatted = scaled % 1 === 0 ? scaled : scaled.toFixed(1).replace(/\.0$/, "");
        const unit = el.dataset.unit || "";
        let unitOut = unit;
        if (unit) {
          const singular = unit.length > 3 && unit.endsWith("s") ? unit.slice(0, -1) : unit;
          unitOut = scaled === 1 ? singular : (unit === singular ? singular + "s" : unit);
        }
        el.textContent = formatted + (unitOut ? " " + unitOut : "");
        el.classList.add("bump");
        setTimeout(() => el.classList.remove("bump"), 200);
      });

      const label = scaler.querySelector(".scaler-serving-count");
      if (label) {
        const baseServings = parseInt(label.dataset.baseServings) || 8;
        label.textContent = Math.round(baseServings * factor) + " servings";
      }
    });
  });
});

/* ======== Cart drawer — instant slide-out quick checkout ======== */
document.addEventListener("DOMContentLoaded", () => {
  const G = window.SITE_CONFIG;
  if (!G || !G.gumroad) return;

  const CATALOG_P = fetch("/data/products.json")
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  const bySku = {};
  const lang = /\/es(\/|$)/.test(location.pathname) ? "es" : "en";

  // Regional campaign attribution — parse utm_campaign from the landing URL
  // and persist it for the session so drawer checkouts carry the source.
  function storedUtm() {
    try { return JSON.parse(sessionStorage.getItem("ss-utm") || "null"); } catch (err) { return null; }
  }
  let UTM = null;
  try {
    const p = new URLSearchParams(location.search);
    const campaign = p.get("utm_campaign");
    // Affiliate attribution: remember a creator's ?via= code for the session.
    const via = p.get("via") || "";
    if (via && via.length <= 64) {
      try { sessionStorage.setItem("ss-via", via.trim()); } catch (err) {}
    }
    if (campaign) {
      UTM = { source: p.get("utm_source") || "social", medium: p.get("utm_medium") || "social", campaign };
      sessionStorage.setItem("ss-utm", JSON.stringify(UTM));
    } else {
      UTM = storedUtm();
    }
  } catch (err) {
    UTM = storedUtm();
  }

  // Count one click per session per campaign so the digest can compute
  // conversion rates (orders / clicks). Fire-and-forget beacon to the edge.
  if (UTM) {
    try {
      const key = "ss-clicked:" + UTM.campaign;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        const trackUrl = "/api/track-click?label=" + encodeURIComponent(UTM.source + " / " + UTM.campaign);
        if (navigator.sendBeacon) {
          navigator.sendBeacon(trackUrl);
        } else {
          fetch(trackUrl, { method: "GET", keepalive: true }).catch(() => {});
        }
      }
    } catch (err) {}
  }

  // Load the Gumroad overlay so Checkout opens in-context (Apple/Shop/Google Pay
  // handled by Gumroad inside the overlay) instead of navigating off-site.
  if (!document.querySelector('script[src*="gumroad.com/js/gumroad.js"]')) {
    const g = document.createElement("script");
    g.src = "https://gumroad.com/js/gumroad.js";
    g.async = true;
    document.head.appendChild(g);
  }

  function fmt(n) { return "$" + (Math.round(n * 100) / 100).toFixed(n % 1 === 0 ? 0 : 2); }
  function pick(o, fb) { if (o && typeof o === "object") return o[lang] || o.en || o.es || fb; return o == null ? fb : o; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  // ---- Persistent EN/ES header toggle (navigates to the twin page) ----
  function injectLangToggle() {
    const nav = document.querySelector(".nav-links");
    if (!nav || nav.querySelector(".lang-toggle")) return;
    const isEs = /\/es(\/|$)/.test(location.pathname);
    const li = document.createElement("li");
    li.className = "nav-lang";
    const a = document.createElement("a");
    a.className = "btn btn-ghost lang-toggle";
    a.setAttribute("href", "#");
    a.setAttribute("aria-label", isEs ? "Switch to English" : "Cambiar a Español");
    a.textContent = isEs ? "EN" : "ES";
    li.appendChild(a);
    nav.appendChild(li);
    a.addEventListener("click", (e) => {
      e.preventDefault();
      try { localStorage.setItem("sofrito.lang", isEs ? "en" : "es"); } catch (err) {}
      window.location.href = langTwinUrl(isEs ? "en" : "es");
    });
  }
  function langTwinUrl(target) {
    const path = location.pathname;
    const base = "https://sofritostudio.com";
    if (target === "es") {
      if (path === "/" || path === "/index.html") return base + "/es/products.html";
      if (path === "/products.html") return base + "/es/products.html";
      if (path.startsWith("/products/") || path.startsWith("/blog/")) return base + "/es" + path;
      return base + "/es/products.html";
    }
    const p = path.replace(/^\/es/, "");
    return base + (p || "/index.html");
  }
  injectLangToggle();

  // Recipe Index — site-wide nav link (self-injected so every page gets it)
  function injectRecipeNav() {
    const nav = document.querySelector(".nav-links");
    if (!nav || nav.querySelector('[data-recipe-nav]')) return;
    // Skip pages that already link to the recipe index (avoids a duplicate nav item)
    const already = Array.prototype.some.call(nav.querySelectorAll("a"), (a) => /recipe-db\.html/.test(a.getAttribute("href") || ""));
    if (already) return;
    const depth = location.pathname.split("/").filter(Boolean).length - 1;
    const prefix = depth > 0 ? "../".repeat(depth) : "";
    const li = document.createElement("li");
    li.setAttribute("data-recipe-nav", "1");
    const a = document.createElement("a");
    a.href = prefix + "recipe-db.html";
    a.textContent = "Recipe Index";
    li.appendChild(a);
    const cta = nav.querySelector("li:last-child");
    nav.insertBefore(li, cta);
  }
  injectRecipeNav();

  // ---- Self-injecting drawer markup (works on every page that loads main.js) ----
  let drawer = document.getElementById("cartDrawer");
  let backdrop = document.getElementById("cartBackdrop");
  if (!drawer) {
    backdrop = document.createElement("div");
    backdrop.className = "cart-backdrop";
    backdrop.id = "cartBackdrop";
    backdrop.hidden = true;
    drawer = document.createElement("aside");
    drawer.className = "cart-drawer";
    drawer.id = "cartDrawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("aria-label", lang === "es" ? "Carrito de compras" : "Shopping cart");
    drawer.innerHTML =
      '<div class="cart-drawer-inner">' +
      '<header class="cart-head"><h2 class="cart-title">' + (lang === "es" ? "Tu Carrito" : "Your Cart") + '</h2>' +
      '<button class="cart-close" id="cartClose" aria-label="Close cart">&times;</button></header>' +
      '<div class="cart-body">' +
      '<p class="cart-empty" id="cartEmpty">' + (lang === "es" ? "Tu carrito está vacío." : "Your cart is empty.") + "</p>" +
      '<div id="cartLines"></div>' +
      '<div id="cartBump"></div>' +
      '<div class="cart-total" id="cartTotalRow" hidden><span>Subtotal</span><b id="cartTotal"></b></div>' +
      '<div class="cart-recover" id="cartRecover">' +
      '<p class="cart-pay-label">' + (lang === "es" ? "Guardar mi carrito" : "Save your cart") + "</p>" +
      '<form class="cart-recover-form" id="cartRecoverForm" novalidate>' +
      '<input type="email" id="cartRecoverEmail" placeholder="you@example.com" aria-label="Email for a 1-click checkout recovery link">' +
      '<button type="submit" class="btn btn-ghost">' + (lang === "es" ? "Enviar" : "Send") + "</button>" +
      '</form>' +
      '<p class="cart-recover-note" id="cartRecoverNote">' + (lang === "es" ? "Te enviamos un enlace de pago de 1 clic para que nunca pierdas tu carrito." : "We'll email a 1-click checkout link so you never lose your cart.") + "</p>" +
      "</div>" +
      '<div class="cart-express">' +
      '<p class="cart-pay-label">' + (lang === "es" ? "Pago exprés" : "Express checkout") + "</p>" +
      '<div class="cart-pay-badges"><span>Shop Pay</span><span>Apple Pay</span><span>Google Pay</span></div>' +
      '<a class="btn btn-primary-big gumroad-button" id="cartCheckout" href="#" style="width:100%;">Checkout Now</a>' +
      '<p class="cart-note">' + (lang === "es" ? "Descarga instantánea · Garantía 30 días · Pago seguro con Gumroad" : "Instant download · 30-day guarantee · Secure via Gumroad") + "</p>" +
      "</div></div></div>";
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
  }

  const linesEl = document.getElementById("cartLines");
  const bumpEl = document.getElementById("cartBump");
  const emptyEl = document.getElementById("cartEmpty");
  const totalRow = document.getElementById("cartTotalRow");
  const totalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("cartCheckout");
  const closeBtn = document.getElementById("cartClose");

  // Mobile sticky checkout bar (fixed bottom once an item is in the cart)
  let checkoutBar = document.getElementById("cartCheckoutBar");
  if (!checkoutBar) {
    checkoutBar = document.createElement("div");
    checkoutBar.className = "cart-checkout-bar";
    checkoutBar.id = "cartCheckoutBar";
    checkoutBar.hidden = true;
    checkoutBar.innerHTML =
      '<span class="cart-bar-count" id="cartBarCount">0</span>' +
      '<span class="cart-bar-text" id="cartBarText"></span>' +
      '<button class="btn cart-bar-btn" id="cartBarBtn">Checkout</button>';
    document.body.appendChild(checkoutBar);
  }
  const barCountEl = document.getElementById("cartBarCount");
  const barTextEl = document.getElementById("cartBarText");
  const barBtn = document.getElementById("cartBarBtn");
  if (barBtn) barBtn.addEventListener("click", openDrawer);

  // Frequently-bought-together companions (sku -> suggested companion sku).
  // Keys MUST match data/products.json skus — the previous map referenced
  // "mofongo-course"/"boricua-breakfasts"/"postres-boricuas", which don't
  // exist in the catalog, so those suggestions silently never rendered.
  const FBT_MAP = {
    mesa: "holiday-addon",
    "kitchen-bundle": "holiday-addon",
    "full-table": "coquito-guide",
    weeknights: "meal-prep",
    breakfasts: "breakfast-bundle",
    callejera: "street-food-bundle",
    postres: "coquito-guide",
    course: "mesa",
    "starter-kit": null,
    "coquito-guide": "postres",
    "holiday-addon": "coquito-guide",
  };

  // Next-logical upgrade when the companion is already in the cart
  const UPGRADE_MAP = {
    "starter-kit": "mesa",
    mesa: "full-table",
    "kitchen-bundle": "full-table",
    weeknights: "kitchen-bundle",
    breakfasts: "mesa",
    postres: "kitchen-bundle",
    course: "full-table",
  };

  // Smart bump: the $9 Starter Kit escalates STRAIGHT to the $47 La Mesa
  // upgrade (the primary money path — a companion offer here only delays it).
  // Everything else shows its FBT companion first, then the next-tier upgrade
  // once that companion is already in the cart.
  function smartBump() {
    const primary = cart[cart.length - 1] || cart[0];
    if (!primary) return null;
    const has = (sku) => cart.some((c) => c.sku === sku);
    if (primary.sku === "starter-kit" && !has("mesa")) {
      return { sku: "mesa", kind: "upgrade" };
    }
    const companion = FBT_MAP[primary.sku];
    if (companion && !has(companion)) {
      return { sku: companion, kind: "companion" };
    }
    const upgrade = UPGRADE_MAP[primary.sku];
    if (upgrade && upgrade !== companion && !has(upgrade)) {
      return { sku: upgrade, kind: "upgrade" };
    }
    return null;
  }

  function loadCart() { try { return JSON.parse(localStorage.getItem("ss-cart") || "[]") || []; } catch (e) { return []; } }
  function saveCart(c) { try { localStorage.setItem("ss-cart", JSON.stringify(c)); } catch (e) {} }
  let cart = loadCart();

  // Focus management: move focus into the dialog on open, restore it on
  // close, and trap Tab inside while open (WCAG 2.4.3 / 2.1.2).
  let lastFocused = null;
  function focusFirstInDrawer() {
    const target = drawer.querySelector(".cart-close") || drawer.querySelector('a[href], button, input');
    if (target) { try { target.focus(); } catch (err) {} }
  }
  function openDrawer() {
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.hidden = false;
    document.body.classList.add("cart-locked");
    updateCheckoutBar();
    render();
    focusFirstInDrawer();
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove("cart-locked");
    updateCheckoutBar();
    if (lastFocused) {
      try { lastFocused.focus(); } catch (err) {}
      lastFocused = null;
    }
  }
  // Mobile-only fixed checkout bar (shows once an item is in the cart)
  function updateCheckoutBar() {
    if (!checkoutBar) return;
    const onMobile = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
    const show = onMobile && cart.length > 0 && !drawer.classList.contains("open");
    checkoutBar.hidden = !show;
    if (show) {
      const sum = cart.reduce((a, i) => a + (meta(i.sku).price || 0), 0);
      if (barCountEl) barCountEl.textContent = String(cart.length);
      if (barTextEl) barTextEl.textContent = fmt(sum);
    }
  }
  window.addEventListener("resize", updateCheckoutBar);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
    if (e.key === "Tab" && drawer.classList.contains("open")) {
      const focusables = drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Cart recovery-link capture -> intent lead (powers the 1h/24h abandoned sequence)
  const recoverForm = document.getElementById("cartRecoverForm");
  if (recoverForm) {
    recoverForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("cartRecoverEmail");
      const note = document.getElementById("cartRecoverNote");
      if (!input || !input.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        if (input) { input.style.borderColor = "#e0653c"; input.focus(); }
        return;
      }
      input.style.borderColor = "";
      const primary = cart[cart.length - 1] ? cart[cart.length - 1].sku : "starter-kit";
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: input.value.trim(),
          lang,
          source: "cart-drawer",
          intent: "checkout",
          product: primary,
        }),
      })
        .catch(() => null)
        .finally(() => {
          if (note) {
            note.textContent = lang === "es"
              ? "¡Listo! Revisa tu bandeja de entrada para el enlace de pago."
              : "Done! Check your inbox for your checkout link.";
          }
          input.value = "";
        });
    });
  }

  // Gumroad URL; La Mesa carries a post-purchase redirect to the Full Table upsell.
  // Regional utm params are appended so Gumroad records which social post converted.
  function gumUrl(sku) {
    const url = G.gumroad[sku];
    if (!url) return null;
    let out = url;
    if (sku === "mesa") {
      const sep = out.indexOf("?") === -1 ? "?" : "&";
      out += sep + "redirect_url=" + encodeURIComponent("https://sofritostudio.com/products/full-table-upsell.html");
    }
    if (UTM) {
      const sep = out.indexOf("?") === -1 ? "?" : "&";
      out += sep + "utm_source=" + encodeURIComponent(UTM.source) +
        "&utm_medium=" + encodeURIComponent(UTM.medium) +
        "&utm_campaign=" + encodeURIComponent(UTM.campaign);
    }
    return out;
  }

  // Legacy/edge SKU aliases — the edge unlock CTAs (recipe-unlocks.js) and
  // older links reference catalog names that differ from data/products.json
  // skus. Without this map those CTAs fail the G.gumroad check, skip the cart
  // drawer entirely, and lose UTM attribution on the way to Gumroad.
  const SKU_ALIASES = {
    "postres-boricuas": "postres",
    "boricua-breakfasts": "breakfasts",
    "mofongo-course": "course",
  };
  function normSku(sku) {
    sku = String(sku || "");
    return G.gumroad[sku] ? sku : (SKU_ALIASES[sku] || sku);
  }

  function meta(sku) {
    const p = bySku[sku] || {};
    return {
      name: pick(p.name, sku),
      price: typeof p.price === "number" ? p.price : null,
      img: p.image || "",
      url: gumUrl(sku)
    };
  }

  function addItem(sku) {
    if (!cart.some((i) => i.sku === sku)) cart.push({ sku });
    saveCart(cart);
    const m = meta(sku);
    if (typeof window.gtag === "function") {
      gtag("event", "begin_checkout", {
        currency: "USD",
        value: m.price || 0,
        items: [{
          item_id: sku,
          item_name: m.name || sku,
          price: m.price || 0,
          quantity: 1,
          currency: "USD",
        }],
        campaign: UTM ? UTM.campaign : null,
      });
    }
    if (typeof window.ssTrack === "function") {
      ssTrack("cart_add", { item: sku, utm_campaign: UTM ? UTM.campaign : null });
    }
    openDrawer();
  }
  function removeItem(sku) {
    cart = cart.filter((i) => i.sku !== sku);
    saveCart(cart);
    render();
  }

  function render() {
    const primary = cart[cart.length - 1] || null;
    linesEl.innerHTML = cart.map((i) => {
      const m = meta(i.sku);
      return '<div class="cart-line">' +
        (m.img ? '<img class="cart-line-img" src="' + esc(m.img) + '" alt="" loading="lazy">' : "") +
        '<div class="cart-line-info"><span class="cart-line-name">' + esc(m.name) + "</span>" +
        '<span class="cart-line-price">' + (m.price != null ? fmt(m.price) : "") + "</span>" +
        '<span class="cart-line-qty">' + (lang === "es" ? "Cant. 1" : "Qty 1") + "</span>" +
        // Gumroad checkouts are single-product: give every line its own buy
        // path so multi-item carts aren't stranded.
        (m.url ? '<a class="cart-line-buy" href="' + esc(m.url) + '" rel="noopener">' + (lang === "es" ? "Comprar" : "Buy") + "</a>" : "") +
        "</div>" +
        '<button class="cart-line-remove" data-remove="' + esc(i.sku) + '" aria-label="Remove">&#10005;</button></div>';
    }).join("");
    emptyEl.hidden = cart.length > 0;
    totalRow.hidden = cart.length === 0;

    // Smart bump: default FBT companion, or the next upgrade when the
    // companion is already in the cart.
    const bump = smartBump();
    const bumpProduct = bump ? bySku[bump.sku] : null;
    if (bumpProduct) {
      const kindLabel = bump.kind === "upgrade"
        ? (lang === "es" ? "Mejora sugerida" : "Suggested upgrade")
        : (lang === "es" ? "Comprados con frecuencia" : "Frequently Bought Together");
      const pricePrefix = bump.kind === "upgrade"
        ? (lang === "es" ? "Solo " : "Only ")
        : "+ ";
      bumpEl.innerHTML =
        '<div class="cart-fbt">' +
        '<div class="cart-fbt-label">' + kindLabel + "</div>" +
        '<div class="cart-fbt-row">' +
        (bumpProduct.image ? '<img class="cart-line-img" src="' + esc(bumpProduct.image) + '" alt="" loading="lazy">' : "") +
        '<div class="cart-fbt-info"><span class="cart-line-name">' + esc(pick(bumpProduct.name)) + "</span>" +
        '<span class="cart-line-price">' + pricePrefix + fmt(bumpProduct.price) + "</span></div>" +
        '<button class="btn cart-fbt-add" data-bump-add="' + esc(bump.sku) + '">' + (lang === "es" ? "Añadir" : "Add") + "</button>" +
        "</div></div>";
    } else {
      bumpEl.innerHTML = "";
    }

    if (cart.length === 0 || !primary) {
      totalEl.textContent = "";
      checkoutBtn.removeAttribute("href");
      checkoutBtn.textContent = "Checkout";
      checkoutBtn.classList.add("cart-disabled");
      return;
    }
    const p = meta(primary.sku);
    const sum = cart.reduce((a, i) => a + (meta(i.sku).price || 0), 0);
    totalEl.textContent = fmt(sum);
    checkoutBtn.href = p.url || "#";
    // Gumroad links are single-product — label the button with the exact item
    // being checked out so a multi-item cart can't imply one combined charge.
    checkoutBtn.textContent = p.name
      ? (lang === "es" ? "Pagar: " : "Checkout: ") + p.name
      : "Checkout Now";
    checkoutBtn.title = cart.length > 1
      ? (lang === "es"
        ? "Gumroad cobra un producto por compra — usa «Comprar» en cada línea para el resto."
        : "Gumroad checks out one product per purchase — use each line's Buy link for the rest.")
      : "";
    checkoutBtn.classList.toggle("cart-disabled", !p.url);

    linesEl.querySelectorAll("[data-remove]").forEach((b) => {
      b.addEventListener("click", () => removeItem(b.getAttribute("data-remove")));
    });

    bumpEl.querySelectorAll("[data-bump-add]").forEach((b) => {
      b.addEventListener("click", () => addItem(b.getAttribute("data-bump-add")));
    });

    updateCheckoutBar();
  }

  CATALOG_P.then((data) => {
    if (data && data.products) data.products.forEach((p) => { bySku[p.sku] = p; });
    render();
  });

  // ---- Wire CTAs: [data-cart-add], [data-product], .js-cart-open open the drawer ----
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-cart-add], [data-product], .js-cart-open");
    if (!t || t.id === "cartCheckout") return;
    const sku = normSku(t.getAttribute("data-cart-add") || t.getAttribute("data-product"));
    if (!sku || !G.gumroad[sku]) return;
    e.preventDefault();
    addItem(sku);
  });
});

/* ======== Generic lead form handler (form[data-leads]) ========
 * Posts to /api/leads (instant email + KV capture), flags the visitor as a
 * subscriber (hides the sticky offer bar), then redirects if data-redirect.
 */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form[data-leads]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"], .btn');
      if (!email || !email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        if (email) { email.style.borderColor = "#e0653c"; email.focus(); }
        return;
      }
      email.style.borderColor = "";
      if (btn) { btn.disabled = true; btn.classList.add("loading"); }
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value.trim(),
          lang: pageLang(),
          source: form.getAttribute("data-source") || "site-form",
          intent: "freebie",
        }),
      })
        .catch(() => null)
        .finally(() => {
          try { localStorage.setItem("ss-subbed", "1"); } catch (err) {}
          const target = form.getAttribute("data-redirect");
          if (target) {
            window.location.href = target;
          } else {
            form.reset();
            if (btn) { btn.disabled = false; btn.classList.remove("loading"); }
          }
        });
    });
  });
});

/* ======== Sticky Starter Kit offer bar ========
 * Appears once the visitor scrolls through 50% of the page — an instant
 * impulse-buy path to the $9 Starter Kit (opens the cart drawer). Hidden for
 * subscribers (lead captured) or after a one-time dismiss.
 */
document.addEventListener("DOMContentLoaded", () => {
  const isEsPage = pageLang() === "es";
  const offerText = esc((document.querySelector('meta[name="ss-offer"]') || {}).content
    || (isEsPage
      ? "Empieza a cocinar recetas puertorriqueñas auténticas hoy — Consigue el Kit de Inicio de $9."
      : "Start cooking authentic Puerto Rican recipes today — Get the $9 Starter Kit."));
  const bar = document.createElement("div");
  bar.className = "sticky-offer-bar";
  bar.setAttribute("role", "region");
  bar.innerHTML =
    '<div class="sticky-offer-inner">' +
    '<span class="sticky-offer-text">' + offerText + "</span>" +
    '<a class="btn" href="#" data-cart-add="starter-kit">' + (isEsPage ? "Consigue el Kit de Inicio" : "Get the Starter Kit") + "</a>" +
    '<button class="sticky-offer-close" aria-label="' + (isEsPage ? "Descartar" : "Dismiss") + '">&times;</button>' +
    "</div>";
  document.body.appendChild(bar);

  let shown = false;
  function maybeShow() {
    if (shown) return;
    try {
      if (localStorage.getItem("ss-subbed") || localStorage.getItem("ss-offer-dismissed")) return;
    } catch (err) { return; }
    const doc = document.documentElement;
    const pct = (window.scrollY + window.innerHeight) / (doc.scrollHeight || 1);
    if (pct >= 0.5) {
      shown = true;
      bar.classList.add("visible");
      if (typeof window.ssTrack === "function") ssTrack("view_offer_bar", { item: "starter-kit" });
    }
  }
  window.addEventListener("scroll", maybeShow, { passive: true });
  window.addEventListener("resize", maybeShow, { passive: true });
  const closeBtn = bar.querySelector(".sticky-offer-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      bar.classList.remove("visible");
      try { localStorage.setItem("ss-offer-dismissed", "1"); } catch (err) {}
    });
  }
  maybeShow();
});
