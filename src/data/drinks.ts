import type { SpriteColors, SpriteName } from '../lib/sprites.ts'

// 轉輪品項都是超商（以 7-11 為主）買得到的東西（各門市進貨不同，大店品項較齊）
export interface Item {
  name: string
  sprite: SpriteName
  // a 主色、b 標籤、c 瓶蓋、e 標籤上的字
  colors: SpriteColors
  // 用在沒有現成酒譜時，自動組出口感描述
  flavor: string
  // 酒精濃度（%）、甜度 0~3、氣泡 0~3，用來估算酒感、甜度、氣泡
  abv?: number
  sweet?: number
  fizz?: number
  // 基酒：沒有現成酒譜時，材料一預設加幾份（基酒 1 份）
  ratio?: number
  // 材料二：solid 的不算進比例，改顯示 howTo
  solid?: boolean
  howTo?: string
}

export type RecipeTag = '人氣' | '經典' | '創意' | '實驗'

export interface RecipeData {
  name: string
  // 人氣＝網路上超商調酒文章常見的組合、經典＝經典調酒、創意＝自己搭的
  tag: Exclude<RecipeTag, '實驗'>
  // 依序是基酒、材料一、材料二的品名
  items: [string, string, string]
  // 比例（材料二是 solid 時只寫前兩個）
  parts: number[]
  taste: string
}

// 基酒
export const BASES: Item[] = [
  { name: '威士忌', abv: 40, sweet: 0, ratio: 3, flavor: '麥香和木桶味', sprite: 'squareBottle', colors: { a: '#c47a1e', b: '#1b1b1b', c: '#2a2a2a', e: '#e0b84a' } },
  { name: '伏特加', abv: 40, sweet: 0, ratio: 3, flavor: '乾淨的酒精感', sprite: 'bottle', colors: { a: '#dfe9f2', b: '#f7f9fc', c: '#aab3bd', e: '#2b59c3' } },
  { name: '琴酒', abv: 40, sweet: 0, ratio: 3, flavor: '杜松子草本香', sprite: 'bottle', colors: { a: '#3a7bd5', b: '#f2efe6', c: '#c0c6cc', e: '#c0392b' } },
  { name: '高粱', abv: 58, sweet: 0, ratio: 4, flavor: '濃烈的高粱香', sprite: 'bottle', colors: { a: '#f4f1e8', b: '#d62828', c: '#d62828', e: '#f6c445' } },
  { name: '野格', abv: 35, sweet: 2, ratio: 2, flavor: '藥草甘草味', sprite: 'squareBottle', colors: { a: '#1f4d2b', b: '#f28c28', c: '#f28c28', e: '#1b1b1b' } },
  { name: '燒酒', abv: 16, sweet: 1, ratio: 1, flavor: '清爽的燒酒味', sprite: 'bottle', colors: { a: '#3fae6a', b: '#e8f5e9', c: '#1e6b3a', e: '#2e7d32' } },
  { name: '清酒', abv: 13, sweet: 1, ratio: 1.5, flavor: '淡淡的米香', sprite: 'cup', colors: { a: '#f3f0e2', b: '#c62828', c: '#d4a73a', e: '#f6c445' } },
  { name: '梅酒', abv: 12, sweet: 3, ratio: 1, flavor: '梅子的酸甜', sprite: 'bottle', colors: { a: '#e0a03a', b: '#f6f1df', c: '#c49a3a', e: '#7cb342' } },
]

