import { spriteRects, type SpriteColors, type SpriteName } from './sprites.ts'

// 分享圖：用 canvas 畫像素風的圖片（字級用 12 的倍數，像素字型才會清楚）

export const C = {
  ink: '#1b1b2f',
  bg: '#2b2d42',
  dot: '#3a3d5c',
  cream: '#fff7e3',
  creamDark: '#e6d8b8',
  soft: '#7a6f57',
  muted: '#a3a6c4',
  orange: '#f47920',
  red: '#e63946',
  redDark: '#a4161a',
  green: '#00845a',
  greenDark: '#005c3f',
  yellow: '#ffd23f',
  blue: '#3a7bd5',
  pink: '#ff7aa8',
  sky: '#4cb8f0',
  lcdBg: '#0f2a1d',
  lcdText: '#7dffa8',
  lcdDim: '#4fae72',
}

export const WIDTH = 1080
export const PAD = 64
const FONT = 'Cubic11'

export type Ctx = CanvasRenderingContext2D

interface TextOptions {
  size: number
  color: string
  align?: CanvasTextAlign
}

export async function loadFont(): Promise<void> {
  try {
    await document.fonts.load(`48px ${FONT}`)
  } catch {
    // 字型載不到就用系統字
  }
}

function setFont(ctx: Ctx, size: number) {
  ctx.font = `${size}px ${FONT}, "PingFang TC", sans-serif`
}

// 中文一個字一個字斷行，英數字連在一起的不拆開
export function wrap(ctx: Ctx, text: string, maxWidth: number, size: number): string[] {
  setFont(ctx, size)
  const tokens = text.match(/[A-Za-z0-9.%+:/-]+|\s|./gu) ?? []
  const lines: string[] = []
  let line = ''
  for (const token of tokens) {
    if (ctx.measureText(line + token).width > maxWidth && line) {
      lines.push(line.trimEnd())
      line = token.trimStart()
    } else {
      line += token
    }
  }
  if (line) lines.push(line)
  return lines
}

export function text(ctx: Ctx, value: string, x: number, y: number, { size, color, align = 'left' }: TextOptions) {
  setFont(ctx, size)
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  ctx.fillText(value, x, y)
}

// 多行文字，回傳畫完後的 y
export function paragraph(ctx: Ctx, value: string, x: number, y: number, maxWidth: number, options: TextOptions & { lineHeight?: number }) {
  const lineHeight = options.lineHeight ?? Math.round(options.size * 1.5)
  const lines = wrap(ctx, value, maxWidth, options.size)
  lines.forEach((line, i) => text(ctx, line, x, y + i * lineHeight, options))
  return y + lines.length * lineHeight
}

export function textWidth(ctx: Ctx, value: string, size: number): number {
  setFont(ctx, size)
  return ctx.measureText(value).width
}

// 像素面板：底色＋四邊外框（角落留空看起來像像素圓角）＋右下陰影
export function panel(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, shade?: string) {
  const px = 6
  ctx.fillStyle = fill
  ctx.fillRect(x, y, w, h)
  if (shade) {
    ctx.fillStyle = shade
    ctx.fillRect(x, y + h - px, w, px)
    ctx.fillRect(x + w - px, y, px, h)
  }
  ctx.fillStyle = C.ink
  ctx.fillRect(x, y - px, w, px)
  ctx.fillRect(x, y + h, w, px)
  ctx.fillRect(x - px, y, px, h)
  ctx.fillRect(x + w, y, px, h)
}

export function sprite(ctx: Ctx, name: SpriteName, colors: SpriteColors, x: number, y: number, scale: number) {
  spriteRects(name, colors).forEach((rect) => {
    ctx.fillStyle = rect.fill
    ctx.fillRect(x + rect.x * scale, y + rect.y * scale, rect.width * scale, scale)
  })
}

// 招牌的橘紅綠三條線
export function stripes(ctx: Ctx, x: number, y: number, w: number, colors = [C.orange, C.red, C.green]) {
  colors.forEach((color, i) => {
    ctx.fillStyle = color
    ctx.fillRect(x, y + i * 8, w, 8)
  })
}

// 五格量表
export function meter(ctx: Ctx, x: number, y: number, level: number, color: string) {
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < level ? color : C.creamDark
    ctx.fillRect(x + i * 56, y, 48, 32)
  }
}

// 頁尾：網址和法定警語
export function footer(ctx: Ctx, y: number): number {
  text(ctx, '超商調酒拉霸機', PAD, y, { size: 36, color: C.cream })
  text(ctx, 'fantasybluz.github.io/cocktail-party', PAD, y + 52, { size: 24, color: C.muted })
  text(ctx, '禁止酒駕・飲酒過量，有害健康', WIDTH - PAD, y + 52, { size: 24, color: C.muted, align: 'right' })
  return y + 100
}

// 先畫在很高的畫布上，量出內容高度後再裁切成剛好的大小
export function renderImage(draw: (ctx: Ctx) => number): HTMLCanvasElement {
  const scratch = document.createElement('canvas')
  scratch.width = WIDTH
  scratch.height = 4000
  const ctx = scratch.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, scratch.width, scratch.height)
  ctx.fillStyle = C.dot
  for (let y = 21; y < scratch.height; y += 24) for (let x = 21; x < scratch.width; x += 24) ctx.fillRect(x, y, 3, 3)

  const height = Math.min(scratch.height, Math.ceil(draw(ctx) + PAD))
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = height
  canvas.getContext('2d')!.drawImage(scratch, 0, 0)
  return canvas
}

export interface ShareResult {
  status: 'shared' | 'cancelled' | 'preview'
  url?: string
}

// 手機支援就直接開分享選單（可以選 LINE）；不支援就回傳圖片網址讓畫面顯示，長按儲存
export async function shareCanvas(canvas: HTMLCanvasElement, filename: string, message: string): Promise<ShareResult> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return { status: 'cancelled' }
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: message })
      return { status: 'shared' }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return { status: 'cancelled' }
    }
  }
  return { status: 'preview', url: URL.createObjectURL(blob) }
}
