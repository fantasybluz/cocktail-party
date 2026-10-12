import { useEffect, useRef, useState } from 'react'
import { PixelSprite } from '../components/PixelSprite.tsx'
import { Stepper } from '../components/Stepper.tsx'
import { CHEST_COLORS, EXPLOSION_COLORS } from '../data/games.ts'
import { shuffle } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { useParty } from '../party.ts'
import { GamePage } from './GamePage.tsx'

interface Round {
  bombs: Set<number>
  opened: Set<number>
  exploded: number | null
}

function newRound(boxes: number, bombs: number): Round {
  return {
    bombs: new Set(shuffle([...Array(boxes).keys()]).slice(0, bombs)),
    opened: new Set(),
    exploded: null,
  }
}

// 炸彈最多是箱子的三分之一
const maxBombs = (boxes: number) => Math.floor(boxes / 3)

export function BoxBomb() {
  const { showBoom } = useParty()
  const [boxCount, setBoxCount] = useState(12)
  const [bombCount, setBombCount] = useState(1)
  const [round, setRound] = useState(() => newRound(12, 1))
  const boomTimer = useRef(0)

  useEffect(() => () => clearTimeout(boomTimer.current), [])

  const reset = () => setRound(newRound(boxCount, bombCount))

  function changeBoxes(value: number) {
    const bombs = Math.min(bombCount, maxBombs(value))
    setBoxCount(value)
    setBombCount(bombs)
    setRound(newRound(value, bombs))
  }

  function changeBombs(value: number) {
    setBombCount(value)
    setRound(newRound(boxCount, value))
  }

  function open(index: number) {
    if (round.exploded !== null || round.opened.has(index)) return
    sound.unlock()
    const opened = new Set(round.opened).add(index)

    if (round.bombs.has(index)) {
      setRound({ ...round, opened, exploded: index })
      boomTimer.current = window.setTimeout(
        () => showBoom({ text: `第 ${index + 1} 箱是炸彈！開到的人喝`, onAgain: reset }),
        250,
      )
      return
    }
    setRound({ ...round, opened })
    sound.tick(opened.size / boxCount)
    vibrate(15)
  }

  const left = boxCount - round.opened.size

  return (
    <GamePage title="開箱炸彈" rule="箱子裡藏著炸彈，輪流開一箱，開到炸彈的人喝。">
      <div className="settings">
        <Stepper id="bb-boxes" label="箱子" value={boxCount} min={6} max={20} onChange={changeBoxes} />
        <Stepper id="bb-bombs" label="炸彈" value={bombCount} min={1} max={maxBombs(boxCount)} onChange={changeBombs} />
      </div>
      <p className="game-status" id="bb-status" aria-live="polite">
        {round.exploded !== null ? '炸了！' : `剩 ${left} 箱・下一箱中彈機率 ${bombCount}/${left}`}
      </p>
      <div className="box-grid">
        {Array.from({ length: boxCount }, (_, i) => {
          const isOpen = round.opened.has(i)
          const isBomb = round.exploded === i
          const classes = ['box', isOpen && 'is-open', isBomb && 'is-bomb'].filter(Boolean).join(' ')
          return (
            <button
              key={i}
              className={classes}
              type="button"
              aria-label={`第 ${i + 1} 箱`}
              disabled={isOpen || round.exploded !== null}
              onClick={() => open(i)}
            >
              <PixelSprite name={isBomb ? 'explosion' : 'chest'} colors={isBomb ? EXPLOSION_COLORS : CHEST_COLORS} />
              <span className="box__num">{i + 1}</span>
              {isOpen && !isBomb && <span className="box__label">安全</span>}
            </button>
          )
        })}
      </div>
      <button
        className="btn btn--small"
        type="button"
        onClick={() => {
          reset()
          sound.blip(true)
        }}
      >
        重新開始
      </button>
    </GamePage>
  )
}
