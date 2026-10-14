import { describe, expect, it } from 'vitest'
import { addStep, checkInput, flashMs, PADS } from './memory.ts'
import { createBarrel, holesLeft, stab } from './pirate.ts'
import { rankReaction, reactionLosers, reactionRating } from './reaction.ts'

describe('反應力大考驗', () => {
  const results = [
    { name: '小明', ms: 312 },
    { name: '小華', ms: null },
    { name: '阿美', ms: 198 },
    { name: '大雄', ms: 455 },
  ]

  it('由快到慢排，犯規的排最後', () => {
    expect(rankReaction(results).map((r) => r.name)).toEqual(['阿美', '小明', '大雄', '小華'])
  })

  it('有人犯規就是犯規的喝，沒人犯規就最慢的喝', () => {
    expect(reactionLosers(results).map((r) => r.name)).toEqual(['小華'])
    expect(reactionLosers(results.filter((r) => r.ms !== null)).map((r) => r.name)).toEqual(['大雄'])
    expect(reactionLosers([])).toEqual([])
  })

  it('評語', () => {
    expect(reactionRating(null)).toContain('犯規')
    expect(reactionRating(150)).toBe('閃電手！')
    expect(reactionRating(600)).toBe('已經醉了吧')
  })
})

describe('記憶挑戰', () => {
  it('每次多一步，都是四色之一', () => {
    let sequence: number[] = []
    for (let i = 0; i < 20; i++) sequence = addStep(sequence)
    expect(sequence).toHaveLength(20)
    sequence.forEach((step) => {
      expect(step).toBeGreaterThanOrEqual(0)
      expect(step).toBeLessThan(PADS.length)
    })
  })

  it('檢查輸入：按錯、還沒按完、按完', () => {
    expect(checkInput([0, 1, 2], [0])).toBe('continue')
    expect(checkInput([0, 1, 2], [0, 2])).toBe('wrong')
    expect(checkInput([0, 1, 2], [0, 1, 2])).toBe('done')
  })

  it('越長閃越快，但有下限', () => {
    expect(flashMs(1)).toBeGreaterThan(flashMs(8))
    expect(flashMs(100)).toBe(260)
  })
})

describe('瘋狂海盜桶', () => {
  it('機關在洞的範圍內', () => {
    for (let i = 0; i < 50; i++) {
      const barrel = createBarrel(12)
      expect(barrel.trigger).toBeGreaterThanOrEqual(0)
      expect(barrel.trigger).toBeLessThan(12)
    }
  })

  it('插到機關海盜跳出來，插過的洞不能再插', () => {
    let barrel = createBarrel(6, 3)
    const first = stab(barrel, 0)
    expect(first.result).toBe('safe')
    barrel = first.barrel
    expect(holesLeft(barrel)).toBe(5)
    expect(stab(barrel, 0).result).toBe('taken')
    expect(stab(barrel, 3).result).toBe('pop')
  })

  it('一直插安全的洞，最後一定會插到機關', () => {
    let barrel = createBarrel(4, 2)
    for (const hole of [0, 1, 3]) barrel = stab(barrel, hole).barrel
    expect(holesLeft(barrel)).toBe(1)
    expect(stab(barrel, 2).result).toBe('pop')
  })
})
