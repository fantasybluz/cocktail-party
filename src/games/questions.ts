import { DARES, TRUTHS } from '../data/games.ts'
import { makeBag } from '../lib/random.ts'
import type { TruthDareType } from '../party.ts'

export interface TruthDareCard {
  type: TruthDareType
  text: string
  // 每抽一題就換一個 id，讓卡片重新播放動畫
  id: number
}

const nextTruth = makeBag(TRUTHS)
const nextDare = makeBag(DARES)
let drawCount = 0

export function drawTruthDare(type: TruthDareType): TruthDareCard {
  drawCount += 1
  return { type, text: type === 'truth' ? nextTruth() : nextDare(), id: drawCount }
}
