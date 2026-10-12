import { DEVIL_RECIPES, RECIPES, type Item } from '../data/drinks.ts'

// 手上有這些品項（加冰塊）能做出哪幾杯酒譜
export function makeableRecipes(have: string[], withIce = true): string[] {
  const owned = new Set(withIce ? [...have, '冰塊'] : have)
  return RECIPES.filter((recipe) => recipe.items.every((name) => owned.has(name))).map((recipe) => recipe.name)
}

// 每個品項用在幾杯酒譜，由多到少排
export function usageCounts(items: Item[], devil = false): { name: string; count: number }[] {
  const list = devil ? DEVIL_RECIPES : RECIPES
  return items
    .map((item) => ({ name: item.name, count: list.filter((recipe) => recipe.items.includes(item.name)).length }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count)
}
