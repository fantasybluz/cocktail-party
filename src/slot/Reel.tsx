import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from 'react'
import { flushSync } from 'react-dom'
import { PixelSprite } from '../components/PixelSprite.tsx'
import type { Item } from '../data/drinks.ts'
import { randomOther } from '../lib/random.ts'

const FILLER_PER_SECOND = 11 // 轉動時每秒經過幾格

export interface ReelHandle {
  spin: (final: Item, duration: number) => Promise<void>
  // 格子高度會隨螢幕改變，重新把結果對到正中間
  realign: () => void
}

interface Props {
  ref: Ref<ReelHandle>
  label: string
  items: Item[]
  initial: Item
  locked: boolean
  onToggleLock: () => void
}

function waitForTransition(el: HTMLElement, duration: number) {
  return new Promise<void>((resolve) => {
    const finish = () => {
      clearTimeout(timer)
      el.removeEventListener('transitionend', onEnd)
      resolve()
    }
    const onEnd = (event: TransitionEvent) => {
      if (event.target === el) finish()
    }
    // 分頁切到背景時 transitionend 可能不會觸發，用計時器保底
    const timer = setTimeout(finish, duration + 150)
    el.addEventListener('transitionend', onEnd)
  })
}

// 讓第 index 格停在視窗正中間的位移
function offsetFor(win: HTMLElement, strip: HTMLElement, index: number) {
  const cell = strip.firstElementChild as HTMLElement
  const padding = (win.clientHeight - cell.offsetHeight) / 2
  return padding - index * cell.offsetHeight
}

function placeAt(win: HTMLElement, strip: HTMLElement, index: number) {
  strip.style.transition = 'none'
  strip.style.transform = `translateY(${offsetFor(win, strip, index)}px)`
}

export function Reel({ ref, label, items, initial, locked, onToggleLock }: Props) {
  // 畫面上的格子：平常三格（上、中＝結果、下），轉動時是一長串
  const [cells, setCells] = useState(() => [randomOther(items, initial), initial, randomOther(items, initial)])
  const [landed, setLanded] = useState(false)
  const windowRef = useRef<HTMLButtonElement>(null)
  const stripRef = useRef<HTMLSpanElement>(null)
  const visibleRef = useRef(cells)
  const spinningRef = useRef(false)

  useImperativeHandle(ref, () => ({
    realign() {
      if (!spinningRef.current) placeAt(windowRef.current!, stripRef.current!, 1)
    },
    async spin(final, duration) {
      spinningRef.current = true
      const above = randomOther(items, final)
      const below = randomOther(items, final)
      const filler: Item[] = []
      let prev = below
      const count = Math.round((duration / 1000) * FILLER_PER_SECOND)
      for (let i = 0; i < count; i++) {
        prev = randomOther(items, prev)
        filler.push(prev)
      }

      // 往下轉：新結果排在最上面，現在看到的三格排在最下面，整條從底部滑到頂部
      const sequence = [above, final, below, ...filler, ...visibleRef.current]
      flushSync(() => {
        setLanded(false)
        setCells(sequence)
      })
      const win = windowRef.current!
      const strip = stripRef.current!
      placeAt(win, strip, sequence.length - 2)
      strip.getBoundingClientRect() // 先套用起點位置，transition 才會從這裡開始
      strip.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.7, 0.3, 1)`
      strip.style.transform = `translateY(${offsetFor(win, strip, 1)}px)`
      await waitForTransition(strip, duration)

      visibleRef.current = [above, final, below]
      flushSync(() => {
        setCells(visibleRef.current)
        setLanded(true)
      })
      placeAt(win, strip, 1)
      spinningRef.current = false
    },
  }))

  useLayoutEffect(() => {
    placeAt(windowRef.current!, stripRef.current!, 1)
  }, [])

  // 轉向或尺寸改變時格子高度會變，重新對齊（頁面藏起來時量不到，由拉霸機切回來時再對齊）
  useEffect(() => {
    const onResize = () => {
      const win = windowRef.current
      if (!spinningRef.current && win?.offsetParent) placeAt(win, stripRef.current!, 1)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className={locked ? 'reel is-locked' : 'reel'}>
      <span className="reel__label">{label}</span>
      <button
        ref={windowRef}
        className="reel__window"
        type="button"
        aria-pressed={locked}
        aria-label={`${label}轉輪，點一下鎖定`}
        onClick={onToggleLock}
      >
        <span ref={stripRef} className={landed ? 'reel__strip is-landed' : 'reel__strip'}>
          {cells.map((item, i) => (
            <span className="cell" key={i}>
              <PixelSprite name={item.sprite} colors={item.colors} />
              <span className="cell__name">{item.name}</span>
            </span>
          ))}
        </span>
        <span className="reel__lock">LOCK</span>
      </button>
    </div>
  )
}
