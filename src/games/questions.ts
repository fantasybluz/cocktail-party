import { DARES, DARES_ADULT, TRUTHS, TRUTHS_ADULT } from '../data/games.ts'
import { makeBag } from '../lib/random.ts'
import type { TruthDareType } from '../party.ts'

export interface TruthDareCard {
  type: TruthDareType
  text: string
  // 每抽一題就換一個 id，讓卡片重新播放動畫
  id: number
}

// 一般／成人模式各一副，分開洗牌
const BAGS = {
  normal: { truth: makeBag(TRUTHS), dare: makeBag(DARES) },
  adult: { truth: makeBag(TRUTHS_ADULT), dare: makeBag(DARES_ADULT) },
}
let drawCount = 0

export function drawTruthDare(type: TruthDareType, adult = false): TruthDareCard {
  drawCount += 1
  return { type, text: BAGS[adult ? 'adult' : 'normal'][type](), id: drawCount }
}
