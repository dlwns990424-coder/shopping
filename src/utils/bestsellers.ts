import type { Order, Product } from '../types'
import { isRevenueOrder } from './orderStats'

export interface ProductStat {
  productId: string | null
  name: string
  quantity: number
  revenue: number
}

// 상품명이 아니라 productId 기준으로 집계 — 상품명을 나중에 바꾸거나 상품을 지워도
// 과거 매출이 이름 기준으로 쪼개지지 않고 하나로 유지된다. productId가 없는(예전) 주문만
// 이름으로 폴백한다.
export function computeProductStats(orders: Order[], products: Product[]): Map<string, ProductStat> {
  const productById = new Map(products.map((product) => [product.id, product]))
  const stats = new Map<string, ProductStat>()
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.productId ?? `name:${item.name}`
      const product = item.productId ? productById.get(item.productId) : undefined
      const displayName = product?.name ?? item.name

      const stat = stats.get(key) ?? { productId: item.productId ?? null, name: displayName, quantity: 0, revenue: 0 }
      stat.name = displayName
      stat.quantity += item.quantity
      stat.revenue += item.price * item.quantity
      stats.set(key, stat)
    }
  }
  return stats
}

export interface BestsellerEntry {
  productId: string
  quantity: number
}

// 최근 sinceDate(YYYY-MM-DD) 이후 주문(취소/반품완료 제외) 기준 판매수량 TOP N.
// productId가 없는(구주문) 항목은 상품 자체를 특정할 수 없어 랭킹에서 제외한다.
export function computeBestsellers(
  orders: Order[],
  products: Product[],
  sinceDate: string,
  limit = 20,
): BestsellerEntry[] {
  const recentOrders = orders.filter((order) => order.date >= sinceDate && isRevenueOrder(order))
  const stats = computeProductStats(recentOrders, products)
  return [...stats.values()]
    .filter((stat): stat is ProductStat & { productId: string } => stat.productId != null)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
    .map((stat) => ({ productId: stat.productId, quantity: stat.quantity }))
}
