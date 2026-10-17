# 文件

這個資料夾放「程式碼看不出來」的東西：網站怎麼組成、怎麼部署、為什麼這樣做。
玩法、在家玩要準備什麼寫在 [../README.md](../README.md)（給玩家看）；某個函式怎麼寫留在程式碼的註解。

| 文件 | 內容 | 什麼時候要改 |
|---|---|---|
| [architecture.md](architecture.md) | 資料夾、頁面和 `#` 網址、存在手機上的資料、版號、GoatCounter、分享、部署 | 加頁面、加 localStorage 的 key、改分享或部署方式 |
| [setup.md](setup.md) | 本機開發、測試、GitHub Actions、secret、網域、舊網址轉址、GoatCounter 設定 | 部署方式、secret、網域有變 |
| [decisions/](decisions/) | 重要決定的來龍去脈（ADR） | 做了會影響之後很久的選擇 |
| [../README.md](../README.md) | 給玩家看：拉霸機、在家玩、20 個遊戲、聚會工具 | 加遊戲、改玩法、改酒譜或採買組合 |
| [../RELEASING.md](../RELEASING.md) | 發版流程、版號怎麼跳 | 發版方式有變 |
| [../CHANGELOG.md](../CHANGELOG.md) | 每一版改了什麼（網站上的「更新紀錄」） | 每次改了玩家看得到的東西 |

沒有另外寫需求文件：遊戲規則寫在程式裡（`src/games/*.ts` 的純函式，有測試），玩家看的玩法在 README。

## 維護規則

1. **文件跟程式碼放在同一個 commit**，不要「之後再補」
2. **改了什麼，對照上表改哪份**。不確定就問自己：下一個接手的人（或 AI）只看文件，會不會被誤導？
3. **CHANGELOG 寫給玩家看**：說「能玩什麼了」，不說「改了哪個檔案」。平常寫在「## 未發佈」底下，發版時改成版號（見 RELEASING.md）
4. **決定寫成 ADR**：選了 A 不選 B、之後可能有人問「為什麼不用 B」的，在 `decisions/` 加一份，編號往下接（`0007-xxx.md`），
   寫背景、決定、代價。決定改了就新增一份取代舊的，舊的標「已被 000X 取代」，不要直接刪
5. **寫具體的事實**：數字、指令、檔名都寫出來（例如「快取最多四小時」「`npm run build:redirect`」）

## 改什麼東西在哪裡

| 要改的東西 | 位置 |
|---|---|
| 轉輪品項（名稱、濃度、甜度、氣泡、顏色） | `src/data/drinks.ts` 的 `BASES`、`MIXERS`、`ACCENTS` |
| 酒譜（組合、比例、口感、標籤） | `src/data/drinks.ts` 的 `RECIPES` |
| 惡魔模式（加烈品項、酒譜、注意事項） | `src/data/drinks.ts` 的 `DEVIL_SHOTS`、`DEVIL_RECIPES` |
| 像素圖樣（16×16） | `src/lib/sprites.ts` 的 `SPRITES` |
| 遊戲列表、轉盤預設選項、題庫、成人題庫、大富翁格子 | `src/data/games.ts`（新遊戲還要在 `App.tsx` 接上元件，README 的表加一列） |
| 在家玩的採買組合 | `src/data/shopping.ts`（能做幾杯會自動算，測試會檢查）；README 的表也要跟著改 |
| 連結預覽圖 | `public/og.png`（1200×630），`index.html` 的 `og:image` 指向它 |
| 網址 | 見 [setup.md](setup.md#網域舊網址) 列的地方 |

改完跑 `npm test`：酒譜的品名打錯、圖樣不是 16×16、用到沒定義的顏色、題目重複都會報錯。

## 自動檢查

`npm test` 會跑 [docs.test.ts](docs.test.ts)，文件跟程式碼對不上就失敗：

- README、RELEASING、CLAUDE、CHANGELOG、`docs/` 裡的相對連結都要指得到檔案
- README「喝酒遊戲」的表要剛好列出 `GAME_LIST` 的每一個遊戲名稱；README 要提到 `TOOL_LIST` 的每一個工具
- [architecture.md](architecture.md) 要列出程式裡每一個 `*_KEY = '...'`（localStorage 的 key）

另外 `src/lib/changelog.test.ts` 檢查 `VERSION` 等於 CHANGELOG 最新發佈的一版。GitHub Actions 每次推 `main` 都跑 `npm test`，沒過就不部署。
