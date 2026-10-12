import { ACCENTS, BASES, BEER, DEVIL_MIN_ABV, DEVIL_SHOTS, MIXERS } from '../data/drinks.ts'
import { SHOPPING_SETS, SINGLE_SPIRIT } from '../data/shopping.ts'
import { GamePage } from '../games/GamePage.tsx'
import { WATER_EVERY } from '../party.ts'
import { makeableRecipes, usageCounts } from './shopping.ts'

function Chips({ items }: { items: { name: string; count: number }[] }) {
  return (
    <span className="chip-list">
      {items.map(({ name, count }) => (
        <span key={name} className="chip">
          {name}
          <b>{count}</b>
        </span>
      ))}
    </span>
  )
}

// 拉霸機右上角 [?]：怎麼玩、在家要先準備什麼
export function HomeGuide() {
  const single = makeableRecipes([SINGLE_SPIRIT.spirit, ...SINGLE_SPIRIT.drinks])
  const devilBases = BASES.filter((base) => (base.abv ?? 0) >= DEVIL_MIN_ABV)

  return (
    <GamePage
      title="在家玩指南"
      back="#slot"
      noRecord
      rule="拉霸機的品項都是超商買得到的，不用全部買齊，照人數挑一組就好。"
    >
      <section className="panel guide">
        <h3 className="guide__title">怎麼玩</h3>
        <ul className="guide__list">
          <li>按 SPIN 或拉右邊的拉桿，轉出一杯酒譜，附比例和口感</li>
          <li>點轉輪可以鎖定：家裡已經有的酒先鎖起來，只轉那支酒的酒譜</li>
          <li>惡魔開關：只轉出高濃度組合（每杯兩份烈酒），量力而為</li>
          <li>轉完可以分享到 LINE，或按「誰喝這杯？」記到喝酒記分板</li>
        </ul>
      </section>

      <h3 className="section-title">照人數挑一組（都要再加冰塊）</h3>
      {SHOPPING_SETS.map((set) => {
        const recipes = makeableRecipes([...set.spirits, ...set.drinks])
        return (
          <section key={set.name} className="panel guide guide-set" data-set={set.name}>
            <p className="guide-set__head">
              <strong>{set.name}</strong>
              <span className="guide-set__people">{set.people}</span>
              <span className="tag guide-set__count">{recipes.length} 杯</span>
            </p>
            <dl className="card__rows">
              <dt>酒</dt>
              <dd>{set.spirits.join('、')}</dd>
              <dt>飲料</dt>
              <dd>{set.drinks.join('、')}</dd>
              <dt>能做</dt>
              <dd>{recipes.join('、')}</dd>
            </dl>
          </section>
        )
      })}
      <section className="panel guide">
        <p className="guide__text">
          只想買一支酒的話，{SINGLE_SPIRIT.spirit}最划算：配{SINGLE_SPIRIT.drinks.join('、')}和冰塊，就能做
          {single.length} 杯（{single.join('、')}）。
        </p>
      </section>

      <h3 className="section-title">完整清單（數字是用在幾杯酒譜）</h3>
      <section className="panel guide">
        <dl className="card__rows">
          <dt>基酒</dt>
          <dd>
            <Chips items={usageCounts(BASES)} />
          </dd>
          <dt>材料一</dt>
          <dd>
            <Chips items={usageCounts(MIXERS)} />
          </dd>
          <dt>材料二</dt>
          <dd>
            <Chips items={usageCounts(ACCENTS)} />
          </dd>
        </dl>
        <p className="guide__text">冰塊幾乎每杯都要，一定要買、寧可多買。</p>
      </section>

      <h3 className="section-title">份量怎麼抓</h3>
      <section className="panel guide">
        <ul className="guide__list">
          <li>1 份 ≈ 一瓶 50ml 迷你酒，常見比例是酒 1：飲料 3（50ml 酒配 150ml 飲料）</li>
          <li>一個人一晚抓 2～3 杯：4 個人大約 8～12 份，買迷你瓶，或一支 700ml 的酒（約 14 份）</li>
          <li>600ml 寶特瓶大約調 4 杯、330ml 一罐大約 2 杯</li>
          <li>冰淇淋、棒棒冰記得放冷凍</li>
        </ul>
      </section>

      <h3 className="section-title">器具</h3>
      <section className="panel guide">
        <ul className="guide__list">
          <li>每人一個杯子、量酒用的量杯或 shot 杯（30ml／50ml）、攪拌用的長湯匙或吸管</li>
          <li>剪刀（剪棒棒冰）、冰淇淋挖勺（威士忌可樂漂浮）</li>
          <li>喝酒遊戲大多只要手機；國王杯要在中間放一個空杯</li>
        </ul>
      </section>

      <h3 className="section-title">惡魔模式另外要準備</h3>
      <section className="panel guide">
        <ul className="guide__list">
          <li>啤酒（深水炸彈、高粱炸彈）和 shot 杯</li>
          <li>1 份 = 一個 shot 杯（30ml），每杯都有兩份烈酒（基酒＋加烈）</li>
        </ul>
        <dl className="card__rows">
          <dt>基酒</dt>
          <dd>
            <Chips items={usageCounts(devilBases, true)} />
          </dd>
          <dt>加烈</dt>
          <dd>
            <Chips items={usageCounts(DEVIL_SHOTS, true)} />
          </dd>
          <dt>飲料</dt>
          <dd>
            <Chips items={usageCounts([...MIXERS, BEER], true)} />
          </dd>
        </dl>
      </section>

      <h3 className="section-title">喝之前</h3>
      <section className="panel guide guide--warning">
        <ul className="guide__list">
          <li>準備水和食物，不要空腹喝；記分板每 {WATER_EVERY} 杯會提醒喝水</li>
          <li>先安排好回家方式，喝了就不開車</li>
          <li>未滿 18 歲不要喝；不舒服就停，不用勉強玩完</li>
        </ul>
      </section>
    </GamePage>
  )
}
