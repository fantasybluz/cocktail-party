import { useState } from 'react'
import { PixelSprite } from '../components/PixelSprite.tsx'
import { GAME_LIST, TOOL_LIST, type GameMeta } from '../data/games.ts'
import { sound } from '../lib/sound.ts'
import { useParty } from '../party.ts'
import './games.css'

// 有題庫、會被成人模式影響的遊戲
const ADULT_GAMES = new Set<string>(['truth-dare', 'never', 'most-likely', 'two-truths'])

function Cards({ list, adult }: { list: GameMeta<string>[]; adult: boolean }) {
  return (
    <>
      {list.map((game) => (
        <a key={game.id} className="game-card" href={`#${game.id}`}>
          {adult && ADULT_GAMES.has(game.id) && <span className="badge game-card__badge">18+</span>}
          <PixelSprite name={game.icon} colors={game.colors} />
          <span className="game-card__name">{game.name}</span>
          <span className="game-card__desc">{game.desc}</span>
        </a>
      ))}
    </>
  )
}

export function GameMenu() {
  const { adult, setAdult } = useParty()
  const [confirming, setConfirming] = useState(false)

  function toggleAdult() {
    sound.unlock()
    if (adult) {
      setAdult(false)
      sound.blip(false)
      return
    }
    setConfirming(true)
  }

  return (
    <>
      <header className="page-head">
        <h2 className="page-title">喝酒遊戲</h2>
        <p className="page-sub">一支手機輪流傳，大家一起玩</p>
      </header>

      <button
        className={adult ? 'adult-switch is-on' : 'adult-switch'}
        id="adult-switch"
        type="button"
        role="switch"
        aria-checked={adult}
        onClick={toggleAdult}
      >
        <span className="badge">18+</span>
        <span className="adult-switch__label">
          成人題庫
          <small>{adult ? '真心話、我從來沒有等改成感情曖昧題' : '打開後題目改成感情、曖昧類'}</small>
        </span>
        <span className="devil-switch__track" aria-hidden="true">
          <span className="devil-switch__knob" />
        </span>
      </button>

      {confirming && (
        <div className="panel adult-confirm" role="alertdialog" aria-labelledby="adult-confirm-text">
          <p id="adult-confirm-text">
            成人題庫有感情、曖昧、身體相關的題目。請確認在場每個人都滿 18 歲，也都能接受；不想回答或不敢做的一樣喝一杯跳過。
          </p>
          <div className="btn-row">
            <button className="btn" type="button" onClick={() => setConfirming(false)}>
              取消
            </button>
            <button
              className="btn btn--red"
              id="adult-confirm"
              type="button"
              onClick={() => {
                setAdult(true)
                setConfirming(false)
                sound.devil()
              }}
            >
              都滿 18 歲，打開
            </button>
          </div>
        </div>
      )}

      <nav className="game-grid" aria-label="遊戲列表">
        <Cards list={GAME_LIST} adult={adult} />
      </nav>

      <h3 className="section-title">聚會工具</h3>
      <nav className="game-grid" aria-label="聚會工具">
        <Cards list={TOOL_LIST} adult={adult} />
      </nav>
    </>
  )
}
