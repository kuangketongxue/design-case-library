const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openImageFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  importImage: (sourcePath) => ipcRenderer.invoke('image:import', sourcePath),
  readImageDataUrl: (filePath) => ipcRenderer.invoke('image:read', filePath),
  deleteImageFile: (filePath) => ipcRenderer.invoke('image:deleteFile', filePath),
  showInFolder: (filePath) => ipcRenderer.invoke('shell:showItemInFolder', filePath),
  getLibraryPath: () => ipcRenderer.invoke('image:getLibraryPath'),
  listSeedFiles: () => ipcRenderer.invoke('seed:listFiles'),
});
