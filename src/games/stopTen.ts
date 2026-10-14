// 停在 10 秒：盲按計時，離目標最遠的人喝

export interface StopResult {
  name: string
  // 實際按了幾秒
  time: number
}

export interface RankedResult extends StopResult {
  diff: number
}

// 差不到這麼多就是「神手」
export const GOD_HAND = 0.1

export function formatSeconds(seconds: number): string {
  return seconds.toFixed(2)
}

// 用畫面上顯示的精度（0.01 秒）比，看起來一樣就算平手，也避開浮點數誤差
const toHundredths = (seconds: number) => Math.round(seconds * 100) / 100

// 由準到不準排
export function rankResults(results: StopResult[], target: number): RankedResult[] {
  return results
    .map((result) => ({ ...result, diff: toHundredths(Math.abs(toHundredths(result.time) - target)) }))
    .sort((a, b) => a.diff - b.diff)
}

export function rating(diff: number): string {
  if (diff < GOD_HAND) return '神準！'
  if (diff < 0.3) return '超接近'
  if (diff < 0.7) return '還不錯'
  if (diff < 1.5) return '差一點'
  return '差太多了'
}

// 差最多的人（平手都算）
export function losers(ranked: RankedResult[]): RankedResult[] {
  if (ranked.length === 0) return []
  const worst = ranked[ranked.length - 1].diff
  return ranked.filter((result) => result.diff === worst)
}
