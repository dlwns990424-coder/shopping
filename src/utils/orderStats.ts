import type { Order } from '../types'

export function orderTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function isRevenueOrder(order: Order) {
  return order.status !== '취소'
}
