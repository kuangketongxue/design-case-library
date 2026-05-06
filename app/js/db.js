// db.js — IndexedDB 单例，Phase 2 完整实现
const imageDB = {
  db: null,
  _imagesCache: null,
  DB_NAME: 'design-case-library',
  DB_VERSION: 1,

  async init() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'id' });
          store.createIndex('by-category', 'category', { unique: false });
          store.createIndex('by-rating', 'rating', { unique: false });
          store.createIndex('by-importedAt', 'importedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'name' });
        }
        if (!db.objectStoreNames.contains('collections')) {
          db.createObjectStore('collections', { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
      req.onerror = (e) => reject(e.target.error);
    });
  },

  ensureDB() {
    if (!this.db) throw new Error('imageDB not initialized. Call init() first.');
  },

  invalidateCache() { this._imagesCache = null; },

  async putImage(entry) {
    this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('images', 'readwrite');
      tx.objectStore('images').put(entry);
      tx.oncomplete = () => { this.invalidateCache(); resolve(); };
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async getImage(id) {
    this.ensureDB();
    return new Promise((resolve, reject) => {
      const req = this.db.transaction('images').objectStore('images').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async getAllImages() {
    this.ensureDB();
    if (this._imagesCache) return this._imagesCache;
    return new Promise((resolve, reject) => {
      const req = this.db.transaction('images').objectStore('images').getAll();
      req.onsuccess = () => { this._imagesCache = [...req.result]; resolve(this._imagesCache); };
      req.onerror = (e) => reject(e.target.error);
    });
  },


  async deleteImage(id) {
    this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('images', 'readwrite');
      tx.objectStore('images').delete(id);
      tx.oncomplete = () => { this.invalidateCache(); resolve(); };
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async searchImages(query) {
    const all = await this.getAllImages();
    const q = query.toLowerCase();
    return all.filter(img =>
      (img.title || '').toLowerCase().includes(q) ||
      (img.filename || '').toLowerCase().includes(q) ||
      (img.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (img.category || '').toLowerCase().includes(q)
    );
  },

  async getImagesFiltered({ category, tag, sortBy = 'importedAt', sortOrder = 'desc', page = 1, pageSize = 50, query = '' }) {
    let items = query ? await this.searchImages(query) : await this.getAllImages();
    if (category) items = items.filter(i => i.category === category);
    if (tag) items = items.filter(i => (i.tags || []).includes(tag));
    const normalize = sortBy === 'rating' ? v => v || 0
      : sortBy === 'title' ? v => (v || '').toLowerCase()
      : v => v;
    const dir = sortOrder === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      const va = normalize(a[sortBy]), vb = normalize(b[sortBy]);
      return va < vb ? -dir : va > vb ? dir : 0;
    });
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total, page, pageSize };
  },

  async getAllTags() {
    this.ensureDB();
    return new Promise((resolve, reject) => {
      const req = this.db.transaction('tags').objectStore('tags').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async saveTag(tag) {
    this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('tags', 'readwrite');
      tx.objectStore('tags').put(tag);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async deleteTag(name) {
    this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('tags', 'readwrite');
      tx.objectStore('tags').delete(name);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async getCategories() {
    const all = await this.getAllImages();
    const map = {};
    all.forEach(img => {
      const cat = img.category || '未分类';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },

  async getAllTagsFromImages() {
    const all = await this.getAllImages();
    const map = {};
    all.forEach(img => {
      (img.tags || []).forEach(t => { map[t] = (map[t] || 0) + 1; });
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
};
