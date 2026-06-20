(function () {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setHero(current + 1);
        }, 5200);
    }

    var searchInput = document.getElementById('localSearch');
    var yearFilter = document.getElementById('yearFilter');
    var regionFilter = document.getElementById('regionFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function readQuery() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (searchInput && query) {
            searchInput.value = query;
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var query = normalize(searchInput ? searchInput.value : '');
        var year = normalize(yearFilter ? yearFilter.value : '');
        var region = normalize(regionFilter ? regionFilter.value : '');

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year')
            ].join(' '));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchYear = !year || cardYear === year;
            var matchRegion = !region || cardRegion.indexOf(region) !== -1;
            card.classList.toggle('hidden-by-filter', !(matchQuery && matchYear && matchRegion));
        });
    }

    readQuery();

    [searchInput, yearFilter, regionFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    applyFilters();
}());
