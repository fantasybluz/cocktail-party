import { PixelSprite } from '../components/PixelSprite.tsx'
import { GAME_LIST } from '../data/games.ts'
import './games.css'

export function GameMenu() {
  return (
    <>
      <header className="page-head">
        <h2 className="page-title">喝酒遊戲</h2>
        <p className="page-sub">一支手機輪流傳，大家一起玩</p>
      </header>
      <nav className="game-grid" aria-label="遊戲列表">
        {GAME_LIST.map((game) => (
          <a key={game.id} className="game-card" href={`#${game.id}`}>
            <PixelSprite name={game.icon} colors={game.colors} />
            <span className="game-card__name">{game.name}</span>
            <span className="game-card__desc">{game.desc}</span>
          </a>
        ))}
      </nav>
    </>
  )
}
