import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import CartItemRow from '../components/CartItemRow'
import Checkbox from '../components/Checkbox'
import Button from '../components/Button'
import { useCart } from '../context/CartContext'
import { SHIPPING_FEE } from '../constants'

function formatPrice(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`
}

function Cart() {
  const navigate = useNavigate()
  const { items: cartItems, updateQuantity, removeItem, removeItems } = useCart()
  const [selectedIds, setSelectedIds] = useState(() => cartItems.map((item) => item.id))
  const [expanded, setExpanded] = useState(false)

  const allSelected = cartItems.length > 0 && selectedIds.length === cartItems.length

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : cartItems.map((item) => item.id))
  }

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    )
  }

  const handleRemove = (id: string) => {
    removeItem(id)
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id))
  }

  const handleRemoveSelected = () => {
    removeItems(selectedIds)
    setSelectedIds([])
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-560 flex-col items-center justify-center gap-16 px-24 py-64 text-center">
        <ShoppingBag size={48} strokeWidth={1.2} className="text-disabled" />
        <p className="text-h3">장바구니가 비어있습니다</p>
        <p className="text-body text-secondary">마음에 드는 상품을 담아보세요</p>
        <Button variant="primary" size="large" onClick={() => navigate('/')}>
          쇼핑하러 가기
        </Button>
      </div>
    )
  }

  const selectedItems = cartItems.filter((item) => selectedIds.includes(item.id))
  const productTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = selectedItems.length > 0 ? SHIPPING_FEE : 0
  const totalPrice = productTotal + shippingFee

  return (
    <div>
      <div className="flex flex-col gap-4 px-24 pb-16 pt-32 lg:px-80 lg:pb-24 lg:pt-48">
        <h1 className="text-h2">장바구니</h1>
        <p className="text-body-sm text-secondary">총 {cartItems.length}개 상품</p>
      </div>

      <div className="flex flex-col gap-32 px-24 pb-32 lg:flex-row lg:items-start lg:gap-64 lg:px-80 lg:pb-80">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between pb-16">
            <Checkbox
              checked={allSelected}
              onChange={toggleAll}
              label={`전체선택 (${selectedIds.length}/${cartItems.length})`}
            />
            <button
              type="button"
              className="text-body-sm cursor-pointer border-none bg-transparent text-secondary disabled:cursor-not-allowed disabled:text-disabled"
              onClick={handleRemoveSelected}
              disabled={selectedIds.length === 0}
            >
              선택삭제
            </button>
          </div>

          <div className={!expanded && cartItems.length > 5 ? 'max-h-840 overflow-hidden' : undefined}>
            {cartItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={{ ...item, price: formatPrice(item.price) }}
                checked={selectedIds.includes(item.id)}
                onCheck={() => toggleItem(item.id)}
                onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </div>

          {cartItems.length > 5 && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-body-sm mt-16 w-full cursor-pointer border-none bg-transparent py-8 text-center text-secondary hover:text-primary"
            >
              더보기
            </button>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-20 bg-surface-muted px-24 pb-24 pt-20 lg:sticky lg:top-96 lg:w-360">
          <p className="text-[15px] font-medium text-primary">주문 요약</p>
          <div className="text-body-sm flex items-center justify-between text-primary">
            <span className="text-secondary">상품금액</span>
            <span>{formatPrice(productTotal)}</span>
          </div>
          <div className="text-body-sm flex items-center justify-between text-primary">
            <span className="text-secondary">배송비</span>
            <span>{formatPrice(shippingFee)}</span>
          </div>
          <div className="h-px bg-line" />
          <div className="flex items-center justify-between text-primary">
            <span className="text-[15px] font-medium">총 결제금액</span>
            <span className="text-price">{formatPrice(totalPrice)}</span>
          </div>
          <Button
            variant="primary"
            size="large"
            className="w-full"
            disabled={selectedItems.length === 0}
            onClick={() => navigate('/order', { state: { items: selectedItems } })}
          >
            주문하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Cart
