// gallery.js — 网格视图 + 分页
const Gallery = {
  pageSize: 50,
  currentPage: 1,
  currentSize: 'medium',

  init() {
    const el = document.getElementById('gallery');
    el.classList.add('size-medium');

    document.querySelectorAll('.grid-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.grid-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSize = btn.dataset.size;
        el.className = 'gallery size-' + this.currentSize;
      });
    });
  },

  async render(data) {
    const gallery = document.getElementById('gallery');
    const pagination = document.getElementById('pagination');
    gallery.textContent = '';

    if (!data.items.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const icon = document.createElement('div');
      icon.className = 'empty-icon';
      icon.textContent = '📭';
      const text = document.createElement('p');
      text.className = 'empty-text';
      text.textContent = '没有找到图片';
      empty.append(icon, text);
      gallery.appendChild(empty);
      pagination.textContent = '';
      return;
    }

    data.items.forEach(img => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.id = img.id;

      const imgEl = document.createElement('img');
      imgEl.className = 'card-img';
      imgEl.src = img.thumbnail || '';
      imgEl.alt = img.title || img.filename;
      imgEl.loading = 'lazy';

      const overlay = document.createElement('div');
      overlay.className = 'card-overlay';

      const title = document.createElement('span');
      title.className = 'card-title';
      title.textContent = img.title || img.filename;

      const rating = document.createElement('span');
      rating.className = 'card-rating';
      rating.textContent = '★'.repeat(img.rating || 0) + '☆'.repeat(5 - (img.rating || 0));

      overlay.append(title, rating);
      card.append(imgEl, overlay);
      card.addEventListener('click', () => Detail.open(img.id));
      gallery.appendChild(card);
    });

    this.renderPagination(data);
  },

  renderPagination(data) {
    const el = document.getElementById('pagination');
    const totalPages = Math.ceil(data.total / data.pageSize);
    if (totalPages <= 1) { el.textContent = ''; return; }

    el.textContent = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-icon' + (i === data.page ? ' active' : '');
      btn.textContent = String(i);
      btn.dataset.page = i;
      btn.addEventListener('click', () => {
        Gallery.currentPage = parseInt(btn.dataset.page);
        App.refreshGallery();
      });
      el.appendChild(btn);
    }
  }
};
