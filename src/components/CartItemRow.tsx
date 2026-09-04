import Checkbox from './Checkbox'
import QuantityStepper from './QuantityStepper'

interface CartItemRowItem {
  name: string
  option: string
  price: string
  quantity: number
  image?: string | null
}

interface CartItemRowProps {
  item: CartItemRowItem
  checked: boolean
  onCheck: () => void
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

function CartItemRow({ item, checked, onCheck, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <div className="flex flex-col gap-16 border-b border-line py-24 md:flex-row md:items-center md:gap-24">
      <div className="flex gap-16 md:contents">
        <Checkbox checked={checked} onChange={onCheck} />
        <div
          className="h-120 w-100 shrink-0 rounded-sm bg-line bg-cover bg-center"
          style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
        />
        <div className="flex flex-1 flex-col gap-8">
          <p className="text-body-lg">{item.name}</p>
          <p className="text-body-sm text-secondary">{item.option}</p>
          <p className="text-price">{item.price}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pl-136 md:contents md:pl-0">
        <QuantityStepper value={item.quantity} onChange={onQuantityChange} />
        <button
          type="button"
          className="h-24 w-24 cursor-pointer border-none bg-transparent text-lg leading-none text-secondary"
          onClick={onRemove}
          aria-label="삭제"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default CartItemRow
