(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setPosterState() {
        qsa('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.style.opacity = '0';
            }, { once: true });
        });
    }

    function initMenu() {
        var button = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('.hero-dot', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function initSearchPage() {
        var input = qs('[data-search-input]');
        var list = qs('[data-search-list]');
        if (!input || !list) {
            return;
        }
        var typeSelect = qs('[data-type-filter]');
        var regionSelect = qs('[data-region-filter]');
        var resetButton = qs('[data-filter-reset]');
        var empty = qs('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            input.value = query;
        }
        var cards = qsa('.movie-card', list);

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filter() {
            var keyword = normalize(input.value);
            var typeValue = normalize(typeSelect ? typeSelect.value : '');
            var regionValue = normalize(regionSelect ? regionSelect.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var type = normalize(card.getAttribute('data-type'));
                var region = normalize(card.getAttribute('data-region'));
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedType = !typeValue || type === typeValue;
                var matchedRegion = !regionValue || region === regionValue;
                var show = matchedKeyword && matchedType && matchedRegion;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        input.addEventListener('input', filter);
        if (typeSelect) {
            typeSelect.addEventListener('change', filter);
        }
        if (regionSelect) {
            regionSelect.addEventListener('change', filter);
        }
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                input.value = '';
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                filter();
            });
        }
        filter();
    }

    function initPlayer() {
        var video = qs('[data-hls]');
        if (!video) {
            return;
        }
        var overlay = qs('.play-overlay');
        var message = qs('.player-message');
        var url = video.getAttribute('data-hls');
        var hls = null;

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add('show');
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        }

        function load() {
            if (!url) {
                showMessage('视频暂时无法加载');
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage('视频加载失败，请稍后再试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                video.src = url;
            }
        }

        function play() {
            hideOverlay();
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {});
            }
        }

        load();
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('play', hideOverlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setPosterState();
        initMenu();
        initHero();
        initSearchPage();
        initPlayer();
    });
}());
