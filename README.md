# 超商調酒拉霸機 cocktail-party

像素風的聚會小工具，用 React + TypeScript + Vite 寫成靜態網站，放在 GitHub Pages。
底部切換兩個頁面：

- **調酒拉霸機**：三個轉輪「基酒、材料一、材料二」，品項都是超商（以 7-11 為主）買得到的東西。
  每次轉出一杯現成酒譜，附上比例、口感，以及估算的酒感、甜度、氣泡
- **喝酒遊戲**：8 種一支手機大家輪流操作的遊戲，輸了可以直接「去轉拉霸機」決定喝什麼

網址：https://fantasybluz.github.io/cocktail-party/
把網址貼到 LINE 聊天室，大家點了會直接在 LINE 內建瀏覽器打開。

## 開發

```bash
npm install
npm run dev        # 開發伺服器 http://localhost:5173/cocktail-party/
npm test           # 單元測試（資料完整性、挑酒譜邏輯）
npm run lint       # ESLint
npm run lint:css   # Stylelint
npm run build      # 輸出到 dist/
npm run preview    # 預覽 build 結果
```

## 部署

推到 `main` 會由 GitHub Actions（`.github/workflows/deploy.yml`）跑 lint、測試、build，
再部署到 GitHub Pages，大約一兩分鐘。`vite.config.ts` 的 `base` 要和 repo 名稱一致。

## 結構

```
src/
├── App.tsx            # 切換頁面、爆炸畫面、遊戲共用的動作
├── party.ts           # 遊戲共用動作的 context（輸家去轉拉霸機、爆炸畫面）
├── data/
│   ├── drinks.ts      # 轉輪品項、酒譜
│   └── games.ts       # 遊戲列表、題庫
├── slot/              # 調酒拉霸機（轉輪、酒譜卡片、挑酒譜邏輯、分享到 LINE）
├── games/             # 8 個喝酒遊戲
├── components/        # 共用元件（像素圖、結果、加減器、底部切換列⋯）
├── lib/               # 像素圖樣、音效、亂數、網址切換、瀏覽人數
└── styles/base.css    # 色票、字型、按鈕、液晶螢幕等共用樣式
```

- 頁面用網址的 `#` 切換（例如 `#spy`），LINE 和瀏覽器的上一頁也能用
- 跟時間有關的遊戲（懲罰轉盤、傳手機炸彈）離開頁面就停止；其他遊戲切走再回來會保留進度

## 修改內容

| 要改的東西 | 位置 |
|---|---|
| 轉輪品項（名稱、濃度、甜度、氣泡、顏色） | `src/data/drinks.ts` 的 `BASES`、`MIXERS`、`ACCENTS` |
| 酒譜（組合、比例、口感、標籤） | `src/data/drinks.ts` 的 `RECIPES` |
| 像素圖樣（16x16） | `src/lib/sprites.ts` 的 `SPRITES` |
| 轉盤預設選項、遊戲題庫 | `src/data/games.ts` |
| 連結預覽圖 | `public/og.png`（1200x630），`index.html` 的 `og:image` 指向它 |

改完跑 `npm test`：酒譜的品名打錯、圖樣不是 16x16、用到沒定義的顏色、題目重複都會報錯。

酒譜整理自網路上的超商調酒文章，標「創意」的是自己搭的。各門市進貨不同，大店品項比較齊。

## 瀏覽人數

用 [GoatCounter](https://www.goatcounter.com) 記錄，還沒啟用。註冊後：

1. 把代碼填到 `src/lib/visitors.ts` 的 `GOATCOUNTER_CODE`
2. 在 GoatCounter 設定打開「Allow adding visitor counts on your website」

頁尾就會顯示「你是第 N 個酒鬼」（GoatCounter 的總數有最多四小時的快取，是大概的數字），
後台也看得到每個遊戲頁的瀏覽數。

## 字型

[俐方體 11 號（Cubic 11）](https://github.com/ACh-K/Cubic-11)，授權見 `src/assets/fonts/OFL.txt`。
