import { useState } from 'react'
import { GamePage } from '../games/GamePage.tsx'
import { sound } from '../lib/sound.ts'
import { useParty, WATER_EVERY } from '../party.ts'

const MAX_PLAYERS = 12
const MAX_NAME = 8

export function Scoreboard() {
  const { roster, updateRoster } = useParty()
  const [name, setName] = useState('')
  const [confirmReset, setConfirmReset] = useState<'count' | 'all' | null>(null)

  const trimmed = name.trim()
  const duplicate = roster.some((player) => player.name === trimmed)

  function add() {
    if (!trimmed || duplicate || roster.length >= MAX_PLAYERS) return
    updateRoster((list) => [...list, { name: trimmed, drinks: 0, water: 0 }])
    setName('')
    sound.blip(true)
  }

  function change(index: number, delta: number) {
    sound.unlock()
    updateRoster((list) =>
      list.map((player, i) => {
        if (i !== index) return player
        const drinks = Math.max(0, player.drinks + delta)
        return { ...player, drinks, water: Math.min(player.water, drinks) }
      }),
    )
    sound.blip(delta > 0)
  }

  function reset(kind: 'count' | 'all') {
    if (confirmReset !== kind) {
      setConfirmReset(kind)
      return
    }
    updateRoster((list) => (kind === 'all' ? [] : list.map((player) => ({ ...player, drinks: 0, water: 0 }))))
    setConfirmReset(null)
    sound.blip(false)
  }

  const total = roster.reduce((sum, player) => sum + player.drinks, 0)
  const top = Math.max(0, ...roster.map((player) => player.drinks))

  return (
    <GamePage
      noRecord
      title="喝酒記分板"
      rule={`記每個人喝了幾杯，每多 ${WATER_EVERY} 杯提醒喝水。名單也會用在吹牛骰、大富翁、誰是臥底，遊戲裡按「記一杯」也會記到這裡。`}
    >
      <form
        className="roster-form"
        onSubmit={(event) => {
          event.preventDefault()
          add()
        }}
      >
        <input
          className="text-input"
          id="sb-name"
          type="text"
          maxLength={MAX_NAME}
          placeholder="輸入名字"
          value={name}
          aria-label="玩家名字"
          onChange={(event) => setName(event.target.value)}
        />
        <button
          className="btn btn--orange"
          id="sb-add"
          type="submit"
          disabled={!trimmed || duplicate || roster.length >= MAX_PLAYERS}
        >
          新增
        </button>
      </form>
      {duplicate && <p className="game-status">已經有人叫這個名字了</p>}

      {roster.length === 0 ? (
        <p className="game-status">還沒有玩家，先新增大家的名字</p>
      ) : (
        <>
          <p className="game-status" id="sb-total">
            總共 {total} 杯
          </p>
          <ul className="roster">
            {roster.map((player, i) => {
              const needWater = player.drinks - player.water >= WATER_EVERY
              return (
                <li key={player.name} className="roster__row" data-name={player.name}>
                  <span className="roster__name">
                    {player.name}
                    {top > 0 && player.drinks === top && <small className="roster__crown">喝最多</small>}
                  </span>
                  {needWater ? (
                    <button
                      className="roster__water"
                      type="button"
                      onClick={() => updateRoster((list) => list.map((p, j) => (j === i ? { ...p, water: p.drinks } : p)))}
                    >
                      該喝水了
                    </button>
                  ) : (
                    <span />
                  )}
                  <button className="btn" type="button" aria-label={`${player.name} 減一杯`} onClick={() => change(i, -1)}>
                    －
                  </button>
                  <span className="roster__count">{player.drinks}</span>
                  <button
                    className="btn btn--orange"
                    type="button"
                    aria-label={`${player.name} 加一杯`}
                    onClick={() => change(i, 1)}
                  >
                    ＋
                  </button>
                  <button
                    className="roster__remove"
                    type="button"
                    aria-label={`移除 ${player.name}`}
                    onClick={() => updateRoster((list) => list.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="btn-row">
            <button className="btn" type="button" onClick={() => reset('count')}>
              {confirmReset === 'count' ? '再按一次歸零' : '杯數歸零'}
            </button>
            <button className="btn btn--red" type="button" onClick={() => reset('all')}>
              {confirmReset === 'all' ? '再按一次清空' : '清空名單'}
            </button>
          </div>
        </>
      )}
    </GamePage>
  )
}