// 材料一：主要的飲料，佔杯子大部分
export const MIXERS: Item[] = [
  { name: '可樂', sweet: 3, fizz: 3, flavor: '可樂的焦糖甜', sprite: 'can', colors: { a: '#d6202a', b: '#f4f4f4', c: '#c0c6cc', e: '#d6202a' } },
  { name: '雪碧', sweet: 3, fizz: 3, flavor: '檸檬汽水的清爽', sprite: 'can', colors: { a: '#1e9b4a', b: '#f6e04b', c: '#c0c6cc', e: '#1e5aa8' } },
  { name: '黑松沙士', sweet: 3, fizz: 3, flavor: '沙士的草本涼感', sprite: 'can', colors: { a: '#1f3c88', b: '#f4f4f4', c: '#c0c6cc', e: '#d62828' } },
  { name: '蘋果西打', sweet: 3, fizz: 3, flavor: '蘋果汽水的果香', sprite: 'can', colors: { a: '#f2c230', b: '#d62828', c: '#c0c6cc', e: '#f4f4f4' } },
  { name: '氣泡水', sweet: 0, fizz: 3, flavor: '無糖的氣泡', sprite: 'pet', colors: { a: '#cfe8f5', b: '#2b8fd6', c: '#2b8fd6', e: '#f4f4f4' } },
  { name: '冬瓜茶', sweet: 3, fizz: 0, flavor: '冬瓜茶的黑糖香', sprite: 'carton', colors: { a: '#8b5a2b', b: '#f2e3c6', c: '#8b5a2b', e: '#4a7a2a' } },
  { name: '無糖綠茶', sweet: 0, fizz: 0, flavor: '綠茶的回甘', sprite: 'pet', colors: { a: '#a8cf6b', b: '#2f6b2f', c: '#2f6b2f', e: '#f4f4f4' } },
  { name: '柳橙汁', sweet: 2, fizz: 0, flavor: '柳橙的酸甜', sprite: 'carton', colors: { a: '#f28c28', b: '#f4f4f4', c: '#f28c28', e: '#f28c28' } },
  { name: '蔓越莓汁', sweet: 2, fizz: 0, flavor: '莓果的酸甜', sprite: 'pet', colors: { a: '#b0173b', b: '#f4f4f4', c: '#f4f4f4', e: '#b0173b' } },
  { name: '草莓牛奶', sweet: 3, fizz: 0, flavor: '草莓奶香', sprite: 'carton', colors: { a: '#f7a8c4', b: '#f4f4f4', c: '#f7a8c4', e: '#e0457b' } },
  { name: '紅牛', sweet: 3, fizz: 2, flavor: '能量飲料的甜', sprite: 'slimCan', colors: { a: '#2b59c3', b: '#c0c6cc', c: '#c0c6cc', e: '#d62828' } },
  { name: '冰結檸檬', abv: 5, sweet: 1, fizz: 2, flavor: '檸檬沙瓦的酸爽', sprite: 'can', colors: { a: '#d8dde3', b: '#f6e04b', c: '#c0c6cc', e: '#2e7d32' } },
  { name: '冰結葡萄', abv: 5, sweet: 2, fizz: 2, flavor: '葡萄沙瓦的果香', sprite: 'can', colors: { a: '#d8dde3', b: '#7b3fa0', c: '#c0c6cc', e: '#f4f4f4' } },
]

// 材料二：加味或加料
export const ACCENTS: Item[] = [
  { name: '冰塊', solid: true, sweet: 0, howTo: '杯子先裝滿冰', flavor: '滿滿的冰塊', sprite: 'iceCup', colors: { a: '#bfe3f5', b: '#f4fbff', w: '#ffffff' } },
  { name: '養樂多', sweet: 3, fizz: 0, flavor: '養樂多的乳酸甜', sprite: 'smallBottle', colors: { a: '#f2efe0', b: '#d62828', c: '#d62828', e: '#f4f4f4' } },
  { name: '可爾必思', sweet: 3, fizz: 0, flavor: '可爾必思的酸甜乳香', sprite: 'pet', colors: { a: '#f4f4f4', b: '#2b59c3', c: '#2b59c3', e: '#f4f4f4' } },
  { name: '檸檬棒棒冰', solid: true, sweet: 2, howTo: '剪開整支放進杯子', flavor: '檸檬冰棒的酸甜', sprite: 'icePop', colors: { a: '#f6e04b', c: '#f4f4f4' } },
  { name: '香草冰淇淋', solid: true, sweet: 3, howTo: '最後挖一球放上面', flavor: '冰淇淋的香草奶香', sprite: 'iceCream', colors: { a: '#fff3c4', b: '#c49a6c', e: '#7a4a24' } },
]

