/* Sofrito Studio comments — async, YouTube-style, self-contained.
   Loaded via <script defer> injected by the edge worker on recipe pages.
   Renders into <section id="ss-comments" data-recipe-id="...">. */
(function () {
  "use strict";
  var root = document.getElementById("ss-comments");
  if (!root || !root.getAttribute("data-recipe-id")) return;
  var RECIPE = root.getAttribute("data-recipe-id");
  var API = "/api/comments";
  var state = { sort: "new", byId: {} };
  var NAME_KEY = "ss_commenter_name";

  var CSS =
    "#ss-comments{max-width:760px;margin:34px auto;padding:0 20px;font-family:Inter,Arial,sans-serif;color:#2b2118}" +
    ".ssc-h{font-family:Fraunces,Georgia,serif;font-size:22px;font-weight:700;margin:0 0 14px}" +
    ".ssc-sort{display:flex;gap:18px;margin-bottom:16px;font-size:13px;font-weight:600}" +
    ".ssc-sort button{background:none;border:none;cursor:pointer;font:inherit;color:#7a6b5d;padding:0}" +
    ".ssc-sort button.on{color:#b02422}" +
    ".ssc-write{display:flex;gap:12px;margin-bottom:22px}" +
    ".ssc-av{width:40px;height:40px;border-radius:50%;flex:0 0 40px;background:#eadfcf;color:#7a6b5d;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:15px;overflow:hidden}" +
    ".ssc-av img{width:100%;height:100%;object-fit:cover}" +
    ".ssc-c{flex:1}" +
    ".ssc-ta{width:100%;box-sizing:border-box;border:none;border-bottom:1px solid #d9cbb4;background:transparent;font:inherit;font-size:14px;color:#2b2118;padding:8px 2px;resize:none;outline:none}" +
    ".ssc-ta:focus{border-color:#b02422}" +
    ".ssc-row{display:flex;align-items:center;justify-content:space-between;margin-top:8px}" +
    ".ssc-count{font-size:12px;color:#a29482}" +
    ".ssc-btns{display:flex;gap:10px}" +
    ".ssc-btn{border:none;border-radius:999px;font:inherit;font-size:13px;font-weight:700;padding:8px 16px;cursor:pointer}" +
    ".ssc-cancel{background:transparent;color:#7a6b5d}" +
    ".ssc-post{background:#b02422;color:#fff}" +
    ".ssc-post:disabled{opacity:.45;cursor:default}" +
    ".ssc-item{display:flex;gap:12px;margin-bottom:18px}" +
    ".ssc-body{flex:1;min-width:0}" +
    ".ssc-meta{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}" +
    ".ssc-name{font-size:14px;font-weight:700}" +
    ".ssc-time{font-size:12px;color:#a29482}" +
    ".ssc-txt{font-size:14px;line-height:1.55;margin:4px 0 6px;white-space:pre-wrap;word-break:break-word}" +
    ".ssc-act{display:flex;align-items:center;gap:14px;font-size:13px}" +
    ".ssc-like{display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:#7a6b5d;font:inherit;padding:2px 6px;border-radius:999px}" +
    ".ssc-like.on,.ssc-like:hover{color:#b02422}" +
    ".ssc-reply{background:none;border:none;cursor:pointer;color:#2e6b4f;font:inherit;font-weight:700}" +
    ".ssc-replies{margin-left:52px;margin-top:6px}" +
    ".ssc-toggle{background:none;border:none;cursor:pointer;color:#2e6b4f;font:inherit;font-size:13px;font-weight:700;padding:0}" +
    ".ssc-empty{color:#7a6b5d;font-size:14px;padding:10px 0}" +
    ".ssc-err{color:#b02422;font-size:13px;margin-top:6px}";

  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function timeAgo(iso) {
    var d = new Date(iso), now = Date.now();
    if (isNaN(d)) return "";
    var s = Math.max(0, Math.floor((now - d.getTime()) / 1000));
    if (s < 60) return "now";
    var m = Math.floor(s / 60); if (m < 60) return m + "m ago";
    var h = Math.floor(m / 60); if (h < 24) return h + "h ago";
    var dy = Math.floor(h / 24); if (dy < 7) return dy + (dy === 1 ? " day ago" : " days ago");
    var w = Math.floor(dy / 7); if (w < 5) return w + (w === 1 ? " week ago" : " weeks ago");
    var mo = Math.floor(dy / 30); if (mo < 12) return mo + (mo === 1 ? " month ago" : " months ago");
    return Math.floor(dy / 365) + (dy >= 365 ? " years ago" : " year ago");
  }
  function initials(name) {
    var p = name.trim().split(/\s+/).filter(Boolean);
    return esc(((p[0] && p[0][0]) || "?") + ((p[1] && p[1][0]) || ""));
  }
  function avatar(c, name) {
    if (c.avatar_url) return '<img src="' + esc(c.avatar_url) + '" alt="" onerror="this.outerHTML=\'' + initials(name) + '\'">';
    return initials(name);
  }

  function api(url, opts) {
    return fetch(url, opts).then(function (r) { return r.json().catch(function () { return null; }); });
  }

  function likeBtn(c) {
    return '<button class="ssc-like' + (c.liked ? " on" : "") + '" data-like="' + esc(c.id) + '">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>' +
      (c.likes > 0 ? '<span>' + c.likes + "</span>" : "") + "</button>";
  }

  function itemHTML(c, depth) {
    var t = esc(c.author_name) + '<span class="ssc-time">' + timeAgo(c.created_at) + "</span>";
    var act = likeBtn(c) +
      (depth < 2 ? '<button class="ssc-reply" data-reply="' + esc(c.id) + '" data-name="' + esc(c.author_name) + '">Reply</button>' : "");
    var html = '<div class="ssc-item" data-id="' + esc(c.id) + '"><div class="ssc-av">' + avatar(c, c.author_name) + "</div>" +
      '<div class="ssc-body"><div class="ssc-meta">' + t + "</div>" +
      '<div class="ssc-txt">' + esc(c.content) + "</div>" +
      '<div class="ssc-act">' + act + "</div></div></div>";
    if (c.replies && c.replies.length) {
      var open = c._open;
      html += '<div class="ssc-replies">' +
        '<button class="ssc-toggle" data-toggle="' + esc(c.id) + '">' + (open ? "Hide replies" : "View " + c.replies.length + (c.replies.length === 1 ? " reply" : " replies")) + "</button>" +
        (open ? '<div class="ssc-open">' + c.replies.map(function (r) { return itemHTML(r, depth + 1); }).join("") + "</div>" : "") +
        "</div>";
    }
    return html;
  }

  function render() {
    root.querySelector(".ssc-h").textContent = state.count + (state.count === 1 ? " Comment" : " Comments");
    var list = root.querySelector(".ssc-list");
    list.innerHTML = state.comments.length ? state.comments.map(function (c) { return itemHTML(c, 0); }).join("") : '<div class="ssc-empty">Be the first to comment — share your take on this recipe.</div>';
  }

  function writeForm() {
    var saved = "";
    try { saved = localStorage.getItem(NAME_KEY) || ""; } catch (e) {}
    var f = document.createElement("div");
    f.className = "ssc-write";
    f.innerHTML = '<div class="ssc-av">' + esc(saved ? initials(saved) : "You") + "</div>" +
      '<div class="ssc-c"><textarea class="ssc-ta" rows="1" maxlength="2000" placeholder="Add a comment…" aria-label="Add a comment"></textarea>' +
      '<div class="ssc-row"><span class="ssc-count">0 / 2000</span>' +
      '<div class="ssc-btns"><button type="button" class="ssc-btn ssc-cancel" hidden>Cancel</button>' +
      '<button type="button" class="ssc-btn ssc-post" disabled>Comment</button></div></div></div>';
    root.appendChild(f);

    var ta = f.querySelector(".ssc-ta"), count = f.querySelector(".ssc-count"),
        post = f.querySelector(".ssc-post"), cancel = f.querySelector(".ssc-cancel");
    ta.addEventListener("input", function () {
      count.textContent = ta.value.length + " / 2000";
      post.disabled = ta.value.trim().length === 0;
    });
    post.addEventListener("click", function () {
      var content = ta.value.trim();
      if (!content) return;
      var name = saved.trim() || "Guest";
      var c = { id: "tmp-" + Date.now(), author_name: name, avatar_url: null, content: content, likes: 0, created_at: new Date().toISOString(), replies: [], _open: false, _pending: true };
      state.byId[c.id] = c; state.comments.unshift(c); state.count++;
      ta.value = ""; count.textContent = "0 / 2000"; post.disabled = true;
      render();
      api(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipe_id: RECIPE, author_name: name, content: content }) })
        .then(function (res) {
          if (res && res.ok) {
            state.byId[res.comment.id] = res.comment; state.byId[res.comment.id]._open = false;
            var i = state.comments.indexOf(c); if (i > -1) state.comments[i] = res.comment;
          } else {
            state.comments = state.comments.filter(function (x) { return x.id !== c.id; }); state.count--;
          }
          render();
        });
    });
    return f;
  }

  function replyForm(c, to) {
    var wrap = document.createElement("div");
    wrap.className = "ssc-write";
    wrap.style.marginLeft = "52px";
    wrap.innerHTML = '<div class="ssc-av">' + esc(initials(to)) + "</div>" +
      '<div class="ssc-c"><textarea class="ssc-ta" rows="1" maxlength="2000" placeholder="Reply to ' + esc(to) + '…" aria-label="Reply"></textarea>' +
      '<div class="ssc-row"><span class="ssc-count">0 / 2000</span>' +
      '<div class="ssc-btns"><button type="button" class="ssc-btn ssc-cancel">Cancel</button>' +
      '<button type="button" class="ssc-btn ssc-post" disabled>Reply</button></div></div></div>';
    var item = root.querySelector('[data-id="' + cssEsc(c.id) + '"]');
    var target = item.parentNode; target.appendChild(wrap);
    var ta = wrap.querySelector(".ssc-ta"), post = wrap.querySelector(".ssc-post"), cancel = wrap.querySelector(".ssc-cancel");
    ta.focus();
    ta.addEventListener("input", function () { post.disabled = ta.value.trim().length === 0; });
    cancel.addEventListener("click", function () { wrap.parentNode.removeChild(wrap); });
    post.addEventListener("click", function () {
      var content = ta.value.trim(); if (!content) return;
      var name = (function () { try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; } })().trim() || "Guest";
      var r = { id: "tmp-" + Date.now(), parent_id: c.id, author_name: name, avatar_url: null, content: content, likes: 0, created_at: new Date().toISOString(), replies: [], _open: false };
      c.replies = c.replies || []; c.replies.unshift(r); c._open = true; state.count++;
      wrap.parentNode.removeChild(wrap);
      render();
      api(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipe_id: RECIPE, author_name: name, content: content, parent_id: c.id }) })
        .then(function (res) {
          if (!res || !res.ok) { c.replies = c.replies.filter(function (x) { return x.id !== r.id; }); state.count--; }
          render();
        });
    });
  }
  function cssEsc(s) { return String(s).replace(/[^a-z0-9\-_]/gi, ""); }

  function wire() {
    root.querySelector(".ssc-list").addEventListener("click", function (e) {
      var like = e.target.closest("[data-like]");
      if (like) {
        var id = like.getAttribute("data-like"), c = state.byId[id];
        if (!c || c._liked) return;
        c._liked = true; c.likes++; render();
        api(API + "/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: id }) }).catch(function () {});
        return;
      }
      var tg = e.target.closest("[data-toggle]");
      if (tg) {
        var t = state.byId[tg.getAttribute("data-toggle")];
        if (t) { t._open = !t._open; render(); }
        return;
      }
      var rp = e.target.closest("[data-reply]");
      if (rp) {
        var parent = state.byId[rp.getAttribute("data-reply")];
        if (parent) replyForm(parent, rp.getAttribute("data-name") || parent.author_name);
      }
    });
    root.querySelector(".ssc-sort").addEventListener("click", function (e) {
      var b = e.target.closest("[data-sort]");
      if (!b) return;
      state.sort = b.getAttribute("data-sort");
      load(state.sort);
    });
    var saved = ""; try { saved = localStorage.getItem(NAME_KEY) || ""; } catch (err) {}
    if (!saved) {
      var name = window.prompt("What name should appear on your comments?", "");
      if (name && name.trim()) { try { localStorage.setItem(NAME_KEY, name.trim().slice(0, 40)); } catch (err) {} }
    }
  }

  function load(sort) {
    root.innerHTML = "";
    var header = document.createElement("div");
    header.className = "ssc-h"; header.textContent = "Loading comments…";
    root.appendChild(header);
    var sortRow = document.createElement("div");
    sortRow.className = "ssc-sort";
    sortRow.innerHTML = '<button data-sort="new" class="' + (sort === "new" ? "on" : "") + '">Newest</button><button data-sort="top" class="' + (sort === "top" ? "on" : "") + '">Top</button>';
    root.appendChild(sortRow);
    var list = document.createElement("div");
    list.className = "ssc-list";
    root.appendChild(list);
    writeForm();
    api(API + "?recipe_id=" + encodeURIComponent(RECIPE) + "&sort=" + sort).then(function (res) {
      if (!res || !res.comments) { header.textContent = "Comments"; list.innerHTML = '<div class="ssc-err">Couldn’t load comments right now.</div>'; return; }
      state = { sort: sort, count: res.count || 0, byId: {} };
      res.comments.forEach(function (c) { flatten(c); });
      function flatten(c) { state.byId[c.id] = c; (c.replies || []).forEach(flatten); }
      render();
      wire();
    });
  }

  load("new");
})();