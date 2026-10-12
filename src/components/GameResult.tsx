import { useParty } from '../party.ts'

export interface ResultAction {
  label: string
  variant?: 'orange' | 'red' | 'blue'
  onClick: () => void
}

interface Props {
  tag: string
  text: string
  note?: string
  // 加上「輸家去轉拉霸機」
  loser?: boolean
  actions?: ResultAction[]
  id?: string
}

// 遊戲結果：液晶螢幕＋按鈕
export function GameResult({ tag, text, note, loser = false, actions = [], id }: Props) {
  const { loserSpin } = useParty()
  const buttons: ResultAction[] = [
    ...(loser ? [{ label: '輸家去轉拉霸機', variant: 'orange' as const, onClick: loserSpin }] : []),
    ...actions,
  ]

  return (
    <div className="game-result" id={id} aria-live="polite">
      <div className="screen">
        <p className="screen__tag">{tag}</p>
        <p className="screen__main">{text}</p>
      </div>
      {note && <p className="game-status">{note}</p>}
      <div className="result-actions">
        {buttons.map(({ label, variant, onClick }) => (
          <button key={label} className={variant ? `btn btn--${variant}` : 'btn'} type="button" onClick={onClick}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
