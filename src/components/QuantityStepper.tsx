import { useEffect, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from 'react'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

const BUTTON_CLASSES =
  'h-32 w-32 border-none bg-surface text-base text-primary cursor-pointer disabled:cursor-default disabled:text-disabled'

function QuantityStepper({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  const [text, setText] = useState(String(value))

  // 부모가 value를 바꾸면(상품 변경 시 초기화 등) 입력창도 같이 맞춘다.
  useEffect(() => {
    setText(String(value))
  }, [value])

  const decrease = () => onChange(Math.max(min, value - 1))
  const increase = () => onChange(Math.min(max, value + 1))

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value.replace(/[^0-9]/g, ''))
  }

  const commit = () => {
    const parsed = parseInt(text, 10)
    const next = Number.isNaN(parsed) ? min : Math.min(max, Math.max(min, parsed))
    setText(String(next))
    if (next !== value) onChange(next)
  }

  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => commit()

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit()
      e.currentTarget.blur()
    }
  }

  return (
    <div className="inline-flex items-center overflow-hidden rounded-sm border border-line">
      <button type="button" className={BUTTON_CLASSES} onClick={decrease} disabled={value <= min} aria-label="수량 감소">
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-label="수량 입력"
        className="text-body w-32 border-none bg-transparent p-0 text-center text-primary outline-none"
      />
      <button type="button" className={BUTTON_CLASSES} onClick={increase} disabled={value >= max} aria-label="수량 증가">
        +
      </button>
    </div>
  )
}

export default QuantityStepper
