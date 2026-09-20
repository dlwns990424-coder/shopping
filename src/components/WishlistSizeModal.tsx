import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Product } from '../types'
import Button from './Button'

interface WishlistSizeModalProps {
  product: Product
  onConfirm: (size: string) => void
  onCancel: () => void
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function WishlistSizeModal({ product, onConfirm, onCancel }: WishlistSizeModalProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
        return
      }

      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.getClientRects().length > 0,
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && (activeElement === first || !dialog.contains(activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (activeElement === last || !dialog.contains(activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-modal flex items-end bg-black/50 lg:items-center lg:justify-center lg:px-24"
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
        className="w-full animate-[bottom-sheet-in_0.25s_ease-out_forwards] rounded-t-lg bg-surface shadow-lg lg:max-w-[440px] lg:animate-none lg:rounded-lg"
      >
        <div className="flex items-start justify-between gap-16 border-b border-line px-20 py-16 md:px-24">
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

        <div className="p-20 md:p-24">
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
        </div>

        <div className="border-t border-line px-20 pb-[calc(20px+var(--safe-area-bottom))] pt-12 md:px-24 lg:pb-24">
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
