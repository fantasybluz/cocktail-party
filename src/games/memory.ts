import { randomInt } from '../lib/random.ts'

// 記憶挑戰：四色燈號依序閃，每傳給下一個人就多一步，記錯的人喝

export const PADS = [
  { name: '紅', color: '#e63946', freq: 330 },
  { name: '黃', color: '#ffd23f', freq: 392 },
  { name: '綠', color: '#2fb37f', freq: 494 },
  { name: '藍', color: '#3a7bd5', freq: 587 },
]

export function addStep(sequence: number[], next = randomInt(PADS.length)): number[] {
  return [...sequence, next]
}

// 序列越長閃得越快，但不要快到看不清楚
export function flashMs(length: number): number {
  return Math.max(260, 620 - length * 30)
}

// 目前按到第幾個；按錯回傳 'wrong'，整串按完回傳 'done'
export function checkInput(sequence: number[], input: number[]): 'wrong' | 'done' | 'continue' {
  for (let i = 0; i < input.length; i++) if (input[i] !== sequence[i]) return 'wrong'
  return input.length === sequence.length ? 'done' : 'continue'
}
