import { useState } from 'react'
import { sound } from '../lib/sound.ts'
import type { Player } from '../party.ts'

const MAX_PLAYERS = 12
const MAX_NAME = 8

interface Props {
  roster: Player[]
  title?: string
  reason?: string
  // delta：+1 記一杯、-1 復原
  onChange: (names: string[], delta: number) => void
  onAddPlayer: (name: string) => void
  onClose: () => void
}

// 「誰喝一杯？」：點名字就幫那個人 +1，可以連點、全部 +1、復原上一筆
export function DrinkPicker({ roster, title = '誰喝了？', reason, onChange, onAddPlayer, onClose }: Props) {
  // 這次打開選單記過的紀錄，每筆是一次點擊加的人
  const [history, setHistory] = useState<string[][]>([])
  const [name, setName] = useState('')

  const trimmed = name.trim()
  const canAdd = trimmed !== '' && !roster.some((p) => p.name === trimmed) && roster.length < MAX_PLAYERS

  function add(names: string[]) {
    onChange(names, 1)
    setHistory([...history, names])
    sound.blip(true)
  }

  function undo() {
    const last = history.at(-1)
    if (!last) return
    onChange(last, -1)
    setHistory(history.slice(0, -1))
    sound.blip(false)
  }

  // 這次每個人被記了幾杯
  const added = new Map<string, number>()
  history.flat().forEach((n) => added.set(n, (added.get(n) ?? 0) + 1))

  return (
    <div className="overlay" role="dialog" aria-labelledby="picker-title" onClick={onClose}>
      <div className="panel picker" id="picker" onClick={(event) => event.stopPropagation()}>
        <p className="picker__title" id="picker-title">
          {title}
        </p>
        {reason && <p className="picker__reason">{reason}</p>}

        {roster.length > 0 && (
          <div className="picker__list">
            {roster.map((player) => (
              <button
                key={player.name}
                className={added.has(player.name) ? 'btn btn--orange' : 'btn'}
                type="button"
                data-name={player.name}
                onClick={() => add([player.name])}
              >
                {player.name}
                <span className="picker__count">
                  {player.drinks} 杯{added.has(player.name) && ` +${added.get(player.name)}`}
                </span>
              </button>
            ))}
          </div>
        )}

        {roster.length > 1 && (
          <button className="btn btn--small" type="button" onClick={() => add(roster.map((p) => p.name))}>
            大家都 +1
          </button>
        )}

        {roster.length === 0 && <p className="picker__empty">還沒有玩家，先輸入大家的名字（之後在喝酒記分板也能改）</p>}
        <form
          className="roster-form picker__form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canAdd) return
            onAddPlayer(trimmed)
            setName('')
            sound.blip(true)
          }}
        >
          <input
            className="text-input"
            type="text"
            maxLength={MAX_NAME}
            placeholder="新增玩家"
            value={name}
            aria-label="新增玩家名字"
            onChange={(event) => setName(event.target.value)}
          />
          <button className="btn" type="submit" disabled={!canAdd}>
            新增
          </button>
        </form>

        <div className="btn-row">
          <button className="btn" type="button" disabled={history.length === 0} onClick={undo}>
            復原
          </button>
          <button className="btn btn--orange" id="picker-done" type="button" onClick={onClose}>
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
