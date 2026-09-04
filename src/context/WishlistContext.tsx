import { createContext, useContext, useState, type ReactNode } from 'react'

interface WishlistContextValue {
  ids: string[]
  isWishlisted: (id: string) => boolean
  toggle: (id: string) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

const WISHLIST_KEY = 'shop_wishlist'

function readWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]') || []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(readWishlist)

  const toggle = (id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
      return next
    })
  }

  const isWishlisted = (id: string) => ids.includes(id)

  return (
    <WishlistContext.Provider value={{ ids, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
