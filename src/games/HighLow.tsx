import { useEffect, useRef, useState } from 'react'
import { GameResult } from '../components/GameResult.tsx'
import { PlayingCard } from '../components/PlayingCard.tsx'
import { sound, vibrate } from '../lib/sound.ts'
import { isGuessRight, newDeck, type Card, type HighLowGuess } from './cards.ts'
import { GamePage } from './GamePage.tsx'

interface Round {
  deck: Card[]
  current: Card
  // 累積的口數：每猜對一次 +1，猜錯的人全部喝掉
  pot: number
  last: { guess: HighLowGuess; right: boolean; drink: number } | null
}

function newRound(): Round {
  const [current, ...deck] = newDeck()
  return { deck, current, pot: 0, last: null }
}

export function HighLow() {
  const [round, setRound] = useState(newRound)
  const [face, setFace] = useState<Card>(round.current)
  const [flips, setFlips] = useState(0)
  const flipTimer = useRef(0)

  useEffect(() => () => clearTimeout(flipTimer.current), [])

  function guess(direction: HighLowGuess) {
    sound.unlock()
    // 牌抽完就重洗（不含桌上這張）
    const { current } = round
    const deck =
      round.deck.length > 0
        ? round.deck
        : newDeck().filter((card) => card.rank !== current.rank || card.suit !== current.suit)
    const [next, ...rest] = deck
    const right = isGuessRight(round.current, next, direction)
    const drink = Math.max(round.pot, 1)
    setRound({ deck: rest, current: next, pot: right ? round.pot + 1 : 0, last: { guess: direction, right, drink } })
    setFlips((n) => n + 1)
    clearTimeout(flipTimer.current)
    flipTimer.current = window.setTimeout(() => setFace(next), 150)

    if (right) {
      sound.blip(true)
      vibrate(20)
    } else {
      sound.lose()
      vibrate([80, 40, 80])
    }
  }

  const { pot, last, deck } = round

  return (
    <GamePage
      title="猜高低"
      rule="猜下一張牌比較大還是比較小（A 最小、K 最大，一樣大算猜錯）。猜對就把手機傳給下一個人，猜錯的人喝掉累積的口數。"
    >
      <p className="game-status" id="hl-status">
        累積 {pot} 口・剩 {deck.length} 張
      </p>
      <PlayingCard card={face} flipKey={flips} id="hl-card" label="目前的牌" />
      {last?.right && (
        <p className="game-status" aria-live="polite">
          猜對了！傳給下一個人
        </p>
      )}
      {last && !last.right && (
        <GameResult id="hl-result" tag="★ 猜錯了 ★" text={`喝 ${last.drink} 口`} note="累積的口數歸零，從下一個人重新開始" loser />
      )}
      <div className="btn-row">
        <button className="btn btn--blue btn--big" id="hl-higher" type="button" onClick={() => guess('higher')}>
          ▲ 比較大
        </button>
        <button className="btn btn--red btn--big" id="hl-lower" type="button" onClick={() => guess('lower')}>
          ▼ 比較小
        </button>
      </div>
      <button
        className="btn btn--small"
        type="button"
        onClick={() => {
          const fresh = newRound()
          setRound(fresh)
          setFace(fresh.current)
          sound.blip(true)
        }}
      >
        重新洗牌
      </button>
    </GamePage>
  )
}
