import { C, footer, PAD, panel, paragraph, renderImage, stripes, text, WIDTH, wrap } from '../lib/shareImage.ts'

interface ResultImage {
  game: string
  tag: string
  text: string
  note?: string
}

// 遊戲結果：例如「BOOM！炸彈就是 37」「臥底獲勝」
export function drawResultImage({ game, tag, text: main, note }: ResultImage): HTMLCanvasElement {
  return renderImage((ctx) => {
    const inner = WIDTH - PAD * 2
    let y = PAD
    stripes(ctx, PAD, y, inner)
    y += 56
    text(ctx, game, PAD, y, { size: 72, color: C.cream })
    y += 120

    // 液晶螢幕：先算主文字有幾行，再畫剛好的高度
    const mainLines = wrap(ctx, main, inner - 96, 72)
    const screenHeight = 48 + 72 + mainLines.length * 96 + 24
    panel(ctx, PAD, y, inner, screenHeight, C.lcdBg)
    text(ctx, tag, WIDTH / 2, y + 48, { size: 36, color: C.lcdDim, align: 'center' })
    mainLines.forEach((line, i) => text(ctx, line, WIDTH / 2, y + 120 + i * 96, { size: 72, color: C.lcdText, align: 'center' }))
    y += screenHeight + 56

    if (note) y = paragraph(ctx, note, PAD, y, inner, { size: 36, color: C.cream }) + 24
    y += 48
    return footer(ctx, y)
  })
}
