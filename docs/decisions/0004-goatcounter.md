# 0004 瀏覽人數用 GoatCounter

- 狀態：採用
- 日期：2026-10-13

## 背景

想知道有多少人在玩、哪個遊戲最多人玩，頁尾也想放「你是第 N 個酒鬼」。網站沒有後端，要用外部的統計服務。

## 決定

用 [GoatCounter](https://www.goatcounter.com)（`16cbe59`，1.0.0 上線）：

- 不用 cookie、不用跳同意視窗，免費方案夠用
- 有公開的計數 API（`/counter/TOTAL.json`），頁尾可以直接顯示總數
- 代碼 `cocktail-party` 寫在 `src/lib/visitors.ts`；切換 `#` 頁面時呼叫 `goatcounter.count()` 多記一筆，後台看得到每個遊戲頁
- 本機開的不記（GoatCounter 預設略過 localhost）

## 代價

- 總數有最多四小時的快取，頁尾的數字是大概的
- 要在 GoatCounter 設定打開「Allow adding visitor counts on your website」頁尾才會顯示，沒打開時 API 回 403、頁尾就不顯示
- 多載一支外部 script（`gc.zgo.at/count.js`）；被廣告阻擋擋掉就不記，也不顯示人數
