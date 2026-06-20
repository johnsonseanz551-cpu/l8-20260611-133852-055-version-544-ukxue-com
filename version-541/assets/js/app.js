(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('open'));
    });
  }

  const catalogRoot = document.querySelector('[data-catalog]');

  if (catalogRoot) {
    const input = catalogRoot.querySelector('[data-catalog-input]');
    const count = catalogRoot.querySelector('[data-catalog-count]');
    const items = Array.from(catalogRoot.querySelectorAll('.catalog-item'));
    const buttons = Array.from(catalogRoot.querySelectorAll('[data-filter-category]'));
    let activeCategory = 'all';

    function updateCatalog() {
      const query = (input.value || '').trim().toLowerCase();
      let visible = 0;

      items.forEach(function (item) {
        const haystack = [
          item.dataset.title,
          item.dataset.category,
          item.dataset.year,
          item.dataset.region
        ].join(' ').toLowerCase();
        const categoryMatch = activeCategory === 'all' || item.dataset.category === activeCategory;
        const queryMatch = !query || haystack.includes(query);
        const shouldShow = categoryMatch && queryMatch;

        item.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      count.textContent = '显示 ' + visible + ' 部影片';
    }

    if (input) {
      input.addEventListener('input', updateCatalog);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.dataset.filterCategory;
        buttons.forEach(function (btn) {
          btn.classList.toggle('active', btn === button);
        });
        updateCatalog();
      });
    });

    updateCatalog();
  }

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    const input = searchPage.querySelector('[data-search-input]');
    const meta = searchPage.querySelector('[data-search-meta]');
    const results = searchPage.querySelector('[data-search-results]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function renderResults(movies, query) {
      const keyword = query.trim().toLowerCase();

      if (!keyword) {
        meta.textContent = '请输入关键词开始搜索。';
        results.innerHTML = '';
        return;
      }

      const matched = movies.filter(function (movie) {
        return [movie.title, movie.category, movie.region, movie.year, movie.media_type, movie.genres.join(' '), movie.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      }).slice(0, 80);

      meta.textContent = '找到 ' + matched.length + ' 条相关结果';
      results.innerHTML = matched.map(function (movie) {
        return '' +
          '<a class="search-result-card" href="' + movie.detail_path + '">' +
          '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
          '<p>' + movie.year + ' · ' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genres.join('/')) + '</p></span>' +
          '<em>查看详情</em>' +
          '</a>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[char];
      });
    }

    fetch('assets/data/movies.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (movies) {
        renderResults(movies, input ? input.value : '');

        if (input) {
          input.addEventListener('input', function () {
            renderResults(movies, input.value);
          });
        }
      })
      .catch(function () {
        meta.textContent = '搜索数据暂时无法加载。';
      });
  }

  const playerCards = document.querySelectorAll('[data-player]');

  playerCards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.add('is-active');
    }, { once: true });
  });
}());
