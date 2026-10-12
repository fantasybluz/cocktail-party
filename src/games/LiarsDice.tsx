import { useState } from 'react'
import { Die } from '../components/Die.tsx'
import { GameResult } from '../components/GameResult.tsx'
import { Stepper } from '../components/Stepper.tsx'
import { randomInt } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { playerName, useParty } from '../party.ts'
import { DICE_PER_PLAYER, diceMatches, judgeBid, rollDice, type LiarResult } from './dice.ts'
import { GamePage } from './GamePage.tsx'

type Step = 'setup' | 'reveal' | 'bid' | 'result'

export function LiarsDice() {
  const { roster } = useParty()
  // 沒手動調整前跟著記分板名單的人數
  const [playersOverride, setPlayers] = useState<number | null>(null)
  const players = playersOverride ?? (roster.length >= 2 ? Math.min(roster.length, 8) : 4)
  const [wildOnes, setWildOnes] = useState(true)
  const [step, setStep] = useState<Step>('setup')
  const [hands, setHands] = useState<number[][]>([])
  const [first, setFirst] = useState(0)
  const [turn, setTurn] = useState(0)
  const [shown, setShown] = useState(false)
  const [viewed, setViewed] = useState(false)
  const [quantity, setQuantity] = useState(3)
  const [face, setFace] = useState(5)
  const [result, setResult] = useState<LiarResult | null>(null)

  function deal() {
    sound.unlock()
    setHands(Array.from({ length: players }, () => rollDice()))
    setFirst(randomInt(players))
    setTurn(0)
    setShown(false)
    setViewed(false)
    setResult(null)
    setQuantity(players)
    setStep('reveal')
    sound.blip(true)
  }

  function open() {
    const judged = judgeBid(hands, quantity, face, wildOnes)
    setResult(judged)
    setStep('result')
    sound.boom()
    vibrate([150, 60, 150])
  }

  if (step === 'setup') {
    return (
      <GamePage
        title="吹牛骰"
        rule={`每人 ${DICE_PER_PLAYER} 顆骰子，輪流偷看自己的骰子。大家輪流喊「全場有幾個幾點」，喊的數量只能越來越多（或同數量換更大的點），覺得有人在吹牛就喊「開！」`}
      >
        <div className="settings">
          <Stepper id="ld-players" label="玩家人數" value={players} min={2} max={8} onChange={setPlayers} />
        </div>
        <div className="segmented" role="group" aria-label="1 點萬用">
          <button type="button" className={wildOnes ? 'is-active' : undefined} aria-pressed={wildOnes} onClick={() => setWildOnes(true)}>
            1 點萬用
          </button>
          <button
            type="button"
            className={wildOnes ? undefined : 'is-active'}
            aria-pressed={!wildOnes}
            onClick={() => setWildOnes(false)}
          >
            1 點不萬用
          </button>
        </div>
        <p className="game-rule">1 點萬用：1 點可以當成任何點數；但有人喊「幾個 1」時，就只算 1 點。</p>
        <button className="btn btn--orange btn--big" id="ld-start" type="button" onClick={deal}>
          擲骰子
        </button>
      </GamePage>
    )
  }

  // 傳手機看骰子
  if (step === 'reveal') {
    const last = turn === players - 1
    return (
      <GamePage title="吹牛骰">
        <p className="spy-who" id="ld-who">
          請 <strong>{playerName(roster, turn)}</strong> 拿手機
        </p>
        <button
          className="spy-word"
          id="ld-hand"
          type="button"
          onClick={() => {
            if (!shown) sound.blip(true)
            setShown(!shown)
            setViewed(true)
          }}
        >
          {shown ? (
            <>
              <small>你的骰子</small>
              <span className="dice-row">
                {hands[turn].map((value, i) => (
                  <Die key={i} value={value} />
                ))}
              </span>
              <small>再點一下蓋住</small>
            </>
          ) : (
            <>
              <span>{viewed ? '已蓋住，點一下再看一次' : '點這裡看你的骰子'}</span>
              <small>別讓其他人看到</small>
            </>
          )}
        </button>
        <button
          className="btn btn--orange btn--big"
          id="ld-next"
          type="button"
          disabled={!viewed}
          onClick={() => {
            if (last) {
              setStep('bid')
              sound.win()
              return
            }
            setTurn(turn + 1)
            setShown(false)
            setViewed(false)
            sound.blip(true)
          }}
        >
          {last ? '記住了，開始喊' : '記住了，傳給下一位'}
        </button>
      </GamePage>
    )
  }

  const total = players * DICE_PER_PLAYER

  return (
    <GamePage title="吹牛骰">
      {step === 'bid' && (
        <>
          <p className="game-rule" id="ld-hint">
            從 {playerName(roster, first)} 開始喊（例如「三個五」）。有人喊「開！」的時候，把最後喊的數量和點數設好再按開。
          </p>
          <div className="panel">
            <p className="kc-rule__desc">最後喊的是</p>
            <div className="settings">
              <Stepper id="ld-quantity" label="數量" value={quantity} min={1} max={total} onChange={setQuantity} />
            </div>
            <div className="face-picker" role="group" aria-label="點數">
              {[1, 2, 3, 4, 5, 6].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={value === face ? 'face-picker__btn is-active' : 'face-picker__btn'}
                  data-face={value}
                  aria-pressed={value === face}
                  onClick={() => setFace(value)}
                >
                  <Die value={value} />
                </button>
              ))}
            </div>
            <p className="game-status">
              「{quantity} 個 {face} 點」
            </p>
          </div>
          <button className="btn btn--red btn--big" id="ld-open" type="button" onClick={open}>
            開！
          </button>
        </>
      )}

      {step === 'result' && result && (
        <GameResult
          id="ld-result"
          tag={`全場有 ${result.count} 個 ${face} 點`}
          text={result.bidHolds ? '喊的是真的，開的人喝' : '吹牛被抓到，喊的人喝'}
          note={`最後喊「${quantity} 個 ${face} 點」${wildOnes && face !== 1 ? '（1 點萬用）' : ''}`}
          loser
          actions={[
            { label: '下一局', variant: 'orange', onClick: deal },
            { label: '改設定', onClick: () => setStep('setup') },
          ]}
        />
      )}

      {step === 'result' && (
        <div className="hands">
          {hands.map((hand, i) => (
            <div key={i} className="hands__row">
              <span className="hands__name">{playerName(roster, i)}</span>
              <span className="dice-row">
                {hand.map((value, j) => (
                  <Die key={j} value={value} highlight={diceMatches(value, face, wildOnes)} />
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </GamePage>
  )
}
