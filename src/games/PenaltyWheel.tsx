import { useEffect, useRef, useState } from 'react'
import { GameResult, type ResultAction } from '../components/GameResult.tsx'
import { WHEEL_DEFAULTS } from '../data/games.ts'
import { randomInt } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { readStore, writeStore } from '../lib/storage.ts'
import { useParty } from '../party.ts'
import { GamePage } from './GamePage.tsx'

const WHEEL_KEY = 'mix-slot-wheel'
// 外圈八格順時針的位置（列, 欄），中間是開始鈕
const RING_POSITIONS = [
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 3],
  [3, 3],
  [3, 2],
  [3, 1],
  [2, 1],
]

function loadOptions(): string[] {
  const saved = readStore<unknown>(WHEEL_KEY, null)
  return Array.isArray(saved) && saved.length === WHEEL_DEFAULTS.length ? saved.map(String) : [...WHEEL_DEFAULTS]
}

// 跑燈式的轉盤：燈繞著外圈跑，越轉越慢，停在哪格就照做
export function PenaltyWheel() {
  const { openTruthDare } = useParty()
  const [options, setOptions] = useState(loadOptions)
  const [lit, setLit] = useState(-1)
  const [running, setRunning] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [draft, setDraft] = useState<string[] | null>(null) // 編輯中的選項
  const timer = useRef(0)
  const litRef = useRef(-1)

  // 離開這頁（元件卸載）就停止
  useEffect(() => () => clearTimeout(timer.current), [])

  function start() {
    sound.unlock()
    setRunning(true)
    setWinner(null)

    const count = options.length
    const from = Math.max(litRef.current, 0)
    const target = randomInt(count)
    // 至少繞三圈，最後停在目標
    const steps = count * 3 + ((target - from + count) % count)
    let step = 0
    let current = from

    const tick = () => {
      current = (current + 1) % count
      litRef.current = current
      setLit(current)
      sound.tick(step / steps)
      step += 1
      if (step >= steps) {
        finish(current)
        return
      }
      timer.current = window.setTimeout(tick, 40 + 300 * (step / steps) ** 3) // 越轉越慢
    }
    tick()
  }

  function finish(index: number) {
    setRunning(false)
    setWinner(index)
    if (options[index].includes('安全')) sound.win()
    else sound.lose()
    vibrate(80)
  }

  function save() {
    if (!draft) return
    const next = draft.map((text, i) => text.trim() || WHEEL_DEFAULTS[i])
    setOptions(next)
    writeStore(WHEEL_KEY, next)
    setDraft(null)
    sound.blip(true)
  }

  const result = winner === null ? null : options[winner]
  const safe = result?.includes('安全') ?? false
  const actions: ResultAction[] = []
  if (result?.includes('真心話')) {
    actions.push({ label: '抽一題真心話', variant: 'blue', onClick: () => openTruthDare('truth') })
  }
  if (result?.includes('大冒險')) {
    actions.push({ label: '抽一題大冒險', variant: 'red', onClick: () => openTruthDare('dare') })
  }

  return (
    <GamePage title="懲罰轉盤" rule="輪到的人按開始，燈停在哪格就照做。">
      <div className="ring">
        {options.map((text, i) => {
          const [row, col] = RING_POSITIONS[i]
          const classes = ['ring__cell', lit === i && 'is-lit', winner === i && 'is-win'].filter(Boolean).join(' ')
          return (
            <div key={i} className={classes} style={{ gridArea: `${row} / ${col}` }}>
              {text}
            </div>
          )
        })}
        <button className="ring__start" id="wheel-start" type="button" disabled={running} onClick={start}>
          開始
        </button>
      </div>

      {result && (
        <GameResult
          id="wheel-result"
          tag={safe ? '★ 逃過一劫 ★' : '★ 轉盤結果 ★'}
          text={result}
          loser={!safe && actions.length === 0}
          actions={actions}
        />
      )}

      {draft ? (
        <div className="panel wheel-editor">
          <div className="wheel-editor__list" id="wheel-inputs">
            {draft.map((text, i) => (
              <input
                key={i}
                className="text-input"
                type="text"
                maxLength={12}
                value={text}
                aria-label={`第 ${i + 1} 格`}
                onChange={(event) => setDraft(draft.map((value, j) => (j === i ? event.target.value : value)))}
              />
            ))}
          </div>
          <div className="btn-row">
            <button className="btn" type="button" onClick={() => setDraft([...WHEEL_DEFAULTS])}>
              恢復預設
            </button>
            <button className="btn btn--orange" id="wheel-save" type="button" onClick={save}>
              儲存
            </button>
          </div>
        </div>
      ) : (
        <button className="btn btn--small" id="wheel-edit" type="button" onClick={() => setDraft([...options])}>
          編輯選項
        </button>
      )}
    </GamePage>
  )
}
