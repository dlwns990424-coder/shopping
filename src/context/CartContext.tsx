import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { clampOrderQuantity } from '../constants/purchase'

interface CartContextValue {
  items: CartItem[]
  loading: boolean
  addItem: (product: Product, size: string, quantity?: number) => void
  updateItemOption: (id: string, size: string, quantity: number) => void
  removeItem: (id: string) => void
  removeItems: (ids: string[]) => void
}

const CartContext = createContext<CartContextValue | null>(null)

interface CartRow {
  id: string
  product_id: string
  name: string
  option: string
  size: string
  price: number
  quantity: number
  image: string | null
}

function toCartItem(row: CartRow): CartItem {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    option: row.option,
    size: row.size,
    price: row.price,
    quantity: clampOrderQuantity(row.quantity),
    image: row.image,
  }
}

// 예전 localStorage 장바구니(계정별 키)가 남아있으면 최초 로드 시 한 번만 Supabase로
// 옮긴다 — 이 함수는 Supabase 쪽 장바구니가 비어있을 때만 호출된다.
function legacyCartKey(userId: string) {
  return `shop_cart:${userId}`
}

async function migrateLegacyCart(userId: string): Promise<CartRow[] | null> {
  const key = legacyCartKey(userId)
  let legacy: CartItem[]
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]')
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    legacy = parsed as CartItem[]
  } catch {
    return null
  }

  const rows: CartRow[] = legacy.map((item) => ({
    id: item.id,
    product_id: item.productId ?? '',
    name: item.name,
    option: item.option,
    size: item.size ?? '',
    price: item.price,
    quantity: clampOrderQuantity(item.quantity),
    image: item.image,
  }))

  const { error } = await supabase.from('cart_items').insert(rows.map((row) => ({ ...row, user_id: userId })))
  if (error) {
    console.error('예전 장바구니를 옮기지 못했습니다.', error)
    return null
  }
  localStorage.removeItem(key)
  return rows
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id
  const [items, setItems] = useState<CartItem[]>([])
  // authLoading은 InitialAuthLoading이 이미 걸러준 뒤라 CartProvider가 마운트될 땐 항상 false다.
  // 그래서 별도로 "아직 서버에서 읽어오기 전"인지를 나타내는 초기화 플래그를 둔다.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const load = async () => {
      const { data, error } = await supabase.from('cart_items').select('*').eq('user_id', userId)
      if (cancelled) return

      if (error) {
        console.error('장바구니를 불러오지 못했습니다.', error)
        setItems([])
        setLoading(false)
        return
      }

      if ((data ?? []).length === 0) {
        const migrated = await migrateLegacyCart(userId)
        if (cancelled) return
        if (migrated) {
          setItems(migrated.map(toCartItem))
          setLoading(false)
          return
        }
      }

      setItems((data ?? []).map(toCartItem))
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId, authLoading])

  const addItem = (product: Product, size: string, quantity = 1) => {
    if (!userId) return
    const id = `${product.id}-${product.color.label}-${size}`
    const option = `${product.color.label} · ${size}`
    const safeQuantity = clampOrderQuantity(quantity)

    setItems((prev) => {
      const existing = prev.find((item) => item.id === id)

      if (existing) {
        const nextQuantity = clampOrderQuantity(existing.quantity + safeQuantity)
        supabase
          .from('cart_items')
          .update({ quantity: nextQuantity })
          .eq('user_id', userId)
          .eq('id', id)
          .then(({ error }) => error && console.error('장바구니 수량 변경에 실패했습니다.', error))
        return prev.map((item) => (item.id === id ? { ...item, size, quantity: nextQuantity } : item))
      }

      const newItem: CartItem = {
        id,
        productId: product.id,
        name: product.name,
        option,
        size,
        price: product.salePrice ?? product.price,
        quantity: safeQuantity,
        image: product.image,
      }
      supabase
        .from('cart_items')
        .insert({
          id,
          user_id: userId,
          product_id: newItem.productId,
          name: newItem.name,
          option: newItem.option,
          size: newItem.size,
          price: newItem.price,
          quantity: newItem.quantity,
          image: newItem.image,
        })
        .then(({ error }) => error && console.error('장바구니 담기에 실패했습니다.', error))
      return [...prev, newItem]
    })
  }

  const updateItemOption = (id: string, size: string, quantity: number) => {
    if (!userId) return
    const safeQuantity = clampOrderQuantity(quantity)

    setItems((prev) => {
      const current = prev.find((item) => item.id === id)
      if (!current?.productId) return prev

      const colorLabel = current.option.split(' · ')[0] || ''
      const nextId = `${current.productId}-${colorLabel}-${size}`
      const existing = prev.find((item) => item.id === nextId && item.id !== id)

      if (existing) {
        const mergedQuantity = clampOrderQuantity(existing.quantity + safeQuantity)
        supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('id', id)
          .then(({ error }) => error && console.error('장바구니 옵션 변경에 실패했습니다.', error))
        supabase
          .from('cart_items')
          .update({ quantity: mergedQuantity })
          .eq('user_id', userId)
          .eq('id', nextId)
          .then(({ error }) => error && console.error('장바구니 옵션 변경에 실패했습니다.', error))
        return prev
          .filter((item) => item.id !== id)
          .map((item) => (item.id === nextId ? { ...item, size, quantity: mergedQuantity } : item))
      }

      supabase
        .from('cart_items')
        .update({ id: nextId, size, option: `${colorLabel} · ${size}`, quantity: safeQuantity })
        .eq('user_id', userId)
        .eq('id', id)
        .then(({ error }) => error && console.error('장바구니 옵션 변경에 실패했습니다.', error))

      return prev.map((item) =>
        item.id === id
          ? { ...item, id: nextId, option: `${colorLabel} · ${size}`, size, quantity: safeQuantity }
          : item,
      )
    })
  }

  const removeItem = (id: string) => {
    if (!userId) return
    setItems((prev) => prev.filter((item) => item.id !== id))
    supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('id', id)
      .then(({ error }) => error && console.error('장바구니 삭제에 실패했습니다.', error))
  }

  const removeItems = (ids: string[]) => {
    if (!userId) return
    setItems((prev) => prev.filter((item) => !ids.includes(item.id)))
    supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .in('id', ids)
      .then(({ error }) => error && console.error('장바구니 삭제에 실패했습니다.', error))
  }

  return (
    <CartContext.Provider
      value={{ items, loading, addItem, updateItemOption, removeItem, removeItems }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
