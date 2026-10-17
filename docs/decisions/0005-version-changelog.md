# 0005 頁尾版號、更新紀錄頁、NEW，推標籤建 GitHub Release

- 狀態：採用
- 日期：2026-10-14

## 背景

推到 `main` 就自動部署，玩家看不出網站改了什麼、加了哪些新遊戲。

## 決定

- `VERSION` 是版號，`CHANGELOG.md` 是給玩家看的更新紀錄（`d40e758`，1.0.0；之前的版本從 git 歷史補寫成 0.1.0～0.8.0）
- 頁尾顯示 `v<VERSION>`，點進去是 `#changelog`，直接讀 `CHANGELOG.md`（`?raw`），只顯示「- 項目」；
  頁面上方有 commit 和建置日期（`vite.config.ts` 寫入）
- 看過的版號存 localStorage，版號變了顯示 **NEW**，打開更新紀錄後消失；第一次來的人不顯示
- 平常改的寫在「## 未發佈」，發版時改成版號；`src/lib/changelog.test.ts` 檢查 `VERSION` 等於最新一版、版號由新到舊
- 推 `v*` 標籤時 `release.yml` 檢查標籤跟 `VERSION` 一致，用那一版的內容建 GitHub Release

## 代價

- 每次發版要改 `VERSION`、改標題、打標籤三件事（[RELEASING.md](../../RELEASING.md)）
- 標題只有版號沒有日期（`## 1.1.0`），要知道哪天發的看 git 標籤或 GitHub Release
- localStorage 讀不到時（無痕模式）每次都當作看過，不會顯示 NEW
