// app.js — 入口，组装所有模块
const App = {
  async init() {
    await imageDB.init();

    // 首次启动：自动导入 cases/ 里的种子图片
    const existing = await imageDB.getAllImages();
    if (existing.length === 0) {
      await this.importSeedImages();
    }

    Gallery.init();
    Importer.init();
    Detail.init();
    Search.init();

    document.getElementById('sort-select').addEventListener('change', () => this.refreshGallery());

    await this.refreshGallery();
    await Filters.refresh();
  },

  async importSeedImages() {
    try {
      const files = await window.electronAPI.listSeedFiles();
      if (!files || !files.length) return;
      for (const src of files) {
        const result = await IPC.importImage(src);
        const dataUrl = await IPC.readImage(result.filePath);
        const thumb = await Thumbnails.generate(dataUrl);
        const entry = {
          id: result.id,
          filename: result.filename,
          filePath: result.filePath,
          mimeType: dataUrl.split(';')[0].split(':')[1],
          thumbnail: thumb.thumbnail,
          width: thumb.width,
          height: thumb.height,
          title: result.filename.replace(/\.[^.]+$/, '').replace(/^\d+-/, ''),
          description: '',
          category: '配色参考',
          tags: ['渐变', '配色'],
          rating: 3,
          source: '',
          importedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await imageDB.addImage(entry);
      }
    } catch (err) {
      console.error('Seed import failed:', err);
    }
  },

  async refreshGallery() {
    const sort = document.getElementById('sort-select').value.split('-');
    const filter = Filters.getFilter();
    const data = await imageDB.getImagesFiltered({
      category: filter.category,
      tag: filter.tag,
      sortBy: sort[0],
      sortOrder: sort[1],
      page: Gallery.currentPage,
      pageSize: Gallery.pageSize,
      query: Search.getQuery()
    });

    const appEl = document.getElementById('app');
    const total = data.total;
    if (total > 0) {
      appEl.classList.add('has-images');
    } else {
      appEl.classList.remove('has-images');
    }

    const filterLabel = document.getElementById('filter-label');
    if (Search.getQuery()) {
      filterLabel.textContent = '搜索: "' + Search.getQuery() + '"';
    } else if (filter.tag) {
      filterLabel.textContent = '标签: ' + filter.tag;
    } else if (filter.category) {
      filterLabel.textContent = filter.category;
    } else {
      filterLabel.textContent = '全部图片';
    }

    document.getElementById('stats').textContent = '共 ' + total + ' 张图片';
    await Gallery.render(data);
  }
};

App.init().catch(err => console.error('App init failed:', err));
