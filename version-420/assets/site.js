(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindSearchForms() {
    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function bindMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.hidden = !nav.hidden;
      toggle.textContent = nav.hidden ? "☰" : "×";
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var nextButton = hero.querySelector("[data-hero-next]");
    var prevButton = hero.querySelector("[data-hero-prev]");
    var index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    }));

    function setSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        setSlide(index + 1);
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        setSlide(index - 1);
      });
    }

    window.setInterval(function () {
      setSlide(index + 1);
    }, 5000);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function bindFilters() {
    var form = document.querySelector("[data-filter-form]");
    var grid = document.querySelector("[data-search-grid]");
    if (!form || !grid) {
      return;
    }
    var input = form.querySelector("[data-search-input]");
    var typeFilter = form.querySelector("[data-type-filter]");
    var yearFilter = form.querySelector("[data-year-filter]");
    var regionFilter = form.querySelector("[data-region-filter]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var typeValue = normalize(typeFilter ? typeFilter.value : "");
      var yearValue = normalize(yearFilter ? yearFilter.value : "");
      var regionValue = normalize(regionFilter ? regionFilter.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !typeValue || normalize(card.dataset.type) === typeValue;
        var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
        var matchesRegion = !regionValue || normalize(card.dataset.region) === regionValue;
        var visible = matchesQuery && matchesType && matchesYear && matchesRegion;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [input, typeFilter, yearFilter, regionFilter].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });

    apply();
  }

  ready(function () {
    bindSearchForms();
    bindMobileNav();
    bindHero();
    bindFilters();
  });
})();
