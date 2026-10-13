import type { DrinkKind, LogEntry, Player } from '../party.ts'

// 派對結算：從記分板和派對紀錄算出統計與獎項

export interface PlayerStats {
  name: string
  drinks: number
  boom: number
  challenge: number
  lose: number
  water: number
}

export type AwardId = 'king' | 'boom' | 'challenge' | 'lose' | 'water' | 'first' | 'sober'

export interface Award {
  id: AwardId
  title: string
  names: string[]
  value: string
}

export interface PartyStats {
  total: number
  average: number
  // 由杯數多到少
  players: PlayerStats[]
  start: number | null
  end: number | null
  topGame: { game: string; count: number } | null
  // 30 分鐘內喝最多杯的時段
  peak: { start: number; count: number } | null
  awards: Award[]
}

const PEAK_MS = 30 * 60 * 1000
// 記分板上手動加減的不算「哪個遊戲最多人喝」
const MANUAL_GAME = '喝酒記分板'

export function formatTime(at: number): string {
  const date = new Date(at)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 派對時間：不到一分鐘只顯示開始時間
export function formatSpan(start: number, end: number): string {
  if (end - start < 60000) return `${formatTime(start)} 開始`
  return `${formatTime(start)}～${formatTime(end)}（${formatDuration(end - start)}）`
}

export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60000))
  if (minutes < 60) return `${minutes} 分鐘`
  const rest = minutes % 60
  return rest === 0 ? `${Math.floor(minutes / 60)} 小時` : `${Math.floor(minutes / 60)} 小時 ${rest} 分`
}

// 數值最大的人（平手都列），最大值是 0 就不頒
function top(players: PlayerStats[], key: keyof Omit<PlayerStats, 'name'>) {
  const max = Math.max(0, ...players.map((p) => p[key]))
  if (max === 0) return null
  return { names: players.filter((p) => p[key] === max).map((p) => p.name), value: max }
}

function maxEntry(counts: Map<string | number, number>) {
  let best: [string | number, number] | null = null
  for (const entry of counts) if (!best || entry[1] > best[1]) best = entry
  return best
}

export function computeStats(roster: Player[], log: LogEntry[]): PartyStats {
  const drinksLog = log.filter((entry) => entry.kind !== 'water')
  const count = (name: string, kind: DrinkKind | 'water') =>
    log.filter((entry) => entry.name === name && entry.kind === kind).length

  const players = roster
    .map((player) => ({
      name: player.name,
      drinks: player.drinks,
      boom: count(player.name, 'boom'),
      challenge: count(player.name, 'challenge'),
      lose: count(player.name, 'lose'),
      water: count(player.name, 'water'),
    }))
    .sort((a, b) => b.drinks - a.drinks)

  const total = players.reduce((sum, p) => sum + p.drinks, 0)
  const times = log.map((entry) => entry.at)

  const byGame = new Map<string, number>()
  drinksLog
    .filter((entry) => entry.game && entry.game !== MANUAL_GAME)
    .forEach((entry) => byGame.set(entry.game, (byGame.get(entry.game) ?? 0) + 1))
  const game = maxEntry(byGame)

  const byBucket = new Map<number, number>()
  drinksLog.forEach((entry) => {
    const bucket = Math.floor(entry.at / PEAK_MS)
    byBucket.set(bucket, (byBucket.get(bucket) ?? 0) + 1)
  })
  const peak = maxEntry(byBucket)

  const awards: Award[] = []
  const add = (id: AwardId, title: string, result: { names: string[]; value: number } | null, unit: (n: number) => string) => {
    if (result) awards.push({ id, title, names: result.names, value: unit(result.value) })
  }
  add('king', '今晚酒王', top(players, 'drinks'), (n) => `${n} 杯`)
  add('boom', '炸彈磁鐵', top(players, 'boom'), (n) => `被炸 ${n} 次`)
  add('challenge', '挑戰失敗王', top(players, 'challenge'), (n) => `失敗 ${n} 次`)
  add('lose', '最衰', top(players, 'lose'), (n) => `輸 ${n} 次`)
  add('water', '喝水模範生', top(players, 'water'), (n) => `喝水 ${n} 次`)

  const first = drinksLog.reduce<LogEntry | null>((earliest, entry) => (!earliest || entry.at < earliest.at ? entry : earliest), null)
  if (first) awards.push({ id: 'first', title: '第一杯', names: [first.name], value: formatTime(first.at) })

  // 有人喝、而且大家不是一樣多，才頒最清醒
  const maxDrinks = players[0]?.drinks ?? 0
  const minDrinks = Math.min(...players.map((p) => p.drinks))
  if (players.length >= 2 && maxDrinks > minDrinks) {
    awards.push({
      id: 'sober',
      title: '最清醒',
      names: players.filter((p) => p.drinks === minDrinks).map((p) => p.name),
      value: `${minDrinks} 杯`,
    })
  }

  return {
    total,
    average: players.length > 0 ? total / players.length : 0,
    players,
    start: times.length > 0 ? Math.min(...times) : null,
    end: times.length > 0 ? Math.max(...times) : null,
    topGame: game ? { game: String(game[0]), count: game[1] } : null,
    peak: peak ? { start: Number(peak[0]) * PEAK_MS, count: peak[1] } : null,
    awards,
  }
}
