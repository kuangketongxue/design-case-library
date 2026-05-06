const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { existsSync, statSync } = require('fs');

app.disableHardwareAcceleration();

const LIBRARY_ROOT = path.join(app.getPath('userData'), 'image-library');
const ORIGINALS_DIR = path.join(LIBRARY_ROOT, 'originals');

async function ensureDirs() {
  await fs.mkdir(ORIGINALS_DIR, { recursive: true });
}

function registerIPC() {
  // 打开文件对话框
  ipcMain.handle('dialog:openFiles', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] }
      ]
    });
    return result.canceled ? [] : result.filePaths;
  });

  // 复制图片到应用目录
  ipcMain.handle('image:import', async (_event, sourcePath) => {
    const ext = path.extname(sourcePath).toLowerCase();
    const id = crypto.randomUUID();
    const destName = `${id}${ext}`;
    const destPath = path.join(ORIGINALS_DIR, destName);
    await fs.copyFile(sourcePath, destPath);
    return { id, filePath: destPath, filename: path.basename(sourcePath) };
  });

  // 读取图片返回 base64
  ipcMain.handle('image:read', async (_event, filePath) => {
    try {
      const buf = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
                     '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp',
                     '.svg': 'image/svg+xml' }[ext] || 'application/octet-stream';
      return `data:${mime};base64,${buf.toString('base64')}`;
    } catch {
      return null;
    }
  });

  // 删除图片文件
  ipcMain.handle('image:deleteFile', async (_event, filePath) => {
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  });

  // 在资源管理器中显示
  ipcMain.handle('shell:showItemInFolder', (_event, filePath) => {
    shell.showItemInFolder(filePath);
  });

  // 获取图片库路径
  ipcMain.handle('image:getLibraryPath', () => LIBRARY_ROOT);

  // 列出种子图片（cases/ 目录）
  ipcMain.handle('seed:listFiles', async () => {
    const casesDir = path.join(__dirname, '..', 'cases');
    try {
      const files = await fs.readdir(casesDir);
      return files
        .filter(f => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(f))
        .map(f => path.join(casesDir, f));
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
