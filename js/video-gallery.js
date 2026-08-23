/* ======== Vertical video gallery (TikTok/Reels format) ========
 * Renders 9:16 clip cards from /data/videos.json. Tap to play (muted);
 * a CTA overlay drives viewers to the recipe database or the membership.
 */
(function () {
  "use strict";
  var mount = document.getElementById("videoGallery");
  if (!mount) return;
  var lang = /\/es(\/|$)/.test(location.pathname) ? "es" : "en";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  fetch("/data/videos.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; })
    .then(function (data) {
      var vids = (data && data.videos) || [];
      if (!vids.length) { mount.innerHTML = ""; return; }
      mount.innerHTML = vids.map(function (v) {
        return '<div class="vg-card">' +
          '<video muted loop playsinline preload="metadata" poster="/' + esc(v.poster) + '" ' +
          'src="/' + esc(v.video) + '" aria-label="' + esc(v.title_en) + '"></video>' +
          '<button class="vg-play" aria-label="Play">&#9654;</button>' +
          '<div class="vg-overlay">' +
          '<span class="vg-tag">' + esc(lang === "es" ? v.tag_es : v.tag_en) + "</span>" +
          '<h4>' + esc(lang === "es" ? v.title_es : v.title_en) + "</h4>" +
          '<a class="btn vg-cta" href="' + esc(v.cta) + '">' + esc(lang === "es" ? v.cta_label_es : v.cta_label_en) + "</a>" +
          '<a class="btn btn-ghost vg-cta" href="/membership.html">' +
          (lang === "es" ? "Únete a la membresía" : "Join the membership") + "</a>" +
          "</div></div>";
      }).join("");

      mount.querySelectorAll(".vg-card").forEach(function (card) {
        var video = card.querySelector("video");
        var play = card.querySelector(".vg-play");
        function toggle() {
          if (video.paused) {
            video.play().catch(function () {});
            card.classList.add("playing");
            if (play) play.style.display = "none";
          } else {
            video.pause();
            card.classList.remove("playing");
            if (play) play.style.display = "";
          }
        }
        card.addEventListener("click", function (e) {
          if (e.target.closest("a")) return;
          toggle();
        });
        video.addEventListener("ended", function () {
          card.classList.remove("playing");
          if (play) play.style.display = "";
        });
      });
    });
})();