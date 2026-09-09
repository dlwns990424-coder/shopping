import type { Order } from '../types'

export function orderItemsTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// order.shippingFee가 없는 건 이 필드가 생기기 전에 저장된 주문(로컬스토리지)이라 0으로 취급한다.
export function orderTotal(order: Order) {
  return orderItemsTotal(order) + (order.shippingFee ?? 0)
}

// 반품접수는 아직 승인 전이라 매출로 유지하고, 반품완료된 건만 취소처럼 매출에서 뺀다.
export function isRevenueOrder(order: Order) {
  return order.status !== '취소' && order.status !== '반품완료'
}
