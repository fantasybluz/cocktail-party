# 0006 搬到 Cloudflare Pages、網址換成 drunk.bluz.dev，舊網址轉過去

- 狀態：採用
- 日期：2026-10-16

## 背景

網站原本在 GitHub Pages 的 `fantasybluz.github.io/cocktail-party/`。網址長、跟 GitHub 帳號綁在一起，
而且 GitHub Pages 不能設定回應標頭（安全性標頭、assets 長期快取）。同一天 fantasybluz.github.io 也搬到 Cloudflare Pages 的 bluz.dev。

## 決定

`7ceb28f`，換網址算大改版，版號跳到 2.0.0：

- Cloudflare Pages 專案 `cocktail-party`，自訂網域 `drunk.bluz.dev`；`vite.config.ts` 的 `base` 從 `/cocktail-party/` 改成 `/`
- `og:url`、`og:image`、canonical、分享圖片上的網址都換成 drunk.bluz.dev
- Pages 的預設網址 `cocktail-party-2eh.pages.dev` 用 `index.html` 的 script 轉到 drunk.bluz.dev，`_headers` 加 `noindex`
- `public/_headers`：`nosniff`、`Referrer-Policy`、`X-Frame-Options: DENY`、`Permissions-Policy`，`/assets/*` 快取一年
- GitHub Pages 的舊網址只放轉址頁（`scripts/build-redirect.mjs`），路徑、`?查詢`、`#頁面` 都帶過去，
  已經分享的連結、加到主畫面的捷徑都還能用
- `deploy.yml`：先檢查（lint、測試、建置）→ Cloudflare Pages（沒設 secret 就跳過，先用 `npm run deploy`）＋ GitHub Pages 轉址

## 代價

- 兩個地方要維護：Cloudflare Pages 放網站、GitHub Pages 放轉址頁
- GitHub Pages 不能回真的 301，轉址是在瀏覽器做的（meta refresh + script）
- 已經加到主畫面的捷徑每次打開都會先經過轉址頁
- localStorage 跟著網域走：舊網址上存的記分板名單、紀錄不會帶到新網址
- 自訂網域是在 Cloudflare 後台設的，不在 repo 裡
