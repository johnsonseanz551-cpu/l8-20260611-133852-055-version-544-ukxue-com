(function () {
  const form = document.querySelector('[data-search-form]');
  const input = form ? form.querySelector('input[name="q"]') : null;
  const title = document.querySelector('[data-search-title]');
  const results = document.querySelector('[data-search-results]');

  if (!form || !input || !results || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    return `
<article class="movie-card" data-movie-card>
  <a class="poster-link" href="${escapeHtml(movie.url)}" aria-label="观看${escapeHtml(movie.title)}">
    <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="poster-badge">${escapeHtml(movie.year)}</span>
  </a>
  <div class="movie-card-body">
    <div class="card-meta">
      <span>${escapeHtml(movie.region)}</span>
      <span>${escapeHtml(movie.type)}</span>
    </div>
    <h2><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h2>
    <p>${escapeHtml(movie.oneLine)}</p>
    <div class="chip-row">${movie.tags.slice(0, 4).map(function (tag) { return `<span>${escapeHtml(tag)}</span>`; }).join('')}</div>
  </div>
</article>`;
  }

  function search(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return window.MOVIE_SEARCH_INDEX.slice(0, 24);
    }
    return window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      return movie.searchText.indexOf(normalized) !== -1;
    }).slice(0, 120);
  }

  function render(query) {
    const matched = search(query);
    if (title) {
      title.textContent = query ? `“${query}” 的搜索结果` : '热门内容';
    }
    results.innerHTML = matched.length
      ? matched.map(card).join('')
      : '<div class="content-card"><h2>暂无匹配内容</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p></div>';
  }

  function syncFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    input.value = query;
    render(query);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = input.value.trim();
    const url = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
    window.history.pushState({}, '', url);
    render(query);
  });

  window.addEventListener('popstate', syncFromUrl);
  syncFromUrl();
})();
