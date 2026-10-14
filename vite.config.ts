import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const version = readFileSync(new URL('./VERSION', import.meta.url), 'utf8').trim()

// GitHub Actions 有 GITHUB_SHA；本機用 git，都沒有就留空
function buildSha(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return ''
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 的網址是 fantasybluz.github.io/cocktail-party/，資源路徑要加上這段
  base: '/cocktail-party/',
  plugins: [react()],
  // 頁尾版號、更新紀錄頁用
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_SHA__: JSON.stringify(buildSha()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
})
