(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        var showSlide = function (next) {
            if (!slides.length) {
                return;
            }

            index = (next + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var scope = panel.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var search = panel.querySelector('.js-search');
        var typeFilter = panel.querySelector('.js-type-filter');
        var regionFilter = panel.querySelector('.js-region-filter');
        var yearFilter = panel.querySelector('.js-year-filter');

        var apply = function () {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var type = typeFilter ? typeFilter.value : '';
            var region = regionFilter ? regionFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-title') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (type && cardType !== type) {
                    matched = false;
                }

                if (region && cardRegion !== region) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                card.classList.toggle('is-filtered-out', !matched);
            });
        };

        [search, typeFilter, regionFilter, yearFilter].forEach(function (item) {
            if (item) {
                item.addEventListener('input', apply);
                item.addEventListener('change', apply);
            }
        });
    });

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-player-button]');
        var ready = false;
        var engine = null;

        var bindStream = function () {
            if (!video || ready) {
                return;
            }

            var stream = video.getAttribute('data-stream');

            if (!stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                engine = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                engine.loadSource(stream);
                engine.attachMedia(video);
                ready = true;
                return;
            }

            video.src = stream;
            ready = true;
        };

        var start = function () {
            bindStream();

            if (button) {
                button.classList.add('is-hidden');
            }

            if (video) {
                video.controls = true;
                var promise = video.play();

                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
        };

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', start);
        }

        window.addEventListener('pagehide', function () {
            if (engine && engine.destroy) {
                engine.destroy();
            }
        });
    }
})();
