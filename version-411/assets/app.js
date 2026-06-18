(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle('is-active', pos === current);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle('is-active', pos === current);
            });
        }
        function move(step) {
            show(current + step);
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        if (prev) {
            prev.addEventListener('click', function () {
                move(-1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                move(1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
        roots.forEach(function (root) {
            var parent = root.parentElement || document;
            var input = root.querySelector('[data-filter-input]');
            var year = root.querySelector('[data-filter-year]');
            var type = root.querySelector('[data-filter-type]');
            var cards = Array.prototype.slice.call(parent.querySelectorAll('.searchable-card'));
            var empty = parent.querySelector('[data-empty]');
            function apply() {
                var q = normalize(input && input.value);
                var y = normalize(year && year.value);
                var t = normalize(type && type.value);
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && cardYear !== y) {
                        ok = false;
                    }
                    if (t && cardType.indexOf(t) === -1) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', shown === 0);
                }
            }
            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    function setupPlayers() {
        var stages = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        stages.forEach(function (stage) {
            var video = stage.querySelector('video');
            var button = stage.querySelector('[data-play-button]');
            var stream = stage.getAttribute('data-stream');
            var loaded = false;
            if (!video || !button || !stream) {
                return;
            }
            function attachAndPlay() {
                stage.classList.add('is-ready');
                if (!loaded) {
                    loaded = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                }
                var playTask = video.play();
                if (playTask && playTask.catch) {
                    playTask.catch(function () {});
                }
            }
            button.addEventListener('click', attachAndPlay);
            video.addEventListener('click', function () {
                if (!loaded) {
                    attachAndPlay();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
