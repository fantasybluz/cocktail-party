# 發行新版（維護者）

網站是推到 `main` 就自動部署（`.github/workflows/deploy.yml`），版號是給使用者看「這版改了什麼」用的。

## 流程

1. 改好程式後確認：
   - `npm test`、`npm run lint`、`npm run lint:css`
   - `npm run build`（型別檢查＋建置）、`npm run preview` 在手機尺寸把主要流程點一遍
2. 平常改的東西先寫在 `CHANGELOG.md` 的「## 未發佈」底下
3. 要發版時：改 `VERSION`（例如 `1.1.0`），把「## 未發佈」那段的標題改成 `## 1.1.0`，
   上面再補一段空的「## 未發佈」——這段會顯示在網站的「更新紀錄」，使用者看到版號旁的 NEW 就知道有新版
4. commit、打標籤、推上去：

   ```bash
   git tag v1.1.0
   git push origin main v1.1.0
   ```

5. GitHub Actions：
   - `deploy.yml`（推 `main`）：lint、測試、建置、部署到 GitHub Pages
   - `release.yml`（推 `v*` 標籤）：檢查標籤跟 `VERSION` 一致，用 `CHANGELOG.md` 那一版的內容建立 GitHub Release

## 版號怎麼跳

- 新功能、新遊戲：第二碼（`1.1.0`）
- 只有修正、文字調整：第三碼（`1.0.1`）
- 大改版（例如重寫、換網址）：第一碼

## 網站上的版號

- `vite.config.ts` 在建置時讀 `VERSION`、commit（GitHub Actions 的 `GITHUB_SHA`，本機用 `git rev-parse`）和建置日期，
  寫進 `__APP_VERSION__`、`__BUILD_SHA__`、`__BUILD_DATE__`
- 頁尾顯示版號，點進去是「更新紀錄」（`#changelog`），內容直接讀 `CHANGELOG.md`
- 使用者看過的版號存在手機的 localStorage，版號變了就顯示 NEW，打開更新紀錄後消失
- `src/lib/changelog.test.ts` 會檢查 `VERSION` 跟 `CHANGELOG.md` 最新的一版一致
