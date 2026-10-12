import type { SpriteName } from '../lib/sprites.ts'
import { PixelSprite } from './PixelSprite.tsx'

const RED_PIPS = { a: '#ffffff', e: '#e63946' }
const DARK_PIPS = { a: '#ffffff', e: '#1b1b2f' }

// 骰子；1 點、4 點照習慣用紅色
export function Die({ value, highlight = false }: { value: number; highlight?: boolean }) {
  return (
    <span className={highlight ? 'die is-highlight' : 'die'} aria-label={`${value} 點`}>
      <PixelSprite name={`die${value}` as SpriteName} colors={value === 1 || value === 4 ? RED_PIPS : DARK_PIPS} />
    </span>
  )
}
