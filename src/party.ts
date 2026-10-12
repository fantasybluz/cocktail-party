import { createContext, useContext } from 'react'

export type TruthDareType = 'truth' | 'dare'

export interface BoomOptions {
  text: string
  onAgain: () => void
}

// 記分板上的玩家
export interface Player {
  name: string
  drinks: number
  // 上次喝水時喝到第幾杯，每多 3 杯提醒喝水
  water: number
}

export const WATER_EVERY = 3

// 各個遊戲共用的動作和資料
export interface Party {
  // 遊戲輸了，跳到拉霸機幫輸家轉一杯
  loserSpin: () => void
  // 從轉盤、大富翁轉到真心話／大冒險時，直接抽一題
  openTruthDare: (type: TruthDareType) => void
  // 三個炸彈遊戲共用的爆炸畫面
  showBoom: (options: BoomOptions) => void
  // 記分板的玩家名單，其他遊戲也用來顯示名字
  roster: Player[]
  updateRoster: (update: (roster: Player[]) => Player[]) => void
  // 打開「記一杯」的選單，選誰喝就幫誰 +1
  recordDrink: () => void
  // 成人模式：題目類遊戲改用感情、曖昧類的題庫（18+）
  adult: boolean
  setAdult: (adult: boolean) => void
}

export const PartyContext = createContext<Party | null>(null)

export function useParty(): Party {
  const party = useContext(PartyContext)
  if (!party) throw new Error('useParty 要在 PartyContext 裡面使用')
  return party
}

// 有記分板名單就用名字，沒有就用號碼
export function playerName(roster: Player[], index: number): string {
  return roster[index]?.name ?? `${index + 1} 號`
}
