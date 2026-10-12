import { useState } from 'react'
import { sound, vibrate } from '../lib/sound.ts'
import { useParty, type TruthDareType } from '../party.ts'
import { GamePage } from './GamePage.tsx'
import type { TruthDareCard } from './questions.ts'

interface Props {
  // 題目放在 App，從轉盤跳過來時才能直接帶著題目進來
  card: TruthDareCard | null
  adult: boolean
  onDraw: (type: TruthDareType) => void
}

type Outcome = 'success' | 'fail'

export function TruthOrDare({ card, adult, onDraw }: Props) {
  const { recordDrink } = useParty()
  // 記下是哪一題的結果，抽新題目時自然就清掉
  const [resolved, setResolved] = useState<{ id: number; outcome: Outcome } | null>(null)
  const outcome = card && resolved?.id === card.id ? resolved.outcome : null

  const typeLabel = card ? (card.type === 'truth' ? '真心話' : '大冒險') : '真心話？大冒險？'
  const typeClass = card ? `q-card__type is-${card.type}` : 'q-card__type'

  function succeed() {
    if (!card) return
    setResolved({ id: card.id, outcome: 'success' })
    sound.win()
    vibrate(60)
  }

  // 挑戰失敗：跳出「誰喝一杯？」
  function fail() {
    if (!card) return
    setResolved({ id: card.id, outcome: 'fail' })
    sound.lose()
    recordDrink({ title: '誰喝一杯？', reason: `挑戰失敗：${card.text}` })
  }

  return (
    <GamePage
      title="真心話大冒險"
      rule="選真心話或大冒險，做到了按「挑戰成功」換下一個人；不想回答或不敢做就按「挑戰失敗」，選誰喝一杯。"
      badge={adult ? '18+' : undefined}
    >
      <div key={card?.id} className={card ? 'panel q-card is-new' : 'panel q-card'} aria-live="polite">
        <p className={typeClass} id="td-type">
          {typeLabel}
        </p>
        <p className="q-card__text" id="td-text">
          {card?.text ?? '按下面的按鈕抽一題'}
        </p>
        {outcome && (
          <p className={outcome === 'success' ? 'q-card__outcome is-success' : 'q-card__outcome is-fail'} id="td-outcome">
            {outcome === 'success' ? '挑戰成功！換下一個人選' : '挑戰失敗，喝一杯！換下一個人選'}
          </p>
        )}
      </div>

      {card && !outcome && (
        <div className="btn-row">
          <button className="btn btn--green btn--big" id="td-success" type="button" onClick={succeed}>
            挑戰成功
          </button>
          <button className="btn btn--red btn--big" id="td-fail" type="button" onClick={fail}>
            挑戰失敗
          </button>
        </div>
      )}

      {(!card || outcome) && (
        <div className="btn-row">
          <button className="btn btn--blue btn--big" id="td-truth" type="button" onClick={() => onDraw('truth')}>
            真心話
          </button>
          <button className="btn btn--red btn--big" id="td-dare" type="button" onClick={() => onDraw('dare')}>
            大冒險
          </button>
        </div>
      )}

      <button
        className="btn btn--small"
        id="td-random"
        type="button"
        onClick={() => onDraw(card && !outcome ? card.type : Math.random() < 0.5 ? 'truth' : 'dare')}
      >
        {card && !outcome ? '換一題' : '隨機抽'}
      </button>
    </GamePage>
  )
}
