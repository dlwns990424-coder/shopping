import { Link } from 'react-router-dom'
import Checkbox from './Checkbox'

interface CartItemRowItem {
  productId?: string
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
  onOptionChange: () => void
  onRemove: () => void
}

function CartItemRow({ item, checked, onCheck, onOptionChange, onRemove }: CartItemRowProps) {
  const thumbnail = (
    <div
      className="h-120 w-100 rounded-sm bg-line bg-cover bg-center"
      style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
    />
  )
  const info = (
    <div className="flex min-w-0 flex-1 flex-col gap-8">
      <p className="text-body-lg text-primary">{item.name}</p>
      <p className="text-body-sm text-secondary">{item.option}</p>
      <p className="text-body-sm text-secondary">수량 {item.quantity}개</p>
      <p className="text-price text-primary">{item.price}</p>
    </div>
  )

  return (
    <div className="flex items-start gap-12 border-b border-line py-24 md:gap-16">
      <Checkbox checked={checked} onChange={onCheck} className="shrink-0" />

      <div className="flex w-100 shrink-0 flex-col gap-16">
        {item.productId ? (
          <Link to={`/products/${item.productId}`} aria-label={`${item.name} 상품 상세보기`}>
            {thumbnail}
          </Link>
        ) : (
          thumbnail
        )}
        <button
          type="button"
          className="h-32 w-full cursor-pointer rounded-sm border border-line bg-surface text-[13px] text-primary transition-colors hover:border-primary disabled:cursor-default disabled:text-disabled"
          onClick={onOptionChange}
          disabled={!item.productId}
        >
          옵션변경
        </button>
      </div>

      {item.productId ? (
        <Link
          to={`/products/${item.productId}`}
          className="min-w-0 flex-1 text-inherit no-underline"
          aria-label={`${item.name} 상품 상세보기`}
        >
          {info}
        </Link>
      ) : (
        info
      )}

      <button
        type="button"
        className="flex h-24 w-24 shrink-0 cursor-pointer items-start justify-center border-none bg-transparent text-lg leading-none text-secondary"
        onClick={onRemove}
        aria-label="삭제"
      >
        ×
      </button>
    </div>
  )
}

export default CartItemRow
