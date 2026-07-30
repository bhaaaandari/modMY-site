document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // ---------------------------------------------------------
  // Site search
  // ---------------------------------------------------------
  var input = document.getElementById('searchInput');
  var resultsBox = document.getElementById('searchResults');
  var index = window.MODMY_SEARCH_INDEX || [];
  var activeIndex = -1;
  var currentMatches = [];

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderResults(matches, query) {
    if (!matches.length) {
      resultsBox.innerHTML = '<div class="search-empty">No results for &ldquo;' + escapeHtml(query) + '&rdquo;</div>';
      resultsBox.hidden = false;
      return;
    }
    resultsBox.innerHTML = matches.map(function (item, i) {
      var href = item.page + (item.id ? '#' + item.id : '');
      return '<a class="search-result" href="' + href + '" data-index="' + i + '">' +
        '<span class="sr-section">' + escapeHtml(item.section) + '</span>' +
        '<span class="sr-title">' + escapeHtml(item.title) + '</span>' +
        '<span class="sr-desc">' + escapeHtml(item.desc) + '</span>' +
        '</a>';
    }).join('');
    resultsBox.hidden = false;
  }

  function runSearch(query) {
    query = query.trim().toLowerCase();
    activeIndex = -1;
    if (!query) {
      resultsBox.hidden = true;
      resultsBox.innerHTML = '';
      currentMatches = [];
      return;
    }
    currentMatches = index.filter(function (item) {
      return item.title.toLowerCase().indexOf(query) !== -1 ||
             item.desc.toLowerCase().indexOf(query) !== -1 ||
             item.section.toLowerCase().indexOf(query) !== -1;
    }).slice(0, 8);
    renderResults(currentMatches, query);
  }

  if (input && resultsBox) {
    input.addEventListener('input', function () { runSearch(input.value); });
    input.addEventListener('focus', function () { if (input.value.trim()) runSearch(input.value); });

    input.addEventListener('keydown', function (e) {
      var items = resultsBox.querySelectorAll('.search-result');
      if (!items.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          window.location.href = items[activeIndex].getAttribute('href');
        }
        return;
      } else if (e.key === 'Escape') {
        resultsBox.hidden = true;
        input.blur();
        return;
      } else {
        return;
      }
      items.forEach(function (el, i) { el.classList.toggle('is-active', i === activeIndex); });
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    });

    document.addEventListener('click', function (e) {
      if (!document.getElementById('siteSearch').contains(e.target)) {
        resultsBox.hidden = true;
      }
    });
  }

  // ---------------------------------------------------------
  // On arrival via a search result: scroll to and highlight the target
  // ---------------------------------------------------------
  if (window.location.hash) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('search-highlight-target');
        setTimeout(function () { target.classList.remove('search-highlight-target'); }, 2000);
      }, 80);
    }
  }
});
