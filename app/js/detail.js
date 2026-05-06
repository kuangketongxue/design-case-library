// detail.js — 详情弹窗 + 缩放
const Detail = {
  currentImage: null,
  zoom: 1,

  init() {
    document.getElementById('modal-close').addEventListener('click', () => this.close());
    document.getElementById('detail-modal').addEventListener('click', (e) => {
      if (e.target.id === 'detail-modal') this.close();
    });

    document.getElementById('zoom-in').addEventListener('click', () => this.setZoom(this.zoom + 0.25));
    document.getElementById('zoom-out').addEventListener('click', () => this.setZoom(this.zoom - 0.25));
    document.getElementById('zoom-reset').addEventListener('click', () => this.setZoom(1));

    document.getElementById('btn-delete-image').addEventListener('click', () => this.confirmDelete());
    document.getElementById('btn-show-in-folder').addEventListener('click', () => {
      if (this.currentImage) window.electronAPI.showInFolder(this.currentImage.filePath);
    });

    // 评分
    const ratingEl = document.getElementById('info-rating');
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.textContent = '★';
      star.dataset.value = i;
      star.addEventListener('click', () => this.setRating(i));
      ratingEl.appendChild(star);
    }

    // 保存元数据
    ['info-title', 'info-description', 'info-source'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => this.saveMetadata());
    });
    document.getElementById('info-category').addEventListener('change', () => this.saveMetadata());

    // 标签编辑
    this.initTagEditor();

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },

  initTagEditor() {
    const editor = document.getElementById('info-tags');
    const input = document.createElement('input');
    input.className = 'tag-editor-input';
    input.placeholder = '输入标签，回车确认';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const tag = input.value.trim();
        if (!this.currentImage.tags.includes(tag)) {
          this.currentImage.tags.push(tag);
          this.renderTagChips();
          this.saveMetadata();
        }
        input.value = '';
      }
    });
    editor.appendChild(input);
  },

  renderTagChips() {
    const editor = document.getElementById('info-tags');
    editor.querySelectorAll('.tag').forEach(t => t.remove());
    const input = editor.querySelector('.tag-editor-input');
    (this.currentImage.tags || []).forEach(tag => {
      const el = document.createElement('span');
      el.className = 'tag tag-removable';
      const text = document.createTextNode(tag + ' ');
      const remove = document.createElement('span');
      remove.className = 'tag-remove';
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        Detail.currentImage.tags = Detail.currentImage.tags.filter(t => t !== tag);
        Detail.renderTagChips();
        Detail.saveMetadata();
      });
      el.append(text, remove);
      editor.insertBefore(el, input);
    });
  },

  async open(imageId) {
    this.currentImage = await imageDB.getImage(imageId);
    if (!this.currentImage) return;

    this.zoom = 1;
    const modal = document.getElementById('detail-modal');
    const img = document.getElementById('modal-image');

    const dataUrl = await window.electronAPI.readImageDataUrl(this.currentImage.filePath);
    img.src = dataUrl || this.currentImage.thumbnail;
    img.style.transform = '';

    document.getElementById('info-title').value = this.currentImage.title || '';
    document.getElementById('info-description').value = this.currentImage.description || '';
    document.getElementById('info-source').value = this.currentImage.source || '';
    document.getElementById('info-dimensions').textContent =
      this.currentImage.width + ' × ' + this.currentImage.height;
    document.getElementById('info-date').textContent =
      new Date(this.currentImage.importedAt).toLocaleDateString('zh-CN');

    const catSelect = document.getElementById('info-category');
    catSelect.textContent = '';
    const categories = await imageDB.getCategories();
    const catNames = categories.map(c => c.name);
    if (this.currentImage.category && !catNames.includes(this.currentImage.category)) {
      catNames.unshift(this.currentImage.category);
    }
    catNames.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      if (c === this.currentImage.category) opt.selected = true;
      catSelect.appendChild(opt);
    });

    this.renderRating(this.currentImage.rating || 0);
    this.renderTagChips();
    modal.hidden = false;
  },

  close() {
    document.getElementById('detail-modal').hidden = true;
    this.currentImage = null;
  },

  setZoom(z) {
    this.zoom = Math.max(0.25, Math.min(4, z));
    document.getElementById('modal-image').style.transform = 'scale(' + this.zoom + ')';
  },

  renderRating(val) {
    document.querySelectorAll('#info-rating .star').forEach(star => {
      star.classList.toggle('filled', parseInt(star.dataset.value) <= val);
    });
  },

  setRating(val) {
    if (!this.currentImage) return;
    this.currentImage.rating = val;
    this.renderRating(val);
    this.saveMetadata();
  },

  _saveTimer: null,

  saveMetadata() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(async () => {
      if (!this.currentImage) return;
      this.currentImage.title = document.getElementById('info-title').value;
      this.currentImage.description = document.getElementById('info-description').value;
      this.currentImage.source = document.getElementById('info-source').value;
      this.currentImage.category = document.getElementById('info-category').value;
      this.currentImage.updatedAt = new Date().toISOString();
      await imageDB.putImage(this.currentImage);
      App.refreshGallery();
      Filters.refresh();
    }, 300);
  },

  confirmDelete() {
    const dialog = document.getElementById('confirm-dialog');
    dialog.hidden = false;
    document.getElementById('confirm-cancel').onclick = () => { dialog.hidden = true; };
    document.getElementById('confirm-ok').onclick = async () => {
      dialog.hidden = true;
      if (Detail.currentImage) {
        await window.electronAPI.deleteImageFile(Detail.currentImage.filePath);
        await imageDB.deleteImage(Detail.currentImage.id);
        Detail.close();
        App.refreshGallery();
        Filters.refresh();
      }
    };
  }
};
