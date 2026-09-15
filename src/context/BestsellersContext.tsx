import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

interface BestsellersContextValue {
  // rank 순으로 정렬된 productId 목록. 관리자가 "베스트 갱신"을 누른 시점의 스냅샷이라
  // 실시간 판매량과는 다를 수 있다(의도된 동작).
  bestsellerProductIds: string[]
  loading: boolean
}

const BestsellersContext = createContext<BestsellersContextValue | null>(null)

export function BestsellersProvider({ children }: { children: ReactNode }) {
  const [bestsellerProductIds, setBestsellerProductIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('bestseller_snapshot')
      .select('product_id')
      .order('rank', { ascending: true })
      .then(({ data }) => {
        setBestsellerProductIds((data ?? []).map((row) => row.product_id as string))
        setLoading(false)
      })
  }, [])

  return (
    <BestsellersContext.Provider value={{ bestsellerProductIds, loading }}>{children}</BestsellersContext.Provider>
  )
}

export function useBestsellers() {
  const context = useContext(BestsellersContext)
  if (!context) {
    throw new Error('useBestsellers must be used within a BestsellersProvider')
  }
  return context
}
