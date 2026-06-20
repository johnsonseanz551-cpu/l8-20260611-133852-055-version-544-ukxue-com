(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var carousel = document.getElementById('hero-carousel');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-target]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-target')) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var filterInput = document.querySelector('[data-page-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var filterList = document.querySelector('[data-filter-list]');

  function applyPageFilter() {
    if (!filterList) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.filterable-card'));

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var cardType = card.getAttribute('data-type') || '';
      var visible = true;

      if (query && text.indexOf(query) === -1) {
        visible = false;
      }

      if (year && cardYear !== year) {
        visible = false;
      }

      if (type && cardType !== type) {
        visible = false;
      }

      card.style.display = visible ? '' : 'none';
    });
  }

  [filterInput, yearFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyPageFilter);
      control.addEventListener('change', applyPageFilter);
    }
  });

  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');

  function getSearchTerm() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function cardHtml(item) {
    return [
      '<a class="movie-card" href="./' + item.file + '">',
      '  <div class="poster-wrap">',
      '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="poster-time">' + item.duration + '分钟</span>',
      '    <span class="poster-cat">' + escapeHtml(item.category) + '</span>',
      '    <span class="poster-score">' + item.score + '</span>',
      '  </div>',
      '  <div class="card-body compact">',
      '    <h3>' + escapeHtml(item.title) + '</h3>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="card-meta"><span>' + item.year + '年</span><span>' + escapeHtml(item.region) + '</span></div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearch() {
    if (!searchResults || !window.SEARCH_MOVIES) {
      return;
    }

    var term = getSearchTerm();

    if (searchInput) {
      searchInput.value = term;
    }

    if (!term) {
      searchResults.innerHTML = '<div class="search-empty">请输入关键词搜索影片。</div>';
      return;
    }

    var lower = term.toLowerCase();
    var matched = window.SEARCH_MOVIES.filter(function (item) {
      return item.search.indexOf(lower) !== -1;
    }).slice(0, 120);

    if (!matched.length) {
      searchResults.innerHTML = '<div class="search-empty">未找到相关影片。</div>';
      return;
    }

    searchResults.innerHTML = '<div class="movie-grid compact-grid">' + matched.map(cardHtml).join('') + '</div>';
  }

  renderSearch();
})();
