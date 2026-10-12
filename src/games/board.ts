// 喝酒大富翁：24 格排成 7x7 的外圈

export const BOARD_SIZE = 24
const GRID = 7

// 第 index 格在 7x7 格子裡的位置（列, 欄，從 1 開始），從左上角順時針
export function squarePosition(index: number): [number, number] {
  const top = GRID // 上排 7 格：0～6
  const right = GRID - 1 // 右排 6 格：7～12
  const bottom = GRID - 1 // 下排 6 格：13～18
  if (index < top) return [1, index + 1]
  if (index < top + right) return [index - top + 2, GRID]
  if (index < top + right + bottom) return [GRID, GRID - (index - top - right) - 1]
  return [GRID - (index - top - right - bottom) - 1, 1]
}

export interface Move {
  to: number
  // 往前走時經過或停在起點
  passedStart: boolean
}

export function moveBy(from: number, steps: number): Move {
  const raw = from + steps
  return {
    to: ((raw % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE,
    passedStart: steps > 0 && raw >= BOARD_SIZE,
  }
}
