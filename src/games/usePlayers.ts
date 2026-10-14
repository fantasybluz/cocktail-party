import { useState } from 'react'
import { playerName, useParty } from '../party.ts'

// 輪流挑戰的人數：沒手動調整前跟著記分板名單，名字也用名單上的
export function usePlayers(min: number, max: number, fallback: number) {
  const { roster } = useParty()
  const [override, setCount] = useState<number | null>(null)
  const count = override ?? (roster.length >= min ? Math.min(roster.length, max) : fallback)
  return { count, setCount, min, max, name: (index: number) => playerName(roster, index) }
}

// 計時用；包一層避免 React 規則把事件裡的 performance.now() 誤判成在 render 裡呼叫
export const clock = () => performance.now()
