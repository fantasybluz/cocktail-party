import { C, footer, meter, PAD, panel, paragraph, renderImage, sprite, stripes, text, textWidth, WIDTH } from '../lib/shareImage.ts'
import { estimate, fizzLabel, ratioText, sweetLabel, type Recipe } from './recipes.ts'

const TAG_COLORS: Record<string, string> = { 人氣: C.red, 經典: C.orange, 創意: C.green, 惡魔: C.ink, 實驗: '#6b5ca5' }

// 拉霸機轉出來的酒譜卡
export function drawRecipeImage(recipe: Recipe, { devil = false, loser = false } = {}): HTMLCanvasElement {
  return renderImage((ctx) => {
    const inner = WIDTH - PAD * 2
    let y = PAD

    // 招牌
    stripes(ctx, PAD, y, inner, devil ? [C.red, C.ink, C.red] : undefined)
    y += 48
    text(ctx, devil ? '惡魔' : '超商', PAD, y, { size: 48, color: C.red })
    text(ctx, '調酒拉霸機', PAD + textWidth(ctx, '超商', 48), y, { size: 48, color: C.cream })
    y += 96

    text(ctx, loser ? '輸家喝這杯' : '今晚調這杯', PAD, y, { size: 36, color: C.muted })
    y += 60
    y = paragraph(ctx, recipe.name, PAD, y, inner, { size: 96, color: C.cream, lineHeight: 112 })
    y += 16
    const tagWidth = textWidth(ctx, recipe.tag, 36) + 32
    ctx.fillStyle = TAG_COLORS[recipe.tag] ?? C.green
    ctx.fillRect(PAD, y, tagWidth, 56)
    text(ctx, recipe.tag, PAD + 16, y + 10, { size: 36, color: recipe.tag === '惡魔' ? C.red : C.cream })
    y += 104

    // 三個品項
    const labels = devil ? ['基酒', '材料一', '加烈'] : ['基酒', '材料一', '材料二']
    const columnWidth = inner / 3
    const boxTop = y
    panel(ctx, PAD, boxTop, inner, 320, C.cream, C.creamDark)
    recipe.items.forEach((item, i) => {
      const cx = PAD + columnWidth * i + columnWidth / 2
      text(ctx, labels[i], cx, boxTop + 24, { size: 24, color: C.soft, align: 'center' })
      sprite(ctx, item.sprite, item.colors, cx - 80, boxTop + 64, 10)
      text(ctx, item.name, cx, boxTop + 240, { size: 36, color: C.ink, align: 'center' })
    })
    y = boxTop + 320 + 56

    // 比例、口感、注意
    text(ctx, '比例', PAD, y, { size: 36, color: C.muted })
    y = paragraph(ctx, ratioText(recipe), PAD + 120, y, inner - 120, { size: 36, color: C.cream })
    const accent = recipe.items[2]
    if (accent.solid) {
      y += 12
      text(ctx, '加料', PAD, y, { size: 36, color: C.muted })
      y = paragraph(ctx, `${accent.name}，${accent.howTo}`, PAD + 120, y, inner - 120, { size: 36, color: C.cream })
    }
    y += 12
    text(ctx, '口感', PAD, y, { size: 36, color: C.muted })
    y = paragraph(ctx, recipe.taste, PAD + 120, y, inner - 120, { size: 36, color: C.cream })
    if (recipe.warning) {
      y += 12
      text(ctx, '注意', PAD, y, { size: 36, color: C.red })
      y = paragraph(ctx, recipe.warning, PAD + 120, y, inner - 120, { size: 36, color: C.red })
    }

    // 酒感、甜度、氣泡
    y += 40
    const result = estimate(recipe)
    const rows: [string, number, string, string][] = [
      ['酒感', result.strength, `約 ${Math.round(result.abv)}%`, C.red],
      ['甜度', result.sweet, sweetLabel(result.sweet), C.pink],
      ['氣泡', result.fizz, fizzLabel(result.fizz), C.sky],
    ]
    rows.forEach(([label, level, value, color]) => {
      text(ctx, label, PAD, y, { size: 36, color: C.muted })
      meter(ctx, PAD + 120, y + 2, level, color)
      text(ctx, value, PAD + 120 + 296, y, { size: 36, color: C.cream })
      y += 60
    })

    y += 24
    text(ctx, devil ? '惡魔模式 1 份 ≈ 一個 shot 杯（30ml），量力而為' : '1 份 ≈ 一瓶 50ml 迷你酒', PAD, y, {
      size: 24,
      color: C.muted,
    })
    y += 72
    return footer(ctx, y)
  })
}
