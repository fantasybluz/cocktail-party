import { useState } from 'react'
import { PixelSprite } from '../components/PixelSprite.tsx'
import { ShareImageButton } from '../components/ShareImageButton.tsx'
import { GamePage } from '../games/GamePage.tsx'
import { sound } from '../lib/sound.ts'
import { useParty } from '../party.ts'
import { openLineShare, siteLink } from '../slot/share.ts'
import { AWARD_ICONS } from './awardIcons.ts'
import { computeStats, formatSpan, formatTime, type PartyStats } from './summary.ts'
import { drawSummaryImage } from './summaryImage.ts'

function shareText(stats: PartyStats): string {
  const lines = ['🎉 今晚結算（超商調酒拉霸機）', `總共 ${stats.total} 杯・${stats.players.length} 人`]
  stats.awards.forEach((award) => lines.push(`${award.title}：${award.names.join('、')}（${award.value}）`))
  const link = siteLink()
  if (link) lines.push(`下次一起玩 👉 ${link}`)
  return lines.join('\n')
}

export function PartySummary() {
  const { roster, log, resetParty } = useParty()
  const [confirmReset, setConfirmReset] = useState(false)
  const stats = computeStats(roster, log)
  const max = Math.max(1, ...stats.players.map((p) => p.drinks))

  if (stats.total === 0) {
    return (
      <GamePage title="派對結算" noRecord>
        <div className="panel guide">
          <p className="guide__text" id="summary-empty">
            還沒有喝酒紀錄。先到喝酒記分板加大家的名字，玩遊戲時按「記一杯」，結束時再來這裡頒獎。
          </p>
          <a className="btn btn--orange" href="#scoreboard">
            去喝酒記分板
          </a>
        </div>
      </GamePage>
    )
  }

  return (
    <GamePage title="派對結算" noRecord>
      <section className="screen summary-head">
        <p className="screen__tag">
          {stats.start && stats.end ? formatSpan(stats.start, stats.end) : '今晚'}
        </p>
        <p className="screen__main" id="summary-total">
          總共 {stats.total} 杯
        </p>
        <p className="screen__tag">
          {stats.players.length} 人・平均 {stats.average.toFixed(1)} 杯
        </p>
      </section>

      <div className="award-grid">
        {stats.awards.map((award) => (
          <div key={award.id} className="panel award" data-award={award.id}>
            <PixelSprite name={AWARD_ICONS[award.id].sprite} colors={AWARD_ICONS[award.id].colors} />
            <span className="award__title">{award.title}</span>
            <strong className="award__names">{award.names.join('、')}</strong>
            <span className="award__value">{award.value}</span>
          </div>
        ))}
      </div>

      <h3 className="section-title">每個人喝了幾杯</h3>
      <ul className="summary-bars">
        {stats.players.map((player) => (
          <li key={player.name}>
            <span className="summary-bars__name">{player.name}</span>
            <span className="summary-bars__bar">
              <i style={{ width: `${(player.drinks / max) * 100}%` }} />
            </span>
            <span className="summary-bars__count">{player.drinks}</span>
            <small className="summary-bars__detail">
              {[
                player.boom && `被炸 ${player.boom}`,
                player.challenge && `挑戰失敗 ${player.challenge}`,
                player.lose && `輸 ${player.lose}`,
                player.water && `喝水 ${player.water}`,
              ]
                .filter(Boolean)
                .join('・')}
            </small>
          </li>
        ))}
      </ul>

      <section className="panel guide">
        <ul className="guide__list">
          {stats.topGame && (
            <li>
              最多人喝的遊戲：{stats.topGame.game}（{stats.topGame.count} 杯）
            </li>
          )}
          {stats.peak && (
            <li>
              最熱鬧的時段：{formatTime(stats.peak.start)} 起 30 分鐘內 {stats.peak.count} 杯
            </li>
          )}
          <li>回家前喝杯水，喝了就不開車，叫車或請沒喝的朋友送</li>
        </ul>
      </section>

      <div className="btn-row">
        <ShareImageButton
          render={() => drawSummaryImage(stats, new Date())}
          filename="今晚結算.png"
          message={shareText(stats)}
          label="存成圖片"
          className="btn btn--orange"
        />
        <button className="btn btn--green" type="button" onClick={() => openLineShare(shareText(stats))}>
          分享到 LINE
        </button>
      </div>
      <button
        className="btn btn--small"
        id="summary-reset"
        type="button"
        onClick={() => {
          if (!confirmReset) {
            setConfirmReset(true)
            return
          }
          resetParty()
          setConfirmReset(false)
          sound.blip(false)
        }}
      >
        {confirmReset ? '再按一次：杯數和紀錄歸零（保留名單）' : '開新的一場'}
      </button>
    </GamePage>
  )
}
