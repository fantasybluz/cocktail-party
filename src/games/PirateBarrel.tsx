import { useEffect, useRef, useState } from 'react'
import { GameResult } from '../components/GameResult.tsx'
import { PixelSprite } from '../components/PixelSprite.tsx'
import { Stepper } from '../components/Stepper.tsx'
import { PIRATE_COLORS } from '../data/games.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { GamePage } from './GamePage.tsx'
import { createBarrel, HOLE_OPTIONS, holesLeft, stab, type Barrel } from './pirate.ts'
import { usePlayers } from './usePlayers.ts'

export function PirateBarrel() {
  const players = usePlayers(2, 12, 4)
  const [holes, setHoles] = useState(18)
  const [barrel, setBarrel] = useState<Barrel | null>(null)
  const [turn, setTurn] = useState(0)
  const [popped, setPopped] = useState(false) // 海盜飛出來（動畫）
  const [done, setDone] = useState(false) // 動畫播完才顯示結果
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  function start() {
    sound.unlock()
    clearTimeout(timer.current)
    setBarrel(createBarrel(holes))
    setTurn(0)
    setPopped(false)
    setDone(false)
    sound.blip(true)
  }

  function insert(hole: number) {
    if (!barrel || popped) return
    sound.unlock()
    const { barrel: next, result } = stab(barrel, hole)
    if (result === 'taken') return
    setBarrel(next)
    if (result === 'pop') {
      setPopped(true)
      sound.boom()
      vibrate([200, 60, 300])
      timer.current = window.setTimeout(() => {
        setDone(true)
        sound.lose()
      }, 900)
      return
    }
    setTurn((turn + 1) % players.count)
    sound.tick(next.filled.length / next.holes)
    vibrate(20)
  }

  if (!barrel) {
    return (
      <GamePage title="瘋狂海盜桶" rule="輪流在桶子上選一個洞插劍，其中一洞是機關，插到海盜就會跳出來，插的人喝。">
        <div className="settings">
          <Stepper id="pb-players" label="玩家人數" value={players.count} min={players.min} max={players.max} onChange={players.setCount} />
        </div>
        <div className="segmented" role="group" aria-label="洞數">
          {HOLE_OPTIONS.map((value) => (
            <button key={value} type="button" className={value === holes ? 'is-active' : undefined} aria-pressed={value === holes} onClick={() => setHoles(value)}>
              {value} 洞
            </button>
          ))}
        </div>
        <button className="btn btn--orange btn--big" id="pb-start" type="button" onClick={start}>
          開始
        </button>
      </GamePage>
    )
  }

  const left = holesLeft(barrel)
  const loser = players.name(turn)

  return (
    <GamePage title="瘋狂海盜桶">
      <p className="spy-who" id="pb-who">
        {popped ? (
          <>
            <strong>{loser}</strong> 插中機關了！
          </>
        ) : (
          <>
            輪到 <strong>{loser}</strong> 插劍
          </>
        )}
      </p>
      <div className="pirate-stage">
        <div className={popped ? 'pirate is-popped' : 'pirate'} id="pb-pirate">
          <PixelSprite name="pirate" colors={PIRATE_COLORS} />
        </div>
        {/* 一排最多 6 洞，小手機才按得到 */}
        <div className="barrel" id="pb-barrel" style={{ gridTemplateColumns: `repeat(${Math.min(6, barrel.holes / 3)}, minmax(0, 1fr))` }}>
          {Array.from({ length: barrel.holes }, (_, i) => {
            const filled = barrel.filled.includes(i)
            return (
              <button
                key={i}
                className={filled ? 'barrel__hole is-filled' : 'barrel__hole'}
                type="button"
                data-hole={i}
                aria-label={`第 ${i + 1} 洞${filled ? '（已插）' : ''}`}
                disabled={filled || popped}
                onClick={() => insert(i)}
              />
            )
          })}
        </div>
      </div>
      <p className="game-status" id="pb-status" aria-live="polite">
        {popped ? '海盜跳出來了！' : `剩 ${left} 個洞・這一洞中獎機率 1/${left}`}
      </p>
      {done && (
        <GameResult
          id="pb-result"
          tag="★ 海盜跳出來了 ★"
          text={`${loser} 喝！`}
          note={`插到第 ${barrel.filled.length} 劍`}
          loser
          actions={[
            { label: '再來一桶', variant: 'orange', onClick: start },
            { label: '改設定', onClick: () => setBarrel(null) },
          ]}
        />
      )}
    </GamePage>
  )
}
