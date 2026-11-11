/* ============================================================
   简林灵 · 作品集 — interactions
   ============================================================ */
(function () {
  "use strict";

  var ANIME_COUNT = 39;
  var THREE_MODELS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,20];
  var THREE_RENDERS = [18,19,21,22,23,24,25,26,27,28,29,30,31,32];

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---- build a gallery card ---- */
  function card(item) {
    var a = document.createElement("a");
    a.className = "art-card";
    a.href = item.src;
    a.setAttribute("data-full", item.src);
    a.setAttribute("data-title", item.title);
    a.setAttribute("data-sub", item.sub);

    var frame = document.createElement("div");
    frame.className = "art-frame" + (item.model ? " model" : "");

    var wrap = document.createElement("div");
    wrap.className = "art-img-wrap";

    var img = document.createElement("img");
    img.src = item.src;
    img.alt = item.title;
    img.loading = "lazy";

    // tighten frame to natural aspect for transparent models
    img.addEventListener("load", function () {
      var r = img.naturalWidth / img.naturalHeight;
      if (item.model) {
        wrap.style.aspectRatio = Math.min(1.75, Math.max(0.55, r)).toFixed(3);
      } else if (r > 1.12) {
        frame.classList.add("landscape");
      } else if (r < 0.88) {
        frame.classList.add("tall");
      } else {
        frame.classList.add("square");
      }
    });

    wrap.appendChild(img);
    frame.appendChild(wrap);

    var cap = document.createElement("div");
    cap.className = "art-caption";
    var t = document.createElement("span");
    t.className = "title";
    t.textContent = item.title;
    var s = document.createElement("span");
    s.className = "sub";
    s.textContent = item.sub;
    cap.appendChild(t);
    cap.appendChild(s);

    a.appendChild(frame);
    a.appendChild(cap);
    return a;
  }

  function mount(containerId, items) {
    var el = document.getElementById(containerId);
    items.forEach(function (it) {
      var li = document.createElement("div");
      li.className = "art-item";
      li.appendChild(card(it));
      el.appendChild(li);
    });
  }

  /* ---- data ---- */
  var animeItems = [];
  var i;
  for (i = 1; i <= ANIME_COUNT; i++) {
    animeItems.push({
      src: "images/anime/anime-" + pad(i) + ".webp",
      title: "角色设计",
      sub: "Character Design — No. " + pad(i),
      model: false
    });
  }

  var threeItems = [];
  THREE_MODELS.forEach(function (n) {
    threeItems.push({
      src: "images/3d/model-" + pad(n) + ".webp",
      title: "三维建模",
      sub: "3D Modeling — No. " + pad(n),
      model: true
    });
  });
  THREE_RENDERS.forEach(function (n) {
    threeItems.push({
      src: "images/3d/render-" + pad(n) + ".webp",
      title: "渲染作品",
      sub: "3D Render — No. " + pad(n),
      model: false
    });
  });

  mount("gallery-anime", animeItems);
  mount("gallery-3d", threeItems);

  /* ---- scroll reveal ---- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        revealObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal, .art-item").forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---- mobile nav toggle ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var navLinksEl = document.getElementById("nav-links");
  if (navToggle && navLinksEl) {
    navToggle.addEventListener("click", function () {
      var open = navLinksEl.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinksEl.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinksEl.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- nav active state (scroll spy) ---- */
  var navLinks = document.querySelectorAll(".nav-links a");
  var spySections = ["artist", "character", "modeling"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function updateActiveNav() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    var line = scrollTop + 96; // point just below the fixed nav
    var currentId = "";

    spySections.forEach(function (section) {
      if (section.offsetTop <= line) {
        currentId = section.id;
      }
    });

    // Snap to the last section once the page is scrolled to the bottom.
    if (window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 4) {
      currentId = spySections[spySections.length - 1].id;
    }

    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
    });
  }

  var navScrollTicking = false;
  window.addEventListener("scroll", function () {
    if (!navScrollTicking) {
      window.requestAnimationFrame(function () {
        updateActiveNav();
        navScrollTicking = false;
      });
      navScrollTicking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", updateActiveNav);
  updateActiveNav();

  /* ---- lightbox ---- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbTitle = lb.querySelector(".lb-title");
  var lbSub = lb.querySelector(".lb-sub");
  var lbFrame = lb.querySelector(".lb-frame");
  var allCards = Array.prototype.slice.call(document.querySelectorAll(".art-card"));

  function showCard(idx) {
    var c = allCards[idx];
    if (!c) return;
    lbImg.src = c.getAttribute("data-full");
    lbImg.alt = c.getAttribute("data-title");
    lbTitle.textContent = c.getAttribute("data-title");
    lbSub.textContent = c.getAttribute("data-sub");
    lbFrame.classList.toggle("model", /model-/.test(c.getAttribute("data-full")));
  }

  document.addEventListener("click", function (e) {
    var card = e.target.closest ? e.target.closest(".art-card") : null;
    if (!card) return;
    e.preventDefault();
    var idx = allCards.indexOf(card);
    if (idx > -1) {
      lb._idx = idx;
      showCard(idx);
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  });

  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function step(d) {
    if (!lb.classList.contains("open")) return;
    var n = allCards.length;
    lb._idx = (lb._idx + d + n) % n;
    showCard(lb._idx);
  }

  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();
