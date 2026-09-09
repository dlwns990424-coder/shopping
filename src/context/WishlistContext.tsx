import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { safeSetItem } from '../utils/storage'
import { useAuth } from './AuthContext'

interface WishlistContextValue {
  ids: string[]
  isWishlisted: (id: string) => boolean
  toggle: (id: string) => void
  removeMany: (ids: string[]) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

// 위시리스트는 비로그인 상태에서도 쓸 수 있어서(ProductCard 하트 버튼에 로그인 가드 없음)
// 게스트용 버킷을 따로 두고, 로그인 계정은 계정별 버킷으로 스코프한다 — 그래야 같은
// 브라우저를 여러 계정이 써도 서로의 찜 목록이 안 섞인다.
const GUEST_BUCKET = 'guest'

function wishlistKey(bucket: string) {
  return `shop_wishlist:${bucket}`
}

function readWishlist(bucket: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(wishlistKey(bucket)) ?? '[]') || []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    if (authLoading) return

    if (!userId) {
      setIds(readWishlist(GUEST_BUCKET))
      return
    }

    // 로그인 시점에 비로그인 상태에서 찜해둔 상품을 계정 위시리스트로 합치고
    // 게스트 버킷은 비운다(다음 게스트에게 이전 계정의 찜 목록이 안 남게).
    const guestIds = readWishlist(GUEST_BUCKET)
    const accountIds = readWishlist(userId)
    if (guestIds.length > 0) {
      const merged = Array.from(new Set([...accountIds, ...guestIds]))
      safeSetItem(wishlistKey(userId), merged)
      safeSetItem(wishlistKey(GUEST_BUCKET), [])
      setIds(merged)
    } else {
      setIds(accountIds)
    }
  }, [userId, authLoading])

  const bucket = userId ?? GUEST_BUCKET

  const toggle = (id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      safeSetItem(wishlistKey(bucket), next)
      return next
    })
  }

  const isWishlisted = (id: string) => ids.includes(id)

  const removeMany = (removeIds: string[]) => {
    setIds((prev) => {
      const removeSet = new Set(removeIds)
      const next = prev.filter((id) => !removeSet.has(id))
      safeSetItem(wishlistKey(bucket), next)
      return next
    })
  }

  return (
    <WishlistContext.Provider value={{ ids, isWishlisted, toggle, removeMany }}>
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
