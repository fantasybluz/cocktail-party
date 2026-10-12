import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react'
import { PixelSprite } from '../components/PixelSprite.tsx'
import { randomOf } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { RecipeCard } from './RecipeCard.tsx'
import { Reel, type ReelHandle } from './Reel.tsx'
import { pickRecipe, recipes, REELS, SCREEN_TITLES, type Locks, type Mode, type Recipe } from './recipes.ts'
import { shareToLine } from './share.ts'
import './slot.css'

const SPIN_DURATIONS_MS = [1300, 1800, 2300] // 三個轉輪依序停下
const DEVIL_COLORS = { a: '#e63946', b: '#ffffff', e: '#ffd23f' }

interface Screen {
  tag: string
  main: string
  busy?: boolean
}

interface Props {
  // 拉霸機頁是不是正在顯示
  active: boolean
  // 每 +1 就幫輸家自動轉一杯（從喝酒遊戲跳過來）
  autoSpin: number
}

export function SlotMachine({ active, autoSpin }: Props) {
  // 一開始先擺一組現成酒譜，畫面比較好看
  const [intro] = useState(() => randomOf(recipes))
  const [mode, setMode] = useState<Mode>('normal')
  const [locked, setLocked] = useState([false, false, false])
  const [spinning, setSpinning] = useState(false)
  const [pulled, setPulled] = useState(false)
  const [win, setWin] = useState(false)
  const [screen, setScreen] = useState<Screen>({ tag: '點轉輪可以鎖定', main: '拉下拉桿！' })
  const [result, setResult] = useState<{ recipe: Recipe; loser: boolean; mode: Mode } | null>(null)

  const reelRefs = useRef<(ReelHandle | null)[]>([])
  const centers = useRef(intro.items) // 每個轉輪目前停在哪個品項
  const lastRecipe = useRef<Recipe | null>(null)
  const spinningRef = useRef(false)
  const cardRef = useRef<HTMLElement>(null)
  const winTimer = useRef(0)
  const handledAutoSpin = useRef(0)

  async function spin(loser = false) {
    if (spinningRef.current) return
    sound.unlock()

    if (locked.every(Boolean)) {
      setScreen({ tag: '三個都鎖住了', main: '點轉輪解鎖' })
      sound.blip(false)
      return
    }

    spinningRef.current = true
    setSpinning(true)
    setWin(false)
    setPulled(true)
    setTimeout(() => setPulled(false), 350)

    const locks = centers.current.map((item, i) => (locked[i] ? item : null)) as Locks
    const recipe = pickRecipe(locks, lastRecipe.current, mode)
    setScreen({ tag: 'SHAKING...', main: '調製中', busy: true })
    sound.startTicking()

    await Promise.all(
      reelRefs.current.map((reel, i) => {
        if (locked[i] || !reel) return null
        return reel.spin(recipe.items[i], SPIN_DURATIONS_MS[i]).then(() => {
          sound.stop()
          vibrate(15)
        })
      }),
    )

    sound.stopTicking()
    centers.current = recipe.items
    lastRecipe.current = recipe
    setResult({ recipe, loser, mode })
    setScreen({ tag: loser ? '輸家請喝這杯' : SCREEN_TITLES[recipe.tag], main: recipe.name })

    const good = recipe.tag !== '實驗'
    setWin(good)
    clearTimeout(winTimer.current)
    winTimer.current = window.setTimeout(() => setWin(false), 2400)
    if (good) {
      sound.win()
      vibrate([60, 40, 60])
    } else {
      sound.lose()
    }

    spinningRef.current = false
    setSpinning(false)
  }

  // 惡魔開關：只轉出高濃度組合；兩個模式的轉輪品項不同，切換時解除鎖定
  function toggleDevil() {
    if (spinningRef.current) return
    sound.unlock()
    const next: Mode = mode === 'devil' ? 'normal' : 'devil'
    setMode(next)
    setLocked([false, false, false])
    lastRecipe.current = null
    if (next === 'devil') {
      setScreen({ tag: '惡魔模式 ON', main: '高濃度，量力而為' })
      sound.devil()
      vibrate([80, 40, 160])
    } else {
      setScreen({ tag: '惡魔模式 OFF', main: '回到一般酒譜' })
      sound.blip(false)
    }
  }

  function toggleLock(index: number) {
    if (spinningRef.current) return
    sound.unlock()
    sound.blip(!locked[index])
    setLocked(locked.map((value, i) => (i === index ? !value : value)))
  }

  const onAutoSpin = useEffectEvent(() => {
    handledAutoSpin.current = autoSpin
    void spin(true)
  })

  // 輸家從遊戲跳過來：頁面切過來後稍等一下再自動轉
  useEffect(() => {
    if (!active || autoSpin <= handledAutoSpin.current) return
    const timer = setTimeout(onAutoSpin, 400)
    return () => clearTimeout(timer)
  }, [active, autoSpin])

  // 藏起來的時候量不到格子高度，切回來時重新對齊
  useLayoutEffect(() => {
    if (active) reelRefs.current.forEach((reel) => reel?.realign())
  }, [active])

  // 手機上卡片通常在畫面下方，轉完捲過去讓人看到比例和口感
  useEffect(() => {
    if (result) cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [result])

  useEffect(() => () => clearTimeout(winTimer.current), [])

  return (
    <>
      <section
        className={['cabinet', win && 'is-win', mode === 'devil' && 'is-devil'].filter(Boolean).join(' ')}
        aria-label="調酒拉霸機"
      >
        <header className="marquee">
          <div className="stripes" aria-hidden="true" />
          <a className="help-btn" id="help-btn" href="#guide" aria-label="在家玩指南：要先準備什麼">
            ?
          </a>
          <div className="lights" aria-hidden="true" />
          <h1 className="title">
            <span className="title__brand">{mode === 'devil' ? '惡魔' : '超商'}</span>調酒拉霸機
          </h1>
          <div className="lights lights--bottom" aria-hidden="true" />
        </header>

        <div className="reel-area">
          <div className="reels">
            {REELS[mode].items.map((items, i) => (
              <Reel
                key={i}
                ref={(handle) => {
                  reelRefs.current[i] = handle
                }}
                label={REELS[mode].labels[i]}
                items={items}
                initial={intro.items[i]}
                locked={locked[i]}
                onToggleLock={() => toggleLock(i)}
              />
            ))}
          </div>

          <button
            className={pulled ? 'lever is-pulled' : 'lever'}
            type="button"
            aria-label="拉下拉桿"
            disabled={spinning}
            onClick={() => spin()}
          >
            <span className="lever__slot" />
            <span className="lever__arm">
              <span className="lever__stick" />
              <span className="lever__knob" />
            </span>
            <span className="lever__base" />
          </button>
        </div>

        <div className={screen.busy ? 'screen is-busy' : 'screen'} aria-live="polite">
          <p className="screen__tag" id="screen-tag">
            {screen.tag}
          </p>
          <p className="screen__main" id="screen-main">
            {screen.main}
          </p>
        </div>

        <button className="spin-btn" id="spin" type="button" disabled={spinning} onClick={() => spin()}>
          SPIN
        </button>

        <button
          className={mode === 'devil' ? 'devil-switch is-on' : 'devil-switch'}
          id="devil-switch"
          type="button"
          role="switch"
          aria-checked={mode === 'devil'}
          disabled={spinning}
          onClick={toggleDevil}
        >
          <span className="devil-switch__icon">
            <PixelSprite name="devil" colors={DEVIL_COLORS} />
          </span>
          <span className="devil-switch__label">
            惡魔開關
            <small>{mode === 'devil' ? '只出高濃度組合' : '打開只出高濃度組合'}</small>
          </span>
          <span className="devil-switch__track" aria-hidden="true">
            <span className="devil-switch__knob" />
          </span>
        </button>
      </section>

      {result && (
        <RecipeCard
          ref={cardRef}
          recipe={result.recipe}
          loser={result.loser}
          devil={result.mode === 'devil'}
          shareDisabled={spinning}
          onShare={() => shareToLine(result.recipe, result.mode === 'devil')}
        />
      )}
    </>
  )
}
