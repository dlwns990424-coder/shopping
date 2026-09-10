import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Heart } from 'lucide-react'
import type { Product } from '../types'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { formatPrice } from '../utils/formatPrice'
import Button from './Button'
import Checkbox from './Checkbox'
import ConfirmModal from './ConfirmModal'

interface WishlistCardProps {
  product: Product
  selectionMode: boolean
  selected: boolean
  onToggleSelect: () => void
  onAdded: () => void
}

function WishlistCard({ product, selectionMode, selected, onToggleSelect, onAdded }: WishlistCardProps) {
  const { toggle } = useWishlist()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { openLoginModal } = useAuthModal()
  const [size, setSize] = useState('')
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

  const handleAdd = () => {
    if (!size) return
    if (!user) {
      openLoginModal()
      return
    }
    addItem(product, size)
    onAdded()
  }

  return (
    <div className="flex flex-col gap-8">
      {selectionMode && <Checkbox checked={selected} onChange={onToggleSelect} label="선택" />}

      <Link to={`/products/${product.id}`} className="group block text-inherit no-underline">
        <div
          className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-surface-muted bg-cover bg-center bg-no-repeat"
          style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
        >
          <button
            type="button"
            onClick={handleRemoveClick}
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

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="relative w-full lg:w-72 lg:shrink-0">
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="text-body-sm h-36 w-full appearance-none rounded-sm border border-line pl-12 pr-24"
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
            className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-secondary"
          />
        </div>
        <Button size="small" variant="secondary" className="w-full lg:flex-1" onClick={handleAdd} disabled={!size}>
          장바구니 담기
        </Button>
      </div>

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
