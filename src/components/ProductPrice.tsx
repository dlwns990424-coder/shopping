import { formatPrice } from '../utils/formatPrice'

interface ProductPriceProps {
  price: number
  salePrice?: number | null
  reserveCardHeight?: boolean
  className?: string
}

function ProductPrice({ price, salePrice, reserveCardHeight = false, className = '' }: ProductPriceProps) {
  if (salePrice != null) {
    return (
      <p
        className={`flex flex-wrap content-start items-baseline gap-x-8 gap-y-2 ${
          reserveCardHeight ? 'min-h-36 sm:min-h-0' : ''
        } ${className}`}
      >
        <span className="whitespace-nowrap text-sm font-bold text-point">{formatPrice(salePrice)}</span>
        <span className="whitespace-nowrap text-caption text-disabled line-through">{formatPrice(price)}</span>
      </p>
    )
  }

  return (
    <p
      className={`whitespace-nowrap text-sm font-semibold text-primary ${
        reserveCardHeight ? 'min-h-36 sm:min-h-0' : ''
      } ${className}`}
    >
      {formatPrice(price)}
    </p>
  )
}

export default ProductPrice
