/* ICTC site behavior: mobile nav + EN/TA language toggle. No dependencies. */
(function () {
  "use strict";

  var STORAGE_KEY = "ictc-lang";

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("nav-burger");
  var menu = document.getElementById("nav-menu");

  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });

    // Close the menu after choosing a link (mobile).
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Language toggle ----------
     Elements marked with a non-empty data-ta attribute swap to Tamil.
     Empty data-ta falls back to English, so the toggle is safe to wire
     before any translation exists. */
  var langBtn = document.getElementById("lang-toggle");
  var toast = document.getElementById("lang-toast");
  var toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2500);
  }

  function setLang(lang) {
    var translated = 0;
    var nodes = document.querySelectorAll("[data-ta]");

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var ta = el.getAttribute("data-ta");

      if (lang === "ta" && ta) {
        if (!el.hasAttribute("data-en")) {
          el.setAttribute("data-en", el.innerHTML);
        }
        el.innerHTML = ta;
        translated++;
      } else if (el.hasAttribute("data-en")) {
        el.innerHTML = el.getAttribute("data-en");
      }
    }

    document.documentElement.lang = lang === "ta" ? "ta" : "en";

    if (langBtn) {
      langBtn.textContent = lang === "ta" ? "EN" : "தமிழ்";
      langBtn.setAttribute(
        "aria-label",
        lang === "ta" ? "Switch to English" : "Switch to Tamil"
      );
    }

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* storage unavailable — ignore */ }

    if (lang === "ta" && translated === 0) {
      showToast("Tamil content coming soon.");
    }
  }

  if (langBtn) {
    langBtn.addEventListener("click", function () {
      var current = document.documentElement.lang === "ta" ? "ta" : "en";
      setLang(current === "ta" ? "en" : "ta");
    });
  }

  // Restore saved preference (defaults to English).
  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) { /* ignore */ }
  if (saved === "ta") setLang("ta");
})();

/* ---------- Image galleries (lightbox) ----------
   Each event card button carries data-gallery="<slug>".
   Slides are images/<slug>.webp plus images/<slug>-2.webp … -5.webp. */
(function () {
  "use strict";

  var GALLERIES = {
    "wellness-course": "Wellness Programme — Mental Health / Yoga Therapy",
    "aicsm-2025": "AIMST International Conference on Siddha Medicine 2025",
    "aicsm-report": "Post-Conference Report: AICSM 2025",
    "appreciation-lunch": "Appreciation Lunch",
    "vijayadhasami": "Vijayadhasami Celebration"
  };

  var lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  var lbImg = document.getElementById("lb-img");
  var lbCaption = document.getElementById("lb-caption");
  var lbCounter = document.getElementById("lb-counter");
  var lbPrev = document.getElementById("lb-prev");
  var lbNext = document.getElementById("lb-next");
  var lbClose = document.getElementById("lb-close");

  var gallery = [];
  var galleryIndex = 0;
  var galleryTitle = "";
  var lastFocused = null;

  function buildGallery(slug) {
    var files = ["images/" + slug + ".webp"];
    for (var i = 2; i <= 5; i++) files.push("images/" + slug + "-" + i + ".webp");
    return files;
  }

  function renderSlide() {
    lbImg.src = gallery[galleryIndex];
    lbImg.alt = galleryTitle + " — image " + (galleryIndex + 1) + " of " + gallery.length;
    lbCaption.textContent = galleryTitle;
    lbCounter.textContent = (galleryIndex + 1) + " / " + gallery.length;
    // Preload neighbours for smooth next/prev.
    var nextI = (galleryIndex + 1) % gallery.length;
    var prevI = (galleryIndex - 1 + gallery.length) % gallery.length;
    var n = new Image(); n.src = gallery[nextI];
    var p = new Image(); p.src = gallery[prevI];
  }

  function openLightbox(slug, trigger) {
    gallery = buildGallery(slug);
    galleryTitle = GALLERIES[slug] || slug;
    galleryIndex = 0;
    lastFocused = trigger || document.activeElement;
    renderSlide();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (lastFocused) lastFocused.focus();
  }

  function step(delta) {
    if (!gallery.length) return;
    galleryIndex = (galleryIndex + delta + gallery.length) % gallery.length;
    renderSlide();
  }

  var triggers = document.querySelectorAll(".event-img-btn");
  for (var i = 0; i < triggers.length; i++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        openLightbox(btn.getAttribute("data-gallery"), btn);
      });
    })(triggers[i]);
  }

  lbPrev.addEventListener("click", function () { step(-1); });
  lbNext.addEventListener("click", function () { step(1); });
  lbClose.addEventListener("click", closeLightbox);

  // Click on the dark backdrop (outside the figure) closes.
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });
})();
