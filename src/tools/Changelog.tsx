import { useEffect } from 'react'
import { GamePage } from '../games/GamePage.tsx'
import { CHANGELOG, splitBold, UNRELEASED } from '../lib/changelog.ts'
import { APP_VERSION, BUILD_DATE, BUILD_SHA, versionSeen } from '../lib/version.ts'

function Item({ text }: { text: string }) {
  return (
    <li>
      {splitBold(text).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
    </li>
  )
}

// 點頁尾的版號進來：看每一版改了什麼
export function Changelog() {
  // 看過更新紀錄，頁尾的 NEW 就消失
  useEffect(() => {
    versionSeen.markSeen()
  }, [])

  return (
    <GamePage title="更新紀錄" back="#slot" noRecord>
      <section className="screen">
        <p className="screen__tag">目前版本</p>
        <p className="screen__main" id="changelog-version">
          v{APP_VERSION}
        </p>
        <p className="screen__tag">{[BUILD_SHA && `建置 ${BUILD_SHA}`, BUILD_DATE].filter(Boolean).join('・')}</p>
      </section>
      {CHANGELOG.map((section) => {
        const unreleased = section.version === UNRELEASED
        return (
          <section key={section.version} className="panel guide changelog" data-version={section.version}>
            <p className="changelog__head">
              <strong>{unreleased ? '下一版' : `v${section.version}`}</strong>
              {section.version === APP_VERSION && <span className="tag">目前版本</span>}
              {unreleased && <span className="changelog__note">已經上線，還沒發版</span>}
            </p>
            <ul className="guide__list">
              {section.items.map((item) => (
                <Item key={item} text={item} />
              ))}
            </ul>
          </section>
        )
      })}
    </GamePage>
  )
}
