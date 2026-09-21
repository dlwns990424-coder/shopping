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
}

function WishlistCard({ product, selectionMode, selected, onToggleSelect }: WishlistCardProps) {
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
        >
          <div
            className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-surface-muted bg-cover bg-center bg-no-repeat"
            style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
          />
        </Link>
        <button
          type="button"
          onClick={handleRemoveClick}
          aria-label="찜 해제"
          className="absolute right-8 top-8 flex h-32 w-32 items-center justify-center border-none bg-transparent p-0 text-primary active:scale-90 lg:right-12 lg:top-12 lg:h-40 lg:w-40"
        >
          <span className="flex h-24 w-24 items-center justify-center lg:h-40 lg:w-40">
            <Heart size={20} strokeWidth={1} color="#dc2626" fill="#dc2626" />
          </span>
        </button>
      </div>
      <Link to={`/products/${product.id}`} className="flex flex-col gap-4 text-inherit no-underline">
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
