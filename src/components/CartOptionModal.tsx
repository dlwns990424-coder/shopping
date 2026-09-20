import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Button from './Button'
import QuantityStepper from './QuantityStepper'
import { formatPrice } from '../utils/formatPrice'
import type { CartItem, Product } from '../types'
import { MAX_ORDER_QUANTITY } from '../constants/purchase'

interface CartOptionModalProps {
  item: CartItem
  product: Product
  unitPrice: number
  onConfirm: (size: string, quantity: number) => void
  onCancel: () => void
}

function getSavedSize(item: CartItem) {
  return item.size ?? item.option.split(' · ').pop() ?? ''
}

function CartOptionModal({ item, product, unitPrice, onConfirm, onCancel }: CartOptionModalProps) {
  const initialSize = useMemo(() => {
    const savedSize = getSavedSize(item)
    return product.sizes.includes(savedSize) ? savedSize : product.sizes[0] ?? ''
  }, [item, product.sizes])
  const [selectedSize, setSelectedSize] = useState(initialSize)
  const [quantity, setQuantity] = useState(item.quantity)
  const selectRef = useRef<HTMLSelectElement | null>(null)
  const hasChanges = selectedSize !== initialSize || quantity !== item.quantity

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    selectRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-modal flex items-end bg-black/50 md:items-center md:justify-center md:px-24"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-option-title"
        className="flex max-h-[calc(100dvh-16px-env(safe-area-inset-top))] w-full flex-col overflow-hidden rounded-t-lg bg-surface pb-[env(safe-area-inset-bottom)] shadow-lg animate-[bottom-sheet-in_0.25s_ease-out_forwards] md:max-h-[calc(100dvh-48px)] md:max-w-[480px] md:animate-none md:rounded-lg md:pb-0"
      >
        <h2 id="cart-option-title" className="sr-only">
          옵션 변경
        </h2>

        <div className="min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-16 p-20 md:p-24">
          <div className="relative">
            <select
              ref={selectRef}
              value={selectedSize}
              onChange={(event) => setSelectedSize(event.target.value)}
              className="h-48 w-full appearance-none rounded-sm border border-line bg-surface px-12 pr-40 text-sm text-primary outline-none focus:border-primary"
              aria-label="사이즈 선택"
            >
              {product.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-secondary"
            />
          </div>

          <div className="flex items-center justify-between rounded-sm bg-surface-muted px-16 py-16">
            <QuantityStepper value={quantity} onChange={setQuantity} max={MAX_ORDER_QUANTITY} />
            <p className="text-price font-semibold text-primary">{formatPrice(unitPrice * quantity)}</p>
          </div>
          <p className="text-caption text-secondary">동일 상품·사이즈는 최대 {MAX_ORDER_QUANTITY}개까지 가능합니다.</p>
        </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-8 border-t border-line p-20 pt-12 md:p-24 md:pt-12">
          <Button variant="secondary" size="large" className="h-44 w-full !py-0" onClick={onCancel}>
            취소
          </Button>
          <Button
            variant="primary"
            size="large"
            className="h-44 w-full !py-0"
            disabled={!hasChanges || !selectedSize}
            onClick={() => onConfirm(selectedSize, quantity)}
          >
            변경하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CartOptionModal
