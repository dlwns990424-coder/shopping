import { useState } from 'react'
import type { OrderStatus } from '../types'
import Button from './Button'
import ConfirmModal from './ConfirmModal'
import OrderItemRow from './OrderItemRow'
import ReturnRequestModal from './ReturnRequestModal'
import { useAuth } from '../context/AuthContext'
import { useOrderHistory } from '../context/OrderHistoryContext'
import { formatPrice } from '../utils/formatPrice'
import { RETURN_WINDOW_DAYS, isReturnWindowOpen, orderItemsTotal, orderTotal } from '../utils/orderStats'

// 배송 완료된 지난 주문보다 "지금 내가 결제한 게 어떻게 되고 있는지"가 더 궁금하다는
// 피드백으로, 날짜순 대신 진행 상태 우선순위로 정렬한다(같은 상태 안에서는 최신순 유지).
// 반품요청/반품접수는 아직 처리 중인 관심사라 배송완료보다 앞에 둔다.
const STATUS_PRIORITY: Record<OrderStatus, number> = {
  결제완료: 0,
  배송준비: 1,
  배송중: 2,
  반품요청: 3,
  반품접수: 4,
  배송완료: 5,
  반품완료: 6,
  취소: 7,
}

function OrderHistory() {
  const { user } = useAuth()
  const { orders, updateOrderStatuses, requestReturn } = useOrderHistory()
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)
  const [returnTargetId, setReturnTargetId] = useState<string | null>(null)
  const myOrders = orders
    .filter((order) => order.userEmail === user?.email)
    .slice()
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status])

  const confirmCancel = () => {
    if (!cancelTargetId) return
    updateOrderStatuses([cancelTargetId], '취소')
    setCancelTargetId(null)
  }

  const submitReturn = (reason: string, detail: string, photos: string[]) => {
    if (!returnTargetId) return
    requestReturn(returnTargetId, reason, detail, photos)
    setReturnTargetId(null)
  }

  if (myOrders.length === 0) {
    return <p className="text-body-sm">주문 내역이 없습니다.</p>
  }

  return (
    <div className="flex max-w-640 flex-col gap-16">
      {myOrders.map((order) => (
        <div key={order.id} className="rounded-sm border border-line px-24 py-16">
          <div className="text-body-sm flex justify-between border-b border-line pb-16 text-secondary">
            <span>{order.date}</span>
            <span className="text-primary">{order.status}</span>
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
              <OrderItemRow item={{ ...item, price: formatPrice(item.price) }} />
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
          {(order.status === '반품요청' || order.status === '반품접수' || order.status === '반품완료') && (
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
          {order.status === '결제완료' && (
            <Button
              size="small"
              variant="secondary"
              className="mt-16"
              onClick={() => setCancelTargetId(order.id)}
            >
              주문취소
            </Button>
          )}
          {order.status === '배송완료' &&
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
          onConfirm={confirmCancel}
          onCancel={() => setCancelTargetId(null)}
        />
      )}

      {returnTargetId && <ReturnRequestModal onCancel={() => setReturnTargetId(null)} onSubmit={submitReturn} />}
    </div>
  )
}

export default OrderHistory
