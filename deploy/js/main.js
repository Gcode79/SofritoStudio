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
  // Load Google Analytics 4 only when a measurement ID is configured in SITE_CONFIG.
  if (SITE_CONFIG.ga4Id) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(SITE_CONFIG.ga4Id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", SITE_CONFIG.ga4Id);
  }

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
    if (url) btn.href = url;
    btn.addEventListener("click", () => ssTrack("begin_checkout", { item: btn.dataset.product }));
  });

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
            ssTrack("generate_lead", { location: "exit_popup", intent: "checkout" });
            setTimeout(dismissPopup, 1500);
          });
      });
    }
  }

  // ---- Urgency counter ----
  const urgencyEl = document.getElementById("urgencyCount");
  if (urgencyEl) {
    const base = 18;
    const jitter = () => Math.floor(Math.random() * 8);
    setInterval(() => { urgencyEl.textContent = base + jitter(); }, 5000);
    urgencyEl.textContent = base + jitter();
  }

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
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("aria-label", "Shopping cart");
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

  function loadCart() { try { return JSON.parse(localStorage.getItem("ss-cart") || "[]") || []; } catch (e) { return []; } }
  function saveCart(c) { try { localStorage.setItem("ss-cart", JSON.stringify(c)); } catch (e) {} }
  let cart = loadCart();

  function openDrawer() {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.hidden = false;
    document.body.classList.add("cart-locked");
    render();
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove("cart-locked");
  }
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

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
  function gumUrl(sku) {
    const url = G.gumroad[sku];
    if (!url) return null;
    if (sku === "mesa") {
      const sep = url.indexOf("?") === -1 ? "?" : "&";
      const upsell = "https://sofritostudio.com/products/full-table-upsell.html";
      return url + sep + "redirect_url=" + encodeURIComponent(upsell);
    }
    return url;
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
    openDrawer();
  }
  function removeItem(sku) {
    cart = cart.filter((i) => i.sku !== sku);
    saveCart(cart);
    render();
  }
  function toggleBump(on) {
    if (on) { if (!cart.some((i) => i.sku === "holiday-addon")) cart.push({ sku: "holiday-addon" }); }
    else { cart = cart.filter((i) => i.sku !== "holiday-addon"); }
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
        '<span class="cart-line-price">' + (m.price != null ? fmt(m.price) : "") + "</span></div>" +
        '<button class="cart-line-remove" data-remove="' + esc(i.sku) + '" aria-label="Remove">&#10005;</button></div>';
    }).join("");
    emptyEl.hidden = cart.length > 0;
    totalRow.hidden = cart.length === 0;

    // Dynamic cart bump: Starter Kit selected -> one-click $12 companion add-on.
    const hasKit = cart.some((i) => i.sku === "starter-kit");
    const hasAddon = cart.some((i) => i.sku === "holiday-addon");
    const addon = bySku["holiday-addon"];
    if (hasKit && addon) {
      bumpEl.innerHTML =
        '<div class="cart-bump' + (hasAddon ? " bump-on" : "") + '">' +
        "<label><input type=\"checkbox\" id=\"cartBumpToggle\"" + (hasAddon ? " checked" : "") + "> " +
        "<span class=\"cart-bump-name\">Add " + esc(pick(addon.name, "Companion Add-on")) + "</span>" +
        '<span class="cart-bump-price">+ ' + fmt(addon.price) + "</span></label>" +
        '<p class="cart-bump-sub">Printable recipe cards &amp; cheat sheet — one-click, right before you check out.</p></div>';
      const bumpToggle = document.getElementById("cartBumpToggle");
      bumpToggle.addEventListener("change", () => toggleBump(bumpToggle.checked));
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
    checkoutBtn.textContent = p.price != null ? "Checkout " + fmt(p.price) : "Checkout Now";
    checkoutBtn.classList.toggle("cart-disabled", !p.url);

    linesEl.querySelectorAll("[data-remove]").forEach((b) => {
      b.addEventListener("click", () => removeItem(b.getAttribute("data-remove")));
    });
  }

  CATALOG_P.then((data) => {
    if (data && data.products) data.products.forEach((p) => { bySku[p.sku] = p; });
    render();
  });

  // ---- Wire CTAs: [data-cart-add], [data-product], .js-cart-open open the drawer ----
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-cart-add], [data-product], .js-cart-open");
    if (!t || t.id === "cartCheckout") return;
    const sku = t.getAttribute("data-cart-add") || t.getAttribute("data-product");
    if (!sku || !G.gumroad[sku]) return;
    e.preventDefault();
    addItem(sku);
  });
});
