import { useSyncExternalStore } from 'react'
import { sound } from '../lib/sound.ts'
import { useVisitorCount } from '../lib/visitors.ts'

export function Footer() {
  const soundOn = useSyncExternalStore(sound.subscribe, sound.isEnabled)
  const visitor = useVisitorCount()

  return (
    <footer className="footer">
      <p className="notice">
        {visitor && <span className="visitor">你是第 {visitor.toLocaleString()} 個酒鬼</span>}
        禁止酒駕・飲酒過量，有害健康
        <br />
        未滿 18 歲請勿飲酒
      </p>
      <button className="sound-btn" id="sound" type="button" aria-pressed={soundOn} onClick={() => sound.toggle()}>
        音效 {soundOn ? '開' : '關'}
      </button>
      <p className="author">
        author{' '}
        <a href="https://www.instagram.com/fantasybluzz/" target="_blank" rel="noopener noreferrer">
          @fantasybluz
        </a>
      </p>
    </footer>
  )
}
