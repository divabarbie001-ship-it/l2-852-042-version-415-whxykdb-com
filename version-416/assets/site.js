(function() {
    const menuButton = document.querySelector('.menu-toggle');
    const mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function() {
            const expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobilePanel.hidden = expanded;
            menuButton.textContent = expanded ? '☰' : '×';
        });
    }

    document.querySelectorAll('.search-redirect').forEach(function(form) {
        form.addEventListener('submit', function(event) {
            const input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            const query = encodeURIComponent(input.value.trim());
            window.location.href = 'search.html?q=' + query;
        });
    });

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const nextButton = document.querySelector('.hero-next');
    const prevButton = document.querySelector('.hero-prev');
    let currentSlide = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
            slide.classList.toggle('active', i === currentSlide);
        });
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function startTimer() {
        if (!slides.length) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function() {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            const index = Number(dot.getAttribute('data-slide') || '0');
            showSlide(index);
            startTimer();
        });
    });

    if (nextButton) {
        nextButton.addEventListener('click', function() {
            showSlide(currentSlide + 1);
            startTimer();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function() {
            showSlide(currentSlide - 1);
            startTimer();
        });
    }

    showSlide(0);
    startTimer();

    const grid = document.querySelector('.searchable-grid');
    const searchInput = document.querySelector('.page-search-input');
    const filterSelects = Array.from(document.querySelectorAll('.filter-select'));
    const clearButton = document.querySelector('.clear-filter');
    const emptyBox = document.querySelector('.no-result');

    function applyUrlQuery() {
        if (!searchInput) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const value = params.get('q');
        if (value) {
            searchInput.value = value;
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        if (!grid) {
            return;
        }
        const cards = Array.from(grid.querySelectorAll('.movie-card'));
        const query = normalize(searchInput ? searchInput.value : '');
        const filters = filterSelects.map(function(select) {
            return {
                key: select.getAttribute('data-filter'),
                value: normalize(select.value)
            };
        }).filter(function(item) {
            return item.key && item.value;
        });
        let visible = 0;

        cards.forEach(function(card) {
            const combined = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.category,
                card.dataset.type,
                card.dataset.tags
            ].join(' '));
            const textOk = !query || combined.includes(query);
            const filtersOk = filters.every(function(item) {
                return normalize(card.dataset[item.key]).includes(item.value);
            });
            const show = textOk && filtersOk;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (emptyBox) {
            emptyBox.hidden = visible !== 0;
        }
    }

    applyUrlQuery();

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    filterSelects.forEach(function(select) {
        select.addEventListener('change', filterCards);
    });

    if (clearButton) {
        clearButton.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
            }
            filterSelects.forEach(function(select) {
                select.value = '';
            });
            filterCards();
        });
    }

    filterCards();
})();
