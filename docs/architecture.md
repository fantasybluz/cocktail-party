# 架構

## 整體

```
手機瀏覽器（常常是 LINE 內建瀏覽器）
   │  https://drunk.bluz.dev
   ▼
Cloudflare Pages 專案「cocktail-party」── dist/（Vite 建出來的靜態檔）
   └─ 全部在瀏覽器裡跑：沒有後端、沒有 API、資料存在這支手機的 localStorage
        └─ 只對外連：GoatCounter（瀏覽人數）、line.me 的分享網址

https://fantasybluz.github.io/cocktail-party/（GitHub Pages）── 只放轉址頁 → drunk.bluz.dev 的同一個地方
```

- React 19 + TypeScript + Vite 8 的單頁應用，`npm run build` 輸出到 `dist/`（[ADR 0001](decisions/0001-react-vite-rewrite.md)）
- 一支手機大家輪流用，不用登入、不用連線；記分板、喝酒紀錄只存在那支手機
- 字型是俐方體 11 號（Cubic 11，`src/assets/fonts/`），像素圖是 16×16 的圖樣（`src/lib/sprites.ts`）

| 資料夾 | 內容 |
|---|---|
| `src/App.tsx` | 依網址的 `#` 決定顯示哪一頁、記分板名單和喝酒紀錄的狀態、爆炸畫面、記一杯的選人視窗 |
| `src/party.ts` | 遊戲共用動作的 context（`PartyContext`）：輸家去轉拉霸機、記一杯、爆炸畫面、跳到真心話大冒險 |
| `src/data/` | `drinks.ts`（轉輪品項、酒譜、惡魔模式）、`games.ts`（遊戲列表、題庫）、`shopping.ts`（在家玩的採買組合） |
| `src/slot/` | 調酒拉霸機：轉輪、酒譜卡片、挑酒譜（`recipes.ts`）、在家玩指南（`HomeGuide.tsx`）、分享到 LINE（`share.ts`） |
| `src/games/` | 20 個遊戲，一個遊戲一個元件；規則邏輯拆成純函式（`cards.ts`、`dice.ts`、`board.ts`、`stopTen.ts`、`memory.ts`、`pirate.ts`、`reaction.ts`）方便測試 |
| `src/tools/` | 聚會工具：記分板、派對結算（`summary.ts` 算獎項）、分組點名；更新紀錄頁 |
| `src/components/` | 共用元件：像素圖、骰子、撲克牌、結果、加減器、底部切換列、頁尾、存成圖片按鈕 |
| `src/lib/` | 網址切換（`router.ts`）、localStorage（`storage.ts`）、音效、亂數、像素圖樣、分享圖、版號、更新紀錄、瀏覽人數 |
| `src/styles/base.css` | 色票、字型、按鈕、液晶螢幕等共用樣式；各區的樣式在 `slot/slot.css`、`games/games.css` |
| `scripts/build-redirect.mjs` | 產生 GitHub Pages 舊網址的轉址頁（`redirect-dist/`） |

## 頁面和網址

- 用網址的 `#` 切換頁面（`src/lib/router.ts` 的 `useHashRoute`、`navigate`），例如 `#spy`、`#scoreboard`
  （[ADR 0002](decisions/0002-hash-routing.md)）
- 可以用的頁面在 `App.tsx` 的 `VIEWS`：`slot`（預設）、`guide`（在家玩指南）、`changelog`、`games`（遊戲列表），
  加上 `GAME_LIST` 的 20 個遊戲 id 和 `TOOL_LIST` 的 3 個工具 id（`scoreboard`、`summary`、`teams`）。不認得的 `#` 顯示拉霸機
- 底部切換列只有兩個：調酒拉霸機、喝酒遊戲
- 跟時間、手指有關的遊戲（`UNMOUNT_WHEN_HIDDEN`：懲罰轉盤、傳手機炸彈、命運手指、頭上猜詞、你畫我猜、分組點名、
  停在 10 秒、反應力大考驗、記憶挑戰、瘋狂海盜桶）離開就卸載，計時跟著停；其他頁切走再回來保留進度

## 存在手機上的資料

都經過 `src/lib/storage.ts`：無痕模式、封鎖網站資料時讀不到或寫不進去，一律退回預設值，不會壞掉。

| key | 內容 |
|---|---|
| `mix-slot-roster` | 記分板名單：名字、杯數、喝水次數 |
| `mix-slot-log` | 每一杯的紀錄：誰、什麼時候、哪一頁、原因（炸彈／挑戰失敗／遊戲輸了／拉霸機／其他），還有喝水；派對結算從這裡算 |
| `mix-slot-adult` | 成人題庫開關 |
| `mix-slot-seen-version` | 看過的版號（NEW 用） |
| `mix-slot-sound` | 音效開關 |
| `mix-slot-wheel`、`mix-slot-hot-potato-length`、`mix-slot-memory-best` | 懲罰轉盤的選項、傳手機炸彈的長度、記憶挑戰的最高紀錄 |

