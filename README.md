# TRPG Game 🎲

一個可以在網頁和手機上遊玩的 TRPG（桌上角色扮演遊戲）。

## 技術架構

- **前端**: React + Vite + TypeScript (PWA)
- **後端**: Express + Socket.IO
- **共用**: TypeScript monorepo (npm workspaces)

## 專案結構

```
trpg-game/
├── packages/
│   ├── shared/     # 共用型別、遊戲規則引擎、預設資料
│   ├── server/     # Express + Socket.IO 後端
│   └── client/     # React + Vite PWA 前端
├── package.json    # monorepo 設定
└── tsconfig.json   # TypeScript 基礎設定
```

## 遊戲功能

- 🎲 骰子系統 (d4, d6, d8, d10, d12, d20, d100)
- ⚔️ 回合制戰鬥系統
- 👤 角色建立與升級
- 🗺️ 場景探索與選擇
- 💬 即時聊天
- 📱 PWA 支援（手機可安裝為 App）

## 安裝與編譯

```bash
npm install
npm run build
```

## 開發

```bash
# 啟動後端
npm run dev:server

# 啟動前端
npm run dev:client
```

## 個別編譯

```bash
npm run build:shared
npm run build:server
npm run build:client
```
