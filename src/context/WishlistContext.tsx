import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { safeSetItem } from '../utils/storage'
import { useAuth } from './AuthContext'

interface WishlistContextValue {
  ids: string[]
  loading: boolean
  isWishlisted: (id: string) => boolean
  toggle: (id: string) => void
  removeMany: (ids: string[]) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

// 위시리스트는 비로그인 상태에서도 쓸 수 있어서(ProductCard 하트 버튼에 로그인 가드 없음)
// 게스트는 계속 localStorage에 두고, 로그인 계정만 Supabase(wishlist_items)로 옮긴다.
const GUEST_BUCKET = 'guest'

function guestWishlistKey(bucket: string) {
  return `shop_wishlist:${bucket}`
}

function readLocalWishlist(bucket: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(guestWishlistKey(bucket)) ?? '[]') || []
  } catch {
    return []
  }
}

// 이전 버전은 로그인 계정도 localStorage(`shop_wishlist:{userId}`)에 저장했다. 계정으로
// 로그인했을 때 그 잔재 + 게스트 버킷을 한 번에 Supabase로 합치고 둘 다 비운다.
async function migrateLocalWishlistToAccount(userId: string, existingIds: string[]): Promise<string[]> {
  const guestIds = readLocalWishlist(GUEST_BUCKET)
  const legacyAccountIds = readLocalWishlist(userId)
  const localIds = Array.from(new Set([...guestIds, ...legacyAccountIds]))
  const missingIds = localIds.filter((id) => !existingIds.includes(id))

  if (missingIds.length > 0) {
    const { error } = await supabase
      .from('wishlist_items')
      .insert(missingIds.map((productId) => ({ product_id: productId, user_id: userId })))
    if (error) {
      console.error('예전 위시리스트를 옮기지 못했습니다.', error)
      return existingIds
    }
  }

  if (guestIds.length > 0) safeSetItem(guestWishlistKey(GUEST_BUCKET), [])
  if (legacyAccountIds.length > 0) safeSetItem(guestWishlistKey(userId), [])

  return Array.from(new Set([...existingIds, ...localIds]))
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id
  const [ids, setIds] = useState<string[]>([])
  // authLoading은 InitialAuthLoading이 이미 걸러준 뒤라 WishlistProvider가 마운트될 땐 항상 false다.
  // 그래서 별도로 "아직 초기 로드 전"인지를 나타내는 초기화 플래그를 둔다.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!userId) {
      setIds(readLocalWishlist(GUEST_BUCKET))
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const load = async () => {
      const { data, error } = await supabase.from('wishlist_items').select('product_id').eq('user_id', userId)
      if (cancelled) return

      if (error) {
        console.error('위시리스트를 불러오지 못했습니다.', error)
        setIds([])
        setLoading(false)
        return
      }

      const existingIds = (data ?? []).map((row) => row.product_id as string)
      const merged = await migrateLocalWishlistToAccount(userId, existingIds)
      if (cancelled) return
      setIds(merged)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId, authLoading])

  const toggle = (id: string) => {
    if (!userId) {
      setIds((prev) => {
        const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        safeSetItem(guestWishlistKey(GUEST_BUCKET), next)
        return next
      })
      return
    }

    setIds((prev) => {
      const wishlisted = prev.includes(id)
      if (wishlisted) {
        supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', id)
          .then(({ error }) => error && console.error('찜 해제에 실패했습니다.', error))
        return prev.filter((item) => item !== id)
      }

      supabase
        .from('wishlist_items')
        .insert({ user_id: userId, product_id: id })
        .then(({ error }) => error && console.error('찜하기에 실패했습니다.', error))
      return [...prev, id]
    })
  }

  const isWishlisted = (id: string) => ids.includes(id)

  const removeMany = (removeIds: string[]) => {
    if (!userId) {
      setIds((prev) => {
        const removeSet = new Set(removeIds)
        const next = prev.filter((id) => !removeSet.has(id))
        safeSetItem(guestWishlistKey(GUEST_BUCKET), next)
        return next
      })
      return
    }

    setIds((prev) => {
      const removeSet = new Set(removeIds)
      const next = prev.filter((id) => !removeSet.has(id))
      supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .in('product_id', removeIds)
        .then(({ error }) => error && console.error('찜 목록 삭제에 실패했습니다.', error))
      return next
    })
  }

  return (
    <WishlistContext.Provider value={{ ids, loading, isWishlisted, toggle, removeMany }}>
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
