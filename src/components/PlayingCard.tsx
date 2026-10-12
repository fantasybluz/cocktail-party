import type { Card } from '../games/cards.ts'

interface Props {
  // null 是牌背
  card: Card | null
  // 每換一次值就重播翻牌動畫
  flipKey: number
  id?: string
  label?: string
  onClick?: () => void
}

export function PlayingCard({ card, flipKey, id, label = '撲克牌', onClick }: Props) {
  const corner = card ? `${card.rank}\n${card.suit}` : ''
  const classes = ['playing-card', !card && 'is-back', card?.red && 'is-red', flipKey > 0 && 'is-flipping']
    .filter(Boolean)
    .join(' ')

  return (
    <button key={flipKey} className={classes} id={id} type="button" aria-label={label} onClick={onClick}>
      <span className="playing-card__corner">{corner}</span>
      <span className="playing-card__suit">{card?.suit}</span>
      <span className="playing-card__corner playing-card__corner--bottom">{corner}</span>
    </button>
  )
}
