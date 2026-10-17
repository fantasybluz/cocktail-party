# 0002 用網址的 # 切換頁面

- 狀態：採用
- 日期：2026-10-12

## 背景

重寫成 React 之後有拉霸機、遊戲列表、每個遊戲、工具好幾十頁，要能用上一頁回去、能把某個遊戲的網址傳給別人。
當時放在 GitHub Pages 的子路徑 `/cocktail-party/`：GitHub Pages 不能設定「找不到的路徑都回 index.html」，
用一般路徑（`/cocktail-party/spy`）重新整理會 404。

## 決定

- 用 `#`（`src/lib/router.ts`，`useSyncExternalStore` 聽 `hashchange`），例如 `#spy`、`#scoreboard`
- LINE 內建瀏覽器和一般瀏覽器的上一頁都能用
- 不認得的 `#` 顯示拉霸機

## 代價

- 網址比較不好看（`drunk.bluz.dev/#spy`）
- 搬到 Cloudflare Pages（[ADR 0006](0006-cloudflare-pages-drunk-bluz-dev.md)）之後其實可以用一般路徑了，但已經分享出去的連結、
  加到主畫面的捷徑都是 `#`，所以不改；轉址頁也要保留 `#`
- GoatCounter 要自己在 `hashchange` 時多記一筆，才看得到每個遊戲頁（[ADR 0004](0004-goatcounter.md)）
