import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import type { CartItem, Order, ReturnStatus, ShippingStatus } from '../types'

type OrderShippingInfo = Pick<
  Order,
  'shippingName' | 'shippingPhone' | 'shippingAddress' | 'shippingAddressDetail' | 'deliveryRequest'
>

interface OrderHistoryContextValue {
  orders: Order[]
  loading: boolean
  error: string | null
  addOrder: (
    userEmail: string,
    items: CartItem[],
    shippingFee: number,
    shipping: OrderShippingInfo,
  ) => Promise<string | null>
  updateShippingStatuses: (orderIds: string[], status: ShippingStatus) => Promise<boolean>
  updateReturnStatus: (orderId: string, status: ReturnStatus) => Promise<boolean>
  requestReturn: (orderId: string, reason: string, detail: string, photos: string[]) => Promise<boolean>
}

const OrderHistoryContext = createContext<OrderHistoryContextValue | null>(null)

interface OrderRow {
  id: string
  user_email: string
  date: string
  shipping_status: ShippingStatus
  return_status: ReturnStatus | null
  items: CartItem[]
  shipping_fee: number
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_address_detail: string | null
  delivery_request: string | null
  delivered_at: string | null
  return_reason: string | null
  return_detail: string | null
  return_photos: string[] | null
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    date: row.date,
    shippingStatus: row.shipping_status,
    returnStatus: row.return_status ?? undefined,
    userEmail: row.user_email,
    items: row.items,
    shippingFee: row.shipping_fee,
    shippingName: row.shipping_name,
    shippingPhone: row.shipping_phone,
    shippingAddress: row.shipping_address,
    shippingAddressDetail: row.shipping_address_detail ?? undefined,
    deliveryRequest: row.delivery_request ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    returnReason: row.return_reason ?? undefined,
    returnDetail: row.return_detail ?? undefined,
    returnPhotos: row.return_photos ?? undefined,
  }
}

export function OrderHistoryProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // RLS가 일반 사용자는 본인 것만, 관리자는 전체를 돌려주므로 쿼리는 이 한 줄로 공용
  const load = useCallback(async () => {
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setOrders((data ?? []).map(toOrder))
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    load()
  }, [authLoading, load])

  const addOrder = async (
    userEmail: string,
    items: CartItem[],
    shippingFee: number,
    shipping: OrderShippingInfo,
  ): Promise<string | null> => {
    if (!user) {
      setError('로그인이 필요합니다.')
      return null
    }
    setError(null)
    const id = `ORD-${Date.now()}`
    const { error } = await supabase.from('orders').insert({
      id,
      user_id: user.id,
      user_email: userEmail,
      shipping_status: '결제완료',
      items,
      shipping_fee: shippingFee,
      shipping_name: shipping.shippingName,
      shipping_phone: shipping.shippingPhone,
      shipping_address: shipping.shippingAddress,
      shipping_address_detail: shipping.shippingAddressDetail ?? null,
      delivery_request: shipping.deliveryRequest ?? null,
    })
    if (error) {
      setError(error.message)
      return null
    }
    await load()
    return id
  }

  const updateShippingStatuses = async (orderIds: string[], status: ShippingStatus): Promise<boolean> => {
    setError(null)
    const payload: Record<string, unknown> = { shipping_status: status }
    if (status === '배송완료') payload.delivered_at = new Date().toISOString()
    const { error } = await supabase.from('orders').update(payload).in('id', orderIds)
    if (error) {
      setError(error.message)
      return false
    }
    await load()
    return true
  }

  const updateReturnStatus = async (orderId: string, status: ReturnStatus): Promise<boolean> => {
    setError(null)
    const { error } = await supabase.from('orders').update({ return_status: status }).eq('id', orderId)
    if (error) {
      setError(error.message)
      return false
    }
    await load()
    return true
  }

  const requestReturn = async (
    orderId: string,
    reason: string,
    detail: string,
    photos: string[],
  ): Promise<boolean> => {
    setError(null)
    const { error } = await supabase
      .from('orders')
      .update({ return_status: '반품요청', return_reason: reason, return_detail: detail, return_photos: photos })
      .eq('id', orderId)
    if (error) {
      setError(error.message)
      return false
    }
    await load()
    return true
  }

  return (
    <OrderHistoryContext.Provider
      value={{ orders, loading, error, addOrder, updateShippingStatuses, updateReturnStatus, requestReturn }}
    >
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
