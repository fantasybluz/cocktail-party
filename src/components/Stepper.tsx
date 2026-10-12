import { clamp } from '../lib/random.ts'
import { sound } from '../lib/sound.ts'

interface Props {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

// － 數字 ＋ 的加減器
export function Stepper({ id, label, value, min, max, onChange }: Props) {
  const change = (step: number) => {
    sound.unlock()
    sound.blip(true)
    onChange(clamp(value + step, min, max))
  }

  return (
    <div className="stepper" id={id}>
      <span className="stepper__label">{label}</span>
      <button
        className="btn"
        type="button"
        data-step="-1"
        aria-label={`減少${label}`}
        disabled={value <= min}
        onClick={() => change(-1)}
      >
        －
      </button>
      <span className="stepper__value" aria-live="polite">
        {value}
      </span>
      <button
        className="btn"
        type="button"
        data-step="1"
        aria-label={`增加${label}`}
        disabled={value >= max}
        onClick={() => change(1)}
      >
        ＋
      </button>
    </div>
  )
}
