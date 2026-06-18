(function () {
    function initMoviePlayer(streamUrl) {
        var root = document.querySelector("[data-player]");
        if (!root || !streamUrl) {
            return;
        }

        var video = root.querySelector("video");
        var overlay = root.querySelector("[data-player-overlay]");
        var loading = root.querySelector("[data-player-loading]");
        var attached = false;
        var hls = null;

        function attachStream() {
            if (attached || !video) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function setLoading(active) {
            root.classList.toggle("is-loading", active);
            if (loading) {
                loading.style.display = active ? "block" : "none";
            }
        }

        function playMovie() {
            attachStream();
            setLoading(true);
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    setLoading(false);
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playMovie);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playMovie();
            }
        });

        video.addEventListener("playing", function () {
            setLoading(false);
        });

        video.addEventListener("waiting", function () {
            setLoading(true);
        });

        video.addEventListener("pause", function () {
            setLoading(false);
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
