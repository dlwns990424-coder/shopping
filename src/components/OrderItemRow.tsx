import { Link } from 'react-router-dom'
import QuantityStepper from './QuantityStepper'

interface OrderItemRowItem {
  name: string
  option: string
  price: string
  quantity: number
  image?: string | null
  productId?: string
}

interface OrderItemRowProps {
  item: OrderItemRowItem
  onQuantityChange?: (quantity: number) => void
  onRemove?: () => void
  linkToProduct?: boolean
}

function OrderItemRow({ item, onQuantityChange, onRemove, linkToProduct = false }: OrderItemRowProps) {
  const editable = Boolean(onQuantityChange && onRemove)
  const clickable = linkToProduct && Boolean(item.productId)

  const thumbnail = (
    <div
      className="h-96 w-80 shrink-0 rounded-sm bg-line bg-cover bg-center"
      style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
    />
  )
  const info = (
    <div className="flex flex-1 flex-col gap-8">
      <p className="text-body-lg">{item.name}</p>
      <p className="text-body-sm text-secondary">{item.option}</p>
      <p className="text-price">{item.price}</p>
    </div>
  )

  return (
    <div className="flex items-center gap-24 py-16">
      {clickable ? (
        <Link to={`/products/${item.productId}`} className="flex flex-1 items-center gap-24 text-inherit no-underline">
          {thumbnail}
          {info}
        </Link>
      ) : (
        <>
          {thumbnail}
          {info}
        </>
      )}
      {editable ? (
        <>
          <QuantityStepper value={item.quantity} onChange={onQuantityChange!} />
          <button
            type="button"
            className="h-24 w-24 cursor-pointer border-none bg-transparent text-lg leading-none text-secondary"
            onClick={onRemove}
            aria-label="삭제"
          >
            ×
          </button>
        </>
      ) : (
        <span className="text-body text-secondary">{item.quantity}개</span>
      )}
    </div>
  )
}

export default OrderItemRow
