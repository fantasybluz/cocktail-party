import { ACCENTS, BASES, MIXERS, RECIPES, type Item, type RecipeTag } from '../data/drinks.ts'
import { clamp, randomOf } from '../lib/random.ts'

export interface Recipe {
  name: string
  tag: RecipeTag
  // 基酒、材料一、材料二
  items: [Item, Item, Item]
  parts: number[]
  taste: string
}

export type Locks = [Item | null, Item | null, Item | null]

export const REEL_ITEMS: readonly [Item[], Item[], Item[]] = [BASES, MIXERS, ACCENTS]

export const SCREEN_TITLES: Record<RecipeTag, string> = {
  人氣: '★ 網友人氣酒譜 ★',
  經典: '★ 經典調酒 ★',
  創意: '♪ 創意酒譜',
  實驗: '?! 實驗組合',
}

// 把酒譜裡的品名換成品項物件，打錯字直接報錯
function findItem(list: Item[], name: string): Item {
  const item = list.find((i) => i.name === name)
  if (!item) throw new Error(`酒譜裡的「${name}」不在轉輪品項裡`)
  return item
}

export const recipes: Recipe[] = RECIPES.map((recipe) => ({
  ...recipe,
  items: [findItem(BASES, recipe.items[0]), findItem(MIXERS, recipe.items[1]), findItem(ACCENTS, recipe.items[2])],
}))

// locks：鎖定的轉輪停在哪個品項；last：上一杯，盡量不要連續出一樣的
export function pickRecipe(locks: Locks, last: Recipe | null = null): Recipe {
  let matches = recipes.filter((recipe) => recipe.items.every((item, i) => !locks[i] || locks[i] === item))
  if (matches.length === 0) return experimentRecipe(locks)
  if (matches.length > 1) matches = matches.filter((recipe) => recipe !== last)

  // 先平均挑基酒再挑酒譜，酒譜多的基酒才不會一直出現
  const base = randomOf([...new Set(matches.map((recipe) => recipe.items[0]))])
  return randomOf(matches.filter((recipe) => recipe.items[0] === base))
}

// 鎖定的組合沒有現成酒譜時，自己組一杯
export function experimentRecipe(locks: Locks): Recipe {
  const items = REEL_ITEMS.map((list, i) => locks[i] ?? randomOf(list)) as [Item, Item, Item]
  const [base, mixer, accent] = items
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
