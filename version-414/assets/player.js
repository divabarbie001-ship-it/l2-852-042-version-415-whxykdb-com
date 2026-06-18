(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initPlayer() {
        var box = document.querySelector("[data-player]");
        if (!box) {
            return;
        }
        var video = box.querySelector("video");
        var overlay = box.querySelector("[data-play-overlay]");
        var button = box.querySelector("[data-play-button]");
        if (!video) {
            return;
        }
        var stream = video.getAttribute("data-stream") || "";
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !stream) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            attached = true;
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
        }
        if (overlay) {
            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) {
                    start();
                }
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    ready(initPlayer);
})();
