import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { PixelSprite } from '../components/PixelSprite.tsx'
import { BOMB_COLORS, HOT_POTATO_TOPICS } from '../data/games.ts'
import { makeBag } from '../lib/random.ts'
import { sound } from '../lib/sound.ts'
import { readStore, writeStore } from '../lib/storage.ts'
import { useParty } from '../party.ts'
import { GamePage } from './GamePage.tsx'

const LENGTHS = { short: [10, 20], medium: [20, 40], long: [40, 70] } as const // 秒數範圍
type Length = keyof typeof LENGTHS
const LENGTH_LABELS: Record<Length, string> = { short: '短', medium: '中', long: '長' }
const LENGTH_KEY = 'mix-slot-hot-potato-length'

// 記住上次選的長度（離開這頁元件會卸載）
function loadLength(): Length {
  const saved = readStore<string>(LENGTH_KEY, 'medium')
  return saved in LENGTHS ? (saved as Length) : 'medium'
}

// 放在元件外，離開再回來題目也不會重複
const nextTopic = makeBag(HOT_POTATO_TOPICS)

// 離開這頁時元件會卸載，倒數就跟著停止
export function HotPotato() {
  const { showBoom } = useParty()
  const [length, setLength] = useState(loadLength)
  const [topic, setTopic] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [pulse, setPulse] = useState(1000)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  function start() {
    sound.unlock()
    const [min, max] = LENGTHS[length]
    const duration = (min + Math.random() * (max - min)) * 1000
    const startedAt = Date.now()
    const current = nextTopic()
    setTopic(current)
    setRunning(true)

    // 越接近爆炸滴答越快，但看不出確切什麼時候爆
    const tick = () => {
      const elapsed = Date.now() - startedAt
      if (elapsed >= duration) {
        setRunning(false)
        showBoom({ text: `題目：${current}\n爆炸時拿著手機的人喝！`, onAgain: start })
        return
      }
      const progress = elapsed / duration
      const interval = 700 - 580 * progress
      setPulse(Math.round(interval * 2))
      sound.tick(progress)
      timer.current = window.setTimeout(tick, Math.min(interval, duration - elapsed))
    }
    tick()
  }

  return (
    <GamePage
      title="傳手機炸彈"
      rule="按開始後炸彈會偷偷倒數。拿到手機的人說出一個符合題目的答案，再傳給下一個人，爆炸時拿著手機的人喝。"
    >
      <div
        className={running ? 'hp-stage is-running' : 'hp-stage'}
        id="hp-stage"
        style={{ '--pulse': `${pulse}ms` } as CSSProperties}
      >
        <div className="hp-bomb">
          <PixelSprite name="bomb" colors={BOMB_COLORS} />
        </div>
        <p className="hp-label">說出一個⋯</p>
        <p className="hp-topic" id="hp-topic">
          {topic ?? '按開始抽題目'}
        </p>
      </div>
      <div className="segmented" id="hp-length" role="group" aria-label="炸彈時間">
        {(Object.keys(LENGTHS) as Length[]).map((value) => (
          <button
            key={value}
            type="button"
            data-value={value}
            className={value === length ? 'is-active' : undefined}
            aria-pressed={value === length}
            onClick={() => {
              setLength(value)
              writeStore(LENGTH_KEY, value)
              sound.blip(true)
            }}
          >
            {LENGTH_LABELS[value]}
          </button>
        ))}
      </div>
      <button className="btn btn--orange btn--big" id="hp-start" type="button" disabled={running} onClick={start}>
        {running ? '倒數中，快傳！' : '開始'}
      </button>
      <button
        className="btn btn--small"
        type="button"
        onClick={() => {
          setTopic(nextTopic())
          sound.blip(true)
        }}
      >
        換題目
      </button>
    </GamePage>
  )
}
