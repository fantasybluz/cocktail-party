import { createContext, useContext } from 'react'

export type TruthDareType = 'truth' | 'dare'

export interface BoomOptions {
  text: string
  onAgain: () => void
}

// 各個遊戲共用的動作
export interface Party {
  // 遊戲輸了，跳到拉霸機幫輸家轉一杯
  loserSpin: () => void
  // 從轉盤轉到真心話／大冒險時，直接抽一題
  openTruthDare: (type: TruthDareType) => void
  // 三個炸彈遊戲共用的爆炸畫面
  showBoom: (options: BoomOptions) => void
}

export const PartyContext = createContext<Party | null>(null)

export function useParty(): Party {
  const party = useContext(PartyContext)
  if (!party) throw new Error('useParty 要在 PartyContext 裡面使用')
  return party
}
