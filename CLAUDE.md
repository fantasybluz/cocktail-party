# 超商調酒拉霸機（cocktail-party）

https://drunk.bluz.dev ：像素風的聚會小工具，調酒拉霸機 + 20 個喝酒遊戲 + 3 個聚會工具。React 19 + TypeScript + Vite 的靜態網站，
沒有後端，資料存在手機的 localStorage，放在 Cloudflare Pages（舊網址 GitHub Pages 只放轉址頁）。
先讀 [docs/README.md](docs/README.md)，架構在 [docs/architecture.md](docs/architecture.md)，部署在 [docs/setup.md](docs/setup.md)。

## 指令

- `npm run dev`：http://localhost:5173/
- `npm test`：Vitest（資料完整性、遊戲規則、更新紀錄、文件檢查 `docs/docs.test.ts`）
- `npm run lint`、`npm run lint:css`、`npm run build`（含 `tsc -b`）
- commit 前這四個都要過（CI 也是跑這四個，沒過就不部署）
- `npm run deploy`：筆電直接部署到 Cloudflare Pages（Cloudflare secret 還沒設時用）

## 改程式時，同一個 commit 要一起改的

| 改了什麼 | 要改 |
|---|---|
| 新遊戲、改遊戲名稱 | `src/data/games.ts` 的 `GAME_LIST`、`App.tsx` 接元件、README「喝酒遊戲」的表（測試會比對）；要不要離開就停止（`UNMOUNT_WHEN_HIDDEN`） |
| 新的聚會工具 | `TOOL_LIST`，README 提到它（測試會檢查） |
| 新的 localStorage key | 一律 `mix-slot-` 開頭、經過 `src/lib/storage.ts`，`docs/architecture.md` 的表加一列（測試會檢查） |
| 酒譜、品項、採買組合 | `src/data/`，README 的在家玩段落 |
| 玩家看得到的改動 | `CHANGELOG.md` 的「## 未發佈」 |
| 部署、網域、secret | `docs/setup.md` |
| 重要的技術選擇 | `docs/decisions/` 新增一份 ADR |
| 發版 | 照 [RELEASING.md](RELEASING.md)：改 `VERSION`、改 CHANGELOG 標題、推 `v*` 標籤 |

## 慣例

- 註解、文件、畫面文字用繁體中文；commit 訊息用中文，一行摘要，發版的 commit 結尾加（vX.Y.Z）
- 手機優先：在 393px 寬看過，LINE 內建瀏覽器要能用（不能分享檔案、上一頁要正常）
- 頁面用 `#` 切換（`src/lib/router.ts`），不要改成一般路徑（已分享的連結都是 `#`）
- 遊戲規則寫成純函式（`src/games/*.ts`）並加測試，元件只管畫面
- 分享圖用 `src/lib/shareImage.ts` 的色票和字型，字級用 12 的倍數；圖上要有網址和「禁止酒駕・飲酒過量，有害健康」
- 喝酒相關的提醒（喝水、不開車、未滿 18 歲、成人題庫要先確認）不要拿掉
- CSS：class 用 BEM（`block__element--modifier`，Stylelint 會檢查），顏色用 `src/styles/base.css` 的變數
