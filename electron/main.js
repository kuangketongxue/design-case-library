const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

app.disableHardwareAcceleration();

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
const IMAGE_EXT_RE = new RegExp(`\\.(${IMAGE_EXTENSIONS.join('|')})$`, 'i');
const MIME_MAP = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml'
};

const LIBRARY_ROOT = path.join(app.getPath('userData'), 'image-library');
const ORIGINALS_DIR = path.join(LIBRARY_ROOT, 'originals');

async function ensureDirs() {
  await fs.mkdir(ORIGINALS_DIR, { recursive: true });
}

function registerIPC() {
  ipcMain.handle('dialog:openFiles', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: IMAGE_EXTENSIONS }]
    });
    return result.canceled ? [] : result.filePaths;
  });

  ipcMain.handle('image:import', async (_event, sourcePath) => {
    const ext = path.extname(sourcePath).toLowerCase();
    const id = crypto.randomUUID();
    const destPath = path.join(ORIGINALS_DIR, `${id}${ext}`);
    await fs.copyFile(sourcePath, destPath);
    return { id, filePath: destPath, filename: path.basename(sourcePath) };
  });

  ipcMain.handle('image:read', async (_event, filePath) => {
    try {
      const buf = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME_MAP[ext] || 'application/octet-stream';
      return `data:${mime};base64,${buf.toString('base64')}`;
    } catch {
      return null;
    }
  });

  ipcMain.handle('image:deleteFile', async (_event, filePath) => {
    try { await fs.unlink(filePath); return true; } catch { return false; }
  });

  ipcMain.handle('shell:showItemInFolder', (_event, filePath) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle('image:getLibraryPath', () => LIBRARY_ROOT);

  ipcMain.handle('seed:listFiles', async () => {
    const casesDir = path.join(__dirname, '..', 'cases');
    try {
      const files = await fs.readdir(casesDir);
      return files.filter(f => IMAGE_EXT_RE.test(f)).map(f => path.join(casesDir, f));
    } catch {
      return [];
    }
  });
}

let mainWindow = null;

app.whenReady().then(async () => {
  await ensureDirs();
  registerIPC();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: '设计案例库',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'app', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
});

app.on('window-all-closed', () => {
  app.quit();
});
