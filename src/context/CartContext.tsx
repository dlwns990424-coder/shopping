import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'
import { safeSetItem } from '../utils/storage'
import { useAuth } from './AuthContext'
import { clampOrderQuantity } from '../constants/purchase'

interface CartContextValue {
  items: CartItem[]
  addItem: (product: Product, size: string, quantity?: number) => void
  updateItemOption: (id: string, size: string, quantity: number) => void
  removeItem: (id: string) => void
  removeItems: (ids: string[]) => void
}

const CartContext = createContext<CartContextValue | null>(null)

// 장바구니는 로그인해야만 담을 수 있어서(ProductDetail의 로그인 가드) 게스트용 버킷은 없음 —
// 계정별로만 스코프해서, 같은 브라우저를 여러 계정이 써도 서로의 장바구니가 안 섞이게 한다.
function cartKey(userId: string) {
  return `shop_cart:${userId}`
}

function readCart(userId: string): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(cartKey(userId)) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return (parsed as CartItem[]).map((item) => ({
      ...item,
      quantity: clampOrderQuantity(item.quantity),
    }))
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!userId) {
      setItems([])
      return
    }

    const nextItems = readCart(userId)
    setItems(nextItems)
    safeSetItem(cartKey(userId), nextItems)
  }, [userId, authLoading])

  const updateItems = (updater: (prev: CartItem[]) => CartItem[]) => {
    if (!userId) return
    setItems((prev) => {
      const next = updater(prev)
      safeSetItem(cartKey(userId), next)
      return next
    })
  }

  const addItem = (product: Product, size: string, quantity = 1) => {
    const id = `${product.id}-${product.color.label}-${size}`
    const option = `${product.color.label} · ${size}`
    const safeQuantity = clampOrderQuantity(quantity)

    updateItems((prev) => {
      const existing = prev.find((item) => item.id === id)
      if (existing) {
        return prev.map((item) =>
          item.id === id
            ? { ...item, size, quantity: clampOrderQuantity(item.quantity + safeQuantity) }
            : item
        )
      }
      return [
        ...prev,
        {
          id,
          productId: product.id,
          name: product.name,
          option,
          size,
          price: product.salePrice ?? product.price,
          quantity: safeQuantity,
          image: product.image,
        },
      ]
    })
  }

  const updateItemOption = (id: string, size: string, quantity: number) => {
    updateItems((prev) => {
      const current = prev.find((item) => item.id === id)
      if (!current?.productId) return prev

      const colorLabel = current.option.split(' · ')[0] || ''
      const nextId = `${current.productId}-${colorLabel}-${size}`
      const existing = prev.find((item) => item.id === nextId && item.id !== id)

      if (existing) {
        return prev
          .filter((item) => item.id !== id)
          .map((item) =>
            item.id === nextId
              ? { ...item, size, quantity: clampOrderQuantity(item.quantity + quantity) }
              : item,
          )
      }

      return prev.map((item) =>
        item.id === id
          ? { ...item, id: nextId, option: `${colorLabel} · ${size}`, size, quantity: clampOrderQuantity(quantity) }
          : item,
      )
    })
  }

  const removeItem = (id: string) => {
    updateItems((prev) => prev.filter((item) => item.id !== id))
  }

  const removeItems = (ids: string[]) => {
    updateItems((prev) => prev.filter((item) => !ids.includes(item.id)))
  }

  return (
    <CartContext.Provider value={{ items, addItem, updateItemOption, removeItem, removeItems }}>
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
