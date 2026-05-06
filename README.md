# 设计案例库

本地设计灵感收藏工具。纯离线，无网络依赖。

## 功能

- 拖拽 / 文件对话框批量导入图片
- 分类、标签、评分、搜索过滤
- 网格视图 + 分页，支持小/中/大三种尺寸
- 详情弹窗：缩放查看、元数据编辑、标签管理
- 首次启动自动导入 cases/ 目录的种子图片

## 技术栈

- Electron 桌面应用
- 纯 HTML + CSS + JavaScript（无框架，无构建步骤）
- IndexedDB 本地存储（图片元数据 + 缩略图 DataURL）

## 启动

```bash
npm install
npm start
```

## 构建安装包

```bash
npm run build
```

## 数据位置

- 原图：`%APPDATA%/design-case-library/image-library/originals/`
- 元数据 + 缩略图：浏览器 IndexedDB（`design-case-library` 数据库）

## 项目结构

```
electron/
  main.js          — 主进程 + IPC
  preload.js       — contextBridge
app/
  index.html       — 单页入口
  css/             — 样式（自定义属性色板）
  js/
    db.js          — IndexedDB 单例
    thumbnails.js  — Canvas 缩略图
    gallery.js     — 网格 + 分页
    importer.js    — 拖拽导入 + createEntry 工厂
    filters.js     — 侧边栏过滤
    detail.js      — 详情弹窗
    search.js      — 搜索
    app.js         — 入口组装
```
