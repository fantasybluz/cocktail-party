import { useState } from 'react'
import { sound } from '../lib/sound.ts'
import type { Player } from '../party.ts'

interface Props {
  roster: Player[]
  onAdd: (index: number) => void
  onClose: () => void
}

// 「記一杯」：選誰喝，記分板上就幫誰 +1
export function DrinkPicker({ roster, onAdd, onClose }: Props) {
  const [added, setAdded] = useState<string | null>(null)

  return (
    <div className="overlay" role="dialog" aria-labelledby="picker-title" onClick={onClose}>
      <div className="panel picker" onClick={(event) => event.stopPropagation()}>
        <p className="picker__title" id="picker-title">
          誰喝了？
        </p>
        {roster.length === 0 ? (
          <p className="picker__empty">
            記分板還沒有玩家，先到
            <a href="#scoreboard" onClick={onClose}>
              喝酒記分板
            </a>
            新增名字
          </p>
        ) : (
          <div className="picker__list">
            {roster.map((player, i) => (
              <button
                key={player.name}
                className="btn"
                type="button"
                onClick={() => {
                  onAdd(i)
                  setAdded(player.name)
                  sound.blip(true)
                }}
              >
                {player.name} <span className="picker__count">{player.drinks} 杯</span>
              </button>
            ))}
          </div>
        )}
        <p className="game-status" aria-live="polite">
          {added && `${added} +1`}
        </p>
        <button className="btn btn--orange" type="button" onClick={onClose}>
          完成
        </button>
      </div>
    </div>
  )
}
