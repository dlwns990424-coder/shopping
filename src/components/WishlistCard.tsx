import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Product } from '../types'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { formatPrice } from '../utils/formatPrice'
import Button from './Button'
import Checkbox from './Checkbox'
import ConfirmModal from './ConfirmModal'
import WishlistSizeModal from './WishlistSizeModal'

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
  const [selectingSize, setSelectingSize] = useState(false)
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

  const handleOpenSize = () => {
    if (!user) {
      openLoginModal()
      return
    }
    setSelectingSize(true)
  }

  const handleAdd = (size: string) => {
    addItem(product, size)
    setSelectingSize(false)
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
            <span className="flex h-24 w-24 items-center justify-center drop-shadow-[0_0_2px_rgba(255,255,255,0.9)] lg:h-40 lg:w-40">
              <Heart size={16} strokeWidth={1.5} color="#dc2626" fill="#dc2626" />
            </span>
          </button>
        </div>
        <div className="mt-12 flex flex-col gap-4">
          <p className="text-body text-primary">{product.name}</p>
          {product.salePrice != null ? (
            <p className="flex items-center gap-8">
              <span className="text-sm font-bold text-point">{formatPrice(product.salePrice)}</span>
              <span className="text-caption text-disabled line-through">{formatPrice(product.price)}</span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-primary">{formatPrice(product.price)}</p>
          )}
        </div>
      </Link>

      <Button size="large" variant="secondary" className="h-44 w-full !py-0" onClick={handleOpenSize}>
        장바구니 담기
      </Button>

      {selectingSize && (
        <WishlistSizeModal
          product={product}
          onConfirm={handleAdd}
          onCancel={() => setSelectingSize(false)}
        />
      )}

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
