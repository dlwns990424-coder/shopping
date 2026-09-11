import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import type { Order } from '../types'
import Button from './Button'
import ConfirmModal from './ConfirmModal'
import OrderItemRow from './OrderItemRow'
import ReturnRequestModal from './ReturnRequestModal'
import { useAuth } from '../context/AuthContext'
import { useOrderHistory } from '../context/OrderHistoryContext'
import { formatPrice } from '../utils/formatPrice'
import {
  CANCELABLE_SHIPPING_STATUSES,
  RETURN_WINDOW_DAYS,
  isReturnWindowOpen,
  orderItemsTotal,
  orderTotal,
} from '../utils/orderStats'

// 배송 완료된 지난 주문보다 "지금 내가 결제한 게 어떻게 되고 있는지"가 더 궁금하다는
// 피드백으로, 날짜순 대신 진행 상태 우선순위로 정렬한다(같은 순위 안에서는 최신순 유지).
// 반품요청/반품접수는 배송 상태가 뭐든(배송완료로 고정) 아직 처리 중인 관심사라 최우선.
function priorityOf(order: Order): number {
  if (order.returnStatus === '반품요청') return 0
  if (order.returnStatus === '반품접수') return 1
  if (order.shippingStatus === '결제완료') return 2
  if (order.shippingStatus === '배송준비') return 3
  if (order.shippingStatus === '배송중') return 4
  if (order.shippingStatus === '배송완료') return 5
  if (order.returnStatus === '반품완료') return 6
  return 7 // 취소
}

function OrderHistory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { orders, loading, error, updateShippingStatuses, requestReturn } = useOrderHistory()
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [returnTargetId, setReturnTargetId] = useState<string | null>(null)
  const myOrders = orders
    .filter((order) => order.userEmail === user?.email)
    .slice()
    .sort((a, b) => priorityOf(a) - priorityOf(b))

  const openCancelModal = (id: string) => {
    setCancelError(null)
    setCancelTargetId(id)
  }

  const closeCancelModal = () => {
    setCancelTargetId(null)
    setCancelError(null)
  }

  const confirmCancel = async () => {
    if (!cancelTargetId) return
    setCancelling(true)
    setCancelError(null)
    const success = await updateShippingStatuses([cancelTargetId], '취소')
    setCancelling(false)
    if (!success) {
      setCancelError('주문 취소에 실패했습니다. 잠시 후 다시 시도해주세요.')
      return
    }
    setCancelTargetId(null)
  }

  const submitReturn = async (reason: string, detail: string, photos: string[]) => {
    if (!returnTargetId) return false
    const success = await requestReturn(returnTargetId, reason, detail, photos)
    if (success) setReturnTargetId(null)
    return success
  }

  if (loading) {
    return <p className="text-body-sm text-secondary">불러오는 중...</p>
  }

  if (error && myOrders.length === 0) {
    return <p className="text-body-sm text-point">{error}</p>
  }

  if (myOrders.length === 0) {
    return (
      <div className="flex min-h-320 flex-col items-center justify-center gap-16 px-20 py-64 text-center">
        <ShoppingBag size={48} strokeWidth={1.2} className="text-disabled" />
        <p className="text-h3">아직 주문한 상품이 없습니다</p>
        <p className="text-body text-secondary">마음에 드는 상품을 만나보세요</p>
        <Button variant="primary" size="large" onClick={() => navigate('/')}>
          쇼핑하러 가기
        </Button>
      </div>
    )
  }

  return (
    <div className="flex max-w-640 flex-col gap-16">
      {myOrders.map((order) => (
        <div key={order.id} className="rounded-sm border border-line px-24 py-16">
          <div className="text-body-sm flex justify-between border-b border-line pb-16 text-secondary">
            <span>{order.date}</span>
            <span className="text-primary">
              {order.shippingStatus}
              {order.returnStatus && ` · ${order.returnStatus}`}
            </span>
          </div>
          <div className="text-body-sm flex flex-col gap-2 border-b border-line py-16 text-secondary">
            <p>
              {order.shippingName} · {order.shippingPhone}
            </p>
            <p>
              {order.shippingAddress} {order.shippingAddressDetail}
            </p>
            {order.deliveryRequest && <p>배송 요청: {order.deliveryRequest}</p>}
          </div>
          {order.items.map((item, index) => (
            <div key={`${order.id}-${index}`} className="[&:not(:last-of-type)]:border-b [&:not(:last-of-type)]:border-line">
              <OrderItemRow item={{ ...item, price: formatPrice(item.price) }} linkToProduct />
            </div>
          ))}
          <div className="flex flex-col gap-4 pt-16">
            <div className="text-body-sm flex items-center justify-between text-secondary">
              <span>상품금액</span>
              <span>{formatPrice(orderItemsTotal(order))}</span>
            </div>
            <div className="text-body-sm flex items-center justify-between text-secondary">
              <span>배송비</span>
              <span>{formatPrice(order.shippingFee ?? 0)}</span>
            </div>
            <div className="flex items-baseline justify-between pt-4">
              <span className="text-body-sm text-secondary">총 결제금액</span>
              <span className="text-price">{formatPrice(orderTotal(order))}</span>
            </div>
          </div>
          {order.returnStatus && (
            <div className="text-body-sm mt-16 flex flex-col gap-8 rounded-sm bg-surface-muted p-12 text-secondary">
              <p>
                반품 사유: <span className="text-primary">{order.returnReason}</span>
              </p>
              {order.returnDetail && <p>{order.returnDetail}</p>}
              {order.returnPhotos && order.returnPhotos.length > 0 && (
                <div className="flex flex-wrap gap-8">
                  {order.returnPhotos.map((url) => (
                    <img key={url} src={url} alt="반품 사진" className="h-56 w-56 rounded-sm object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}
          {CANCELABLE_SHIPPING_STATUSES.has(order.shippingStatus) && (
            <Button
              size="small"
              variant="secondary"
              className="mt-16"
              onClick={() => openCancelModal(order.id)}
            >
              주문취소
            </Button>
          )}
          {order.shippingStatus === '배송완료' &&
            !order.returnStatus &&
            (isReturnWindowOpen(order) ? (
              <Button
                size="small"
                variant="secondary"
                className="mt-16"
                onClick={() => setReturnTargetId(order.id)}
              >
                반품 신청
              </Button>
            ) : (
              <div className="mt-16 flex flex-col items-start gap-4">
                <Button size="small" variant="secondary" disabled>
                  반품 신청
                </Button>
                <p className="text-caption text-secondary">
                  반품 가능 기간({RETURN_WINDOW_DAYS}일)이 지났습니다.
                </p>
              </div>
            ))}
        </div>
      ))}

      {cancelTargetId && (
        <ConfirmModal
          message="이 주문을 취소하시겠어요?"
          confirmLabel="주문취소"
          cancelLabel="닫기"
          confirming={cancelling}
          error={cancelError}
          onConfirm={confirmCancel}
          onCancel={closeCancelModal}
        />
      )}

      {returnTargetId && <ReturnRequestModal onCancel={() => setReturnTargetId(null)} onSubmit={submitReturn} />}
    </div>
  )
}

export default OrderHistory
