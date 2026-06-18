(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initImageFallbacks() {
    selectAll('img.movie-cover').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-error');
        image.removeAttribute('src');
      }, { once: true });
    });
  }

  function initMobileNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });
    }

    function start() {
      if (slides.length <= 1) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        showSlide(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  function initSliders() {
    selectAll('[data-slider]').forEach(function (slider) {
      var track = slider.querySelector('[data-slider-track]');
      var previous = slider.querySelector('[data-slider-prev]');
      var next = slider.querySelector('[data-slider-next]');

      if (!track) {
        return;
      }

      function scrollByPage(direction) {
        var distance = Math.max(280, Math.floor(track.clientWidth * 0.82));
        track.scrollBy({ left: direction * distance, behavior: 'smooth' });
      }

      if (previous) {
        previous.addEventListener('click', function () {
          scrollByPage(-1);
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          scrollByPage(1);
        });
      }
    });
  }

  function initFilters() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var searchInput = scope.querySelector('[data-search-input]');
      var selects = selectAll('[data-filter-select]', scope);
      var cards = selectAll('[data-movie-card]', scope);
      var countTarget = scope.querySelector('[data-filter-count]');

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function cardMatches(card, query, filters) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.type,
          card.dataset.category,
          card.textContent
        ].join(' '));

        if (query && haystack.indexOf(query) === -1) {
          return false;
        }

        return Object.keys(filters).every(function (key) {
          var expected = filters[key];

          if (!expected) {
            return true;
          }

          return normalize(card.dataset[key]).indexOf(normalize(expected)) !== -1;
        });
      }

      function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : '');
        var filters = {};
        var visibleCount = 0;

        selects.forEach(function (select) {
          filters[select.dataset.filterSelect] = select.value;
        });

        cards.forEach(function (card) {
          var visible = cardMatches(card, query, filters);
          card.hidden = !visible;

          if (visible) {
            visibleCount += 1;
          }
        });

        if (countTarget) {
          countTarget.textContent = visibleCount + ' 部影片';
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
      });

      applyFilters();
    });
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (window.__hlsLoadingPromise) {
      return window.__hlsLoadingPromise;
    }

    window.__hlsLoadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('播放器组件加载失败'));
      };
      document.head.appendChild(script);
    });

    return window.__hlsLoadingPromise;
  }

  function playStream(container) {
    var video = container.querySelector('[data-video-player]');
    var message = container.querySelector('[data-player-message]');
    var streamUrl = container.dataset.stream;

    if (!video || !streamUrl) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function startPlayback() {
      container.classList.add('is-playing');
      var playback = video.play();

      if (playback && typeof playback.catch === 'function') {
        playback.catch(function () {
          setMessage('播放源已加载，如浏览器阻止自动播放，请再次点击视频播放按钮。');
        });
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      setMessage('播放源加载中。');
      startPlayback();
      return;
    }

    loadHlsLibrary()
      .then(function (Hls) {
        if (!Hls || !Hls.isSupported()) {
          setMessage('当前浏览器不支持 HLS 播放，请更换支持的浏览器访问。');
          return;
        }

        if (container.__hlsInstance) {
          container.__hlsInstance.destroy();
        }

        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        container.__hlsInstance = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源加载完成。');
          startPlayback();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放遇到网络或格式问题，请刷新后重试。');
          }
        });
      })
      .catch(function () {
        setMessage('播放器组件加载失败，请检查网络后重试。');
      });
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (container) {
      var button = container.querySelector('[data-play-button]');

      if (!button) {
        return;
      }

      button.addEventListener('click', function () {
        playStream(container);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initImageFallbacks();
    initMobileNavigation();
    initHeroCarousel();
    initSliders();
    initFilters();
    initPlayers();
  });
}());
