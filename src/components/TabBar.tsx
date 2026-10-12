import { BASES } from '../data/drinks.ts'
import { BOMB_COLORS } from '../data/games.ts'
import type { SpriteColors, SpriteName } from '../lib/sprites.ts'
import { PixelSprite } from './PixelSprite.tsx'

export type Tab = 'slot' | 'games'

const TABS: { id: Tab; label: string; icon: SpriteName; colors: SpriteColors }[] = [
  { id: 'slot', label: '調酒拉霸機', icon: 'squareBottle', colors: BASES[0].colors },
  { id: 'games', label: '喝酒遊戲', icon: 'bomb', colors: BOMB_COLORS },
]

export function TabBar({ active }: { active: Tab }) {
  return (
    <nav className="tabbar" aria-label="切換頁面">
      {TABS.map(({ id, label, icon, colors }) => (
        <a
          key={id}
          className={id === active ? 'tabbar__tab is-active' : 'tabbar__tab'}
          href={`#${id}`}
          data-tab={id}
          aria-current={id === active ? 'page' : undefined}
        >
          <span className="tabbar__icon">
            <PixelSprite name={icon} colors={colors} />
          </span>
          {label}
        </a>
      ))}
    </nav>
  )
}
