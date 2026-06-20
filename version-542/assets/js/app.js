(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initSearch() {
    var inputs = selectAll('.site-search');
    if (!inputs.length) {
      return;
    }
    var cards = selectAll('.movie-card');
    function applySearch(value) {
      var needle = String(value || '').trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = String(card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden-card', needle && haystack.indexOf(needle) === -1);
      });
    }
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        inputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        applySearch(input.value);
      });
    });
    selectAll('[data-filter-year]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-year') || '';
        inputs.forEach(function (input) {
          input.value = value;
        });
        setActiveChip(chip);
        applySearch(value);
      });
    });
    selectAll('[data-filter-text]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-text') || '';
        inputs.forEach(function (input) {
          input.value = value;
        });
        setActiveChip(chip);
        applySearch(value);
      });
    });
    selectAll('[data-filter-clear]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        inputs.forEach(function (input) {
          input.value = '';
        });
        setActiveChip(chip);
        applySearch('');
      });
    });
  }

  function setActiveChip(activeChip) {
    selectAll('.filter-chip').forEach(function (chip) {
      chip.classList.toggle('is-active', chip === activeChip);
    });
  }

  function initPlayer() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.js-play');
      if (!video || !button) {
        return;
      }
      function prepare() {
        var source = video.getAttribute('data-hls');
        if (!source) {
          return;
        }
        if (video.getAttribute('data-ready') === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = source;
        }
        video.setAttribute('data-ready', '1');
      }
      function play() {
        prepare();
        var playPromise = video.play();
        button.classList.add('is-hidden');
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }
      button.addEventListener('click', play);
      player.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        if (!button.classList.contains('is-hidden')) {
          play();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();
