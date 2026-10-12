import { useState } from 'react'
import { NEVER_ADULT, NEVER_HAVE_I_EVER } from '../data/games.ts'
import { makeBag } from '../lib/random.ts'
import { sound } from '../lib/sound.ts'
import { useParty } from '../party.ts'
import { GamePage } from './GamePage.tsx'

const nextNormal = makeBag(NEVER_HAVE_I_EVER)
const nextAdult = makeBag(NEVER_ADULT)

export function NeverHaveIEver() {
  const { adult, recordDrink } = useParty()
  const [current, setCurrent] = useState<{ text: string; count: number } | null>(null)

  function next() {
    sound.unlock()
    const text = adult ? nextAdult() : nextNormal()
    setCurrent((prev) => ({ text, count: (prev?.count ?? 0) + 1 }))
    sound.blip(true)
  }

  return (
    <GamePage title="我從來沒有" rule="大家一起看題目，做過這件事的人喝一口。" badge={adult ? '18+' : undefined}>
      <div key={current?.count} className={current ? 'panel q-card is-new' : 'panel q-card'} aria-live="polite">
        <p className="q-card__type">我從來沒有⋯</p>
        <p className="q-card__text" id="nv-text">
          {current?.text ?? '按下一題開始'}
        </p>
        <p className="q-card__foot">做過的人喝一口！</p>
      </div>
      <p className="game-status" id="nv-status">
        {current && `第 ${current.count} 題（共 ${(adult ? NEVER_ADULT : NEVER_HAVE_I_EVER).length} 題，抽完才會重複）`}
      </p>
      {current && (
        <button
          className="btn"
          id="nv-record"
          type="button"
          onClick={() => recordDrink({ title: '誰做過？各喝一口', reason: `我從來沒有⋯${current.text}` })}
        >
          記錄做過的人
        </button>
      )}
      <button className="btn btn--orange btn--big" id="nv-next" type="button" onClick={next}>
        下一題
      </button>
    </GamePage>
  )
}
