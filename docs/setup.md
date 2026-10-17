# 設定與部署

## 本機開發

```bash
npm install
npm run dev        # http://localhost:5173/
npm test           # Vitest：資料完整性、遊戲規則、挑酒譜、採買組合、派對結算、更新紀錄、文件檢查
npm run lint       # ESLint
npm run lint:css   # Stylelint（不會自動修）
npm run build      # tsc -b 型別檢查 + vite build，輸出到 dist/
npm run preview    # 預覽 dist/
```

- commit 前 `npm test`、`npm run lint`、`npm run lint:css`、`npm run build` 都要過（CI 也跑這四個）
- 改畫面要在手機尺寸看過（393px 寬），LINE 內建瀏覽器的行為跟 Safari 不完全一樣：例如不能分享檔案，存成圖片會改成顯示圖片
- 本機開的 GoatCounter 不會記

## 部署

### 自動（GitHub Actions）

`.github/workflows/deploy.yml`，推到 `main`（或手動 `workflow_dispatch`）時：

1. `check`：Node 24、`npm ci`、`npm run lint`、`npm run lint:css`、`npm test`、`npm run build`
2. 過了才跑下面兩個：
   - `cloudflare-pages`：`npm run build` 再 `npx wrangler@4 pages deploy dist --project-name cocktail-party --branch main`。
     沒設 Cloudflare 的 secret 時整個跳過（不會失敗）
   - `github-pages-redirect`：`node scripts/build-redirect.mjs`，把 `redirect-dist/` 用 `actions/upload-pages-artifact` +
     `actions/deploy-pages` 部署到 GitHub Pages（舊網址）

同時只跑一個部署（`concurrency: pages`），新的推上來就取消舊的。

### 手動（筆電）

```bash
npx wrangler login
npm run deploy     # npm run build + wrangler pages deploy dist --project-name cocktail-party --branch main
```

Cloudflare 的 secret 還沒設之前就用這個。

### 需要的 secret

GitHub repo 的 Settings › Secrets and variables › Actions：

| Secret | 怎麼拿 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare › My Profile › API Tokens，權限要有 Cloudflare Pages: Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 後台 Workers & Pages 頁面的 Account ID |

GitHub Pages 的部署用 workflow 自己的權限（`pages: write`、`id-token: write`），不用另外設。

### 網域、舊網址

- `drunk.bluz.dev` 是在 Cloudflare 後台 Workers & Pages › `cocktail-party` › Custom domains 加的，不在 repo 裡
- Pages 的預設網址 `cocktail-party-2eh.pages.dev` 會被 `index.html` 的 script 轉到 drunk.bluz.dev；
  專案重建的話預設網址會變，要改 `index.html` 的 script 和 `public/_headers`
- GitHub repo 的 Settings › Pages › Source 要選 **GitHub Actions**（轉址頁是用 `actions/deploy-pages` 部署的）
- 本機試轉址頁：`npm run build:redirect`，打開 `redirect-dist/index.html`
- 換網址的話要改：`index.html`（canonical、`og:url`、`og:image`、轉址 script）、`src/lib/shareImage.ts` 圖片上的網址、
  `scripts/build-redirect.mjs` 的 `NEW_SITE`、`public/_headers`

## 發版

見 [RELEASING.md](../RELEASING.md)：改 `VERSION`、把 `CHANGELOG.md` 的「## 未發佈」改成版號、推 `v1.2.0` 這種標籤，
`.github/workflows/release.yml` 檢查標籤跟 `VERSION` 一致後建立 GitHub Release（用 workflow 的 `GITHUB_TOKEN`）。

## GoatCounter

- 帳號的代碼是 `cocktail-party`（`src/lib/visitors.ts`），後台 https://cocktail-party.goatcounter.com
- 頁尾要顯示人數，GoatCounter 的 Settings 要打開「Allow adding visitor counts on your website」；
  沒打開時 `/counter/TOTAL.json` 回 403，頁尾就不顯示
