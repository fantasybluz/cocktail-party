// 在家玩的採買組合：用酒譜資料窮舉「買最少、能做最多杯」算出來的（都要再加冰塊）
// 能做哪幾杯由 slot/shopping.ts 依酒譜即時計算，改酒譜時這裡不用跟著改數字

export interface ShoppingSet {
  name: string
  people: string
  spirits: string[]
  drinks: string[]
}

export const SHOPPING_SETS: ShoppingSet[] = [
  {
    name: '小酌組',
    people: '2～3 人',
    spirits: ['威士忌', '梅酒'],
    drinks: ['氣泡水', '可樂', '黑松沙士', '無糖綠茶'],
  },
  {
    name: '派對組',
    people: '4～6 人',
    spirits: ['威士忌', '伏特加', '琴酒', '梅酒'],
    drinks: ['氣泡水', '可樂', '雪碧', '黑松沙士', '無糖綠茶', '冬瓜茶', '柳橙汁'],
  },
  {
    name: '大派對組',
    people: '6 人以上',
    spirits: ['威士忌', '伏特加', '琴酒', '高粱', '燒酒'],
    drinks: ['氣泡水', '可樂', '雪碧', '黑松沙士', '無糖綠茶', '柳橙汁', '冰結葡萄', '養樂多'],
  },
]

// 只想買一支酒時的建議
export const SINGLE_SPIRIT = {
  spirit: '威士忌',
  drinks: ['氣泡水', '可樂', '黑松沙士', '無糖綠茶', '冬瓜茶'],
}