key 開頭是 `mix-slot-`（最早的名字），改名會讓大家手機上的名單不見，不要改。

## 版號、更新紀錄

- `VERSION` 是版號；`vite.config.ts` 建置時把它、commit（`GITHUB_SHA` 或 `git rev-parse --short HEAD`）、建置日期
  寫進 `__APP_VERSION__`、`__BUILD_SHA__`、`__BUILD_DATE__`（[ADR 0005](decisions/0005-version-changelog.md)）
- 頁尾顯示 `v<VERSION>`，點進去是 `#changelog`。`src/lib/changelog.ts` 用 `?raw` 讀 `CHANGELOG.md`，
  只讀「## 標題」和「- 項目」，沒有內容的「## 未發佈」不顯示
- `src/lib/version.ts`：看過的版號跟現在不一樣就在版號旁顯示 NEW，打開更新紀錄後消失；第一次來的人直接記成目前版號
- `src/lib/changelog.test.ts` 檢查 `VERSION` 等於最新發佈的一版、版號都是 `x.y.z` 而且由新到舊
- 推 `v*` 標籤時 `.github/workflows/release.yml` 檢查標籤跟 `VERSION` 一致，用那一版的內容建 GitHub Release。流程見 [RELEASING.md](../RELEASING.md)

## 瀏覽人數（GoatCounter）

- `src/lib/visitors.ts`：代碼 `GOATCOUNTER_CODE = 'cocktail-party'`，後台 https://cocktail-party.goatcounter.com
  （[ADR 0004](decisions/0004-goatcounter.md)）
- 載入 `https://gc.zgo.at/count.js` 記第一次的瀏覽；之後每次 `hashchange` 再記一筆（路徑是 `pathname + hash`），後台看得到每個遊戲頁
- 頁尾的「你是第 N 個酒鬼」= `/counter/TOTAL.json` 的總數 + 1。GoatCounter 有最多四小時的快取，是大概的數字；
  設定沒打開「Allow adding visitor counts on your website」時回 403，頁尾就不顯示
- 用檔案直接開（不是 http）不載入；localhost、127.0.0.1 GoatCounter 本身不記

## 分享

- **分享到 LINE**（`src/slot/share.ts`）：組一段文字，開 `https://line.me/R/share?text=...`；LINE 內建瀏覽器直接換頁，其他瀏覽器開新分頁。
  網址不是 http（直接開檔案）時不附連結
- **存成圖片**（[ADR 0003](decisions/0003-canvas-share-images.md)）：酒譜卡（`slot/recipeImage.ts`）、遊戲結果（`components/resultImage.ts`）、
  派對結算（`tools/summaryImage.ts`）用 canvas 畫，共用 `src/lib/shareImage.ts`（寬 1080、色票 `C`、Cubic 11 字型、
  字級用 12 的倍數像素字才清楚），底下都有 `drunk.bluz.dev` 和「禁止酒駕・飲酒過量，有害健康」
- 輸出 PNG；`navigator.canShare({ files })` 可以就開系統分享選單，不行（例如 LINE 內建瀏覽器）就顯示圖片讓人長按儲存，也有下載按鈕
- 聊天室的連結預覽圖是 `public/og.png`（1200×630），`index.html` 的 `og:image` 用絕對網址指向它

## 部署

- 正式網址 https://drunk.bluz.dev ，Cloudflare Pages 專案 `cocktail-party`（[ADR 0006](decisions/0006-cloudflare-pages-drunk-bluz-dev.md)）
- `vite.config.ts` 的 `base: '/'`（以前在 GitHub Pages 是 `/cocktail-party/`）
- Pages 的預設網址 `cocktail-party-2eh.pages.dev`：`index.html` 裡的 script 轉到 drunk.bluz.dev（保留路徑和 `#`），
  `public/_headers` 加 `X-Robots-Tag: noindex`
- `public/_headers`：`nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`、`X-Frame-Options: DENY`、
  `Permissions-Policy`（關掉相機、麥克風、定位），`/assets/*` 快取一年（檔名有內容雜湊）
- 舊網址 `fantasybluz.github.io/cocktail-party/`：`scripts/build-redirect.mjs` 產生 `index.html` 和 `404.html`（同一頁），
  `meta refresh` 不用 JS 也會轉，script 把 `/cocktail-party` 拿掉後保留路徑、`?查詢`、`#頁面`
- GitHub Actions 的流程、secret 見 [setup.md](setup.md)
