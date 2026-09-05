import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CartItem, Order } from '../types'

type OrderShippingInfo = Pick<
  Order,
  'shippingName' | 'shippingPhone' | 'shippingAddress' | 'shippingAddressDetail' | 'deliveryRequest'
>

interface OrderHistoryContextValue {
  orders: Order[]
  addOrder: (userEmail: string, items: CartItem[], shipping: OrderShippingInfo) => void
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

  const addOrder = (userEmail: string, items: CartItem[], shipping: OrderShippingInfo) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      status: '결제완료',
      userEmail,
      items,
      ...shipping,
    }
    setOrders((prev) => {
      const next = [newOrder, ...prev]
      localStorage.setItem(ORDERS_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <OrderHistoryContext.Provider value={{ orders, addOrder }}>
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
