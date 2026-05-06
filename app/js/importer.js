// importer.js — 拖拽 + 文件对话框导入
const IMAGE_FILE_RE = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;

function createEntry(result, dataUrl, thumb, overrides = {}) {
  return {
    id: result.id,
    filename: result.filename,
    filePath: result.filePath,
    mimeType: dataUrl.split(';')[0].split(':')[1],
    thumbnail: thumb.thumbnail,
    width: thumb.width,
    height: thumb.height,
    title: result.filename.replace(/\.[^.]+$/, ''),
    description: '',
    category: '未分类',
    tags: [],
    rating: 0,
    source: '',
    importedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

const Importer = {
  init() {
    const dropZone = document.getElementById('drop-zone');
    const mainEl = document.getElementById('main');

    // 全 main 区域都可拖拽
    mainEl.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    mainEl.addEventListener('dragleave', (e) => {
      if (!mainEl.contains(e.relatedTarget)) dropZone.classList.remove('drag-over');
    });
    mainEl.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const files = [...e.dataTransfer.files].filter(f => IMAGE_FILE_RE.test(f.name));
      if (files.length) await this.importFiles(files.map(f => f.path));
    });

    // 导入按钮
    document.getElementById('import-btn').addEventListener('click', async () => {
      const paths = await window.electronAPI.openImageFiles();
      if (paths.length) await this.importFiles(paths);
    });
  },

  async importFiles(sourcePaths) {
    let imported = 0;
    for (const src of sourcePaths) {
      try {
        const result = await window.electronAPI.importImage(src);
        const dataUrl = await window.electronAPI.readImageDataUrl(result.filePath);
        const thumb = await Thumbnails.generate(dataUrl);
        await imageDB.putImage(createEntry(result, dataUrl, thumb));
        imported++;
      } catch (err) {
        console.error('Import failed:', src, err);
      }
    }
    if (imported > 0) {
      App.refreshGallery();
      Filters.refresh();
    }
  }
};
