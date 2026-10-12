import { describe, expect, it } from 'vitest'
import { SPRITES, type SpriteColors, type SpriteName } from '../lib/sprites.ts'
import { ACCENTS, BASES, BEER, DEVIL_MIN_ABV, DEVIL_RECIPES, DEVIL_SHOTS, MIXERS, RECIPES } from './drinks.ts'
import {
  BOMB_COLORS,
  CHEST_COLORS,
  DARES,
  EXPLOSION_COLORS,
  GAME_LIST,
  HOT_POTATO_TOPICS,
  NEVER_HAVE_I_EVER,
  SPY_WORDS,
  TRUTHS,
} from './games.ts'

// 圖樣用到的顏色代號都要有定義（k 外框固定、w／d 會自動算）
function missingColors(name: SpriteName, colors: SpriteColors): string[] {
  const keys = new Set(SPRITES[name].join('').replace(/[.kwd]/g, ''))
  return [...keys].filter((key) => !(key in colors))
}

describe('像素圖樣', () => {
  it.each(Object.entries(SPRITES))('%s 是 16x16', (_, rows) => {
    expect(rows).toHaveLength(16)
    rows.forEach((row) => expect(row).toHaveLength(16))
  })

  const uses: [string, SpriteName, SpriteColors][] = [
    ...[...BASES, ...MIXERS, ...ACCENTS, BEER, ...DEVIL_SHOTS].map(
      (item) => [item.name, item.sprite, item.colors] as [string, SpriteName, SpriteColors],
    ),
    ...GAME_LIST.map((game) => [game.name, game.icon, game.colors] as [string, SpriteName, SpriteColors]),
    ['炸彈', 'bomb', BOMB_COLORS],
    ['寶箱', 'chest', CHEST_COLORS],
    ['爆炸', 'explosion', EXPLOSION_COLORS],
  ]
  it.each(uses)('%s 的顏色都有定義', (_, sprite, colors) => {
    expect(missingColors(sprite, colors)).toEqual([])
  })
})

describe('酒譜', () => {
  it.each(RECIPES.map((recipe) => [recipe.name, recipe] as const))('%s 的品項都在轉輪上、比例數量正確', (_, recipe) => {
    const [base, mixer, accent] = recipe.items
    expect(BASES.map((i) => i.name)).toContain(base)
    expect(MIXERS.map((i) => i.name)).toContain(mixer)
    const accentItem = ACCENTS.find((i) => i.name === accent)
    expect(accentItem).toBeDefined()
    expect(recipe.parts).toHaveLength(accentItem?.solid ? 2 : 3)
  })

  it('每個品項至少出現在一杯酒譜', () => {
    const used = new Set([...RECIPES, ...DEVIL_RECIPES].flatMap((recipe) => recipe.items))
    const unused = [...BASES, ...MIXERS, ...ACCENTS, BEER, ...DEVIL_SHOTS]
      .map((i) => i.name)
      .filter((name) => !used.has(name))
    expect(unused).toEqual([])
  })

  it.each(DEVIL_RECIPES.map((recipe) => [recipe.name, recipe] as const))(
    '惡魔酒譜 %s 用的是烈酒、加烈品項，而且有寫注意事項',
    (_, recipe) => {
      const [base, mixer, shot] = recipe.items
      const baseItem = BASES.find((i) => i.name === base)
      expect(baseItem?.abv).toBeGreaterThanOrEqual(DEVIL_MIN_ABV)
      expect([...MIXERS, BEER].map((i) => i.name)).toContain(mixer)
      expect(DEVIL_SHOTS.map((i) => i.name)).toContain(shot)
      expect(recipe.tag).toBe('惡魔')
      expect(recipe.parts).toHaveLength(3)
      expect(recipe.warning).toBeTruthy()
    },
  )

  it('基酒都有濃度和預設比例', () => {
    BASES.forEach((base) => {
      expect(base.abv).toBeGreaterThan(0)
      expect(base.ratio).toBeGreaterThan(0)
    })
  })
})

describe('遊戲題庫', () => {
  const banks = { TRUTHS, DARES, NEVER_HAVE_I_EVER, HOT_POTATO_TOPICS, SPY_WORDS: SPY_WORDS.map((pair) => pair.join('/')) }
  it.each(Object.entries(banks))('%s 沒有重複題目', (_, bank) => {
    expect(new Set(bank).size).toBe(bank.length)
  })
})
