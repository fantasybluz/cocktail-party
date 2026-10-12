import { useState } from 'react'
import { GameResult } from '../components/GameResult.tsx'
import { TWO_TRUTHS_ADULT, TWO_TRUTHS_TOPICS } from '../data/games.ts'
import { makeBag } from '../lib/random.ts'
import { sound } from '../lib/sound.ts'
import { useParty } from '../party.ts'
import { GamePage } from './GamePage.tsx'

const nextNormal = makeBag(TWO_TRUTHS_TOPICS)
const nextAdult = makeBag(TWO_TRUTHS_ADULT)

export function TwoTruths() {
  const { adult } = useParty()
  const [topic, setTopic] = useState<{ text: string; id: number } | null>(null)
  // 大家有沒有猜中哪一句是假的
  const [caught, setCaught] = useState<boolean | null>(null)

  function next() {
    sound.unlock()
    const text = adult ? nextAdult() : nextNormal()
    setTopic((prev) => ({ text, id: (prev?.id ?? 0) + 1 }))
    setCaught(null)
    sound.blip(true)
  }

  function judge(value: boolean) {
    setCaught(value)
    if (value) sound.lose()
    else sound.win()
  }

  return (
    <GamePage
      title="兩真一假"
      rule="輪到的人照主題說三件關於自己的事，兩件真的、一件假的。其他人討論後一起猜哪一件是假的。"
      badge={adult ? '18+' : undefined}
    >
      <div key={topic?.id} className={topic ? 'panel q-card is-new' : 'panel q-card'} aria-live="polite">
        <p className="q-card__type">這一輪的主題</p>
        <p className="q-card__text" id="tt-topic">
          {topic?.text ?? '按抽主題開始'}
        </p>
        {topic && <p className="q-card__foot">說三件事：兩真一假</p>}
      </div>

      {topic && caught === null && (
        <div className="btn-row">
          <button className="btn btn--blue" id="tt-caught" type="button" onClick={() => judge(true)}>
            猜中假的了
          </button>
          <button className="btn btn--red" id="tt-fooled" type="button" onClick={() => judge(false)}>
            大家被騙了
          </button>
        </div>
      )}

      {caught !== null && (
        <GameResult
          id="tt-result"
          tag={caught ? '★ 被識破了 ★' : '★ 騙過大家 ★'}
          text={caught ? '說的人喝' : '猜錯的人喝'}
          loser
        />
      )}

      <button className="btn btn--orange btn--big" id="tt-next" type="button" onClick={next}>
        {topic ? '下一個主題' : '抽主題'}
      </button>
    </GamePage>
  )
}
