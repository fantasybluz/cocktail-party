import { BOMB_COLORS } from '../data/games.ts'
import type { SpriteColors, SpriteName } from '../lib/sprites.ts'
import type { AwardId } from './summary.ts'

// 每個獎項的像素圖示（結算頁和分享圖共用）
export const AWARD_ICONS: Record<AwardId, { sprite: SpriteName; colors: SpriteColors }> = {
  king: { sprite: 'mug', colors: { a: '#f2c230', b: '#fff7e3' } },
  boom: { sprite: 'bomb', colors: BOMB_COLORS },
  challenge: { sprite: 'bubble', colors: { a: '#ffffff', e: '#e63946' } },
  lose: { sprite: 'die1', colors: { a: '#ffffff', e: '#e63946' } },
  water: { sprite: 'iceCup', colors: { a: '#bfe3f5', b: '#f4fbff', w: '#ffffff' } },
  first: { sprite: 'target', colors: { a: '#e63946', b: '#fff7e3', c: '#e63946' } },
  sober: { sprite: 'heads', colors: { a: '#f2c9a0', b: '#ffffff', e: '#2fb37f' } },
}
