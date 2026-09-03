import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import CartItemRow from '../components/CartItemRow'
import Checkbox from '../components/Checkbox'
import Button from '../components/Button'
import { initialCartItems } from '../mock/cart'
import './Cart.css'

const SHIPPING_FEE = 3000

function formatPrice(amount) {
  return `₩${amount.toLocaleString('ko-KR')}`
}

function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [selectedIds, setSelectedIds] = useState(() => initialCartItems.map((item) => item.id))

  const allSelected = cartItems.length > 0 && selectedIds.length === cartItems.length

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : cartItems.map((item) => item.id))
  }

  const toggleItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    )
  }

  const changeQuantity = (id, quantity) => {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id))
  }

  const removeSelected = () => {
    setCartItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
    setSelectedIds([])
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingBag size={48} strokeWidth={1.2} className="cart-empty__icon" />
        <p className="text-h3">장바구니가 비어있습니다</p>
        <p className="text-body cart-empty__desc">마음에 드는 상품을 담아보세요</p>
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
    <div className="cart">
      <div className="cart__header">
        <h1 className="text-h2">장바구니</h1>
        <p className="text-body-sm cart__count">총 {cartItems.length}개 상품</p>
      </div>

      <div className="cart__layout">
        <div className="cart__list-column">
          <div className="cart__toolbar">
            <Checkbox
              checked={allSelected}
              onChange={toggleAll}
              label={`전체선택 (${selectedIds.length}/${cartItems.length})`}
            />
            <button
              type="button"
              className="cart__remove-selected text-body-sm"
              onClick={removeSelected}
              disabled={selectedIds.length === 0}
            >
              선택삭제
            </button>
          </div>

          <div className="cart__list">
            {cartItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={{ ...item, price: formatPrice(item.price) }}
                checked={selectedIds.includes(item.id)}
                onCheck={() => toggleItem(item.id)}
                onQuantityChange={(quantity) => changeQuantity(item.id, quantity)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        </div>

        <div className="cart__summary">
          <p className="cart__summary-title">주문 요약</p>
          <div className="cart__summary-row text-body-sm">
            <span>상품금액</span>
            <span>{formatPrice(productTotal)}</span>
          </div>
          <div className="cart__summary-row text-body-sm">
            <span>배송비</span>
            <span>{formatPrice(shippingFee)}</span>
          </div>
          <div className="cart__summary-divider" />
          <div className="cart__summary-row cart__summary-row--total">
            <span className="cart__summary-total-label">총 결제금액</span>
            <span className="text-price">{formatPrice(totalPrice)}</span>
          </div>
          <Button
            variant="primary"
            size="large"
            className="cart__checkout"
            disabled={selectedItems.length === 0}
            onClick={() => navigate('/order')}
          >
            주문하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Cart
