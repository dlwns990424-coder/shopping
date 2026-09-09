import type { Order } from '../types'

export function orderItemsTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// order.shippingFee가 없는 건 이 필드가 생기기 전에 저장된 주문(로컬스토리지)이라 0으로 취급한다.
export function orderTotal(order: Order) {
  return orderItemsTotal(order) + (order.shippingFee ?? 0)
}

// 반품요청/반품접수는 아직 최종 처리 전이라 매출로 유지하고, 반품완료된 건만 취소처럼 매출에서 뺀다.
export function isRevenueOrder(order: Order) {
  return order.shippingStatus !== '취소' && order.returnStatus !== '반품완료'
}

export const RETURN_WINDOW_DAYS = 7

// deliveredAt이 없는 주문(이 필드가 생기기 전에 배송완료된 건)은 언제 배송됐는지 알 수 없으니
// 기간 제한 없이 반품 가능한 것으로 취급한다.
export function isReturnWindowOpen(order: Order) {
  if (!order.deliveredAt) return true
  const elapsedMs = Date.now() - new Date(order.deliveredAt).getTime()
  return elapsedMs <= RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000
}
