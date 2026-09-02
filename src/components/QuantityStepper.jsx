import './QuantityStepper.css'

function QuantityStepper({ value, onChange, min = 1, max = 99 }) {
  const decrease = () => onChange(Math.max(min, value - 1))
  const increase = () => onChange(Math.min(max, value + 1))

  return (
    <div className="quantity-stepper">
      <button
        type="button"
        onClick={decrease}
        disabled={value <= min}
        aria-label="수량 감소"
      >
        −
      </button>
      <span className="quantity-stepper__value text-body">{value}</span>
      <button
        type="button"
        onClick={increase}
        disabled={value >= max}
        aria-label="수량 증가"
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
