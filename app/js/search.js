// search.js — 搜索
const Search = {
  debounceTimer: null,

  init() {
    const input = document.getElementById('search-input');
    input.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        Filters.activeCategory = null;
        Filters.activeTag = null;
        App.refreshGallery();
      }, 250);
    });
  },

  getQuery() {
    return document.getElementById('search-input').value.trim();
  }
};