export const RECIPES: RecipeData[] = [
  { name: '嗨棒', tag: '經典', items: ['威士忌', '氣泡水', '冰塊'], parts: [1, 3], taste: '麥香被氣泡拉開，乾爽不甜、尾韻帶淡淡木桶香，配什麼都好吃' },
  { name: '威士忌可樂', tag: '人氣', items: ['威士忌', '可樂', '冰塊'], parts: [1, 3], taste: '可樂的焦糖甜蓋過酒辣，香甜好入口，像大人版的可樂' },
  { name: '威士忌綠茶', tag: '經典', items: ['威士忌', '無糖綠茶', '冰塊'], parts: [1, 4], taste: 'KTV 經典喝法，茶的回甘壓住酒精刺激，清爽不甜、越喝越順' },
  { name: '威士忌冬瓜茶', tag: '人氣', items: ['威士忌', '冬瓜茶', '冰塊'], parts: [1, 3], taste: '冬瓜茶的黑糖焦香跟麥香很合，甜而不膩，古早味大變身' },
  { name: '威士忌沙士', tag: '創意', items: ['威士忌', '黑松沙士', '冰塊'], parts: [1, 3], taste: '沙士的草本涼感配上麥香，很有台味的嗨棒' },
  { name: '威士忌可樂漂浮', tag: '創意', items: ['威士忌', '可樂', '香草冰淇淋'], parts: [1, 3], taste: '冰淇淋慢慢融進可樂變成奶香泡沫，甜點系調酒' },
  { name: '螺絲起子', tag: '經典', items: ['伏特加', '柳橙汁', '冰塊'], parts: [1, 2], taste: '柳橙酸甜為主，幾乎喝不出酒味，小心一杯接一杯' },
  { name: '伏特加蔓越莓', tag: '人氣', items: ['伏特加', '蔓越莓汁', '冰塊'], parts: [1, 3], taste: '莓果酸甜、顏色漂亮，偏酸很解膩，想要氣泡可以補點雪碧' },
  { name: '草莓牛奶伏特加', tag: '人氣', items: ['伏特加', '草莓牛奶', '冰塊'], parts: [1, 3], taste: '草莓奶香把酒味包起來，滑順香甜，像在喝飲料' },
  { name: '養樂多伏特加', tag: '人氣', items: ['伏特加', '雪碧', '養樂多'], parts: [1, 2, 1], taste: '乳酸酸甜加上汽水氣泡，像養樂多汽水，很好入口' },
  { name: '雙倍檸檬伏特加', tag: '人氣', items: ['伏特加', '冰結檸檬', '冰塊'], parts: [1, 4], taste: '檸檬酸爽加上足足的氣泡，很解渴，但酒精不低要慢慢喝' },
  { name: '可爾必思伏特加', tag: '創意', items: ['伏特加', '氣泡水', '可爾必思'], parts: [1, 3, 1], taste: '可爾必思蘇打的酸甜乳香，乾淨清爽，伏特加幾乎隱形' },
  { name: '琴雪通', tag: '人氣', items: ['琴酒', '雪碧', '冰塊'], parts: [1, 3], taste: '杜松子草本香配檸檬汽水，清爽帶點微苦，夏天首選' },
  { name: '琴酒柳橙', tag: '人氣', items: ['琴酒', '柳橙汁', '冰塊'], parts: [1, 5], taste: '柳橙甜味打頭陣，琴酒的草本香在後段出來，很順口' },
  { name: '琴酒綠茶', tag: '創意', items: ['琴酒', '無糖綠茶', '冰塊'], parts: [1, 3], taste: '茶香和草本香疊在一起，乾爽回甘、完全不甜' },
  { name: '琴蘇打棒棒冰', tag: '創意', items: ['琴酒', '氣泡水', '檸檬棒棒冰'], parts: [1, 3], taste: '冰棒邊融邊變成檸檬琴蘇打，越喝越酸甜，而且一直很冰' },
  { name: '養樂多高粱', tag: '人氣', items: ['高粱', '雪碧', '養樂多'], parts: [1, 3, 1], taste: '養樂多的乳酸甜把高粱的嗆辣壓下來，入口甜、後勁強' },
  { name: '高粱葡萄冰結', tag: '人氣', items: ['高粱', '冰結葡萄', '冰塊'], parts: [1, 8], taste: '葡萄香氣蓋住高粱味，喝起來像果汁沙瓦，但會偷偷醉' },
  { name: '清酒西打', tag: '人氣', items: ['清酒', '蘋果西打', '冰塊'], parts: [1, 1.5], taste: '米香配蘋果汽水，酸甜清爽，酒精感很低' },
  { name: '清酒可爾必思', tag: '創意', items: ['清酒', '氣泡水', '可爾必思'], parts: [1, 1, 1], taste: '日式乳酸沙瓦風，米香加上酸甜乳香，柔和好入口' },
  { name: '野格炸彈', tag: '人氣', items: ['野格', '紅牛', '冰塊'], parts: [1, 1], taste: '藥草甘草香配能量飲料的甜，派對必備，喝完很嗨' },
  { name: '野格沙士', tag: '人氣', items: ['野格', '黑松沙士', '冰塊'], parts: [1, 3], taste: '兩種草本味疊在一起，像加強版沙士，香甜帶涼感' },
  { name: '養樂多燒酒', tag: '經典', items: ['燒酒', '雪碧', '養樂多'], parts: [1, 1, 1], taste: '韓國經典喝法，酸甜乳香加上氣泡，像在喝汽水' },
  { name: '葡萄燒酒', tag: '人氣', items: ['燒酒', '冰結葡萄', '冰塊'], parts: [1, 2], taste: '葡萄香氣很濃、甜甜的像果汁，韓式派對感' },
  { name: '燒酒棒棒冰', tag: '人氣', items: ['燒酒', '氣泡水', '檸檬棒棒冰'], parts: [1, 1], taste: '冰棒邊融邊喝，檸檬酸甜加上氣泡，冰涼爽口' },
  { name: '梅酒蘇打', tag: '人氣', items: ['梅酒', '氣泡水', '冰塊'], parts: [1, 2], taste: '梅子酸甜被氣泡打開，清爽解膩，酒精感很輕' },
  { name: '梅子綠茶', tag: '人氣', items: ['梅酒', '無糖綠茶', '冰塊'], parts: [1, 1], taste: '茶的回甘配梅子酸甜，清爽不膩，像加了酒的梅子綠' },
]
