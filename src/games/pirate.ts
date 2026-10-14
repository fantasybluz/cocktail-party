import { randomInt } from '../lib/random.ts'

// 瘋狂海盜桶：桶子上有一排洞，其中一洞是機關，插到海盜就會跳出來

export const HOLE_OPTIONS = [12, 18, 24]

export interface Barrel {
  holes: number
  // 機關在第幾洞
  trigger: number
  // 已經插了劍的洞
  filled: number[]
}

export function createBarrel(holes: number, trigger = randomInt(holes)): Barrel {
  return { holes, trigger, filled: [] }
}

export type StabResult = 'pop' | 'safe' | 'taken'

export function stab(barrel: Barrel, hole: number): { barrel: Barrel; result: StabResult } {
  if (barrel.filled.includes(hole)) return { barrel, result: 'taken' }
  const next = { ...barrel, filled: [...barrel.filled, hole] }
  return { barrel: next, result: hole === barrel.trigger ? 'pop' : 'safe' }
}

export function holesLeft(barrel: Barrel): number {
  return barrel.holes - barrel.filled.length
}
