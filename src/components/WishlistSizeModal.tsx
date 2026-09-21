import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Product } from '../types'
import Button from './Button'
import { useModalA11y } from '../hooks/useModalA11y'

interface WishlistSizeModalProps {
  product: Product
  onConfirm: (size: string) => void
  onCancel: () => void
}

function WishlistSizeModal({ product, onConfirm, onCancel }: WishlistSizeModalProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useModalA11y(dialogRef, onCancel, true, closeButtonRef)

  return (
    <div
      className="fixed inset-0 z-modal flex items-end overflow-y-auto bg-black/50 lg:items-center lg:justify-center lg:px-24 lg:py-24"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`wishlist-size-title-${product.id}`}
        className="flex max-h-[calc(100dvh-var(--safe-area-top)-var(--safe-area-bottom))] w-full flex-col overflow-hidden animate-[bottom-sheet-in_0.25s_ease-out_forwards] rounded-t-lg bg-surface shadow-lg lg:max-w-[440px] lg:animate-none lg:rounded-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-16 border-b border-line px-20 py-16 md:px-24">
          <div className="min-w-0">
            <h2 id={`wishlist-size-title-${product.id}`} className="text-h3 text-primary">
              사이즈 선택
            </h2>
            <p className="mt-4 truncate text-body-sm text-secondary">{product.name}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="사이즈 선택 닫기"
            className="flex h-44 w-44 shrink-0 items-center justify-center border-none bg-transparent text-primary"
            onClick={onCancel}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="overflow-y-auto p-20 md:p-24">
          {product.sizes.length > 0 ? (
            <div className="grid grid-cols-3 gap-8" role="group" aria-label="사이즈">
              {product.sizes.map((size) => {
                const selected = selectedSize === size
                return (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={selected}
                    className={`h-44 rounded-sm border text-sm transition-colors ${
                      selected
                        ? 'border-primary bg-primary text-surface'
                        : 'border-line bg-surface text-primary hover:border-primary'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-body-sm text-secondary">현재 선택 가능한 사이즈가 없습니다.</p>
          )}
        </div>

        <div className="shrink-0 border-t border-line px-20 pb-[calc(20px+var(--safe-area-bottom))] pt-12 md:px-24 lg:pb-24">
          <Button
            variant="primary"
            size="large"
            className="h-44 w-full !py-0"
            disabled={!selectedSize}
            onClick={() => onConfirm(selectedSize)}
          >
            장바구니 담기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default WishlistSizeModal
