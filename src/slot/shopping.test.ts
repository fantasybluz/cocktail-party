import { describe, expect, it } from 'vitest'
import { ACCENTS, BASES, MIXERS } from '../data/drinks.ts'
import { SHOPPING_SETS, SINGLE_SPIRIT } from '../data/shopping.ts'
import { makeableRecipes, usageCounts } from './shopping.ts'

const allNames = new Set([...BASES, ...MIXERS, ...ACCENTS].map((item) => item.name))

describe('在家玩的採買組合', () => {
  it.each(SHOPPING_SETS.map((set) => [set.name, set] as const))('%s 的品項都在轉輪上', (_, set) => {
    ;[...set.spirits, ...set.drinks].forEach((name) => expect(allNames).toContain(name))
  })

  it('三組分別能做 6、11、13 杯，而且越大組越多', () => {
    const counts = SHOPPING_SETS.map((set) => makeableRecipes([...set.spirits, ...set.drinks]).length)
    expect(counts).toEqual([6, 11, 13])
  })

  it('只買一支威士忌配五種飲料能做 5 杯', () => {
    expect(makeableRecipes([SINGLE_SPIRIT.spirit, ...SINGLE_SPIRIT.drinks])).toEqual([
      '嗨棒',
      '威士忌可樂',
      '威士忌綠茶',
      '威士忌冬瓜茶',
      '威士忌沙士',
    ])
  })

  it('沒有冰塊就做不出要加冰的酒譜', () => {
    expect(makeableRecipes(['威士忌', '氣泡水'], false)).toEqual([])
  })

  it('冰塊是用最多的材料', () => {
    expect(usageCounts(ACCENTS)[0]).toEqual({ name: '冰塊', count: 19 })
  })
})
