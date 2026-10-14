// 反應力大考驗：變綠燈的瞬間按，最慢或太早按的人喝

export interface ReactionResult {
  name: string
  // 反應時間（毫秒）；null 是太早按（犯規）
  ms: number | null
}

// 等綠燈的時間（隨機，避免抓節奏）
export const WAIT_MIN_MS = 1500
export const WAIT_MAX_MS = 4500

// 由快到慢，犯規的排最後
export function rankReaction(results: ReactionResult[]): ReactionResult[] {
  return [...results].sort((a, b) => (a.ms ?? Infinity) - (b.ms ?? Infinity))
}

// 有人犯規就是犯規的喝，不然最慢的喝（平手都算）
export function reactionLosers(results: ReactionResult[]): ReactionResult[] {
  const fouls = results.filter((r) => r.ms === null)
  if (fouls.length > 0) return fouls
  if (results.length === 0) return []
  const slowest = Math.max(...results.map((r) => r.ms ?? 0))
  return results.filter((r) => r.ms === slowest)
}

export function reactionRating(ms: number | null): string {
  if (ms === null) return '太早按了，犯規！'
  if (ms < 200) return '閃電手！'
  if (ms < 280) return '反應很快'
  if (ms < 380) return '普通人'
  if (ms < 500) return '有點醉了？'
  return '已經醉了吧'
}
