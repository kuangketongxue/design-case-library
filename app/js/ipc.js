// ipc.js — window.electronAPI 封装
const IPC = {
  async openFiles() {
    return window.electronAPI.openImageFiles();
  },
  async importImage(sourcePath) {
    return window.electronAPI.importImage(sourcePath);
  },
  async readImage(filePath) {
    return window.electronAPI.readImageDataUrl(filePath);
  },
  async deleteFile(filePath) {
    return window.electronAPI.deleteImageFile(filePath);
  },
  async showInFolder(filePath) {
    return window.electronAPI.showInFolder(filePath);
  },
  async getLibraryPath() {
    return window.electronAPI.getLibraryPath();
  }
};
