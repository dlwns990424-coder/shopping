import OrderItemRow from './OrderItemRow'
import { useAuth } from '../context/AuthContext'
import { useOrderHistory } from '../context/OrderHistoryContext'
import type { Order } from '../types'
import { formatPrice } from '../utils/formatPrice'

function orderTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function OrderHistory() {
  const { user } = useAuth()
  const { orders } = useOrderHistory()
  const myOrders = orders.filter((order) => order.userEmail === user?.email)

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
          <div className="text-body-sm flex items-baseline justify-end gap-8 pt-16 text-secondary">
            총 결제금액 <span className="text-price">{formatPrice(orderTotal(order))}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrderHistory
