(() => {
    const menuButton = document.querySelector('[data-menu-button]');
    const nav = document.querySelector('[data-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const showSlide = (index) => {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const startTimer = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => showSlide(current + 1), 5200);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    const filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        const cards = Array.from(document.querySelectorAll('[data-card]'));
        const searchInput = filterPanel.querySelector('[data-search-input]');
        const selects = Array.from(filterPanel.querySelectorAll('[data-select-filter]'));
        const emptyState = document.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (initialQuery && searchInput && !searchInput.value) {
            searchInput.value = initialQuery;
        }

        const applyFilters = () => {
            const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
            const activeFilters = selects.map((select) => [select.dataset.selectFilter, select.value]).filter((item) => item[1]);
            let visible = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                const queryMatch = !query || haystack.includes(query);
                const selectMatch = activeFilters.every(([key, value]) => (card.dataset[key] || '') === value);
                const shouldShow = queryMatch && selectMatch;

                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        };

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        selects.forEach((select) => {
            select.addEventListener('change', applyFilters);
        });

        applyFilters();
    }

    const searchForms = Array.from(document.querySelectorAll('[data-search-form]'));
    searchForms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input[type="search"]');
            const query = input ? input.value.trim() : '';
            const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
            window.location.href = `search.html${suffix}`;
        });
    });

    const playerBoxes = Array.from(document.querySelectorAll('[data-player-box]'));
    playerBoxes.forEach((box) => {
        const video = box.querySelector('video');
        const button = box.querySelector('[data-play-button]');
        const stream = video ? video.dataset.stream : '';
        let hls = null;

        const attach = () => {
            if (!video || !stream) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                }
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.src) {
                    video.src = stream;
                }
            } else if (!video.src) {
                video.src = stream;
            }
        };

        const play = () => {
            attach();
            box.classList.add('is-playing');
            if (video) {
                const promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(() => {
                        box.classList.remove('is-playing');
                    });
                }
            }
        };

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', () => {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', () => box.classList.add('is-playing'));
            video.addEventListener('pause', () => {
                if (!video.ended) {
                    box.classList.remove('is-playing');
                }
            });
        }
    });
})();
