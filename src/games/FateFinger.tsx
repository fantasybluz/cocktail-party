import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { randomOf } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { useParty } from '../party.ts'
import { GamePage } from './GamePage.tsx'

const COLORS = ['#e63946', '#ffd23f', '#2fb37f', '#4cb8f0', '#ff7aa8', '#f47920', '#6b5ca5', '#fff7e3', '#7cb342', '#c47a1e']
const HOLD_MS = 2400 // 手指都放好後等多久開獎（中間有人加入或離開就重算）

interface Finger {
  x: number
  y: number
  color: string
}

type Phase = 'waiting' | 'holding' | 'picked'

// 大家同時把手指放在螢幕上，等一下會亮起其中一根
export function FateFinger() {
  const { recordDrink, loserSpin } = useParty()
  const [fingers, setFingers] = useState<Map<number, Finger>>(new Map())
  const [phase, setPhase] = useState<Phase>('waiting')
  const [winner, setWinner] = useState<number | null>(null)
  const timer = useRef(0)
  const colorIndex = useRef(0)
  // 多根手指同時移動時事件很密集，用 ref 存最新位置，避免讀到舊的 state 互相蓋掉
  const fingersRef = useRef<Map<number, Finger>>(new Map())

  function commit(next: Map<number, Finger>) {
    fingersRef.current = next
    setFingers(next)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  // 手指數量改變時重新計時；兩根以上才開始
  function restartHold(next: Map<number, Finger>) {
    clearTimeout(timer.current)
    if (next.size < 2) {
      setPhase('waiting')
      return
    }
    setPhase('holding')
    sound.tick(0)
    timer.current = window.setTimeout(() => {
      const id = randomOf([...next.keys()])
      setWinner(id)
      setPhase('picked')
      sound.win()
      vibrate([100, 50, 200])
    }, HOLD_MS)
  }

  function position(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function onDown(event: PointerEvent<HTMLDivElement>) {
    sound.unlock()
    if (phase === 'picked') return
    const next = new Map(fingersRef.current)
    next.set(event.pointerId, { ...position(event), color: COLORS[colorIndex.current++ % COLORS.length] })
    commit(next)
    restartHold(next)
  }

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const finger = fingersRef.current.get(event.pointerId)
    if (!finger) return
    commit(new Map(fingersRef.current).set(event.pointerId, { ...finger, ...position(event) }))
  }

  function onUp(event: PointerEvent<HTMLDivElement>) {
    if (!fingersRef.current.has(event.pointerId)) return
    const next = new Map(fingersRef.current)
    next.delete(event.pointerId)
    commit(next)
    if (phase === 'picked') {
      // 開獎後大家放開，就可以再玩一次
      if (next.size === 0) {
        setPhase('waiting')
        setWinner(null)
      }
      return
    }
    restartHold(next)
  }

  const message =
    phase === 'picked'
      ? '亮起來的那根手指喝！'
      : phase === 'holding'
        ? `${fingers.size} 根手指，不要動⋯`
        : '大家各放一根手指在框框裡'

  return (
    <GamePage title="命運手指" rule="每個人放一根手指在下面的框框裡，都放好後不要動，過幾秒會亮起其中一根，那個人喝。">
      <div
        className={`finger-zone is-${phase}`}
        id="finger-zone"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onContextMenu={(event) => event.preventDefault()}
      >
        <p className="finger-zone__message" aria-live="polite">
          {message}
        </p>
        {[...fingers].map(([id, { x, y, color }]) => (
          <span
            key={id}
            className={['finger', id === winner && 'is-winner', phase === 'picked' && id !== winner && 'is-out']
              .filter(Boolean)
              .join(' ')}
            style={{ left: x, top: y, background: color }}
          />
        ))}
      </div>
      {phase === 'picked' && (
        <div className="btn-row">
          <button className="btn btn--orange" type="button" onClick={loserSpin}>
            去轉拉霸機
          </button>
          <button className="btn" type="button" onClick={() => recordDrink({ title: '誰被選中了？', reason: '命運手指' })}>
            記一杯
          </button>
        </div>
      )}
      <p className="game-rule finger-hint">
        iPhone 大約只能同時偵測 5 根手指，人多的話可以改用
        <a href="#teams">分組點名</a>
        的隨機點名。
      </p>
    </GamePage>
  )
}
