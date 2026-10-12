import { useEffect, useRef, useState } from 'react'
import { Die } from '../components/Die.tsx'
import { Stepper } from '../components/Stepper.tsx'
import { BOARD_SQUARES, MOST_LIKELY, NEVER_HAVE_I_EVER, type Square } from '../data/games.ts'
import { makeBag, randomInt } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { playerName, useParty } from '../party.ts'
import { moveBy, squarePosition } from './board.ts'
import { GamePage } from './GamePage.tsx'

const TOKEN_COLORS = ['#e63946', '#3a7bd5', '#2fb37f', '#ffd23f', '#ff7aa8', '#6b5ca5']
const STEP_MS = 220 // 棋子每走一格的時間

const nextNever = makeBag(NEVER_HAVE_I_EVER)
const nextLikely = makeBag(MOST_LIKELY)

interface Landing {
  square: Square
  // 經過起點、交換位置等額外說明
  notes: string[]
  question?: string
}

export function DrinkingBoard() {
  const { roster, loserSpin, openTruthDare, recordDrink } = useParty()
  // 沒手動調整前跟著記分板名單的人數
  const [playersOverride, setPlayers] = useState<number | null>(null)
  const players = playersOverride ?? (roster.length >= 2 ? Math.min(roster.length, 6) : 3)
  const [started, setStarted] = useState(false)
  const [positions, setPositions] = useState<number[]>([])
  const [skips, setSkips] = useState<boolean[]>([])
  const [turn, setTurn] = useState(0)
  const [dice, setDice] = useState(1)
  const [busy, setBusy] = useState(false)
  const [landing, setLanding] = useState<Landing | null>(null)
  const [rollAgain, setRollAgain] = useState(false)
  const [notice, setNotice] = useState('') // 例如誰被跳過
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  function start() {
    sound.unlock()
    setPositions(Array(players).fill(0))
    setSkips(Array(players).fill(false))
    setTurn(0)
    setLanding(null)
    setRollAgain(false)
    setStarted(true)
    sound.blip(true)
  }

  // 一格一格走，走完回傳停下的位置
  function walk(from: number, steps: number, player: number, done: (to: number, passedStart: boolean) => void) {
    const direction = Math.sign(steps)
    let at = from
    let passed = false
    let left = Math.abs(steps)
    const step = () => {
      const move = moveBy(at, direction)
      at = move.to
      passed ||= move.passedStart
      left -= 1
      setPositions((prev) => prev.map((value, i) => (i === player ? at : value)))
      sound.tick(0.2)
      if (left > 0) timer.current = window.setTimeout(step, STEP_MS)
      else done(at, passed)
    }
    timer.current = window.setTimeout(step, STEP_MS)
  }

  function roll() {
    if (busy) return
    sound.unlock()
    setBusy(true)
    setLanding(null)
    setRollAgain(false)
    setNotice('')

    // 骰子先亂跳一陣子
    let frames = 8
    const shake = () => {
      setDice(randomInt(6) + 1)
      sound.tick(0.5)
      frames -= 1
      if (frames > 0) {
        timer.current = window.setTimeout(shake, 70)
        return
      }
      const value = randomInt(6) + 1
      setDice(value)
      walk(positions[turn], value, turn, (to, passedStart) => land(to, passedStart ? ['經過起點，大家一起喝一口！'] : []))
    }
    shake()
  }

  // allowMove：前進／後退之後停的那格就算也是移動格，也不再連續移動
  function land(index: number, notes: string[], allowMove = true) {
    const square = BOARD_SQUARES[index]
    const finish = (extra: Partial<Landing> = {}) => {
      setLanding({ square, notes, question: questionFor(square), ...extra })
      setBusy(false)
      vibrate(40)
    }

    switch (square.kind) {
      case 'forward':
      case 'back':
        if (!allowMove) {
          finish({ square: { ...square, desc: '停在這裡，不再移動' } })
          return
        }
        walk(index, square.move ?? 0, turn, (to, passedStart) =>
          land(to, [...notes, `${square.title}！`, ...(passedStart ? ['經過起點，大家一起喝一口！'] : [])], false),
        )
        return
      case 'again':
        setRollAgain(true)
        sound.win()
        finish()
        return
      case 'skip':
        setSkips((prev) => prev.map((value, i) => (i === turn ? true : value)))
        sound.blip(false)
        finish()
        return
      case 'swap': {
        let other = randomInt(players - 1)
        if (other >= turn) other += 1
        setPositions((prev) => prev.map((value, i) => (i === turn ? prev[other] : i === other ? prev[turn] : value)))
        sound.blip(true)
        finish({ notes: [...notes, `跟 ${playerName(roster, other)} 交換位置`] })
        return
      }
      default:
        if (['drink', 'double', 'all'].includes(square.kind)) sound.lose()
        else sound.blip(true)
        finish()
    }
  }

  function questionFor(square: Square) {
    if (square.kind === 'never') return `我從來沒有⋯${nextNever()}`
    if (square.kind === 'likely') return `在場誰最可能⋯${nextLikely()}`
    return undefined
  }

  // 換下一個人；被「休息一回」的人跳過並解除
  function nextTurn() {
    if (rollAgain) {
      setRollAgain(false)
      setLanding(null)
      return
    }
    let next = (turn + 1) % players
    const nextSkips = [...skips]
    const skipped: string[] = []
    while (nextSkips[next]) {
      nextSkips[next] = false
      skipped.push(playerName(roster, next))
      next = (next + 1) % players
    }
    setSkips(nextSkips)
    setTurn(next)
    setLanding(null)
    setNotice(skipped.length > 0 ? `${skipped.join('、')} 休息一回，這輪跳過` : '')
    sound.blip(true)
  }

  if (!started) {
    return (
      <GamePage title="喝酒大富翁" rule="輪流擲骰子走格子，停在哪格就照做。經過起點大家一起喝一口。">
        <div className="settings">
          <Stepper id="bd-players" label="玩家人數" value={players} min={2} max={6} onChange={setPlayers} />
        </div>
        <p className="game-rule">記分板有名單的話，棋子會用名單上的名字。</p>
        <button className="btn btn--orange btn--big" id="bd-start" type="button" onClick={start}>
          開始
        </button>
      </GamePage>
    )
  }

  const square = landing?.square
  const actions = square && !busy ? squareActions(square.kind) : []

  function squareActions(kind: Square['kind']) {
    switch (kind) {
      case 'truth':
        return [{ label: '抽真心話', className: 'btn btn--blue', onClick: () => openTruthDare('truth') }]
      case 'dare':
        return [{ label: '抽大冒險', className: 'btn btn--red', onClick: () => openTruthDare('dare') }]
      case 'slot':
        return [{ label: '去轉拉霸機', className: 'btn btn--orange', onClick: loserSpin }]
      case 'drink':
      case 'double':
      case 'left':
      case 'right':
      case 'pick':
      case 'all':
      case 'never':
      case 'likely':
        return [
          {
            label: kind === 'all' ? '記大家各一杯' : '記一杯',
            className: 'btn',
            onClick: () => recordDrink({ title: '誰喝了？', reason: `${square?.title}：${landing?.question ?? square?.desc}` }),
          },
        ]
      default:
        return []
    }
  }

  return (
    <GamePage title="喝酒大富翁">
      <div className="board" id="bd-board">
        {BOARD_SQUARES.map((cell, i) => {
          const [row, col] = squarePosition(i)
          const here = positions.map((at, player) => (at === i ? player : -1)).filter((player) => player >= 0)
          return (
            <div
              key={i}
              className={['board__cell', `is-${cell.kind}`, landing && positions[turn] === i && 'is-landed'].filter(Boolean).join(' ')}
              style={{ gridArea: `${row} / ${col}` }}
              title={cell.title}
            >
              <span className="board__label">{cell.label}</span>
              <span className="board__tokens">
                {here.map((player) => (
                  <i key={player} style={{ background: TOKEN_COLORS[player] }} />
                ))}
              </span>
            </div>
          )
        })}
        <div className="board__center">
          <p className="board__turn" id="bd-turn">
            <i style={{ background: TOKEN_COLORS[turn] }} />
            {playerName(roster, turn)}
          </p>
          <Die value={dice} />
          <button className="btn btn--orange" id="bd-roll" type="button" disabled={busy || !!landing} onClick={roll}>
            擲骰子
          </button>
        </div>
      </div>

      {notice && (
        <p className="game-status" aria-live="polite">
          {notice}
        </p>
      )}

      {landing && square && (
        <div className="panel board-result" id="bd-result" aria-live="polite">
          {landing.notes.map((note) => (
            <p key={note} className="board-result__note">
              {note}
            </p>
          ))}
          <p className="kc-rule__title">{square.title}</p>
          <p className="kc-rule__desc">{square.desc}</p>
          {landing.question && <p className="board-result__question">{landing.question}</p>}
          {rollAgain && <p className="board-result__note">{playerName(roster, turn)} 再擲一次！</p>}
          <div className="result-actions">
            {actions.map(({ label, className, onClick }) => (
              <button key={label} className={className} type="button" onClick={onClick}>
                {label}
              </button>
            ))}
            <button className="btn btn--orange" id="bd-next" type="button" onClick={nextTurn}>
              {rollAgain ? '再擲一次' : '換下一位'}
            </button>
          </div>
        </div>
      )}

      <div className="board-legend">
        {Array.from({ length: players }, (_, i) => (
          <span key={i} className={i === turn ? 'is-turn' : undefined}>
            <i style={{ background: TOKEN_COLORS[i] }} />
            {playerName(roster, i)}
            {skips[i] && '（休息）'}
          </span>
        ))}
      </div>
      <button className="btn btn--small" type="button" onClick={() => setStarted(false)}>
        重新開始
      </button>
    </GamePage>
  )
}
