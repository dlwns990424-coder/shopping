import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Heart } from 'lucide-react'
import type { Product } from '../types'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/formatPrice'
import Button from './Button'
import Checkbox from './Checkbox'

interface WishlistCardProps {
  product: Product
  selected: boolean
  onToggleSelect: () => void
  size: string
  onSizeChange: (size: string) => void
  onAdded: () => void
}

function WishlistCard({ product, selected, onToggleSelect, size, onSizeChange, onAdded }: WishlistCardProps) {
  const { toggle } = useWishlist()
  const { addItem } = useCart()

  const handleRemove = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
  }

  const handleAdd = () => {
    if (!size) return
    addItem(product, size)
    onAdded()
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="relative">
        <div className="absolute left-8 top-8 z-10 rounded-sm bg-surface/92 p-4">
          <Checkbox checked={selected} onChange={onToggleSelect} aria-label={`${product.name} 선택`} />
        </div>

        <Link to={`/products/${product.id}`} className="group block text-inherit no-underline">
          <div
            className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-surface-muted bg-cover bg-center bg-no-repeat"
            style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
          >
            <button
              type="button"
              onClick={handleRemove}
              aria-label="찜 해제"
              className="absolute right-8 top-8 flex h-32 w-32 items-center justify-center border-none bg-transparent p-0 text-primary lg:right-12 lg:top-12 lg:h-40 lg:w-40"
            >
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-surface/92 lg:h-40 lg:w-40">
                <Heart size={16} strokeWidth={1.5} fill="currentColor" />
              </span>
            </button>
          </div>
          <div className="mt-12 flex flex-col gap-4">
            <p className="text-body text-primary">{product.name}</p>
            {product.salePrice != null ? (
              <p className="flex items-center gap-8">
                <span className="text-caption text-disabled line-through">{formatPrice(product.price)}</span>
                <span className="text-sm font-semibold text-point">{formatPrice(product.salePrice)}</span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-primary">{formatPrice(product.price)}</p>
            )}
          </div>
        </Link>
      </div>

      <div className="flex gap-8">
        <div className="relative flex-1">
          <select
            value={size}
            onChange={(e) => onSizeChange(e.target.value)}
            className="text-body-sm h-36 w-full appearance-none rounded-sm border border-line pl-12 pr-28"
          >
            <option value="">사이즈</option>
            {product.sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-secondary"
          />
        </div>
        <Button size="small" variant="secondary" className="shrink-0" onClick={handleAdd} disabled={!size}>
          담기
        </Button>
      </div>
    </div>
  )
}

export default WishlistCard
