import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import OrderItemRow from '../components/OrderItemRow'
import Checkbox from '../components/Checkbox'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useOrderHistory } from '../context/OrderHistoryContext'
import type { CartItem } from '../types'

const SHIPPING_FEE = 3000

function formatPrice(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`
}

function Order() {
  const { user } = useAuth()
  const { removeItems } = useCart()
  const { addOrder } = useOrderHistory()
  const location = useLocation()
  const navigate = useNavigate()
  const items = (location.state as { items?: CartItem[] } | null)?.items

  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [items, navigate])

  if (!items || items.length === 0) {
    return null
  }

  const productTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalPrice = productTotal + SHIPPING_FEE

  const hasShippingInfo = user?.shippingName && user?.shippingPhone && user?.shippingAddress

  const handleCheckout = () => {
    addOrder(user!.email, items)
    removeItems(items.map((item) => item.id))
    navigate('/order/complete', {
      replace: true,
      state: { itemCount: items.length, totalPrice },
    })
  }

  return (
    <div>
      <div className="px-24 pb-16 pt-32 lg:px-80 lg:pb-24 lg:pt-48">
        <h1 className="text-h2">주문/결제</h1>
      </div>

      <div className="flex flex-col gap-32 px-24 pb-32 lg:flex-row lg:items-start lg:gap-64 lg:px-80 lg:pb-80">
        <div className="flex min-w-0 flex-1 flex-col gap-48">
          <div className="flex flex-col gap-16">
            <p className="text-body-lg font-bold text-primary">배송지</p>
            <div className="flex flex-col gap-6 border border-line px-20 py-16">
              {hasShippingInfo ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">{user.shippingName}</p>
                    <button
                      type="button"
                      className="cursor-pointer border-none bg-transparent text-[13px] text-secondary underline"
                      onClick={() => navigate('/mypage?tab=settings')}
                    >
                      변경
                    </button>
                  </div>
                  <p className="text-[13px] text-secondary">{user.shippingPhone}</p>
                  <p className="text-[13px] text-secondary">{user.shippingAddress}</p>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-secondary">배송지 정보를 입력해주세요.</p>
                  <button
                    type="button"
                    className="cursor-pointer border-none bg-transparent text-[13px] text-secondary underline"
                    onClick={() => navigate('/mypage?tab=settings')}
                  >
                    입력하기
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-16">
            <p className="text-body-lg font-bold text-primary">주문상품</p>
            <div>
              {items.map((item) => (
                <OrderItemRow key={item.id} item={{ ...item, price: formatPrice(item.price) }} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-20 bg-surface-muted px-24 pb-24 pt-20 lg:w-360">
          <p className="text-[15px] font-medium text-primary">결제 금액</p>
          <div className="text-body-sm flex items-center justify-between text-primary">
            <span className="text-secondary">상품금액</span>
            <span>{formatPrice(productTotal)}</span>
          </div>
          <div className="text-body-sm flex items-center justify-between text-primary">
            <span className="text-secondary">배송비</span>
            <span>{formatPrice(SHIPPING_FEE)}</span>
          </div>
          <div className="h-px bg-line" />
          <div className="flex items-center justify-between text-primary">
            <span className="text-[15px] font-medium">총 결제금액</span>
            <span className="text-price">{formatPrice(totalPrice)}</span>
          </div>
          <Checkbox
            id="order-agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            label="주문내용 확인 및 결제진행에 동의"
          />
          <Button
            variant="primary"
            size="large"
            className="w-full"
            disabled={!agreed}
            onClick={handleCheckout}
          >
            결제하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Order
