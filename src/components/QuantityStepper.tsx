interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

const BUTTON_CLASSES =
  'h-32 w-32 border-none bg-surface text-base text-primary cursor-pointer disabled:cursor-default disabled:text-disabled'

function QuantityStepper({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  const decrease = () => onChange(Math.max(min, value - 1))
  const increase = () => onChange(Math.min(max, value + 1))

  return (
    <div className="inline-flex items-center overflow-hidden rounded-sm border border-line">
      <button type="button" className={BUTTON_CLASSES} onClick={decrease} disabled={value <= min} aria-label="수량 감소">
        −
      </button>
      <span className="text-body w-32 text-center">{value}</span>
      <button type="button" className={BUTTON_CLASSES} onClick={increase} disabled={value >= max} aria-label="수량 증가">
        +
      </button>
    </div>
  )
}

export default QuantityStepper
