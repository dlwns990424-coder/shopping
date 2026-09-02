import Checkbox from './Checkbox'
import QuantityStepper from './QuantityStepper'
import './CartItemRow.css'

function CartItemRow({ item, checked, onCheck, onQuantityChange, onRemove }) {
  return (
    <div className="cart-item-row">
      <Checkbox checked={checked} onChange={onCheck} />
      <div
        className="cart-item-row__thumbnail"
        style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
      />
      <div className="cart-item-row__info">
        <p className="cart-item-row__name text-body-lg">{item.name}</p>
        <p className="cart-item-row__option text-body-sm">{item.option}</p>
        <p className="cart-item-row__price text-price">{item.price}</p>
      </div>
      <QuantityStepper value={item.quantity} onChange={onQuantityChange} />
      <button
        type="button"
        className="cart-item-row__remove"
        onClick={onRemove}
        aria-label="삭제"
      >
        ×
      </button>
    </div>
  )
}

export default CartItemRow
