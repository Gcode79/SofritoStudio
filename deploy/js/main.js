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
    mesa: "https://joshortiz4.gumroad.com/l/cmfkg",
    "kitchen-bundle": "https://joshortiz4.gumroad.com/l/razabs",
    "full-table": "https://joshortiz4.gumroad.com/l/dodbtn",

    // ---- Individual guides (wired to Gumroad account) ----
    breakfasts: "https://joshortiz4.gumroad.com/l/boricua-breakfasts",
    callejera: "https://joshortiz4.gumroad.com/l/comida-callejera",
    postres: "https://joshortiz4.gumroad.com/l/postres-boricuas",
    "sofrito-masterclass": "https://joshortiz4.gumroad.com/l/sofrito-masterclass",
    "meal-prep": "https://joshortiz4.gumroad.com/l/boricua-meal-prep",
    "air-fryer": "https://joshortiz4.gumroad.com/l/air-fryer-boricua",
    "pernil-playbook": "https://joshortiz4.gumroad.com/l/pernil-playbook",

    // ---- Bundles (wired to Gumroad account) ----
    "breakfast-bundle": "https://joshortiz4.gumroad.com/l/breakfast-bundle",
    "street-food-bundle": "https://joshortiz4.gumroad.com/l/street-food-bundle",
    "holiday-bundle": "https://joshortiz4.gumroad.com/l/holiday-bundle",
    "complete-kitchen": "https://joshortiz4.gumroad.com/l/complete-kitchen",

    // ---- Seasonal (preorder buttons) ----
    "thanksgiving-boricua": "https://joshortiz4.gumroad.com/l/thanksgiving-boricua",
    "navidad-boricua": "https://joshortiz4.gumroad.com/l/navidad-boricua",
    "coquito-guide": "https://joshortiz4.gumroad.com/l/coquito-guide",
    "holiday-addon": "https://joshortiz4.gumroad.com/l/holiday-coquito-addon",

    // ---- Entry / standalone / course / membership ----
    "starter-kit": "https://joshortiz4.gumroad.com/l/sofrito-starter-kit",
    weeknights: "https://joshortiz4.gumroad.com/l/boricua-weeknights",
    course: "https://joshortiz4.gumroad.com/l/mofongo-course",
    "membership-monthly": "https://joshortiz4.gumroad.com/l/membership-monthly",
    "membership-yearly": "https://joshortiz4.gumroad.com/l/membership-yearly",
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

  // ---- Sofrito 101 signup (posts straight to Buttondown, no API key) ----
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

      if (!SITE_CONFIG.buttondownUsername.startsWith("YOUR-")) {
        const iframe = document.createElement("iframe");
        iframe.name = "buttondown-frame";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        form.action = "https://buttondown.com/api/emails/embed-subscribe/" + SITE_CONFIG.buttondownUsername;
        form.method = "post";
        form.target = iframe.name;
        iframe.addEventListener("load", () => {
          form.removeAttribute("target");
          form.reset();
          if (msg) msg.hidden = false;
          ssTrack("generate_lead", { location: "freebie" });
        });
        form.submit();
        return;
      }

      form.reset();
      if (msg) msg.hidden = false;
      ssTrack("generate_lead", { location: "freebie" });
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

  // ---- Exit-intent popup ----
  const popupOverlay = document.getElementById("popupOverlay");
  const popupClose = document.getElementById("popupClose");
  const popupForm = document.getElementById("popupForm");
  if (popupOverlay) {
    // Opt-in: only arm the overlay once the script is confirmed running.
    document.documentElement.classList.add("popup-enabled");
    let popupShown = false;
    document.addEventListener("mouseout", (e) => {
      if (!popupShown && e.clientY < 5 && !e.relatedTarget) {
        popupOverlay.classList.add("active");
        popupShown = true;
      }
    });
    if (popupClose) {
      popupClose.addEventListener("click", () => popupOverlay.classList.remove("active"));
    }
    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay) popupOverlay.classList.remove("active");
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
        const phoneInput = popupForm.querySelector('input[type="tel"]');
        if (phoneInput && phoneInput.value.trim()) {
          const phone = phoneInput.value.replace(/[^0-9+]/g, "");
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
        const iframe = document.createElement("iframe");
        iframe.name = "popup-frame";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        popupForm.action = "https://buttondown.com/api/emails/embed-subscribe/" + SITE_CONFIG.buttondownUsername;
        popupForm.method = "post";
        popupForm.target = iframe.name;
        iframe.addEventListener("load", () => {
          popupForm.reset();
          if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove("loading"); }
          if (msg) msg.hidden = false;
          ssTrack("generate_lead", { location: "exit_popup" });
          setTimeout(() => popupOverlay.classList.remove("active"), 2000);
        });
        popupForm.submit();
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
