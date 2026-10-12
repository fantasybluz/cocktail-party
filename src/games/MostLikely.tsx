import { useEffect, useRef, useState } from 'react'
import { MOST_LIKELY, MOST_LIKELY_ADULT } from '../data/games.ts'
import { makeBag } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { useParty } from '../party.ts'
import { GamePage } from './GamePage.tsx'

const nextNormal = makeBag(MOST_LIKELY)
const nextAdult = makeBag(MOST_LIKELY_ADULT)

export function MostLikely() {
  const { recordDrink, adult } = useParty()
  const [question, setQuestion] = useState<{ text: string; id: number } | null>(null)
  // 倒數 3、2、1，0 是「指！」
  const [count, setCount] = useState<number | null>(null)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  function next() {
    sound.unlock()
    clearTimeout(timer.current)
    const text = adult ? nextAdult() : nextNormal()
    setQuestion((prev) => ({ text, id: (prev?.id ?? 0) + 1 }))
    setCount(null)
    sound.blip(true)
  }

  function countdown(from = 3) {
    setCount(from)
    if (from === 0) {
      sound.win()
      vibrate(120)
      return
    }
    sound.tick(1 - from / 3)
    timer.current = window.setTimeout(() => countdown(from - 1), 700)
  }

  return (
    <GamePage
      title="誰最可能"
      rule="大家一起看題目，數完 3、2、1 同時指向一個人，被指最多的人喝（平手就一起喝）。"
      badge={adult ? '18+' : undefined}
    >
      <div key={question?.id} className={question ? 'panel q-card is-new' : 'panel q-card'} aria-live="polite">
        <p className="q-card__type">在場誰最可能⋯</p>
        <p className="q-card__text" id="ml-text">
          {question?.text ?? '按下一題開始'}
        </p>
        {count !== null && (
          <p className="countdown" id="ml-count">
            {count === 0 ? '指！' : count}
          </p>
        )}
        {count === 0 && <p className="q-card__foot">被指最多的人喝！</p>}
      </div>
      <div className="btn-row">
        <button
          className="btn btn--red btn--big"
          id="ml-point"
          type="button"
          disabled={!question || (count !== null && count > 0)}
          onClick={() => countdown()}
        >
          3、2、1
        </button>
        <button className="btn btn--orange btn--big" id="ml-next" type="button" onClick={next}>
          下一題
        </button>
      </div>
      {count === 0 && (
        <button
          className="btn btn--small"
          type="button"
          onClick={() => recordDrink({ title: '被指最多的是誰？', reason: `在場誰最可能⋯${question?.text ?? ''}` })}
        >
          記一杯到記分板
        </button>
      )}
    </GamePage>
  )
}
