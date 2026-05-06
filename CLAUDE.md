# 设计案例库 — 本地设计灵感收藏工具

## 技术栈
- Electron 桌面应用（纯本地，无网络依赖）
- 纯 HTML + CSS + JavaScript（无框架，无构建步骤）
- IndexedDB 本地存储（图片元数据 + 缩略图 DataURL）

## 项目结构
```
electron/
  main.js               — Electron 主进程 + IPC 文件操作
  preload.js            — contextBridge 暴露安全 API
app/
  index.html            — 单页入口
  css/
    variables.css       — 色板、间距、字体自定义属性
    layout.css          — 侧边栏 + 网格 + 弹窗布局
    components.css      — 卡片、标签、按钮、弹窗样式
  js/
    db.js               — IndexedDB 单例（images/tags/collections）
    thumbnails.js       — Canvas 缩略图生成
    gallery.js          — 网格视图 + 分页
    importer.js         — 拖拽 + 文件对话框导入
    filters.js          — 侧边栏过滤/标签逻辑
    detail.js           — 详情弹窗 + 缩放
    search.js           — 搜索
    app.js              — 入口，组装所有模块
```

## 核心命令
- `npm start` — 启动 Electron 桌面应用
- `npm run build` — 构建安装包（electron-builder）

## 架构要点
- Electron loadFile() 直接加载 app/index.html，无 HTTP 服务器
- 图片导入时复制到 app.getPath('userData')/image-library/originals/
- 缩略图由 Canvas 生成，DataURL 存入 IndexedDB（每张 ~5-20KB）
- IndexedDB 3 个 store：images、tags、collections
- tags[] 反规范化存于 image 记录，加速过滤；独立 tags store 管理标签
- contextIsolation: true, nodeIntegration: false

## 注意事项
- 不要往代码里放密钥/token
- 图片元数据存在 IndexedDB，原图文件存在 app-data 目录
- CSS 无框架，用自定义属性维护色板
