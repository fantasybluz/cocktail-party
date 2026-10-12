import { useEffect, useState } from 'react'

// 到 https://www.goatcounter.com 註冊後把代碼填在這裡（例如 'mixslot'），
// 並在 GoatCounter 設定打開「Allow adding visitor counts on your website」，
// 就會開始記錄瀏覽人數，頁尾顯示「你是第 N 個酒鬼」
const GOATCOUNTER_CODE: string = ''

declare global {
  interface Window {
    goatcounter?: { count?: (options: { path: string }) => void }
  }
}

// 回傳「你是第幾個」，還沒啟用或讀不到時是 null
export function useVisitorCount(): number | null {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (!GOATCOUNTER_CODE || !window.location.protocol.startsWith('http')) return
    const base = `https://${GOATCOUNTER_CODE}.goatcounter.com`

    if (!document.querySelector('script[data-goatcounter]')) {
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://gc.zgo.at/count.js'
      script.dataset.goatcounter = `${base}/count`
      document.head.appendChild(script)
    }

    // 切換頁面各記一筆，才看得出哪個遊戲最多人玩
    const onHashChange = () => window.goatcounter?.count?.({ path: window.location.pathname + window.location.hash })
    window.addEventListener('hashchange', onHashChange)

    // 總數有快取（最多四小時），所以是大概的數字
    let cancelled = false
    fetch(`${base}/counter/TOTAL.json`)
      .then((res) => (res.ok ? (res.json() as Promise<{ count: string }>) : Promise.reject(new Error(String(res.status)))))
      .then(({ count: total }) => {
        if (!cancelled) setCount(Number(total.replace(/\D/g, '')) + 1)
      })
      .catch(() => {
        // 沒開放計數或連不上就不顯示
      })

    return () => {
      cancelled = true
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  return count
}
