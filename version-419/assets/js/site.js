(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-menu");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                var opened = menu.classList.toggle("is-open");
                document.body.classList.toggle("menu-open", opened);
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function autoplay() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-index")) || 0);
                    autoplay();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    autoplay();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    autoplay();
                });
            }

            show(0);
            autoplay();
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));

        forms.forEach(function (form) {
            var input = form.querySelector("[data-filter-input]");
            var region = form.querySelector("[data-filter-region]");
            var type = form.querySelector("[data-filter-type]");
            var list = document.querySelector("[data-filter-list]");
            var empty = document.querySelector("[data-empty-state]");

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function filterCards() {
                if (!list) {
                    return;
                }

                var query = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var visible = 0;
                var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchRegion = !regionValue || normalize(card.getAttribute("data-region")).indexOf(regionValue) !== -1;
                    var matchType = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
                    var matched = matchQuery && matchRegion && matchType;

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filterCards);
                    control.addEventListener("change", filterCards);
                }
            });

            form.addEventListener("submit", function (event) {
                if (list) {
                    event.preventDefault();
                    filterCards();
                }
            });

            filterCards();
        });
    });
})();
