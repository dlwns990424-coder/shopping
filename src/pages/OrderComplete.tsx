import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CheckCircle } from 'lucide-react'
import Button from '../components/Button'
import OrderItemRow from '../components/OrderItemRow'
import type { CartItem } from '../types'
import { formatPrice } from '../utils/formatPrice'

interface OrderCompleteState {
  orderId?: string
  itemCount?: number
  totalPrice?: number
  items?: CartItem[]
  shippingName?: string
  shippingAddress?: string
  shippingAddressDetail?: string
}

function OrderComplete() {
  const location = useLocation()
  const navigate = useNavigate()
  const { orderId, itemCount, totalPrice, items, shippingName, shippingAddress, shippingAddressDetail } =
    (location.state as OrderCompleteState | null) || {}

  useEffect(() => {
    if (itemCount === undefined || totalPrice === undefined) {
      navigate('/', { replace: true })
    }
  }, [itemCount, totalPrice, navigate])

  if (itemCount === undefined || totalPrice === undefined) {
    return null
  }

  return (
    <div className="page-section flex flex-col items-center gap-32 text-center">
      <Helmet>
        <title>NOVERA | 주문완료</title>
      </Helmet>

      <div className="flex flex-col items-center gap-16">
        <CheckCircle size={48} strokeWidth={1.2} className="text-point" />
        <p className="text-h3">주문이 완료되었습니다</p>
        {orderId && <p className="text-body-sm text-secondary">주문번호 {orderId}</p>}
      </div>

      {items && items.length > 0 && (
        <div className="w-full max-w-480 divide-y divide-line text-left">
          {items.map((item) => (
            <OrderItemRow key={item.id} item={{ ...item, price: formatPrice(item.price) }} />
          ))}
        </div>
      )}

      {shippingName && shippingAddress && (
        <div className="w-full max-w-480 rounded-sm bg-surface-muted px-20 py-16 text-left">
          <p className="text-body-sm mb-4 font-medium text-primary">배송지</p>
          <p className="text-body-sm text-secondary">{shippingName}</p>
          <p className="text-body-sm text-secondary">
            {shippingAddress} {shippingAddressDetail}
          </p>
        </div>
      )}

      <p className="text-body text-secondary">
        상품 {itemCount}개 · 총 결제금액 <span className="text-price">{formatPrice(totalPrice)}</span>
      </p>

      <div className="flex gap-12">
        <Button variant="secondary" size="large" onClick={() => navigate('/')}>
          쇼핑 계속하기
        </Button>
        <Button variant="primary" size="large" onClick={() => navigate('/mypage?tab=orders')}>
          주문내역 보기
        </Button>
      </div>
    </div>
  )
}

export default OrderComplete
