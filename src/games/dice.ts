import { randomInt } from '../lib/random.ts'

// 吹牛骰的規則

export const DICE_PER_PLAYER = 5

export function rollDice(count = DICE_PER_PLAYER): number[] {
  return Array.from({ length: count }, () => randomInt(6) + 1)
}

// 這顆骰子算不算進喊的點數；1 點萬用時 1 可以當任何點，但喊 1 點時只算 1
export function diceMatches(value: number, face: number, wildOnes: boolean): boolean {
  return value === face || (wildOnes && face !== 1 && value === 1)
}

export function countMatches(hands: number[][], face: number, wildOnes: boolean): number {
  return hands.flat().filter((value) => diceMatches(value, face, wildOnes)).length
}

export interface LiarResult {
  count: number
  // 喊的是真的（數量夠）→ 開的人輸；不夠 → 喊的人輸
  bidHolds: boolean
}

export function judgeBid(hands: number[][], quantity: number, face: number, wildOnes: boolean): LiarResult {
  const count = countMatches(hands, face, wildOnes)
  return { count, bidHolds: count >= quantity }
}
