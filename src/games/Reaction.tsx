import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { GameResult } from '../components/GameResult.tsx'
import { Stepper } from '../components/Stepper.tsx'
import { randomInt } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { GamePage } from './GamePage.tsx'
import { rankReaction, reactionLosers, reactionRating, WAIT_MAX_MS, WAIT_MIN_MS, type ReactionResult } from './reaction.ts'
import { clock, usePlayers } from './usePlayers.ts'

type Step = 'setup' | 'turn' | 'done'
// ready 按一下準備 → waiting 紅燈等待 → go 綠燈 → result
type Phase = 'ready' | 'waiting' | 'go' | 'result'

export function Reaction() {
  const players = usePlayers(2, 12, 4)
  const [step, setStep] = useState<Step>('setup')
  const [turn, setTurn] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [results, setResults] = useState<ReactionResult[]>([])
  const [last, setLast] = useState<ReactionResult | null>(null)
  const goAt = useRef(0)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  function begin() {
    sound.unlock()
    setResults([])
    setTurn(0)
    setPhase('ready')
    setLast(null)
    setStep('turn')
  }

  function record(ms: number | null) {
    const result = { name: players.name(turn), ms }
    setLast(result)
    setResults([...results, result])
    setPhase('result')
    if (ms === null) {
      sound.lose()
      vibrate([80, 40, 80])
    } else {
      sound.blip(true)
      vibrate(30)
    }
  }

  function press() {
    sound.unlock()
    if (phase === 'ready') {
      setPhase('waiting')
      timer.current = window.setTimeout(() => {
        goAt.current = clock()
        setPhase('go')
        sound.tick(1)
        // 等畫面真的變綠再開始算，每個人都一樣公平
        requestAnimationFrame(() => requestAnimationFrame(() => (goAt.current = clock())))
      }, WAIT_MIN_MS + randomInt(WAIT_MAX_MS - WAIT_MIN_MS))
      return
    }
    if (phase === 'waiting') {
      clearTimeout(timer.current)
      record(null)
      return
    }
    if (phase === 'go') record(Math.max(0, Math.round(clock() - goAt.current)))
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
    setPhase('ready')
    setLast(null)
    sound.blip(true)
  }

  if (step === 'setup') {
    return (
      <GamePage title="反應力大考驗" rule="畫面變紅後等綠燈，一變綠就按。每個人輪流挑戰，最慢的人喝；還沒變綠就按算犯規，犯規的人喝。">
        <div className="settings">
          <Stepper id="rx-players" label="玩家人數" value={players.count} min={players.min} max={players.max} onChange={players.setCount} />
        </div>
        <button className="btn btn--orange btn--big" id="rx-start" type="button" onClick={begin}>
          開始
        </button>
      </GamePage>
    )
  }

  if (step === 'done') {
    const ranked = rankReaction(results)
    const slow = reactionLosers(results)
    const fastest = ranked[0]?.ms !== null ? ranked[0] : null
    return (
      <GamePage title="反應力大考驗">
        <GameResult
          id="rx-result"
          tag={slow[0]?.ms === null ? '★ 犯規 ★' : '★ 最慢 ★'}
          text={`${slow.map((r) => r.name).join('、')} 喝！`}
          note={fastest ? `閃電手：${fastest.name}（${fastest.ms} 毫秒）` : undefined}
          loser
          actions={[
            { label: '再來一輪', variant: 'orange', onClick: begin },
            { label: '改人數', onClick: () => setStep('setup') },
          ]}
        />
        <ol className="rank-list" id="rx-ranking">
          {ranked.map((r, i) => (
            <li key={i} className={slow.includes(r) ? 'is-loser' : i === 0 ? 'is-best' : undefined}>
              <span className="rank-list__name">{r.name}</span>
              <span className="rank-list__value">{r.ms === null ? '犯規' : `${r.ms} 毫秒`}</span>
              <span className="rank-list__note">{reactionRating(r.ms)}</span>
            </li>
          ))}
        </ol>
      </GamePage>
    )
  }

  const zoneText: Record<Phase, [string, string]> = {
    ready: ['準備', '按一下，畫面變紅後等綠燈'],
    waiting: ['等⋯', '還沒變綠，不要按！'],
    go: ['按！', ''],
    result: last ? [last.ms === null ? '犯規' : `${last.ms} 毫秒`, reactionRating(last.ms)] : ['', ''],
  }
  const [big, small] = zoneText[phase]

  return (
    <GamePage title="反應力大考驗">
      <p className="spy-who" id="rx-who">
        請 <strong>{players.name(turn)}</strong> 拿手機
      </p>
      <button className={`tap-zone is-${phase}`} id="rx-zone" type="button" onPointerDown={press} onKeyDown={onKey}>
        <strong className="tap-zone__big" id="rx-big">
          {big}
        </strong>
        {small && <span>{small}</span>}
      </button>
      {phase === 'result' && (
        <button className="btn btn--orange btn--big" id="rx-next" type="button" onClick={next}>
          {turn + 1 >= players.count ? '看結果' : `傳給 ${players.name(turn + 1)}`}
        </button>
      )}
      <p className="game-status">
        第 {turn + 1} / {players.count} 位
      </p>
    </GamePage>
  )
}
