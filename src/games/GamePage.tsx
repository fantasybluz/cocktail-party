import type { ReactNode } from 'react'
import './games.css'

interface Props {
  title: string
  rule?: ReactNode
  children: ReactNode
}

// 每個遊戲頁共用的標題列：返回、名稱、玩法說明
export function GamePage({ title, rule, children }: Props) {
  return (
    <>
      <header className="game-head">
        <a className="back-btn" href="#games">
          ◀ 返回
        </a>
        <h2 className="game-title">{title}</h2>
      </header>
      {rule && <p className="game-rule">{rule}</p>}
      {children}
    </>
  )
}
