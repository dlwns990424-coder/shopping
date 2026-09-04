import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import Button from '../components/Button'

function formatPrice(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`
}

function OrderComplete() {
  const location = useLocation()
  const navigate = useNavigate()
  const { itemCount, totalPrice } = (location.state as { itemCount?: number; totalPrice?: number } | null) || {}

  useEffect(() => {
    if (itemCount === undefined || totalPrice === undefined) {
      navigate('/', { replace: true })
    }
  }, [itemCount, totalPrice, navigate])

  if (itemCount === undefined || totalPrice === undefined) {
    return null
  }

  return (
    <div className="flex min-h-480 flex-col items-center justify-center gap-16 px-24 py-64 text-center lg:min-h-640">
      <CheckCircle size={48} strokeWidth={1.2} className="text-point" />
      <p className="text-h3">주문이 완료되었습니다</p>
      <p className="text-body text-secondary">
        상품 {itemCount}개 · 총 결제금액 <span className="text-price">{formatPrice(totalPrice)}</span>
      </p>
      <div className="mt-8 flex gap-12">
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
