import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { GameResult } from '../components/GameResult.tsx'
import { DRAW_WORDS } from '../data/games.ts'
import { makeBag } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { useParty } from '../party.ts'
import { GamePage } from './GamePage.tsx'

const GRID = 64 // 畫布 64x64 格，放大顯示成像素畫
const PALETTE = ['#1b1b2f', '#e63946', '#3a7bd5', '#2fb37f', '#f47920']
const ERASER = '#ffffff'
const TIMES = [60, 90, 120]

const nextWord = makeBag(DRAW_WORDS)

type Step = 'ready' | 'drawing' | 'done'

export function DrawGuess() {
  const { recordDrink } = useParty()
  const [step, setStep] = useState<Step>('ready')
  const [word, setWord] = useState(() => nextWord())
  const [peek, setPeek] = useState(false)
  const [seconds, setSeconds] = useState(60)
  const [left, setLeft] = useState(60)
  const [color, setColor] = useState(PALETTE[0])
  const [thick, setThick] = useState(false)
  const [guessed, setGuessed] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastPoint = useRef<[number, number] | null>(null)
  const timer = useRef(0)

  useEffect(() => () => clearInterval(timer.current), [])

  function clearCanvas() {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = ERASER
    ctx.fillRect(0, 0, GRID, GRID)
  }

  function startDrawing() {
    sound.unlock()
    setStep('drawing')
    setLeft(seconds)
    setGuessed(false)
    sound.blip(true)
    let remaining = seconds
    clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      remaining -= 1
      setLeft(remaining)
      if (remaining <= 10 && remaining > 0) sound.tick(1 - remaining / 10)
      if (remaining <= 0) finish(false)
    }, 1000)
  }

  function finish(correct: boolean) {
    clearInterval(timer.current)
    setGuessed(correct)
    setStep('done')
    if (correct) sound.win()
    else sound.lose()
    vibrate(correct ? 80 : [200, 80, 200])
  }

  function nextRound() {
    setWord(nextWord())
    setStep('ready')
    setPeek(false)
  }

  // 畫布準備好就塗白（每次進入作畫都清空）
  useEffect(() => {
    if (step === 'drawing') clearCanvas()
  }, [step])

  function toGrid(event: PointerEvent<HTMLCanvasElement>): [number, number] {
    const rect = event.currentTarget.getBoundingClientRect()
    return [
      Math.floor(((event.clientX - rect.left) / rect.width) * GRID),
      Math.floor(((event.clientY - rect.top) / rect.height) * GRID),
    ]
  }

  function plot(x: number, y: number) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = color
    const size = thick || color === ERASER ? 3 : 1
    const offset = Math.floor(size / 2)
    ctx.fillRect(x - offset, y - offset, size, size)
  }

  // 兩點之間補滿格子（Bresenham），手指畫快也不會斷線
  function line(from: [number, number], to: [number, number]) {
    let [x0, y0] = from
    const [x1, y1] = to
    const dx = Math.abs(x1 - x0)
    const dy = -Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx + dy
    for (;;) {
      plot(x0, y0)
      if (x0 === x1 && y0 === y1) break
      const e2 = 2 * err
      if (e2 >= dy) {
        err += dy
        x0 += sx
      }
      if (e2 <= dx) {
        err += dx
        y0 += sy
      }
    }
  }

  function onDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = toGrid(event)
    lastPoint.current = point
    plot(...point)
  }

  function onMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!lastPoint.current) return
    const point = toGrid(event)
    line(lastPoint.current, point)
    lastPoint.current = point
  }

  const stopStroke = () => {
    lastPoint.current = null
  }

  if (step === 'ready') {
    return (
      <GamePage
        title="你畫我猜"
        rule="畫的人先偷看題目，其他人不要看。開始後只能畫、不能說話寫字，時間內有人猜中就換下一題。"
      >
        <button
          className="spy-word"
          id="dg-word"
          type="button"
          onPointerDown={() => setPeek(true)}
          onPointerUp={() => setPeek(false)}
          onPointerLeave={() => setPeek(false)}
        >
          {peek ? (
            <>
              <small>題目是</small>
              <strong>{word}</strong>
            </>
          ) : (
            <>
              <span>畫的人按住這裡看題目</span>
              <small>放開就會蓋起來</small>
            </>
          )}
        </button>
        <div className="segmented" role="group" aria-label="作畫時間">
          {TIMES.map((value) => (
            <button
              key={value}
              type="button"
              className={value === seconds ? 'is-active' : undefined}
              aria-pressed={value === seconds}
              onClick={() => setSeconds(value)}
            >
              {value} 秒
            </button>
          ))}
        </div>
        <button className="btn btn--orange btn--big" id="dg-start" type="button" onClick={startDrawing}>
          開始畫
        </button>
        <button className="btn btn--small" type="button" onClick={nextRound}>
          換一題
        </button>
      </GamePage>
    )
  }

  return (
    <GamePage title="你畫我猜">
      <p className="game-status" id="dg-time">
        {step === 'drawing' ? `剩 ${left} 秒` : guessed ? '猜中了！' : '時間到！'}
      </p>
      <canvas
        ref={canvasRef}
        className="draw-canvas"
        id="dg-canvas"
        width={GRID}
        height={GRID}
        onPointerDown={step === 'drawing' ? onDown : undefined}
        onPointerMove={step === 'drawing' ? onMove : undefined}
        onPointerUp={stopStroke}
        onPointerCancel={stopStroke}
      />
      {step === 'drawing' ? (
        <>
          <div className="draw-tools" role="group" aria-label="畫筆">
            {PALETTE.map((value) => (
              <button
                key={value}
                type="button"
                className={value === color ? 'draw-tools__color is-active' : 'draw-tools__color'}
                style={{ background: value }}
                aria-label="換顏色"
                onClick={() => setColor(value)}
              />
            ))}
            <button
              type="button"
              className={color === ERASER ? 'draw-tools__btn is-active' : 'draw-tools__btn'}
              onClick={() => setColor(ERASER)}
            >
              擦
            </button>
            <button
              type="button"
              className={thick ? 'draw-tools__btn is-active' : 'draw-tools__btn'}
              onClick={() => setThick(!thick)}
            >
              粗
            </button>
            <button type="button" className="draw-tools__btn" onClick={clearCanvas}>
              清
            </button>
          </div>
          <div className="btn-row">
            <button
              className="btn"
              type="button"
              onPointerDown={() => setPeek(true)}
              onPointerUp={() => setPeek(false)}
              onPointerLeave={() => setPeek(false)}
            >
              {peek ? word : '按住看題目'}
            </button>
            <button className="btn btn--orange" id="dg-guessed" type="button" onClick={() => finish(true)}>
              猜中了！
            </button>
          </div>
        </>
      ) : (
        <GameResult
          id="dg-result"
          tag={guessed ? '★ 猜中了 ★' : '★ 時間到 ★'}
          text={guessed ? '猜中的人指定一個人喝' : '畫的人喝'}
          note={`題目：${word}`}
          loser={!guessed}
          actions={[
            ...(guessed ? [{ label: '記一杯', onClick: () => recordDrink({ title: '被指定的是誰？', reason: `你畫我猜：${word}` }) }] : []),
            { label: '下一題', variant: 'orange' as const, onClick: nextRound },
          ]}
        />
      )}
    </GamePage>
  )
}
