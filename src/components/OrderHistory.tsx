import { useState } from 'react'
import type { OrderStatus } from '../types'
import Button from './Button'
import ConfirmModal from './ConfirmModal'
import OrderItemRow from './OrderItemRow'
import { useAuth } from '../context/AuthContext'
import { useOrderHistory } from '../context/OrderHistoryContext'
import { formatPrice } from '../utils/formatPrice'
import { orderItemsTotal, orderTotal } from '../utils/orderStats'

// 배송 완료된 지난 주문보다 "지금 내가 결제한 게 어떻게 되고 있는지"가 더 궁금하다는
// 피드백으로, 날짜순 대신 진행 상태 우선순위로 정렬한다(같은 상태 안에서는 최신순 유지).
const STATUS_PRIORITY: Record<OrderStatus, number> = {
  결제완료: 0,
  배송준비: 1,
  배송중: 2,
  배송완료: 3,
  취소: 4,
}

function OrderHistory() {
  const { user } = useAuth()
  const { orders, updateOrderStatuses } = useOrderHistory()
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)
  const myOrders = orders
    .filter((order) => order.userEmail === user?.email)
    .slice()
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status])

  const confirmCancel = () => {
    if (!cancelTargetId) return
    updateOrderStatuses([cancelTargetId], '취소')
    setCancelTargetId(null)
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
    </div>
  )
}

export default OrderHistory
