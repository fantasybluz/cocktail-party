import { describe, expect, it } from 'vitest'
import { splitTeams } from '../tools/teams.ts'
import { BOARD_SIZE, moveBy, squarePosition } from './board.ts'
import { isGuessRight, newDeck, rankValue, type Card } from './cards.ts'
import { countMatches, diceMatches, judgeBid, rollDice } from './dice.ts'

const card = (rank: string): Card => ({ rank, suit: '♠', red: false })

describe('吹牛骰', () => {
  it('一人擲 5 顆，點數都在 1～6', () => {
    const dice = rollDice()
    expect(dice).toHaveLength(5)
    dice.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(6)
    })
  })

  it('1 點萬用時 1 可以當任何點，但喊 1 點時只算 1', () => {
    expect(diceMatches(1, 5, true)).toBe(true)
    expect(diceMatches(1, 5, false)).toBe(false)
    expect(diceMatches(5, 1, true)).toBe(false)
  })

  const hands = [
    [1, 5, 5, 2, 3],
    [6, 5, 1, 4, 4],
  ]

  it('算出全場符合的骰子數', () => {
    expect(countMatches(hands, 5, true)).toBe(5) // 三個 5＋兩個 1
    expect(countMatches(hands, 5, false)).toBe(3)
    expect(countMatches(hands, 1, true)).toBe(2)
  })

  it('數量夠就是喊的人說真話（開的人輸）', () => {
    expect(judgeBid(hands, 5, 5, true)).toEqual({ count: 5, bidHolds: true })
    expect(judgeBid(hands, 6, 5, true)).toEqual({ count: 5, bidHolds: false })
  })
})

describe('猜高低', () => {
  it('一副牌 52 張、沒有重複', () => {
    const deck = newDeck()
    expect(deck).toHaveLength(52)
    expect(new Set(deck.map((c) => c.rank + c.suit)).size).toBe(52)
  })

  it('A 最小、K 最大', () => {
    expect(rankValue(card('A'))).toBe(1)
    expect(rankValue(card('K'))).toBe(13)
  })

  it('猜對猜錯，一樣大算猜錯', () => {
    expect(isGuessRight(card('5'), card('9'), 'higher')).toBe(true)
    expect(isGuessRight(card('5'), card('9'), 'lower')).toBe(false)
    expect(isGuessRight(card('Q'), card('3'), 'lower')).toBe(true)
    expect(isGuessRight(card('7'), card('7'), 'higher')).toBe(false)
    expect(isGuessRight(card('7'), card('7'), 'lower')).toBe(false)
  })
})

describe('喝酒大富翁', () => {
  it('24 格剛好繞 7x7 外圈一圈、不重複', () => {
    const cells = Array.from({ length: BOARD_SIZE }, (_, i) => squarePosition(i))
    expect(new Set(cells.map(([row, col]) => `${row},${col}`)).size).toBe(BOARD_SIZE)
    cells.forEach(([row, col]) => {
      expect(row === 1 || row === 7 || col === 1 || col === 7).toBe(true)
    })
    expect(cells[0]).toEqual([1, 1])
    expect(cells[6]).toEqual([1, 7])
    expect(cells[12]).toEqual([7, 7])
    expect(cells[18]).toEqual([7, 1])
  })

  it('繞過起點會回到前面，往前經過起點要標記', () => {
    expect(moveBy(22, 3)).toEqual({ to: 1, passedStart: true })
    expect(moveBy(3, 2)).toEqual({ to: 5, passedStart: false })
    expect(moveBy(1, -2)).toEqual({ to: 23, passedStart: false })
  })
})

describe('分組', () => {
  it('每個人都分到、人數差最多一個', () => {
    const people = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const teams = splitTeams(people, 3)
    expect(teams.flat().sort()).toEqual(people)
    const sizes = teams.map((team) => team.length)
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1)
  })
})
