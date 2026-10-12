import { useEffect, useRef, useState } from 'react'
import { sound, vibrate } from '../lib/sound.ts'
import { useParty } from '../party.ts'
import { GamePage } from './GamePage.tsx'

const MIN = 1
const MAX = 100
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0', '確定']

interface Round {
  low: number
  high: number
  bomb: number
  guesses: number
}

function newRound(): Round {
  return { low: MIN, high: MAX, bomb: MIN + Math.floor(Math.random() * (MAX - MIN + 1)), guesses: 0 }
}

export function NumberBomb() {
  const { showBoom } = useParty()
  const [round, setRound] = useState(newRound)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [errorCount, setErrorCount] = useState(0) // 每次輸入錯誤 +1，讓抖動動畫重播
  const errorTimer = useRef(0)

  useEffect(() => () => clearTimeout(errorTimer.current), [])

  function reset() {
    setRound(newRound())
    setInput('')
  }

  function submit() {
    const guess = Number(input)
    setInput('')
    if (!guess || guess < round.low || guess > round.high) {
      setError(`請輸入 ${round.low}～${round.high}`)
      setErrorCount((n) => n + 1)
      sound.blip(false)
      errorTimer.current = window.setTimeout(() => setError(null), 1200)
      return
    }

    const next = { ...round, guesses: round.guesses + 1 }
    if (guess === round.bomb) {
      setRound(next)
      showBoom({ text: `炸彈就是 ${round.bomb}！猜中的人喝`, onAgain: reset })
      return
    }
    if (guess < round.bomb) next.low = guess + 1
    else next.high = guess - 1
    setRound(next)
    sound.tick()
    vibrate(20)
  }

  function press(key: string) {
    sound.unlock()
    clearTimeout(errorTimer.current)
    setError(null)
    if (key === '確定') {
      submit()
      return
    }
    if (key === '清除') setInput('')
    else if (input.length < 3) setInput(String(Number(input + key))) // 去掉開頭的 0
    sound.blip(true)
  }

  const { low, high, guesses } = round

  return (
    <GamePage title="數字炸彈" rule="炸彈藏在範圍裡。輪流輸入一個數字，範圍會越縮越小，猜中炸彈的人喝。">
      <div className="screen">
        <p className="screen__tag">{low === high ? '只剩一個數字，輪到的人中彈！' : `第 ${guesses + 1} 次猜`}</p>
        <p className="nb-range" id="nb-range" aria-live="polite">
          {low} ～ {high}
        </p>
      </div>
      <div
        key={errorCount}
        className={['nb-input', error && 'is-error', !input && !error && 'is-placeholder'].filter(Boolean).join(' ')}
      >
        {error || input || '輸入數字'}
      </div>
      <div className="keypad">
        {KEYS.map((key) => (
          <button
            key={key}
            className={key === '確定' ? 'btn btn--orange' : 'btn'}
            type="button"
            data-key={key}
            onClick={() => press(key)}
          >
            {key}
          </button>
        ))}
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
