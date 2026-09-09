import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CartItem, Order, OrderStatus } from '../types'
import { safeSetItem } from '../utils/storage'

type OrderShippingInfo = Pick<
  Order,
  'shippingName' | 'shippingPhone' | 'shippingAddress' | 'shippingAddressDetail' | 'deliveryRequest'
>

interface OrderHistoryContextValue {
  orders: Order[]
  addOrder: (userEmail: string, items: CartItem[], shippingFee: number, shipping: OrderShippingInfo) => void
  updateOrderStatuses: (orderIds: string[], status: OrderStatus) => void
}

const OrderHistoryContext = createContext<OrderHistoryContextValue | null>(null)

const ORDERS_KEY = 'shop_orders'

function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]') || []
  } catch {
    return []
  }
}

export function OrderHistoryProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(readOrders)

  const addOrder = (userEmail: string, items: CartItem[], shippingFee: number, shipping: OrderShippingInfo) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      status: '결제완료',
      userEmail,
      items,
      shippingFee,
      ...shipping,
    }
    setOrders((prev) => {
      const next = [newOrder, ...prev]
      safeSetItem(ORDERS_KEY, next)
      return next
    })
  }

  const updateOrderStatuses = (orderIds: string[], status: OrderStatus) => {
    setOrders((prev) => {
      const idSet = new Set(orderIds)
      const next = prev.map((order) => (idSet.has(order.id) ? { ...order, status } : order))
      safeSetItem(ORDERS_KEY, next)
      return next
    })
  }

  return (
    <OrderHistoryContext.Provider value={{ orders, addOrder, updateOrderStatuses }}>
      {children}
    </OrderHistoryContext.Provider>
  )
}

export function useOrderHistory() {
  const context = useContext(OrderHistoryContext)
  if (!context) {
    throw new Error('useOrderHistory must be used within an OrderHistoryProvider')
  }
  return context
}
