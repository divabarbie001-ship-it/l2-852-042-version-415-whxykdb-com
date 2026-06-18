
(function () {
  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a href="' + movie.url + '" class="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 movie-card">' +
      '<div class="relative h-48 overflow-hidden">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">' +
      '<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>' +
      '<span class="absolute top-3 left-3 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">' + escapeHtml(movie.category) + '</span>' +
      '<span class="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-xs text-white">' + escapeHtml(movie.year) + '</span>' +
      '</div>' +
      '<div class="p-4">' +
      '<h3 class="text-lg font-semibold text-gray-800 group-hover:text-pink-600 transition-colors line-clamp-2 mb-2">' + escapeHtml(movie.title) + '</h3>' +
      '<p class="text-sm text-gray-600 line-clamp-2 mb-3">' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="flex flex-wrap gap-1 mb-3">' + tags + '</div>' +
      '<div class="flex items-center justify-between text-sm text-gray-500"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '</div>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char];
    });
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = document.querySelector('[data-search-input]');
  var title = document.querySelector('[data-search-title]');
  var result = document.querySelector('[data-search-results]');
  if (input) {
    input.value = query;
  }
  if (title) {
    title.textContent = query ? '搜索结果：' + query : '热门影片搜索';
  }
  if (result && window.SEARCH_MOVIES) {
    var key = query.toLowerCase();
    var list = window.SEARCH_MOVIES.filter(function (movie) {
      if (!key) {
        return false;
      }
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine].concat(movie.tags || []).join(' ').toLowerCase();
      return text.indexOf(key) !== -1;
    }).slice(0, 120);
    if (!key) {
      list = window.SEARCH_MOVIES.slice(0, 24);
    }
    result.innerHTML = list.length ? list.map(card).join('') : '<div class="text-center py-20 bg-white rounded-2xl shadow-md"><p class="text-gray-500 text-lg mb-4">未找到相关影片</p><a href="index.html" class="inline-block bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full transition-colors">返回首页</a></div>';
  }
})();
