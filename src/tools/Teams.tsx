import { useEffect, useRef, useState } from 'react'
import { Stepper } from '../components/Stepper.tsx'
import { GamePage } from '../games/GamePage.tsx'
import { randomInt, shuffle } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { useParty } from '../party.ts'
import { splitTeams } from './teams.ts'

type Mode = 'pick' | 'order' | 'teams'
const MODES: { id: Mode; label: string }[] = [
  { id: 'pick', label: '隨機點名' },
  { id: 'order', label: '排順序' },
  { id: 'teams', label: '分組' },
]
const TEAM_COLORS = ['#e63946', '#3a7bd5', '#2fb37f', '#ffd23f']

export function Teams() {
  const { roster } = useParty()
  const [mode, setMode] = useState<Mode>('pick')
  const [count, setCount] = useState(4) // 沒有名單時用幾個號碼
  const [teamCount, setTeamCount] = useState(2)
  const [shown, setShown] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const [order, setOrder] = useState<string[]>([])
  const [teams, setTeams] = useState<string[][]>([])
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const people = roster.length > 0 ? roster.map((player) => player.name) : Array.from({ length: count }, (_, i) => `${i + 1} 號`)

  // 名字快速跳動、越來越慢，最後停在一個人
  function pick() {
    sound.unlock()
    setPicking(true)
    const target = randomInt(people.length)
    const steps = people.length * 2 + target
    let step = 0
    const tick = () => {
      setShown(people[step % people.length])
      sound.tick(step / steps)
      step += 1
      if (step > steps) {
        setPicking(false)
        sound.win()
        vibrate(120)
        return
      }
      timer.current = window.setTimeout(tick, 50 + 250 * (step / steps) ** 2)
    }
    tick()
  }

  return (
    <GamePage title="分組點名" rule="記分板有名單就用名字，沒有就用號碼。" noRecord>
      <div className="segmented" role="group" aria-label="模式">
        {MODES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            data-mode={id}
            className={id === mode ? 'is-active' : undefined}
            aria-pressed={id === mode}
            onClick={() => setMode(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {roster.length === 0 && (
        <div className="settings">
          <Stepper id="tm-count" label="人數" value={count} min={2} max={12} onChange={setCount} />
        </div>
      )}

      {mode === 'pick' && (
        <>
          <div className="screen">
            <p className="screen__tag">{picking ? '點名中⋯' : shown ? '就是你！' : '按下面的按鈕'}</p>
            <p className="screen__main" id="tm-picked" aria-live="polite">
              {shown ?? '？'}
            </p>
          </div>
          <button className="btn btn--orange btn--big" id="tm-pick" type="button" disabled={picking} onClick={pick}>
            點名
          </button>
        </>
      )}

      {mode === 'order' && (
        <>
          {order.length > 0 && (
            <ol className="order-list" id="tm-order">
              {order.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ol>
          )}
          <button
            className="btn btn--orange btn--big"
            id="tm-shuffle"
            type="button"
            onClick={() => {
              setOrder(shuffle(people))
              sound.blip(true)
            }}
          >
            排順序
          </button>
        </>
      )}

      {mode === 'teams' && (
        <>
          <div className="settings">
            <Stepper
              id="tm-teams"
              label="分幾隊"
              value={teamCount}
              min={2}
              max={Math.min(4, people.length)}
              onChange={setTeamCount}
            />
          </div>
          {teams.length > 0 && (
            <div className="team-list" id="tm-result">
              {teams.map((team, i) => (
                <div key={i} className="team-list__team" style={{ borderColor: TEAM_COLORS[i] }}>
                  <p className="team-list__name" style={{ color: TEAM_COLORS[i] }}>
                    第 {i + 1} 隊
                  </p>
                  <p>{team.join('、')}</p>
                </div>
              ))}
            </div>
          )}
          <button
            className="btn btn--orange btn--big"
            id="tm-split"
            type="button"
            onClick={() => {
              setTeams(splitTeams(people, Math.min(teamCount, people.length)))
              sound.blip(true)
            }}
          >
            分組
          </button>
        </>
      )}
    </GamePage>
  )
}
