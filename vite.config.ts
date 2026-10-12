import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 的網址是 fantasybluz.github.io/cocktail-party/，資源路徑要加上這段
  base: '/cocktail-party/',
  plugins: [react()],
})
