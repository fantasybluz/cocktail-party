import { useEffect, useRef, useState } from 'react'
import { GameResult } from '../components/GameResult.tsx'
import { Stepper } from '../components/Stepper.tsx'
import { SPY_WORDS } from '../data/games.ts'
import { makeBag, shuffle } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { playerName, useParty } from '../party.ts'
import { GamePage } from './GamePage.tsx'

const nextPair = makeBag(SPY_WORDS)

// 3～6 人 1 個臥底，7～9 人最多 2 個，10 人以上最多 3 個
const maxSpies = (players: number) => Math.max(1, Math.floor((players - 1) / 3))

type Step = 'setup' | 'reveal' | 'play'

interface Game {
  civilian: string
  spy: string
  isSpy: boolean[]
  out: boolean[]
  first: number // 從幾號開始描述
}

export function WhoIsSpy() {
  const { roster } = useParty()
  // 沒手動調整前跟著記分板名單的人數
  const [playersOverride, setPlayers] = useState<number | null>(null)
  const players = playersOverride ?? (roster.length >= 3 ? Math.min(roster.length, 12) : 5)
  const [spiesWanted, setSpies] = useState(1)
  const spies = Math.min(spiesWanted, maxSpies(players))
  const [step, setStep] = useState<Step>('setup')
  const [game, setGame] = useState<Game | null>(null)
  const [turn, setTurn] = useState(0) // 發詞發到幾號
  const [shown, setShown] = useState(false) // 詞現在是不是翻開的
  const [viewed, setViewed] = useState(false) // 這個人看過詞了沒
  const [selected, setSelected] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [winner, setWinner] = useState<'civilians' | 'spies' | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  // 結束時捲到結果
  useEffect(() => {
    if (winner) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [winner])

  function changePlayers(value: number) {
    setPlayers(value)
    setSpies(Math.min(spiesWanted, maxSpies(value)))
  }

  function start() {
    sound.unlock()
    let [civilian, spy] = nextPair()
    if (Math.random() < 0.5) [civilian, spy] = [spy, civilian]
    const spyIndexes = new Set(shuffle([...Array(players).keys()]).slice(0, spies))
    setGame({
      civilian,
      spy,
      isSpy: Array.from({ length: players }, (_, i) => spyIndexes.has(i)),
      out: Array(players).fill(false),
      first: Math.floor(Math.random() * players) + 1,
    })
    setStep('reveal')
    setTurn(0)
    setShown(false)
    setViewed(false)
    setSelected(null)
    setMessage('')
    setWinner(null)
  }

  if (!game || step === 'setup') {
    return (
      <GamePage
        title="誰是臥底"
        rule="大家拿到的詞都一樣，只有臥底不一樣（臥底自己也不知道）。輪流用一句話描述自己的詞，再投票淘汰可疑的人。"
      >
        <div className="settings">
          <Stepper id="spy-players" label="玩家人數" value={players} min={3} max={12} onChange={changePlayers} />
          <Stepper id="spy-spies" label="臥底人數" value={spies} min={1} max={maxSpies(players)} onChange={setSpies} />
        </div>
        <button className="btn btn--orange btn--big" id="spy-start" type="button" onClick={start}>
          開始發詞
        </button>
      </GamePage>
    )
  }

  // 發詞：手機傳到誰，誰點開看自己的詞
  if (step === 'reveal') {
    const last = turn === players - 1
    const word = game.isSpy[turn] ? game.spy : game.civilian
    return (
      <GamePage title="誰是臥底">
        <p className="spy-who" id="spy-who">
          請 <strong>{playerName(roster, turn)}</strong> 拿手機
        </p>
        <button
          className="spy-word"
          id="spy-word"
          type="button"
          onClick={() => {
            if (!shown) sound.blip(true)
            setShown(!shown)
            setViewed(true)
          }}
        >
          {shown ? (
            <>
              <small>你的詞是</small>
              <strong>{word}</strong>
              <small>再點一下蓋住</small>
            </>
          ) : viewed ? (
            <span>已蓋住，點一下再看一次</span>
          ) : (
            <>
              <span>點這裡看你的詞</span>
              <small>別讓其他人看到</small>
            </>
          )}
        </button>
        <button
          className="btn btn--orange btn--big"
          id="spy-next"
          type="button"
          disabled={!viewed}
          onClick={() => {
            if (last) {
              setStep('play')
              sound.win()
              return
            }
            setTurn(turn + 1)
            setShown(false)
            setViewed(false)
            sound.blip(true)
          }}
        >
          {last ? '記住了，開始遊戲' : '記住了，傳給下一位'}
        </button>
      </GamePage>
    )
  }

  const spiesLeft = game.isSpy.filter((isSpy, i) => isSpy && !game.out[i]).length
  const alive = game.out.filter((out) => !out).length

  // 先點選、再按淘汰，避免一個誤觸就淘汰掉
  function eliminate() {
    if (!game || selected === null) return
    const out = game.out.map((value, i) => value || i === selected)
    const wasSpy = game.isSpy[selected]
    const left = game.isSpy.filter((isSpy, i) => isSpy && !out[i]).length
    const civilians = out.filter((value) => !value).length - left
    setGame({ ...game, out })
    setSelected(null)

    if (left === 0 || left >= civilians) {
      const civiliansWin = left === 0
      setWinner(civiliansWin ? 'civilians' : 'spies')
      setMessage(civiliansWin ? '臥底全部抓到了！' : '臥底撐到最後了！')
      if (civiliansWin) sound.win()
      else sound.lose()
      vibrate([100, 60, 100])
      return
    }
    setMessage(`${playerName(roster, selected)} 是${wasSpy ? '臥底！' : '平民⋯'}還有 ${left} 個臥底，繼續下一輪`)
    if (wasSpy) sound.win()
    else sound.lose()
    vibrate(60)
  }

  const spyNumbers = game.isSpy
    .map((isSpy, i) => (isSpy ? playerName(roster, i) : null))
    .filter(Boolean)
    .join('、')

  return (
    <GamePage title="誰是臥底">
      <p className="game-rule" id="spy-hint">
        從 {playerName(roster, game.first - 1)} 開始，每人用一句話描述自己的詞（不能直接說出來）。說完一輪後投票，把票最多的人點出來淘汰。
      </p>
      <p className="game-status" id="spy-status" aria-live="polite">
        {message || `還有 ${alive} 人，其中臥底 ${spiesLeft} 人`}
      </p>
      <div className="player-grid">
        {game.isSpy.map((isSpy, i) => {
          const revealed = game.out[i] || winner !== null
          const classes = ['player', revealed && isSpy && 'is-spy', selected === i && 'is-selected']
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={i}
              className={classes}
              type="button"
              data-index={i}
              disabled={revealed}
              onClick={() => {
                setSelected(selected === i ? null : i)
                sound.blip(true)
              }}
            >
              {playerName(roster, i)}
              {revealed && <small>{isSpy ? '臥底' : '平民'}</small>}
            </button>
          )
        })}
      </div>
      {selected !== null && winner === null && (
        <button className="btn btn--red btn--big" id="spy-out" type="button" onClick={eliminate}>
          淘汰 {playerName(roster, selected)}
        </button>
      )}
      {winner && (
        <div ref={resultRef}>
          <GameResult
            id="spy-result"
            tag={winner === 'civilians' ? '★ 平民獲勝 ★' : '★ 臥底獲勝 ★'}
            text={winner === 'civilians' ? '臥底喝！' : '平民每人喝一口'}
            note={`平民的詞：${game.civilian}・臥底的詞：${game.spy}\n臥底是 ${spyNumbers}`}
            loser
            actions={[
              { label: '再來一局', onClick: start },
              { label: '改人數', onClick: () => setStep('setup') },
            ]}
          />
        </div>
      )}
    </GamePage>
  )
}
