(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
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

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panelElement) {
    const keyword = panelElement.querySelector('[data-filter-keyword]');
    const type = panelElement.querySelector('[data-filter-type]');
    const year = panelElement.querySelector('[data-filter-year]');
    const section = panelElement.closest('section');
    const cards = section ? Array.from(section.querySelectorAll('[data-movie-card]')) : [];

    function matchesYear(cardYear, selectedYear) {
      if (!selectedYear) {
        return true;
      }
      const parsedYear = Number(cardYear || 0);
      if (selectedYear === '2020') {
        return parsedYear <= 2020;
      }
      return parsedYear === Number(selectedYear);
    }

    function applyFilter() {
      const keywordValue = (keyword && keyword.value ? keyword.value : '').trim().toLowerCase();
      const typeValue = type && type.value ? type.value : '';
      const yearValue = year && year.value ? year.value : '';

      cards.forEach(function (card) {
        const searchable = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.year
        ].join(' ').toLowerCase();
        const typeMatches = !typeValue || (card.dataset.type || '').indexOf(typeValue) !== -1 || (card.dataset.genre || '').indexOf(typeValue) !== -1;
        const keywordMatches = !keywordValue || searchable.indexOf(keywordValue) !== -1;
        const yearMatches = matchesYear(card.dataset.year, yearValue);
        card.classList.toggle('is-hidden', !(typeMatches && keywordMatches && yearMatches));
      });
    }

    [keyword, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
