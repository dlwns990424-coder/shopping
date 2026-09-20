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
  compactTypography?: boolean
  responsive?: boolean
}

function OrderItemRow({
  item,
  onQuantityChange,
  onRemove,
  linkToProduct = false,
  compactTypography = false,
  responsive = true,
}: OrderItemRowProps) {
  const editable = Boolean(onQuantityChange && onRemove)
  const clickable = linkToProduct && Boolean(item.productId)

  const thumbnail = (
    <div
      className="h-96 w-80 shrink-0 rounded-sm bg-line bg-cover bg-center"
      style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
    />
  )
  const info = (
    <div className="flex min-w-0 flex-1 flex-col gap-8">
      <p className={`${compactTypography ? 'text-sm' : 'text-body-lg'} break-keep`}>{item.name}</p>
      <p className={`${compactTypography ? 'text-sm' : 'text-base'} break-keep text-secondary`}>{item.option}</p>
      <p className="text-price whitespace-nowrap">{item.price}</p>
    </div>
  )

  const thumbnailContent = clickable ? (
    <Link to={`/products/${item.productId}`} aria-label={`${item.name} 상품 상세보기`}>
      {thumbnail}
    </Link>
  ) : (
    thumbnail
  )

  const infoContent = clickable ? (
    <Link
      to={`/products/${item.productId}`}
      className="min-w-0 flex-1 text-inherit no-underline"
      aria-label={`${item.name} 상품 상세보기`}
    >
      {info}
    </Link>
  ) : (
    info
  )

  if (responsive) {
    return (
      <div className="grid grid-cols-[80px_minmax(0,1fr)] items-start gap-x-12 gap-y-12 py-16 md:flex md:items-center md:gap-24">
        {thumbnailContent}
        {infoContent}
        {editable ? (
          <div className="col-start-2 flex items-center justify-between gap-12 md:ml-auto md:shrink-0">
            <QuantityStepper value={item.quantity} onChange={onQuantityChange!} />
            <button
              type="button"
              className="h-24 w-24 cursor-pointer border-none bg-transparent text-lg leading-none text-secondary"
              onClick={onRemove}
              aria-label="삭제"
            >
              ×
            </button>
          </div>
        ) : (
          <span className="text-body col-start-2 text-secondary md:ml-auto md:shrink-0">{item.quantity}개</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-16 py-16 md:gap-24">
      {clickable ? (
        <Link
          to={`/products/${item.productId}`}
          className="flex min-w-0 flex-1 items-center gap-16 text-inherit no-underline md:gap-24"
        >
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
