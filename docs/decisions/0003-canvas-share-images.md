# 0003 分享圖在瀏覽器用 canvas 畫

- 狀態：採用
- 日期：2026-10-13

## 背景

酒譜卡、遊戲結果、派對結算想要能存成圖片丟到 LINE 群組。網站是純靜態的，沒有伺服器可以產圖。

## 決定

- 在瀏覽器用 canvas 畫像素風的圖（`16ed4f1`）：共用 `src/lib/shareImage.ts`（寬 1080px、色票、Cubic 11 字型、字級用 12 的倍數），
  酒譜卡 `slot/recipeImage.ts`、遊戲結果 `components/resultImage.ts`、派對結算 `tools/summaryImage.ts`
- 每張圖底下都有網址和「禁止酒駕・飲酒過量，有害健康」
- 輸出 PNG；`navigator.canShare({ files })` 可以就開系統分享選單（能選 LINE），不行就顯示圖片讓人長按儲存，另外有下載按鈕

## 代價

- LINE 內建瀏覽器不能分享檔案，只能長按存圖再自己傳，多一步
- 要先載完字型（`loadFont()`）才畫，第一次按會慢一點
- 圖上的網址寫死在 `shareImage.ts`，換網址要記得改（2.0.0 改過一次）
