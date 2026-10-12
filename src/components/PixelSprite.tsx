import { memo } from 'react'
import { spriteRects, type SpriteColors, type SpriteName } from '../lib/sprites.ts'

interface Props {
  name: SpriteName
  colors: SpriteColors
}

// 16x16 像素圖，用 CSS 控制顯示大小（16 的整數倍才不會糊）
export const PixelSprite = memo(function PixelSprite({ name, colors }: Props) {
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      {spriteRects(name, colors).map(({ x, y, width, fill }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={width} height={1} fill={fill} />
      ))}
    </svg>
  )
})
