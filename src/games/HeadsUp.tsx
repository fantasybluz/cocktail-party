import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { GameResult } from '../components/GameResult.tsx'
import { HEADS_UP_DECKS } from '../data/games.ts'
import { shuffle } from '../lib/random.ts'
import { sound, vibrate } from '../lib/sound.ts'
import { GamePage } from './GamePage.tsx'

const ROUND_SECONDS = 60
const PASS_SCORE = 5 // 猜中不到這個數字就喝

type Step = 'pick' | 'countdown' | 'playing' | 'done'
type Answer = { word: string; correct: boolean }

// iOS 13 以後要在點擊當下要權限才收得到傾斜事件；被拒絕或不支援就只能用點的
async function requestTiltPermission(): Promise<void> {
  const Orientation = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
  try {
    await Orientation?.requestPermission?.()
  } catch {
    // 拒絕也沒關係，還可以點螢幕
  }
}

export function HeadsUp() {
  const [deckIndex, setDeckIndex] = useState(0)
  const [step, setStep] = useState<Step>('pick')
  const [count, setCount] = useState(3)
  const [left, setLeft] = useState(ROUND_SECONDS)
  // 剩下的題目和作答紀錄放在一起，連續快速作答也不會互相蓋掉
  const [round, setRound] = useState<{ words: string[]; answers: Answer[] }>({ words: [], answers: [] })
  const { words, answers } = round
  const [flash, setFlash] = useState<{ correct: boolean; id: number } | null>(null)
  const timer = useRef(0)
  // 傾斜判斷要回到正中間才能再觸發下一次
  const armed = useRef(true)

  useEffect(() => () => clearInterval(timer.current), [])

  function start(index = deckIndex) {
    void requestTiltPermission()
    sound.unlock()
    setDeckIndex(index)
    setRound({ words: shuffle(HEADS_UP_DECKS[index].words), answers: [] })
    setLeft(ROUND_SECONDS)
    setStep('countdown')
    setCount(3)
    armed.current = true

    let n = 3
    clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      n -= 1
      if (n > 0) {
        setCount(n)
        sound.tick(0.3)
        return
      }
      clearInterval(timer.current)
      setStep('playing')
      sound.blip(true)
      let seconds = ROUND_SECONDS
      timer.current = window.setInterval(() => {
        seconds -= 1
        setLeft(seconds)
        if (seconds <= 10 && seconds > 0) sound.tick(1 - seconds / 10)
        if (seconds <= 0) {
          clearInterval(timer.current)
          setStep('done')
          sound.lose()
          vibrate([200, 80, 200])
        }
      }, 1000)
    }, 800)
  }

  function answer(correct: boolean) {
    if (step !== 'playing') return
    setRound((prev) => {
      const [word, ...rest] = prev.words
      return {
        words: rest.length > 0 ? rest : shuffle(HEADS_UP_DECKS[deckIndex].words),
        answers: [...prev.answers, { word, correct }],
      }
    })
    setFlash((prev) => ({ correct, id: (prev?.id ?? 0) + 1 }))
    if (correct) sound.win()
    else sound.blip(false)
    vibrate(correct ? 60 : [30, 30, 30])
  }
  const onTiltAnswer = useEffectEvent((correct: boolean) => answer(correct))

  // 手機直拿貼在額頭：往下點頭（螢幕朝地）＝答對，往上抬頭（螢幕朝天）＝跳過
  useEffect(() => {
    if (step !== 'playing') return
    const onTilt = (event: DeviceOrientationEvent) => {
      const beta = event.beta
      if (beta === null) return
      const tilt = Math.abs(beta)
      if (tilt > 60 && tilt < 120) {
        armed.current = true
        return
      }
      if (!armed.current) return
      if (tilt >= 140) {
        armed.current = false
        onTiltAnswer(true)
      } else if (tilt <= 40) {
        armed.current = false
        onTiltAnswer(false)
      }
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [step])

  const correctCount = answers.filter((a) => a.correct).length

  if (step === 'pick') {
    return (
      <GamePage
        title="頭上猜詞"
        rule="猜的人把手機直拿貼在額頭、螢幕朝外，其他人比手畫腳或描述螢幕上的詞（不能直接說出來）。往下點頭＝答對、往上抬頭＝跳過，也可以點螢幕左右兩邊。"
      >
        <p className="game-status">選一個題庫，60 秒內猜中不到 {PASS_SCORE} 個就喝</p>
        <div className="deck-grid">
          {HEADS_UP_DECKS.map((deck, i) => (
            <button key={deck.name} className="btn" type="button" data-deck={deck.name} onClick={() => start(i)}>
              {deck.name}
            </button>
          ))}
        </div>
      </GamePage>
    )
  }

  if (step === 'done') {
    const drink = correctCount < PASS_SCORE
    return (
      <GamePage title="頭上猜詞">
        <GameResult
          id="hu-result"
          tag="★ 時間到 ★"
          text={`猜中 ${correctCount} 個`}
          note={drink ? `不到 ${PASS_SCORE} 個，猜的人喝！` : '過關！指定一個人喝'}
          loser={drink}
          actions={[
            { label: '同一個題庫再一輪', variant: 'orange', onClick: () => start() },
            { label: '換題庫', onClick: () => setStep('pick') },
          ]}
        />
        <ul className="answer-list">
          {answers.map(({ word, correct }, i) => (
            <li key={i} className={correct ? 'is-correct' : 'is-pass'}>
              {correct ? '○' : '×'} {word}
            </li>
          ))}
        </ul>
      </GamePage>
    )
  }

  return (
    <div className="heads-up">
      <div className="heads-up__bar">
        <span>{HEADS_UP_DECKS[deckIndex].name}</span>
        <span id="hu-time">{step === 'playing' ? `${left} 秒` : '準備'}</span>
        <span id="hu-score">猜中 {correctCount}</span>
      </div>
      <div
        key={flash?.id}
        className={['heads-up__word', flash && (flash.correct ? 'is-correct' : 'is-pass')].filter(Boolean).join(' ')}
        id="hu-word"
        aria-live="polite"
      >
        {step === 'countdown' ? count : words[0]}
      </div>
      <div className="heads-up__controls">
        <button className="heads-up__tap is-pass" id="hu-pass" type="button" onClick={() => answer(false)}>
          跳過
        </button>
        <button className="heads-up__tap is-correct" id="hu-correct" type="button" onClick={() => answer(true)}>
          答對
        </button>
      </div>
    </div>
  )
}
