
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggles = document.querySelectorAll("[data-menu-toggle]");
    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var menu = document.querySelector("[data-mobile-menu]");
        if (menu) {
          menu.classList.toggle("is-open");
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var activate = function (next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          activate(i);
        });
      });
      activate(0);
      if (slides.length > 1) {
        window.setInterval(function () {
          activate(index + 1);
        }, 5200);
      }
    }

    var filterInput = document.querySelector("[data-card-filter]");
    if (filterInput) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      filterInput.addEventListener("input", function () {
        var keyword = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.hidden = keyword && text.indexOf(keyword) === -1;
        });
      });
    }
  });
})();
