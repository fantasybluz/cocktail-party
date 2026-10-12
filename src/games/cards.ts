import { shuffle } from '../lib/random.ts'

// 國王杯、猜高低共用的撲克牌

export interface Card {
  rank: string
  suit: string
  red: boolean
}

export const SUITS = [
  { suit: '♠', red: false },
  { suit: '♥', red: true },
  { suit: '♦', red: true },
  { suit: '♣', red: false },
]

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function newDeck(): Card[] {
  return shuffle(SUITS.flatMap(({ suit, red }) => RANKS.map((rank) => ({ rank, suit, red }))))
}

// A 最小（1），K 最大（13）
export function rankValue(card: Card): number {
  return RANKS.indexOf(card.rank) + 1
}

export type HighLowGuess = 'higher' | 'lower'

// 一樣大算猜錯
export function isGuessRight(current: Card, next: Card, guess: HighLowGuess): boolean {
  const diff = rankValue(next) - rankValue(current)
  return guess === 'higher' ? diff > 0 : diff < 0
}
