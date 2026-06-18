(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var keyword = input ? input.value.trim() : "";
        if (keyword) {
          window.location.href = "./search.html?q=" + encodeURIComponent(keyword);
        } else {
          window.location.href = "./search.html";
        }
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    play();
  }

  function initFilters() {
    var grid = document.querySelector("[data-movie-grid]");
    if (!grid) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-sort-select]");
    var cards = Array.prototype.slice.call(grid.children);

    function applyFilter() {
      var value = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "")).toLowerCase();
        card.classList.toggle("is-hidden-by-filter", value && text.indexOf(value) === -1);
      });
    }

    function applySort() {
      var mode = select ? select.value : "default";
      var sorted = cards.slice();
      if (mode === "popular") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        });
      }
      if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      applyFilter();
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (select) {
      select.addEventListener("change", applySort);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function resultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<a href=\"./search.html?q=" + encodeURIComponent(tag) + "\">#" + escapeHtml(tag) + "</a>";
    }).join("");
    return "<article class=\"movie-card compact-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span><span class=\"play-circle\">▶</span></a>" +
      "<div class=\"movie-card-body\"><span class=\"category-pill\">" + escapeHtml(movie.category) + "</span>" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  function initSearchPage() {
    var target = document.getElementById("search-results");
    if (!target || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var heading = document.querySelector("[data-search-heading]");
    var summary = document.querySelector("[data-search-summary]");
    var pageInput = document.querySelector(".page-search input[name='q']");
    if (pageInput) {
      pageInput.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var results = window.SITE_MOVIES.filter(function (movie) {
      var text = [
        movie.title,
        movie.oneLine,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase();
      return text.indexOf(lower) !== -1;
    }).slice(0, 120);
    if (heading) {
      heading.textContent = "搜索结果：" + query;
    }
    if (summary) {
      summary.textContent = results.length ? "为你找到相关影片。" : "没有找到匹配内容，可以尝试更换关键词。";
    }
    target.innerHTML = results.map(resultCard).join("");
  }

  window.setupMoviePlayer = function (sourceUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !sourceUrl) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = sourceUrl;
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMobileNav();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
