import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { GameResult } from '../components/GameResult.tsx'
import { Stepper } from '../components/Stepper.tsx'
import { sound, vibrate } from '../lib/sound.ts'
import { GamePage } from './GamePage.tsx'
import { formatSeconds, GOD_HAND, losers, rankResults, rating, type StopResult } from './stopTen.ts'
import { clock, usePlayers } from './usePlayers.ts'

const TARGETS = [5, 10, 15]
const PEEK_SECONDS = 3 // 「前 3 秒看得到」模式

type Step = 'setup' | 'turn' | 'done'
type Mode = 'peek' | 'blind'

export function StopTen() {
  const players = usePlayers(2, 12, 4)
  const [target, setTarget] = useState(10)
  const [mode, setMode] = useState<Mode>('peek')
  const [step, setStep] = useState<Step>('setup')
  const [turn, setTurn] = useState(0)
  const [results, setResults] = useState<StopResult[]>([])
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0) // 前 3 秒顯示用
  const [last, setLast] = useState<number | null>(null) // 這個人剛按的秒數
  const startAt = useRef(0)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function begin() {
    sound.unlock()
    setResults([])
    setTurn(0)
    setLast(null)
    setRunning(false)
    setStep('turn')
  }

  // 同一顆大按鈕：第一下開始、第二下停
  function press() {
    sound.unlock()
    if (last !== null) return
    if (!running) {
      startAt.current = clock()
      setRunning(true)
      setElapsed(0)
      sound.blip(true)
      if (mode === 'peek') {
        const loop = () => {
          const seconds = (clock() - startAt.current) / 1000
          setElapsed(seconds)
          if (seconds < PEEK_SECONDS) frame.current = requestAnimationFrame(loop)
        }
        frame.current = requestAnimationFrame(loop)
      }
      return
    }
    const time = (clock() - startAt.current) / 1000
    cancelAnimationFrame(frame.current)
    setRunning(false)
    setLast(time)
    setResults([...results, { name: players.name(turn), time }])
    if (Math.abs(time - target) < 0.3) sound.win()
    else sound.blip(false)
    vibrate(40)
  }

  function onKey(event: KeyboardEvent) {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    press()
  }

  function next() {
    if (turn + 1 >= players.count) {
      setStep('done')
      sound.lose()
      return
    }
    setTurn(turn + 1)
    setLast(null)
    sound.blip(true)
  }

  const rule = `按一下開始計時，覺得剛好 ${target} 秒就再按一下。每個人輪流挑戰，離 ${target} 秒最遠的人喝；差不到 ${GOD_HAND} 秒是神手，可以再指定一個人喝。`

  if (step === 'setup') {
    return (
      <GamePage title="停在 10 秒" rule={rule}>
        <div className="settings">
          <Stepper id="st-players" label="玩家人數" value={players.count} min={players.min} max={players.max} onChange={players.setCount} />
        </div>
        <div className="segmented" role="group" aria-label="目標秒數">
          {TARGETS.map((value) => (
            <button key={value} type="button" className={value === target ? 'is-active' : undefined} aria-pressed={value === target} onClick={() => setTarget(value)}>
              {value} 秒
            </button>
          ))}
        </div>
        <div className="segmented segmented--two" role="group" aria-label="模式">
          <button type="button" className={mode === 'peek' ? 'is-active' : undefined} aria-pressed={mode === 'peek'} onClick={() => setMode('peek')}>
            前 3 秒看得到
          </button>
          <button type="button" className={mode === 'blind' ? 'is-active' : undefined} aria-pressed={mode === 'blind'} onClick={() => setMode('blind')}>
            全盲
          </button>
        </div>
        <button className="btn btn--orange btn--big" id="st-start" type="button" onClick={begin}>
          開始
        </button>
      </GamePage>
    )
  }

  if (step === 'done') {
    const ranked = rankResults(results, target)
    const worst = losers(ranked)
    const gods = ranked.filter((r) => r.diff < GOD_HAND)
    return (
      <GamePage title="停在 10 秒">
        <GameResult
          id="st-result"
          tag={`★ 離 ${target} 秒最遠 ★`}
          text={`${worst.map((r) => r.name).join('、')} 喝！`}
          note={[
            `差 ${formatSeconds(worst[0]?.diff ?? 0)} 秒`,
            gods.length > 0 && `神手 ${gods.map((r) => r.name).join('、')}，可以再指定一個人喝`,
          ]
            .filter(Boolean)
            .join('\n')}
          loser
          actions={[
            { label: '再來一輪', variant: 'orange', onClick: begin },
            { label: '改設定', onClick: () => setStep('setup') },
          ]}
        />
        <ol className="rank-list" id="st-ranking">
          {ranked.map((r, i) => (
            <li key={i} className={worst.includes(r) ? 'is-loser' : r.diff < GOD_HAND ? 'is-best' : undefined}>
              <span className="rank-list__name">{r.name}</span>
              <span className="rank-list__value">{formatSeconds(r.time)} 秒</span>
              <span className="rank-list__note">差 {formatSeconds(r.diff)}</span>
            </li>
          ))}
        </ol>
      </GamePage>
    )
  }

  const peeking = running && mode === 'peek' && elapsed < PEEK_SECONDS
  return (
    <GamePage title="停在 10 秒">
      <p className="spy-who" id="st-who">
        請 <strong>{players.name(turn)}</strong> 拿手機
      </p>
      <button
        className={['tap-zone', running && 'is-running', last !== null && 'is-result'].filter(Boolean).join(' ')}
        id="st-zone"
        type="button"
        onPointerDown={press}
        onKeyDown={onKey}
      >
        {last !== null ? (
          <>
            <strong className="tap-zone__big" id="st-time">
              {formatSeconds(last)} 秒
            </strong>
            <span>差 {formatSeconds(Math.abs(last - target))} 秒・{rating(Math.abs(last - target))}</span>
          </>
        ) : running ? (
          <>
            <strong className="tap-zone__big">{peeking ? formatSeconds(elapsed) : '？？？'}</strong>
            <span>覺得 {target} 秒到了就按</span>
          </>
        ) : (
          <>
            <strong className="tap-zone__big">開始</strong>
            <span>按一下開始計時</span>
          </>
        )}
      </button>
      {last !== null && (
        <button className="btn btn--orange btn--big" id="st-next" type="button" onClick={next}>
          {turn + 1 >= players.count ? '看結果' : `傳給 ${players.name(turn + 1)}`}
        </button>
      )}
      <p className="game-status">
        第 {turn + 1} / {players.count} 位・目標 {target} 秒
      </p>
    </GamePage>
  )
}
