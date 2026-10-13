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

// 為什麼喝：派對結算用來頒獎
export type DrinkKind = 'boom' | 'challenge' | 'lose' | 'slot' | 'other'

// 每記一杯（或喝一次水）都留一筆，派對結算從這裡算統計
export interface LogEntry {
  name: string
  at: number
  // 在哪個遊戲記的
  game: string
  kind: DrinkKind | 'water'
}

export interface RecordOptions {
  // 選單標題，預設「誰喝了？」
  title?: string
  // 為什麼要喝，例如題目內容
  reason?: string
  // 喝的原因分類，預設 other
  kind?: DrinkKind
  // 在哪個遊戲，預設是目前這一頁
  game?: string
  // 按完成關掉選單之後要做的事（例如換下一題）
  onDone?: () => void
}

export interface DrinkMeta {
  game: string
  kind: DrinkKind
}

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
  // 幫這些人 +1／-1 杯，同時寫進紀錄（-1 會刪掉那個人最後一筆）
  changeDrinks: (names: string[], delta: number, meta: DrinkMeta) => void
  // 按了「該喝水了」
  logWater: (name: string) => void
  // 派對紀錄（每一杯、每次喝水）
  log: LogEntry[]
  // 開新的一場：杯數和紀錄歸零；clearPlayers 連名單一起清掉
  resetParty: (clearPlayers?: boolean) => void
  // 打開「記一杯」的選單，選誰喝就幫誰 +1
  recordDrink: (options?: RecordOptions) => void
  // 目前這一頁的名稱（分享圖標題用）
  pageName: string
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
