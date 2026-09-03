/*!
 * Sofrito Studio — conversation-suggestion chat widget
 * Loaded by the loader appended to main.min.js (see its tail). Self-contained:
 * no build step, no dependencies. Talks to POST /api/chat (same origin) which
 * returns { reply, suggestions, llm }: `suggestions` are the follow-up
 * conversation-suggestion chips. Works in browser, addresses CSP (fetch to
 * 'self' only), and strips/cleans all dynamic text via textContent.
 */
(function () {
  "use strict";
  if (window.__ssChatLoaded) return;
  window.__ssChatLoaded = true;

  var KEY = "ss-chat:v1";
  var EPS = "/api/chat";
  var MAX_HISTORY = 8;

  var lang = "en";
  try {
    var L = document.documentElement && (document.documentElement.getAttribute("lang") || "");
    if (L && L.toLowerCase().indexOf("es") === 0) lang = "es";
  } catch (e) {}

  var I18N = {
    en: {
      open: "Ask Sofrito Studio",
      title: "Sofrito Studio",
      sub: "Bilingual Puerto Rican recipes, mainland swaps — ask anything.",
      placeholder: "Ask about a dish, a swap, or what to buy…",
      send: "Send",
      close: "Close chat",
      greeting:
        "¡Hola! I'm your Sofrito Studio guide — here to help with recipes, mainland ingredient swaps, trend ideas, and which bundle fits you. Tap a suggestion or type your own question.",
      typing: "Sofrito Studio is thinking…",
      error: "Hmm, the answer didn't come through. Try again in a moment — or tap a suggestion below.",
      rate: "You're asking a lot right now — take a short break and I'll be here when you're back.",
    },
    es: {
      open: "Pregúntale a Sofrito Studio",
      title: "Sofrito Studio",
      sub: "Recetas bilingües puertorriqueñas, swaps del mainland — pregunta lo que quieras.",
      placeholder: "Pregunta por un plato, un swap o qué comprar…",
      send: "Enviar",
      close: "Cerrar chat",
      greeting:
        "¡Hola! Soy tu guía de Sofrito Studio — te ayudo con recetas, swaps de ingredientes del mainland, ideas de tendencia y qué bundle te conviene. Toca una sugerencia o escribe tu pregunta.",
      typing: "Sofrito Studio está pensando…",
      error: "Vaya, la respuesta no llegó. Inténtalo de nuevo en un momento — o toca una sugerencia.",
      rate: "Estás haciendo muchas preguntas — tómate un respiro y estaré aquí cuando vuelvas.",
    },
  }[lang];

  var STARTER = lang === "es"
    ? [
        "¿Qué son los swaps del mainland?",
        "¿Qué está en tendencia en la cocina boricua?",
        "Ideas de coquito todo el año",
        "¿Qué bundle me conviene empezar?",
      ]
    : [
        "What's trending in Puerto Rican food?",
        "What are mainland swaps?",
        "Coquito ideas for year-round",
        "Which bundle should I start with?",
      ];

  var FALLBACK_CHIPS = lang === "es"
    ? ["¿Qué es La Mesa Boricua?", "Recetas fáciles para la cena", "Planifica Nochebuena"]
    : ["Tell me about La Mesa", "Easy weeknight recipes", "Plan Nochebuena"];

  // ----------------------------------------------------------------
  // State + DOM
  // ----------------------------------------------------------------
  var state = loadState();
  function loadState() {
    var s = { history: [], chips: STARTER.slice(0, 3) };
    try {
      var raw = sessionStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && Array.isArray(p.history)) {
          s.history = p.history.filter(function (m) {
            return m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant");
          }).slice(-MAX_HISTORY);
        }
        if (p && Array.isArray(p.chips)) s.chips = p.chips.slice(0, 3);
      }
    } catch (e) {}
    return s;
  }
  function saveState() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }

  var root = null; // panel root element
  var chipsEl = null;
  var msgsEl = null;
  var inputEl = null;
  var typingEl = null;
  var busy = false;

  function tw(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function renderChips(list) {
    chipsEl.textContent = "";
    (list || []).forEach(function (c) {
      if (!c || !c.trim()) return;
      var b = tw("button", "ss-cchip");
      b.textContent = String(c).slice(0, 80);
      b.addEventListener("click", function () { ask(c); });
      chipsEl.appendChild(b);
    });
  }

  function bubble(text, who) {
    var wrap = tw("div", "ss-msg " + who);
    var b = tw("div", "ss-bubble");
    b.textContent = String(text || "").replace(/\r/g, "").slice(0, 4000);
    wrap.appendChild(b);
    msgsEl.appendChild(wrap);
    scrollBottom();
  }

  function typingDot() {
    typingEl = tw("div", "ss-msg ss-bot");
    var b = tw("div", "ss-bubble ss-typing");
    ["", "", ""].forEach(function () { b.appendChild(tw("span", "ss-dot")); });
    typingEl.appendChild(b);
    msgsEl.appendChild(typingEl);
    scrollBottom();
  }
  function stopTyping() {
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    typingEl = null;
  }

  function scrollBottom() {
    var el = msgsEl;
    if (el) el.scrollTop = el.scrollHeight;
  }

  function open() {
    if (!root) build();
    root.classList.add("open");
    if (window.ssTrack && typeof window.ssTrack === "function") {
      try { window.ssTrack("chat_open", {}); } catch (e) {}
    }
    // First open (no turns yet): render greeting + starter suggestions.
    if (state.history.length === 0) {
      bubble(I18N.greeting, "ss-bot");
      renderChips(STARTER);
    } else {
      msgsEl.textContent = "";
      var hist = state.history;
      for (var i = 0; i < hist.length; i++) bubble(hist[i].content, hist[i].role === "user" ? "ss-user" : "ss-bot");
      renderChips(state.chips);
    }
    try { inputEl.focus(); } catch (e) {}
  }

  function close() {
    if (root) root.classList.remove("open");
  }

  function toggle() {
    root.classList.contains("open") ? close() : open();
  }

  // ----------------------------------------------------------------
  // Ask the worker
  // ----------------------------------------------------------------
  function ask(text) {
    if (busy) return;
    var message = String(text || "").trim().slice(0, 1000);
    if (!message) return;

    busy = true;
    bubble(message, "ss-user");

    renderChips([]); // hide chips while thinking
    typingDot();

    var body = { message: message, history: state.history.slice(-MAX_HISTORY) };
    var init = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };

    fetch(EPS, init)
      .then(function (resp) {
        return resp.json().catch(function () { return { error: "bad_response" }; })
          .then(function (data) { return { status: resp.status, data: data }; });
      })
      .then(function (r) {
        stopTyping();
        busy = false;

        if (r.data && r.data.error) {
          if (r.status === 429) bubble(I18N.rate, "ss-bot");
          else bubble(I18N.error, "ss-bot");
          renderChips(FALLBACK_CHIPS);
          return;
        }

        var reply = String((r.data && r.data.reply) || "").trim();
        if (!reply) { bubble(I18N.error, "ss-bot"); renderChips(FALLBACK_CHIPS); return; }

        bubble(reply, "ss-bot");
        state.history.push({ role: "user", content: message }, { role: "assistant", content: reply });
        state.history = state.history.slice(-MAX_HISTORY);
        var chips = (r.data && Array.isArray(r.data.suggestions) && r.data.suggestions.filter(Boolean)) || FALLBACK_CHIPS;
        state.chips = chips.slice(0, 3);
        saveState();
        renderChips(state.chips);
      })
      .catch(function () {
        stopTyping();
        busy = false;
        bubble(I18N.error, "ss-bot");
        renderChips(FALLBACK_CHIPS);
      });
  }

  // ----------------------------------------------------------------
  // Build UI
  // ----------------------------------------------------------------
  var CSS = [
    "#ss-chat-btn{position:fixed;right:20px;bottom:20px;z-index:9998;width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;background:#b23a2e;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;transition:transform .15s ease}",
    "#ss-chat-btn:hover{transform:scale(1.06)}",
    "#ss-chat-panel{position:fixed;right:20px;bottom:88px;z-index:9999;width:360px;max-width:calc(100vw - 32px);height:min(520px,72vh);display:none;flex-direction:column;background:#fdf6ec;color:#3a2a20;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.30);overflow:hidden;font-family:inherit;font-size:14px;line-height:1.45}",
    "#ss-chat-panel.open{display:flex}",
    "#ss-chat-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#7a1f16;color:#fff;flex:0 0 auto}",
    "#ss-chat-head .ss-title{flex:1;min-width:0}",
    "#ss-chat-head .ss-title b{display:block;font-size:15px;line-height:1.2}",
    "#ss-chat-head .ss-title span{display:block;font-size:11px;opacity:.85;margin-top:2px}",
    "#ss-chat-close{background:none;border:0;color:#fff;font-size:20px;line-height:1;cursor:pointer;padding:2px 6px;opacity:.9}",
    "#ss-chat-close:hover{opacity:1}",
    "#ss-chat-scroll{flex:1 1 auto;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}",
    "#ss-chat-scroll::-webkit-scrollbar{width:8px}",
    "#ss-chat-scroll::-webkit-scrollbar-thumb{background:#d9c0a2;border-radius:4px}",
    ".ss-msg{display:flex}",
    ".ss-msg.ss-user{justify-content:flex-end}",
    ".ss-msg.ss-bot{justify-content:flex-start}",
    ".ss-bubble{max-width:82%;padding:9px 12px;border-radius:12px;white-space:pre-wrap;word-wrap:break-word}",
    ".ss-user .ss-bubble{background:#7a1f16;color:#fff;border-bottom-right-radius:3px}",
    ".ss-bot .ss-bubble{background:#fff;border:1px solid #ecdcc2;border-bottom-left-radius:3px}",
    ".ss-typing{display:flex;gap:4px;align-items:center;padding:9px 12px}",
    ".ss-dot{width:7px;height:7px;border-radius:50%;background:#c9a97c;animation:ssdot 1.2s infinite}",
    ".ss-dot:nth-child(2){animation-delay:.2s}.ss-dot:nth-child(3){animation-delay:.4s}",
    "@keyframes ssdot{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}",
    "#ss-chat-chips{display:flex;flex-wrap:wrap;gap:6px;padding:4px 12px 10px;flex:0 0 auto}",
    ".ss-cchip{background:#f3e0c9;color:#6b3410;border:1px solid #e5c9a4;border-radius:999px;padding:6px 11px;font-size:12.5px;cursor:pointer;transition:background .15s}",
    ".ss-cchip:hover{background:#ecd3b3}",
    "#ss-chat-inputwrap{display:flex;gap:8px;padding:10px 12px 12px;border-top:1px solid #ecdcc2;flex:0 0 auto;background:#fbf3e6}",
    "#ss-chat-input{flex:1;min-width:0;border:1px solid #dfc9a6;border-radius:10px;padding:9px 11px;font:inherit;background:#fff;color:#3a2a20}",
    "#ss-chat-input:focus{outline:none;border-color:#b23a2e}",
    "#ss-chat-send{background:#b23a2e;color:#fff;border:0;border-radius:10px;padding:0 14px;cursor:pointer;font:inherit;font-weight:600}",
    "#ss-chat-send:hover{background:#9e3024}",
    "@media(max-width:420px){#ss-chat-panel{right:8px;bottom:76px;height:min(70vh,600px)}#ss-chat-btn{right:12px;bottom:12px}}",
  ].join("");

  function build() {
    if (root) return;
    var style = document.createElement("style");
    style.id = "ss-chat-style";
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);

    root = document.createElement("div");
    root.setAttribute("id", "ss-chat-panel");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", I18N.title);

    var head = tw("div", "", null);
    head.setAttribute("id", "ss-chat-head");
    var icon = document.createElement("span");
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.3-2-.8-2.9A8 8 0 1 1 5.4 8.7C4.5 10.2 6 11 6 13a5 5 0 0 0 10 0c0-4-4-6-4-11z"/></svg>';
    icon.setAttribute("aria-hidden", "true");
    var title = tw("div", "ss-title", null);
    title.appendChild(tw("b", "", I18N.title));
    title.appendChild(tw("span", "", I18N.sub));
    var closeBtn = tw("button", "", "\u00d7");
    closeBtn.setAttribute("id", "ss-chat-close");
    closeBtn.setAttribute("aria-label", I18N.close);
    closeBtn.addEventListener("click", close);
    head.appendChild(icon);
    head.appendChild(title);
    head.appendChild(closeBtn);

    msgsEl = tw("div", "", null);
    msgsEl.setAttribute("id", "ss-chat-scroll");
    msgsEl.setAttribute("aria-live", "polite");

    chipsEl = tw("div", "", null);
    chipsEl.setAttribute("id", "ss-chat-chips");

    var inputWrap = tw("div", "", null);
    inputWrap.setAttribute("id", "ss-chat-inputwrap");
    inputEl = tw("input", "", null);
    inputEl.setAttribute("id", "ss-chat-input");
    inputEl.setAttribute("type", "text");
    inputEl.setAttribute("maxlength", "1000");
    inputEl.setAttribute("autocomplete", "off");
    inputEl.placeholder = I18N.placeholder;
    var sendBtn = tw("button", "", I18N.send);
    sendBtn.setAttribute("id", "ss-chat-send");
    var submit = function () {
      var v = inputEl.value;
      if (v && v.trim()) { inputEl.value = ""; ask(v); }
    };
    inputEl.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); submit(); } });
    sendBtn.addEventListener("click", submit);
    inputWrap.appendChild(inputEl);
    inputWrap.appendChild(sendBtn);

    root.appendChild(head);
    root.appendChild(msgsEl);
    root.appendChild(chipsEl);
    root.appendChild(inputWrap);

    var btn = tw("button", "", null);
    btn.setAttribute("id", "ss-chat-btn");
    btn.setAttribute("aria-label", I18N.open);
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
    btn.addEventListener("click", toggle);
    btn.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });

    document.body.appendChild(btn);
    document.body.appendChild(root);
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    if (!document.body) return;
    build();
    // Auto-open once per session when the visitor pauses with no input.
    var openedOnce = false;
    try { openedOnce = !!sessionStorage.getItem("ss-chat-opened"); } catch (e) {}
    if (!openedOnce && !state.history.length) {
      setTimeout(function () {
        try { sessionStorage.setItem("ss-chat-opened", "1"); } catch (e) {}
        open();
      }, 8000);
    }
  });
})();