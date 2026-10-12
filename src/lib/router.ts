import { useSyncExternalStore } from 'react'

// 網址的 # 決定顯示哪一頁（例如 #spy），LINE 和瀏覽器的上一頁也能用，
// GitHub Pages 也不用處理子路徑重新整理會 404 的問題

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const getRoute = () => window.location.hash.slice(1)

export function useHashRoute(): string {
  return useSyncExternalStore(subscribe, getRoute)
}

export function navigate(route: string): void {
  window.location.hash = `#${route}`
}
