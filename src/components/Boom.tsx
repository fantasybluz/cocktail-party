import { EXPLOSION_COLORS } from '../data/games.ts'
import { PixelSprite } from './PixelSprite.tsx'

interface Props {
  text: string
  onAgain: () => void
  onLoser: () => void
  onRecord: () => void
}

// 三個炸彈遊戲共用的爆炸畫面
export function Boom({ text, onAgain, onLoser, onRecord }: Props) {
  return (
    <div className="boom" id="boom" role="alertdialog" aria-labelledby="boom-title" aria-describedby="boom-text">
      <div className="boom__inner">
        <div className="boom__sprite">
          <PixelSprite name="explosion" colors={EXPLOSION_COLORS} />
        </div>
        <p className="boom__title" id="boom-title">
          BOOM!
        </p>
        <p className="boom__text" id="boom-text">
          {text}
        </p>
        <div className="boom__actions">
          <button className="btn btn--orange btn--big" id="boom-loser" type="button" onClick={onLoser}>
            輸家去轉拉霸機
          </button>
          <div className="btn-row">
            <button className="btn" type="button" onClick={onRecord}>
              記一杯
            </button>
            <button className="btn" id="boom-again" type="button" onClick={onAgain}>
              再玩一次
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
