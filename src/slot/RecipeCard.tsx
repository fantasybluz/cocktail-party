import type { Ref } from 'react'
import { useParty } from '../party.ts'
import { estimate, fizzLabel, ratioText, sweetLabel, type Recipe } from './recipes.ts'

interface Props {
  ref: Ref<HTMLElement>
  recipe: Recipe
  loser: boolean
  devil: boolean
  shareDisabled: boolean
  onShare: () => void
}

function Meter({ kind, label, level, value }: { kind: string; label: string; level: number; value: string }) {
  return (
    <div className="meter" data-kind={kind}>
      <span className="meter__label">{label}</span>
      <span className="meter__cells">
        {Array.from({ length: 5 }, (_, i) => (
          <i key={i} className={i < level ? 'on' : undefined} />
        ))}
      </span>
      <span className="meter__value">{value}</span>
    </div>
  )
}

export function RecipeCard({ ref, recipe, loser, devil, shareDisabled, onShare }: Props) {
  const { recordDrink } = useParty()
  const accent = recipe.items[2]
  const result = estimate(recipe)

  return (
    <section ref={ref} className={devil ? 'card is-devil' : 'card'} id="recipe">
      <p className="card__eyebrow" id="recipe-eyebrow">
        {loser ? '輸家喝這杯' : '今晚調這杯'}
      </p>
      <div className="card__head">
        <h2 className="card__name" id="recipe-name">
          {recipe.name}
        </h2>
        <span className="tag" data-tag={recipe.tag}>
          {recipe.tag}
        </span>
      </div>

      <dl className="card__rows">
        <dt>比例</dt>
        <dd id="recipe-ratio">{ratioText(recipe)}</dd>
        {accent.solid && (
          <>
            <dt>加料</dt>
            <dd>
              {accent.name}，{accent.howTo}
            </dd>
          </>
        )}
        <dt>口感</dt>
        <dd id="recipe-taste">{recipe.taste}</dd>
        {recipe.warning && (
          <>
            <dt className="card__warning-label">注意</dt>
            <dd className="card__warning" id="recipe-warning">
              {recipe.warning}
            </dd>
          </>
        )}
      </dl>

      <div className="meters">
        <Meter kind="strength" label="酒感" level={result.strength} value={`約 ${Math.round(result.abv)}%`} />
        <Meter kind="sweet" label="甜度" level={result.sweet} value={sweetLabel(result.sweet)} />
        <Meter kind="fizz" label="氣泡" level={result.fizz} value={fizzLabel(result.fizz)} />
      </div>

      {devil ? (
        <p className="card__note card__note--devil">
          惡魔模式 1 份 ≈ 一個 shot 杯（30ml）。濃度很高：量力而為、不要空腹、喝了不開車，不舒服就停。
        </p>
      ) : (
        <p className="card__note">1 份 ≈ 一瓶 50ml 迷你酒，酒精濃度沒算冰塊融化，僅供參考</p>
      )}

      {loser && (
        <button className="btn" type="button" onClick={recordDrink}>
          記一杯到記分板
        </button>
      )}
      <button className="share-btn" id="share" type="button" disabled={shareDisabled} onClick={onShare}>
        分享到 LINE
      </button>
    </section>
  )
}
