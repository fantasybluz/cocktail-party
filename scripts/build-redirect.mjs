// 舊網址（GitHub Pages：https://fantasybluz.github.io/cocktail-party/）改放的轉址頁。
// 網站搬到 Cloudflare Pages（https://drunk.bluz.dev），舊網址的每個路徑、?查詢、#頁面 都轉到新網址的同一個地方，
// 已經分享出去的連結、加到主畫面的捷徑都還能用。輸出：redirect-dist/
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const NEW_SITE = 'https://drunk.bluz.dev'
const OLD_BASE = '/cocktail-party'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'redirect-dist')

// meta refresh 不用 JavaScript 也會轉；script 會保留路徑、?查詢、#頁面（GitHub Pages 的 404.html 也是這頁）
const page = `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>超商調酒拉霸機搬家了</title>
    <link rel="canonical" href="${NEW_SITE}/" />
    <meta http-equiv="refresh" content="0; url=${NEW_SITE}/" />
    <script>
      location.replace('${NEW_SITE}' + (location.pathname.replace(/^${OLD_BASE.replace('/', '\\/')}/, '') || '/') + location.search + location.hash)
    </script>
  </head>
  <body>
    <p>超商調酒拉霸機搬家了：<a href="${NEW_SITE}/">${NEW_SITE}</a></p>
  </body>
</html>
`

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })
await writeFile(path.join(outDir, 'index.html'), page)
await writeFile(path.join(outDir, '404.html'), page)
await writeFile(path.join(outDir, '.nojekyll'), '')
console.log(`redirect site written to ${path.relative(root, outDir)}/ -> ${NEW_SITE}`)
