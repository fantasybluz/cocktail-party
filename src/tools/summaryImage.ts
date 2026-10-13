import { C, footer, PAD, panel, paragraph, renderImage, sprite, stripes, text, WIDTH } from '../lib/shareImage.ts'
import { AWARD_ICONS } from './awardIcons.ts'
import { formatSpan, formatTime, type PartyStats } from './summary.ts'

// 派對結算圖：獎項＋每個人的杯數長條圖
export function drawSummaryImage(stats: PartyStats, date: Date): HTMLCanvasElement {
  return renderImage((ctx) => {
    const inner = WIDTH - PAD * 2
    let y = PAD
    stripes(ctx, PAD, y, inner)
    y += 56
    text(ctx, '今晚結算', PAD, y, { size: 96, color: C.cream })
    y += 120
    const when = [`${date.getMonth() + 1}/${date.getDate()}`]
    if (stats.start && stats.end) when.push(formatSpan(stats.start, stats.end))
    text(ctx, when.join('　'), PAD, y, { size: 36, color: C.muted })
    y += 64
    text(ctx, `總共 ${stats.total} 杯・${stats.players.length} 人・平均 ${stats.average.toFixed(1)} 杯`, PAD, y, {
      size: 48,
      color: C.yellow,
    })
    y += 104

    // 獎項，兩欄
    const gap = 32
    const cardWidth = (inner - gap) / 2
    const cardHeight = 200
    stats.awards.forEach((award, i) => {
      const x = PAD + (i % 2) * (cardWidth + gap)
      const top = y + Math.floor(i / 2) * (cardHeight + gap)
      panel(ctx, x, top, cardWidth, cardHeight, C.cream, C.creamDark)
      const icon = AWARD_ICONS[award.id]
      sprite(ctx, icon.sprite, icon.colors, x + 24, top + 52, 6)
      text(ctx, award.title, x + 148, top + 28, { size: 36, color: C.soft })
      paragraph(ctx, award.names.join('、'), x + 148, top + 76, cardWidth - 172, { size: 48, color: C.ink, lineHeight: 52 })
      text(ctx, award.value, x + 148, top + 140, { size: 24, color: C.red })
    })
    y += Math.ceil(stats.awards.length / 2) * (cardHeight + gap) + 32

    // 每個人的杯數
    if (stats.players.length > 0) {
      text(ctx, '每個人喝了幾杯', PAD, y, { size: 36, color: C.muted })
      y += 64
      const max = Math.max(1, ...stats.players.map((p) => p.drinks))
      const barLeft = PAD + 220
      const barWidth = inner - 220 - 120
      stats.players.forEach((player) => {
        text(ctx, player.name, PAD, y + 4, { size: 36, color: C.cream })
        ctx.fillStyle = C.dot
        ctx.fillRect(barLeft, y, barWidth, 48)
        ctx.fillStyle = C.orange
        ctx.fillRect(barLeft, y, Math.round((barWidth * player.drinks) / max), 48)
        text(ctx, `${player.drinks}`, WIDTH - PAD, y + 4, { size: 36, color: C.cream, align: 'right' })
        y += 72
      })
      y += 24
    }

    if (stats.topGame) {
      text(ctx, `最多人喝的遊戲：${stats.topGame.game}（${stats.topGame.count} 杯）`, PAD, y, { size: 36, color: C.cream })
      y += 60
    }
    if (stats.peak) {
      text(ctx, `最熱鬧的時段：${formatTime(stats.peak.start)} 起 30 分鐘內 ${stats.peak.count} 杯`, PAD, y, {
        size: 36,
        color: C.cream,
      })
      y += 60
    }
    y += 48
    return footer(ctx, y)
  })
}
