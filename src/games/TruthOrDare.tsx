import type { TruthDareType } from '../party.ts'
import { GamePage } from './GamePage.tsx'
import type { TruthDareCard } from './questions.ts'

interface Props {
  // 題目放在 App，從轉盤跳過來時才能直接帶著題目進來
  card: TruthDareCard | null
  adult: boolean
  onDraw: (type: TruthDareType) => void
}

export function TruthOrDare({ card, adult, onDraw }: Props) {
  const typeLabel = card ? (card.type === 'truth' ? '真心話' : '大冒險') : '真心話？大冒險？'
  const typeClass = card ? `q-card__type is-${card.type}` : 'q-card__type'

  return (
    <GamePage
      title="真心話大冒險"
      rule="選真心話或大冒險，不想回答或不敢做就喝一杯跳過。"
      badge={adult ? '18+' : undefined}
    >
      <div key={card?.id} className={card ? 'panel q-card is-new' : 'panel q-card'} aria-live="polite">
        <p className={typeClass} id="td-type">
          {typeLabel}
        </p>
        <p className="q-card__text" id="td-text">
          {card?.text ?? '按下面的按鈕抽一題'}
        </p>
      </div>
      <div className="btn-row">
        <button className="btn btn--blue btn--big" id="td-truth" type="button" onClick={() => onDraw('truth')}>
          真心話
        </button>
        <button className="btn btn--red btn--big" id="td-dare" type="button" onClick={() => onDraw('dare')}>
          大冒險
        </button>
      </div>
      <button
        className="btn btn--small"
        type="button"
        onClick={() => onDraw(Math.random() < 0.5 ? 'truth' : 'dare')}
      >
        隨機抽
      </button>
    </GamePage>
  )
}
