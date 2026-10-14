import { describe, expect, it } from 'vitest'
import { formatSeconds, losers, rankResults, rating } from './stopTen.ts'

describe('停在 10 秒', () => {
  const results = [
    { name: '小明', time: 10.37 },
    { name: '小華', time: 9.98 },
    { name: '阿美', time: 11.6 },
    { name: '大雄', time: 8.2 },
  ]

  it('依離 10 秒多遠排名，早按晚按都算差距', () => {
    const ranked = rankResults(results, 10)
    expect(ranked.map((r) => r.name)).toEqual(['小華', '小明', '阿美', '大雄'])
    expect(ranked[0].diff).toBeCloseTo(0.02)
    expect(ranked[3].diff).toBe(1.8)
  })

  it('差最多的人喝，平手都算', () => {
    expect(losers(rankResults(results, 10)).map((r) => r.name)).toEqual(['大雄'])
    const tie = rankResults([{ name: 'A', time: 9 }, { name: 'B', time: 11 }, { name: 'C', time: 10 }], 10)
    expect(losers(tie).map((r) => r.name)).toEqual(['A', 'B'])
    expect(losers([])).toEqual([])
  })

  it('畫面上看起來一樣（11.60 和 8.40）就算平手，不受浮點數誤差影響', () => {
    const ranked = rankResults([{ name: 'A', time: 11.6 }, { name: 'B', time: 8.4 }, { name: 'C', time: 10.2 }], 10)
    expect(losers(ranked).map((r) => r.name)).toEqual(['A', 'B'])
  })

  it('評語跟差距對得上', () => {
    expect(rating(0.05)).toBe('神準！')
    expect(rating(0.2)).toBe('超接近')
    expect(rating(0.5)).toBe('還不錯')
    expect(rating(1)).toBe('差一點')
    expect(rating(3)).toBe('差太多了')
  })

  it('秒數顯示到小數點後兩位', () => {
    expect(formatSeconds(10.3712)).toBe('10.37')
    expect(formatSeconds(9)).toBe('9.00')
  })
})
