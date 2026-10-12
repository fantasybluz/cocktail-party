import {
  ACCENTS,
  BASES,
  BEER,
  DEVIL_MIN_ABV,
  DEVIL_RECIPES,
  DEVIL_SHOTS,
  MIXERS,
  RECIPES,
  type Item,
  type RecipeData,
  type RecipeTag,
} from '../data/drinks.ts'
import { clamp, randomOf } from '../lib/random.ts'

export interface Recipe {
  name: string
  tag: RecipeTag
  // 基酒、材料一、材料二（惡魔模式是加烈）
  items: [Item, Item, Item]
  parts: number[]
  taste: string
  warning?: string
}

export type Mode = 'normal' | 'devil'
export type Locks = [Item | null, Item | null, Item | null]
type ReelLists = readonly [Item[], Item[], Item[]]

// 每個模式三個轉輪的品項和名稱
export const REELS: Record<Mode, { items: ReelLists; labels: readonly [string, string, string] }> = {
  normal: { items: [BASES, MIXERS, ACCENTS], labels: ['基酒', '材料一', '材料二'] },
  devil: {
    items: [BASES.filter((base) => (base.abv ?? 0) >= DEVIL_MIN_ABV), [...MIXERS, BEER], DEVIL_SHOTS],
    labels: ['基酒', '材料一', '加烈'],
  },
}

export const SCREEN_TITLES: Record<RecipeTag, string> = {
  人氣: '★ 網友人氣酒譜 ★',
  經典: '★ 經典調酒 ★',
  創意: '♪ 創意酒譜',
  惡魔: '!! 惡魔調酒 !!',
  實驗: '?! 實驗組合',
}

// 把酒譜裡的品名換成品項物件，打錯字直接報錯
function resolve(list: RecipeData[], [bases, mixers, accents]: ReelLists): Recipe[] {
  const find = (items: Item[], name: string) => {
    const item = items.find((i) => i.name === name)
    if (!item) throw new Error(`酒譜裡的「${name}」不在轉輪品項裡`)
    return item
  }
  return list.map((recipe) => ({
    ...recipe,
    items: [find(bases, recipe.items[0]), find(mixers, recipe.items[1]), find(accents, recipe.items[2])],
  }))
}

export const RECIPES_BY_MODE: Record<Mode, Recipe[]> = {
  normal: resolve(RECIPES, REELS.normal.items),
  devil: resolve(DEVIL_RECIPES, REELS.devil.items),
}

export const recipes = RECIPES_BY_MODE.normal

// locks：鎖定的轉輪停在哪個品項；last：上一杯，盡量不要連續出一樣的
export function pickRecipe(locks: Locks, last: Recipe | null = null, mode: Mode = 'normal'): Recipe {
  let matches = RECIPES_BY_MODE[mode].filter((recipe) => recipe.items.every((item, i) => !locks[i] || locks[i] === item))
  if (matches.length === 0) return experimentRecipe(locks, mode)
  if (matches.length > 1) matches = matches.filter((recipe) => recipe !== last)

  // 先平均挑基酒再挑酒譜，酒譜多的基酒才不會一直出現
  const base = randomOf([...new Set(matches.map((recipe) => recipe.items[0]))])
  return randomOf(matches.filter((recipe) => recipe.items[0] === base))
}

// 鎖定的組合沒有現成酒譜時，自己組一杯
export function experimentRecipe(locks: Locks, mode: Mode = 'normal'): Recipe {
  const items = REELS[mode].items.map((list, i) => locks[i] ?? randomOf(list)) as [Item, Item, Item]
  const [base, mixer, accent] = items

  if (mode === 'devil') {
    return {
      name: `${base.name}${mixer.name}炸彈`,
      tag: '實驗',
      items,
      parts: [1, 2, 1],
      taste: `${base.flavor}配上${mixer.flavor}，再灌${accent.flavor}。沒人試過的惡魔組合，喝之前三思！`,
      warning: '兩份烈酒的濃度，比喝起來烈很多',
    }
  }

  const ratio = base.ratio ?? 3
  return {
    name: `${base.name}${mixer.name}`,
    tag: '實驗',
    items,
    parts: accent.solid ? [1, ratio] : [1, ratio, 1],
    taste: `${base.flavor}配上${mixer.flavor}，再加${accent.flavor}。沒有現成酒譜，喝完跟朋友回報！`,
  }
}

export interface Estimate {
  abv: number
  // 下面三個都是 0~5 格
  strength: number
  sweet: number
  fizz: number
}

// 用各品項的濃度、甜度、氣泡，依比例加權估算
export function estimate({ items, parts }: Recipe): Estimate {
  const total = parts.reduce((sum, p) => sum + p, 0)
  const average = (key: 'abv' | 'sweet' | 'fizz') =>
    parts.reduce((sum, p, i) => sum + (items[i][key] ?? 0) * p, 0) / total
  const abv = average('abv')
  let sweet = average('sweet')
  const accent = items[2]
  if (accent.solid && accent.sweet) sweet = (sweet * total + accent.sweet) / (total + 1)

  return {
    abv,
    strength: clamp(Math.ceil(abv / 4), 1, 5),
    sweet: clamp(Math.round((sweet / 3) * 5), 0, 5),
    fizz: clamp(Math.round((average('fizz') / 3) * 5), 0, 5),
  }
}

export function ratioText({ items, parts }: Recipe): string {
  return parts.map((p, i) => `${items[i].name} ${p}`).join(' : ')
}

export function sweetLabel(level: number): string {
  if (level === 0) return '不甜'
  if (level <= 2) return '微甜'
  return level === 3 ? '偏甜' : '很甜'
}

export function fizzLabel(level: number): string {
  if (level === 0) return '沒有氣泡'
  return level <= 2 ? '微氣泡' : '氣泡多'
}
