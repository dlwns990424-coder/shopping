import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Product } from '../types'
import { useWishlist } from '../context/WishlistContext'
import { formatPrice } from '../utils/formatPrice'
import Checkbox from './Checkbox'
import ConfirmModal from './ConfirmModal'

interface WishlistCardProps {
  product: Product
  selectionMode: boolean
  selected: boolean
  onToggleSelect: () => void
  onProductClick?: () => void
}

function WishlistCard({ product, selectionMode, selected, onToggleSelect, onProductClick }: WishlistCardProps) {
  const { toggle } = useWishlist()
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  const handleRemoveClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmingRemove(true)
  }

  const handleConfirmRemove = () => {
    toggle(product.id)
    setConfirmingRemove(false)
  }

  return (
    <div className="flex flex-col gap-12">
      {selectionMode && <Checkbox checked={selected} onChange={onToggleSelect} label="선택" />}

      <div className="relative">
        <Link
          to={`/products/${product.id}`}
          aria-label={`${product.name} 상품 상세보기`}
          className="block text-inherit no-underline"
          onClick={onProductClick}
        >
          <div
            className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-surface-muted bg-cover bg-center bg-no-repeat"
            style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
          />
        </Link>
        {!selectionMode && (
          <button
            type="button"
            onClick={handleRemoveClick}
            aria-label="찜 해제"
            className="absolute right-0 top-0 flex h-40 w-40 items-start justify-end border-none bg-transparent p-0 active:scale-90"
          >
            <Heart
              size={20}
              strokeWidth={1}
              color="#dc2626"
              fill="#dc2626"
              className="mr-4 mt-4"
            />
          </button>
        )}
      </div>
      <Link
        to={`/products/${product.id}`}
        className="flex flex-col gap-4 text-inherit no-underline"
        onClick={onProductClick}
      >
        <p className="text-body text-primary">{product.name}</p>
        {product.salePrice != null ? (
          <p className="flex items-center gap-8">
            <span className="text-sm font-bold text-point">{formatPrice(product.salePrice)}</span>
            <span className="text-caption text-disabled line-through">{formatPrice(product.price)}</span>
          </p>
        ) : (
          <p className="text-sm font-semibold text-primary">{formatPrice(product.price)}</p>
        )}
      </Link>

      {confirmingRemove && (
        <ConfirmModal
          message="찜 목록에서 삭제할까요?"
          confirmLabel="삭제"
          cancelLabel="취소"
          onConfirm={handleConfirmRemove}
          onCancel={() => setConfirmingRemove(false)}
        />
      )}
    </div>
  )
}

export default WishlistCard
