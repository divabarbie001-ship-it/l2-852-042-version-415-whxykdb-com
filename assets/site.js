(function () {
  var navButton = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      navButton.textContent = open ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function textValue(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    if (!lists.length) {
      return;
    }

    var field = document.querySelector('.search-field');
    var select = document.querySelector('.type-filter');
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && field) {
      field.value = initialQuery;
    }

    function apply() {
      var query = textValue(field && field.value);
      var type = textValue(select && select.value);
      var visible = 0;

      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        cards.forEach(function (card) {
          var search = textValue(card.getAttribute('data-search'));
          var cardType = textValue(card.getAttribute('data-type'));
          var okQuery = !query || search.indexOf(query) !== -1;
          var okType = !type || cardType.indexOf(type) !== -1;
          var show = okQuery && okType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (field) {
      field.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', apply);
    }

    apply();
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-cover');
      var url = shell.getAttribute('data-video');
      var started = false;
      var hlsPlayer = null;

      if (!video || !url) {
        return;
      }

      function begin() {
        if (started) {
          video.play().catch(function () {});
          return;
        }

        started = true;
        shell.classList.add('is-playing');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsPlayer = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsPlayer.loadSource(url);
          hlsPlayer.attachMedia(video);
          hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }

        video.src = url;
        video.play().catch(function () {});
      }

      if (button) {
        button.addEventListener('click', begin);
      }

      video.addEventListener('click', function () {
        if (!started) {
          begin();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsPlayer) {
          hlsPlayer.destroy();
        }
      });
    });
  }

  initHero();
  initFilters();
  initPlayers();
})();
