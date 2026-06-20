
(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const root = document.querySelector('[data-filter-root]');

  if (root) {
    const input = root.querySelector('[data-filter-input]');
    const selects = Array.from(root.querySelectorAll('[data-filter-select]'));
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const empty = document.querySelector('[data-filter-empty]');

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const applyFilters = function () {
      const keyword = normalize(input ? input.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.category,
          card.dataset.tags
        ].join(' '));
        let matched = !keyword || text.includes(keyword);

        selects.forEach(function (select) {
          const key = select.dataset.filterSelect;
          const value = normalize(select.value);
          if (value && normalize(card.dataset[key]) !== value) {
            matched = false;
          }
        });

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  }

  const playerShell = document.querySelector('[data-player]');

  if (playerShell) {
    const video = playerShell.querySelector('video');
    const playButton = playerShell.querySelector('[data-play-button]');
    const playUrl = playerShell.dataset.playUrl;
    let hlsInstance = null;
    let ready = false;

    const attachVideo = function () {
      if (!video || !playUrl || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(playUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playUrl;
      }

      ready = true;
    };

    const startPlayback = function () {
      attachVideo();
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      if (video) {
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }
    };

    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      });
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          startPlayback();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  const searchResults = document.querySelector('[data-search-results]');

  if (searchResults && window.SEARCH_ITEMS) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const title = document.querySelector('[data-search-title]');
    const desc = document.querySelector('[data-search-desc]');
    const empty = document.querySelector('[data-search-empty]');
    const input = document.querySelector('[data-search-input]');

    if (input) {
      input.value = query;
    }

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const makeCard = function (item) {
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const firstTag = tags[0] ? '<span class="card-tag">' + escapeHtml(tags[0]) + '</span>' : '';
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + escapeAttr(item.url) + '" aria-label="' + escapeAttr(item.title) + '">' +
        '<img src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy" />' +
        '<span class="duration">' + escapeHtml(item.duration) + '</span>' +
        '<span class="category-badge">' + escapeHtml(item.category) + '</span>' +
        '<span class="score-badge">★ ' + escapeHtml(item.score) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<h3><a href="' + escapeAttr(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<div class="card-tags">' + firstTag + '<span>' + escapeHtml(item.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    };

    const pool = window.SEARCH_ITEMS;
    const results = query ? pool.filter(function (item) {
      const haystack = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.category,
        item.oneLine,
        Array.isArray(item.tags) ? item.tags.join(' ') : ''
      ].join(' '));
      return haystack.includes(normalize(query));
    }) : pool.slice(0, 24);

    searchResults.innerHTML = results.slice(0, 96).map(makeCard).join('');

    if (title) {
      title.textContent = query ? '搜索结果：' + query : '推荐影片';
    }

    if (desc) {
      desc.textContent = query ? '为你匹配到相关影视内容。' : '输入关键词后可快速筛选片库内容。';
    }

    if (empty) {
      empty.hidden = results.length > 0;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }
})();
