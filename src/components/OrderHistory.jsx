import OrderItemRow from './OrderItemRow'
import { orders } from '../mock/orders'
import './OrderHistory.css'

function formatPrice(amount) {
  return `₩${amount.toLocaleString('ko-KR')}`
}

function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function OrderHistory() {
  if (orders.length === 0) {
    return <p className="text-body-sm">주문 내역이 없습니다.</p>
  }

  return (
    <div className="order-history">
      {orders.map((order) => (
        <div key={order.id} className="order-history__order">
          <div className="order-history__header text-body-sm">
            <span>{order.date}</span>
            <span className="order-history__status">{order.status}</span>
          </div>
          {order.items.map((item, index) => (
            <OrderItemRow key={`${order.id}-${index}`} item={{ ...item, price: formatPrice(item.price) }} />
          ))}
          <div className="order-history__total text-body-sm">
            총 결제금액 <span className="text-price">{formatPrice(orderTotal(order))}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrderHistory
