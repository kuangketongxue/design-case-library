// filters.js — 侧边栏分类 + 标签过滤
const Filters = {
  activeCategory: null,
  activeTag: null,

  async refresh() {
    await Promise.all([this.renderCategories(), this.renderTags()]);
  },

  async renderCategories() {
    const list = document.getElementById('category-list');
    const categories = await imageDB.getCategories();
    const allImages = await imageDB.getAllImages();
    list.textContent = '';

    // 全部
    const allLi = document.createElement('li');
    if (!this.activeCategory) allLi.className = 'active';
    const allText = document.createElement('span');
    allText.textContent = '全部图片';
    const allCount = document.createElement('span');
    allCount.className = 'cat-count';
    allCount.textContent = String(allImages.length);
    allLi.append(allText, allCount);
    allLi.addEventListener('click', () => { Filters.activeCategory = null; Filters.apply(); });
    list.appendChild(allLi);

    categories.forEach(cat => {
      const li = document.createElement('li');
      if (Filters.activeCategory === cat.name) li.className = 'active';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = cat.name;
      const countSpan = document.createElement('span');
      countSpan.className = 'cat-count';
      countSpan.textContent = String(cat.count);
      li.append(nameSpan, countSpan);
      li.addEventListener('click', () => { Filters.activeCategory = cat.name; Filters.apply(); });
      list.appendChild(li);
    });
  },

  async renderTags() {
    const cloud = document.getElementById('tag-cloud');
    const tags = await imageDB.getAllTagsFromImages();
    cloud.textContent = '';
    tags.slice(0, 20).forEach(t => {
      const el = document.createElement('span');
      el.className = 'tag' + (Filters.activeTag === t.name ? ' active' : '');
      el.textContent = t.name + ' (' + t.count + ')';
      el.addEventListener('click', () => {
        Filters.activeTag = Filters.activeTag === t.name ? null : t.name;
        Filters.apply();
      });
      cloud.appendChild(el);
    });
  },

  apply() {
    document.getElementById('search-input').value = '';
    this.refresh();
    App.refreshGallery();
  },

  getFilter() {
    return { category: this.activeCategory, tag: this.activeTag };
  }
};
