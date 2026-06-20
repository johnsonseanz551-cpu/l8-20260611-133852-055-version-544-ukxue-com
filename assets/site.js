(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initBackTop() {
        var button = document.querySelector("[data-backtop]");
        if (!button) {
            return;
        }
        function update() {
            button.classList.toggle("show", window.scrollY > 360);
        }
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var section = root.closest("section") || document;
            var list = section.querySelector("[data-card-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
            var search = root.querySelector("[data-search-input]");
            var channel = root.querySelector("[data-channel-filter]");
            var type = root.querySelector("[data-type-filter]");
            var year = root.querySelector("[data-year-filter]");
            var sort = root.querySelector("[data-sort-filter]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (search && query) {
                search.value = query;
            }

            function valueOf(control, fallback) {
                return control ? control.value : fallback;
            }

            function apply() {
                var q = search ? search.value.trim().toLowerCase() : "";
                var channelValue = valueOf(channel, "all");
                var typeValue = valueOf(type, "all");
                var yearValue = valueOf(year, "all");
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (channelValue !== "all" && card.getAttribute("data-channel") !== channelValue) {
                        ok = false;
                    }
                    if (typeValue !== "all" && card.getAttribute("data-type") !== typeValue) {
                        ok = false;
                    }
                    if (yearValue !== "all" && card.getAttribute("data-year") !== yearValue) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                });
                sortCards();
            }

            function sortCards() {
                if (!sort || sort.value === "default") {
                    return;
                }
                var sorted = cards.slice().sort(function (a, b) {
                    if (sort.value === "rating") {
                        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                    }
                    if (sort.value === "year") {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    }
                    return (a.getAttribute("data-search") || "").localeCompare(b.getAttribute("data-search") || "", "zh-Hans-CN");
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            [search, channel, type, year, sort].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener(control.tagName === "INPUT" ? "input" : "change", apply);
            });
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var source = video ? video.querySelector("source") : null;
            var overlay = player.querySelector(".player-overlay");
            if (!video || !source || !overlay) {
                return;
            }
            var src = source.getAttribute("src");
            var prepared = false;
            var hls = null;

            function prepare() {
                if (prepared) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                prepared = true;
            }

            function play() {
                prepare();
                overlay.classList.add("is-hidden");
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        overlay.classList.remove("is-hidden");
                    });
                }
            }

            overlay.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                overlay.classList.add("is-hidden");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    overlay.classList.remove("is-hidden");
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initBackTop();
        initHero();
        initFilters();
        initPlayers();
    });
})();
