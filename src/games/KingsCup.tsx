import { Fragment, useEffect, useRef, useState } from 'react'
import { GameResult } from '../components/GameResult.tsx'
import { PlayingCard } from '../components/PlayingCard.tsx'
import { KINGS_CUP_RULES } from '../data/games.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { newDeck, RANKS, type Card } from './cards.ts'
import { GamePage } from './GamePage.tsx'

export function KingsCup() {
  const [deck, setDeck] = useState(newDeck)
  const [kings, setKings] = useState(0)
  const [drawn, setDrawn] = useState<Card | null>(null) // 剛抽到的牌
  const [face, setFace] = useState<Card | null>(null) // 牌面（翻到一半才換）
  const [flips, setFlips] = useState(0)
  const [note, setNote] = useState<string | null>(null)
  const flipTimer = useRef(0)

  useEffect(() => () => clearTimeout(flipTimer.current), [])

  function reset() {
    setDeck(newDeck())
    setKings(0)
    setDrawn(null)
    setFace(null)
    setNote(null)
  }

  function draw() {
    sound.unlock()
    if (kings === 4 || deck.length === 0) {
      setNote(kings === 4 ? '這局結束了' : '牌抽完了')
      sound.blip(false)
      return
    }

    const [card, ...rest] = deck
    const nextKings = card.rank === 'K' ? kings + 1 : kings
    setDeck(rest)
    setKings(nextKings)
    setDrawn(card)
    setNote(null)
    setFlips((n) => n + 1)
    clearTimeout(flipTimer.current)
    flipTimer.current = window.setTimeout(() => setFace(card), 150)

    if (nextKings === 4 && card.rank === 'K') {
      sound.lose()
      vibrate([200, 80, 200])
    } else {
      sound.tick()
    }
  }

  let title = '點牌抽一張'
  let desc = '抽到第四張 K 的人要喝光國王杯'
  if (note) {
    title = note
    desc = '按重新洗牌再玩一輪'
  } else if (drawn) {
    const [name, rule] = KINGS_CUP_RULES[drawn.rank]
    title = `${drawn.rank} ${name}`
    desc = rule
    if (drawn.rank === 'K') {
      if (kings === 4) {
        title = 'K 喝光國王杯！'
        desc = '第四張 K 出現了，把國王杯裡的酒全部喝完'
      } else {
        desc += `（還差 ${4 - kings} 張 K）`
      }
    }
  }

  return (
    <GamePage title="國王杯" rule="中間放一個空杯當國王杯。輪流抽牌，照牌上的規則做。">
      <p className="game-status" id="kc-status">
        剩 {deck.length} 張・國王杯 K {'■'.repeat(kings)}
        {'□'.repeat(4 - kings)}
      </p>
      <PlayingCard card={face} flipKey={flips} id="kc-card" label="抽一張牌" onClick={draw} />
      <div className="panel kc-rule" aria-live="polite">
        <p className="kc-rule__title" id="kc-title">
          {title}
        </p>
        <p className="kc-rule__desc">{desc}</p>
      </div>
      {kings === 4 && (
        <GameResult
          id="kc-result"
          tag="★ 第四張 K ★"
          text="抽到的人喝光國王杯"
          loser
          actions={[{ label: '重新洗牌', onClick: reset }]}
        />
      )}
      <div className="btn-row">
        <button className="btn btn--orange" id="kc-draw" type="button" onClick={draw}>
          抽牌
        </button>
        <button
          className="btn"
          id="kc-restart"
          type="button"
          onClick={() => {
            reset()
            sound.blip(true)
          }}
        >
          重新洗牌
        </button>
      </div>
      <details className="panel rules-list">
        <summary>全部規則</summary>
        <dl>
          {RANKS.map((rank) => (
            <Fragment key={rank}>
              <dt>
                {rank} {KINGS_CUP_RULES[rank][0]}
              </dt>
              <dd>{KINGS_CUP_RULES[rank][1]}</dd>
            </Fragment>
          ))}
        </dl>
      </details>
    </GamePage>
  )
}
