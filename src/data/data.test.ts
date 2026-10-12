import { describe, expect, it } from 'vitest'
import { SPRITES, type SpriteColors, type SpriteName } from '../lib/sprites.ts'
import { ACCENTS, BASES, BEER, DEVIL_MIN_ABV, DEVIL_RECIPES, DEVIL_SHOTS, MIXERS, RECIPES } from './drinks.ts'
import {
  BOARD_SQUARES,
  BOMB_COLORS,
  CHEST_COLORS,
  DARES,
  DARES_ADULT,
  DRAW_WORDS,
  EXPLOSION_COLORS,
  GAME_LIST,
  HEADS_UP_DECKS,
  HOT_POTATO_TOPICS,
  MOST_LIKELY,
  MOST_LIKELY_ADULT,
  NEVER_ADULT,
  NEVER_HAVE_I_EVER,
  SPY_WORDS,
  TOOL_LIST,
  TRUTHS,
  TRUTHS_ADULT,
  TWO_TRUTHS_ADULT,
  TWO_TRUTHS_TOPICS,
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
    ...[...GAME_LIST, ...TOOL_LIST].map((game) => [game.name, game.icon, game.colors] as [string, SpriteName, SpriteColors]),
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
  const banks = {
    TRUTHS,
    DARES,
    NEVER_HAVE_I_EVER,
    HOT_POTATO_TOPICS,
    SPY_WORDS: SPY_WORDS.map((pair) => pair.join('/')),
    DRAW_WORDS,
    MOST_LIKELY,
    TWO_TRUTHS_TOPICS,
    TRUTHS_ADULT,
    DARES_ADULT,
    NEVER_ADULT,
    MOST_LIKELY_ADULT,
    TWO_TRUTHS_ADULT,
    ...Object.fromEntries(HEADS_UP_DECKS.map((deck) => [`頭上猜詞：${deck.name}`, deck.words])),
  }
  it.each(Object.entries(banks))('%s 沒有重複題目、至少 20 題', (_, bank) => {
    expect(new Set(bank).size).toBe(bank.length)
    expect(bank.length).toBeGreaterThanOrEqual(20)
  })

  it('成人模式的大冒險，碰到別人的都要寫「對方同意」', () => {
    const touching = DARES_ADULT.filter((dare) => /擁抱|十指緊扣|牽手|親/.test(dare))
    touching.forEach((dare) => expect(dare).toContain('同意'))
  })

  it('大富翁 24 格，移動格都有步數', () => {
    expect(BOARD_SQUARES).toHaveLength(24)
    expect(BOARD_SQUARES[0].kind).toBe('start')
    BOARD_SQUARES.filter((square) => square.kind === 'forward' || square.kind === 'back').forEach((square) =>
      expect(square.move).toBeTruthy(),
    )
  })

  it('遊戲和工具的 id 不重複', () => {
    const ids = [...GAME_LIST, ...TOOL_LIST].map((game) => game.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
