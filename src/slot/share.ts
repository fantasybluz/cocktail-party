import { ratioText, type Recipe } from './recipes.ts'

export function shareToLine(recipe: Recipe, devil = false): void {
  const accent = recipe.items[2]
  const lines = [
    devil ? '😈 超商調酒拉霸機・惡魔模式' : '🎰 超商調酒拉霸機',
    `今晚調這杯：${recipe.name}`,
    `比例：${ratioText(recipe)}${accent.solid ? ` ＋ ${accent.name}` : ''}`,
    `口感：${recipe.taste}`,
  ]
  if (recipe.warning) lines.push(`注意：${recipe.warning}`)
  // 用檔案直接打開時網址是本機路徑，別人點不到，就不附連結
  if (window.location.protocol.startsWith('http')) {
    lines.push(`你也來轉一杯 👉 ${window.location.href.split(/[?#]/)[0]}`)
  }
  const url = `https://line.me/R/share?text=${encodeURIComponent(lines.join('\n'))}`

  // LINE 內建瀏覽器直接換頁就會跳出選聊天室的畫面；其他瀏覽器開新分頁
  if (/\bLine\//i.test(navigator.userAgent)) {
    window.location.href = url
  } else {
    window.open(url, '_blank', 'noopener')
  }
}
