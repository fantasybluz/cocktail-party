import { useEffect, useRef, useState } from 'react'
import { GameResult } from '../components/GameResult.tsx'
import { Stepper } from '../components/Stepper.tsx'
import { sound, vibrate } from '../lib/sound.ts'
import { readStore, writeStore } from '../lib/storage.ts'
import { GamePage } from './GamePage.tsx'
import { addStep, checkInput, flashMs, PADS } from './memory.ts'
import { usePlayers } from './usePlayers.ts'

const BEST_KEY = 'mix-slot-memory-best'

type Step = 'setup' | 'playing' | 'done'
// show 手機在閃燈號、input 輪到的人按、pass 答對了等傳手機
type Phase = 'show' | 'input' | 'pass'

export function Memory() {
  const players = usePlayers(2, 12, 4)
  const [step, setStep] = useState<Step>('setup')
  const [phase, setPhase] = useState<Phase>('show')
  const [sequence, setSequence] = useState<number[]>([])
  const [input, setInput] = useState<number[]>([])
  const [lit, setLit] = useState<number | null>(null)
  const [turn, setTurn] = useState(0)
  const [best, setBest] = useState(() => readStore<number>(BEST_KEY, 0))
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((id) => clearTimeout(id))
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  // 依序閃燈號，閃完換人按
  function show(seq: number[]) {
    clearTimers()
    setPhase('show')
    setInput([])
    const on = flashMs(seq.length)
    seq.forEach((pad, i) => {
      later(() => {
        setLit(pad)
        sound.tick(pad / 4)
      }, 500 + i * (on + 150))
      later(() => setLit(null), 500 + i * (on + 150) + on)
    })
    later(() => setPhase('input'), 500 + seq.length * (on + 150))
  }

  function begin() {
    sound.unlock()
    const first = addStep([])
    setSequence(first)
    setTurn(0)
    setStep('playing')
    show(first)
  }

  function pressPad(pad: number) {
    if (phase !== 'input') return
    sound.unlock()
    setLit(pad)
    later(() => setLit(null), 180)
    const next = [...input, pad]
    const result = checkInput(sequence, next)
    if (result === 'wrong') {
      clearTimers()
      setLit(null)
      setStep('done')
      sound.lose()
      vibrate([150, 60, 150])
      return
    }
    setInput(next)
    if (result === 'done') {
      if (sequence.length > best) {
        setBest(sequence.length)
        writeStore(BEST_KEY, sequence.length)
      }
      setPhase('pass')
      sound.win()
      vibrate(40)
    }
  }

  // 傳給下一個人，多加一步再閃
  function passOn() {
    const longer = addStep(sequence)
    setSequence(longer)
    setTurn((turn + 1) % players.count)
    show(longer)
  }

  if (step === 'setup') {
    return (
      <GamePage title="記憶挑戰" rule="手機會依序閃燈號，輪到的人照順序按一遍。答對就傳給下一個人，而且會多一步；按錯的人喝。">
        <div className="settings">
          <Stepper id="mm-players" label="玩家人數" value={players.count} min={players.min} max={players.max} onChange={players.setCount} />
        </div>
        {best > 0 && <p className="game-status">最高紀錄：{best} 步</p>}
        <button className="btn btn--orange btn--big" id="mm-start" type="button" onClick={begin}>
          開始
        </button>
      </GamePage>
    )
  }

  if (step === 'done') {
    return (
      <GamePage title="記憶挑戰">
        <GameResult
          id="mm-result"
          tag={`★ 第 ${sequence.length} 步按錯 ★`}
          text={`${players.name(turn)} 喝！`}
          note={`正確順序：${sequence.map((pad) => PADS[pad].name).join(' → ')}\n最高紀錄 ${best} 步`}
          loser
          actions={[
            { label: '再來一局', variant: 'orange', onClick: begin },
            { label: '改人數', onClick: () => setStep('setup') },
          ]}
        />
      </GamePage>
    )
  }

  const status =
    phase === 'show'
      ? '看好了⋯'
      : phase === 'input'
        ? `換你按（${input.length} / ${sequence.length}）`
        : `答對了！傳給 ${players.name((turn + 1) % players.count)}`

  return (
    <GamePage title="記憶挑戰">
      <p className="spy-who" id="mm-who">
        <strong>{players.name(turn)}</strong>・第 {sequence.length} 步
      </p>
      <p className="game-status" id="mm-status" aria-live="polite">
        {status}
      </p>
      <div className={`memory-pads is-${phase}`} id="mm-pads">
        {PADS.map((pad, i) => (
          <button
            key={pad.name}
            className={lit === i ? 'memory-pad is-lit' : 'memory-pad'}
            type="button"
            data-pad={i}
            aria-label={`${pad.name}色`}
            style={{ background: pad.color }}
            disabled={phase !== 'input'}
            onPointerDown={() => pressPad(i)}
          />
        ))}
      </div>
      {phase === 'pass' && (
        <button className="btn btn--orange btn--big" id="mm-pass" type="button" onClick={passOn}>
          {players.name((turn + 1) % players.count)} 準備好了
        </button>
      )}
      {best > 0 && <p className="game-status">最高紀錄：{best} 步</p>}
    </GamePage>
  )
}
