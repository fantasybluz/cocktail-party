import { describe, expect, it } from 'vitest'
import { ACCENTS, BASES, MIXERS, type Item } from '../data/drinks.ts'
import { estimate, pickRecipe, ratioText, recipes, REELS, RECIPES_BY_MODE, type Locks } from './recipes.ts'

const byName = (list: Item[], name: string) => list.find((item) => item.name === name)!
const recipe = (name: string) => recipes.find((r) => r.name === name)!

describe('pickRecipe', () => {
  it('沒鎖定時一定轉出現成酒譜', () => {
    for (let i = 0; i < 200; i++) expect(recipes).toContain(pickRecipe([null, null, null]))
  })

  it('鎖定基酒時只會出那個基酒的酒譜', () => {
    const whisky = byName(BASES, '威士忌')
    for (let i = 0; i < 100; i++) {
      const result = pickRecipe([whisky, null, null])
      expect(result.items[0]).toBe(whisky)
      expect(result.tag).not.toBe('實驗')
    }
  })

  it('鎖定的組合沒有酒譜時出實驗組合，並保留鎖定的品項', () => {
    const locks: Locks = [byName(BASES, '高粱'), byName(MIXERS, '草莓牛奶'), null]
    const result = pickRecipe(locks)
    expect(result.tag).toBe('實驗')
    expect(result.name).toBe('高粱草莓牛奶')
    expect(result.items[0]).toBe(locks[0])
    expect(result.items[1]).toBe(locks[1])
    expect(result.parts[1]).toBe(byName(BASES, '高粱').ratio)
  })

  it('有其他選擇時不會連續出同一杯', () => {
    const last = recipe('嗨棒')
    const whisky = byName(BASES, '威士忌')
    for (let i = 0; i < 100; i++) expect(pickRecipe([whisky, null, null], last)).not.toBe(last)
  })

  it('只剩一杯符合時還是會出那一杯', () => {
    const last = recipe('野格炸彈')
    const locks: Locks = [byName(BASES, '野格'), byName(MIXERS, '紅牛'), byName(ACCENTS, '冰塊')]
    expect(pickRecipe(locks, last)).toBe(last)
  })
})

describe('惡魔模式', () => {
  it('只會轉出惡魔酒譜', () => {
    for (let i = 0; i < 200; i++) expect(pickRecipe([null, null, null], null, 'devil').tag).toBe('惡魔')
  })

  it('每一杯估算的酒精濃度都在 18% 以上', () => {
    RECIPES_BY_MODE.devil.forEach((recipe) => expect(estimate(recipe).abv).toBeGreaterThanOrEqual(18))
  })

  it('基酒轉輪只有 35% 以上的烈酒', () => {
    REELS.devil.items[0].forEach((base) => expect(base.abv).toBeGreaterThanOrEqual(35))
  })

  it('鎖定的組合沒有惡魔酒譜時，實驗組合也是兩份烈酒', () => {
    const [bases, mixers, shots] = REELS.devil.items
    const locks: Locks = [bases.find((b) => b.name === '琴酒')!, mixers.find((m) => m.name === '草莓牛奶')!, null]
    const result = pickRecipe(locks, null, 'devil')
    expect(result.tag).toBe('實驗')
    expect(result.parts).toEqual([1, 2, 1])
    expect(shots).toContain(result.items[2])
    expect(estimate(result).abv).toBeGreaterThanOrEqual(18)
  })
})

describe('estimate', () => {
  it('嗨棒：威士忌 1 : 氣泡水 3', () => {
    expect(estimate(recipe('嗨棒'))).toEqual({ abv: 10, strength: 3, sweet: 0, fizz: 4 })
  })

  it('固體加料的甜度也會算進去', () => {
    // 威士忌 1 : 可樂 3，再加一球冰淇淋
    const result = estimate(recipe('威士忌可樂漂浮'))
    expect(result.sweet).toBe(4)
    expect(result.abv).toBe(10)
  })
})

describe('ratioText', () => {
  it('列出每個液體品項的份數', () => {
    expect(ratioText(recipe('養樂多伏特加'))).toBe('伏特加 1 : 雪碧 2 : 養樂多 1')
    expect(ratioText(recipe('嗨棒'))).toBe('威士忌 1 : 氣泡水 3')
  })
})
