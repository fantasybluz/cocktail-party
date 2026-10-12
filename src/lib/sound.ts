// 8-bit 方波音效，用 Web Audio 即時合成，不需要音檔

const SOUND_KEY = 'mix-slot-sound'

interface ToneOptions {
  delay?: number
  volume?: number
  type?: OscillatorType
  // 音高滑到這個頻率（爆炸聲用）
  slideTo?: number
}

let ctx: AudioContext | null = null
let tickTimer: number | undefined
let enabled = true
const listeners = new Set<() => void>()

try {
  enabled = localStorage.getItem(SOUND_KEY) !== 'off'
} catch {
  // 無痕模式等情況讀不到，就用預設值
}

function context(): AudioContext | null {
  if (!ctx) {
    const AudioCtx =
      window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, duration: number, { delay = 0, volume = 0.05, type = 'square', slideTo }: ToneOptions = {}) {
  if (!enabled) return
  const c = context()
  if (!c) return
  const start = c.currentTime + delay
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(start)
  osc.stop(start + duration)
}

function stopTicking() {
  clearInterval(tickTimer)
  tickTimer = undefined
}

export const sound = {
  isEnabled: () => enabled,
  // 給 useSyncExternalStore 用，開關音效時通知畫面更新
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  toggle() {
    enabled = !enabled
    try {
      localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off')
    } catch {
      // 存不了就只在這次有效
    }
    tone(880, 0.08)
    listeners.forEach((listener) => listener())
  },
  // iOS 要在點擊當下建立 AudioContext 才會有聲音
  unlock() {
    if (enabled) context()
  },
  startTicking() {
    stopTicking()
    tickTimer = window.setInterval(() => tone(1400, 0.02, { volume: 0.02 }), 70)
  },
  stopTicking,
  stop: () => tone(180, 0.08, { volume: 0.07 }),
  blip: (up: boolean) => tone(up ? 990 : 660, 0.06),
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.12, { delay: i * 0.09 })),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.14, { delay: i * 0.12, volume: 0.04 })),
  // progress 0~1，越接近 1 音越高（傳手機炸彈越來越急）
  tick: (progress = 0) => tone(900 + 700 * progress, 0.03, { volume: 0.04 }),
  boom() {
    tone(220, 0.7, { type: 'sawtooth', slideTo: 30, volume: 0.12 })
    tone(110, 0.5, { slideTo: 20, volume: 0.08, delay: 0.02 })
  },
}

export function vibrate(pattern: number | number[]): void {
  // iOS 沒有震動 API
  navigator.vibrate?.(pattern)
}
