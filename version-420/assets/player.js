(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function startPlayer(box) {
    var video = box.querySelector("video");
    var overlay = box.querySelector(".player-overlay");
    var stream = box.getAttribute("data-stream");
    var loaded = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function load() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", load);
    }

    box.querySelectorAll(".play-trigger").forEach(function (button) {
      button.addEventListener("click", load);
    });

    video.addEventListener("click", function () {
      if (!loaded) {
        load();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll(".movie-player").forEach(startPlayer);
  });
})();
