import { describe, expect, it } from 'vitest'
import type { LogEntry, Player } from '../party.ts'
import { computeStats, formatDuration, formatSpan } from './summary.ts'

// 2026-10-12 21:00（台灣時間）起算
const T0 = new Date(2026, 9, 12, 21, 0).getTime()
const min = (n: number) => T0 + n * 60000

const roster: Player[] = [
  { name: '小明', drinks: 4, water: 3 },
  { name: '小華', drinks: 2, water: 0 },
  { name: '阿美', drinks: 1, water: 0 },
]

const log: LogEntry[] = [
  { name: '小華', at: min(5), game: '數字炸彈', kind: 'boom' },
  { name: '小明', at: min(10), game: '數字炸彈', kind: 'boom' },
  { name: '小明', at: min(12), game: '數字炸彈', kind: 'boom' },
  { name: '小明', at: min(40), game: '真心話大冒險', kind: 'challenge' },
  { name: '阿美', at: min(41), game: '真心話大冒險', kind: 'challenge' },
  { name: '小明', at: min(45), game: '吹牛骰', kind: 'lose' },
  { name: '小明', at: min(50), game: '喝酒記分板', kind: 'water' },
  { name: '小華', at: min(90), game: '喝酒記分板', kind: 'other' },
]

describe('派對結算', () => {
  const stats = computeStats(roster, log)

  it('總杯數、平均、依杯數排序', () => {
    expect(stats.total).toBe(7)
    expect(stats.average).toBeCloseTo(7 / 3)
    expect(stats.players.map((p) => p.name)).toEqual(['小明', '小華', '阿美'])
  })

  it('每個人被炸、挑戰失敗、輸、喝水的次數', () => {
    expect(stats.players[0]).toEqual({ name: '小明', drinks: 4, boom: 2, challenge: 1, lose: 1, water: 1 })
  })

  it('派對開始和結束時間', () => {
    expect(stats.start).toBe(min(5))
    expect(stats.end).toBe(min(90))
  })

  it('最多人喝的遊戲不算記分板手動加的', () => {
    expect(stats.topGame).toEqual({ game: '數字炸彈', count: 3 })
  })

  it('30 分鐘內喝最多的時段', () => {
    expect(stats.peak).toEqual({ start: T0, count: 3 })
  })

  it('頒獎：平手都列、0 次不頒', () => {
    const award = (id: string) => stats.awards.find((a) => a.id === id)
    expect(award('king')).toMatchObject({ names: ['小明'], value: '4 杯' })
    expect(award('boom')).toMatchObject({ names: ['小明'], value: '被炸 2 次' })
    expect(award('challenge')).toMatchObject({ names: ['小明', '阿美'], value: '失敗 1 次' })
    expect(award('water')).toMatchObject({ names: ['小明'] })
    expect(award('first')).toMatchObject({ names: ['小華'], value: '21:05' })
    expect(award('sober')).toMatchObject({ names: ['阿美'], value: '1 杯' })
  })

  it('沒有紀錄時不會出錯，也不頒獎', () => {
    const empty = computeStats([{ name: '小明', drinks: 0, water: 0 }], [])
    expect(empty.total).toBe(0)
    expect(empty.awards).toEqual([])
    expect(empty.peak).toBeNull()
    expect(empty.start).toBeNull()
  })

  it('時間長度的寫法', () => {
    expect(formatDuration(45 * 60000)).toBe('45 分鐘')
    expect(formatDuration(120 * 60000)).toBe('2 小時')
    expect(formatDuration(155 * 60000)).toBe('2 小時 35 分')
    expect(formatSpan(T0, T0 + 30000)).toBe('21:00 開始')
    expect(formatSpan(T0, min(155))).toBe('21:00～23:35（2 小時 35 分）')
  })
})
