// 0 到 max - 1 的整數
export function randomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

export function randomOf<T>(list: readonly T[]): T {
  return list[randomInt(list.length)]
}

export function randomOther<T>(list: readonly T[], avoid: T): T {
  if (list.length < 2) return list[0]
  let item: T
  do item = randomOf(list)
  while (item === avoid)
  return item
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function shuffle<T>(list: readonly T[]): T[] {
  const result = [...list]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 洗好的牌一張一張抽，抽完才重洗，題目才不會一直重複
export function makeBag<T>(items: readonly T[]): () => T {
  let bag: T[] = []
  return () => {
    if (bag.length === 0) bag = shuffle(items)
    return bag.pop() as T
  }
}
