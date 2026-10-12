import type { ReactNode } from 'react'
import { useParty } from '../party.ts'
import './games.css'

interface Props {
  title: string
  rule?: ReactNode
  // 標題旁的小標籤，例如成人模式的「18+」
  badge?: string
  // 聚會工具頁不需要右上角的「記一杯」
  noRecord?: boolean
  children: ReactNode
}

// 每個遊戲頁共用的標題列：返回、名稱、玩法說明
// 每個遊戲頁右上角都有「記一杯」，任何時候都能記到記分板
export function GamePage({ title, rule, badge, noRecord = false, children }: Props) {
  const { recordDrink } = useParty()
  return (
    <>
      <header className="game-head">
        <a className="back-btn" href="#games" aria-label="返回遊戲列表">
          ◀<span className="back-btn__text"> 返回</span>
        </a>
        <h2 className="game-title">{title}</h2>
        {badge && <span className="badge">{badge}</span>}
        {!noRecord && (
          <button className="record-btn" type="button" onClick={() => recordDrink({ reason: title })}>
            記一杯
          </button>
        )}
      </header>
      {rule && <p className="game-rule">{rule}</p>}
      {children}
    </>
  )
}
