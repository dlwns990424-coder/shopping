import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'
import { safeSetItem } from '../utils/storage'

interface CartContextValue {
  items: CartItem[]
  addItem: (product: Product, size: string, quantity?: number) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  removeItems: (ids: string[]) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_KEY = 'shop_cart'

function parsePrice(formatted: string): number {
  return Number(formatted.replace(/[^0-9]/g, ''))
}

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') || []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart)

  const updateItems = (updater: (prev: CartItem[]) => CartItem[]) => {
    setItems((prev) => {
      const next = updater(prev)
      safeSetItem(CART_KEY, next)
      return next
    })
  }

  const addItem = (product: Product, size: string, quantity = 1) => {
    const id = `${product.id}-${product.color.label}-${size}`
    const option = `${product.color.label} · ${size}`

    updateItems((prev) => {
      const existing = prev.find((item) => item.id === id)
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [
        ...prev,
        { id, name: product.name, option, price: parsePrice(product.price), quantity, image: product.image },
      ]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    updateItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeItem = (id: string) => {
    updateItems((prev) => prev.filter((item) => item.id !== id))
  }

  const removeItems = (ids: string[]) => {
    updateItems((prev) => prev.filter((item) => !ids.includes(item.id)))
  }

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, removeItems }}>
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
