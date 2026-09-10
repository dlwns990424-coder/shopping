import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { safeSetItem } from '../utils/storage'
import { useAuth } from './AuthContext'

const MAX_RECENT_SEARCHES = 8

interface RecentSearchContextValue {
  terms: string[]
  addTerm: (term: string) => void
  removeTerm: (term: string) => void
  clearAll: () => void
}

const RecentSearchContext = createContext<RecentSearchContextValue | null>(null)

// 검색어도 위시리스트와 동일하게 게스트 버킷+계정별 버킷으로 나눠서, 같은 브라우저를
// 여러 계정이 써도 서로의 검색 기록이 안 섞이게 한다.
const GUEST_BUCKET = 'guest'

function searchKey(bucket: string) {
  return `shop_recent_search:${bucket}`
}

function readTerms(bucket: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(searchKey(bucket)) ?? '[]') || []
  } catch {
    return []
  }
}

export function RecentSearchProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id
  const [terms, setTerms] = useState<string[]>([])

  useEffect(() => {
    if (authLoading) return

    if (!userId) {
      setTerms(readTerms(GUEST_BUCKET))
      return
    }

    // 로그인 시점에 비로그인 상태에서 검색한 기록을 계정 기록과 합치고
    // 게스트 버킷은 비운다(다음 게스트에게 이전 계정의 검색어가 안 남게).
    const guestTerms = readTerms(GUEST_BUCKET)
    const accountTerms = readTerms(userId)
    if (guestTerms.length > 0) {
      const merged = Array.from(new Set([...guestTerms, ...accountTerms])).slice(0, MAX_RECENT_SEARCHES)
      safeSetItem(searchKey(userId), merged)
      safeSetItem(searchKey(GUEST_BUCKET), [])
      setTerms(merged)
    } else {
      setTerms(accountTerms)
    }
  }, [userId, authLoading])

  const bucket = userId ?? GUEST_BUCKET

  const addTerm = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setTerms((prev) => {
      const next = [trimmed, ...prev.filter((t) => t !== trimmed)].slice(0, MAX_RECENT_SEARCHES)
      safeSetItem(searchKey(bucket), next)
      return next
    })
  }

  const removeTerm = (term: string) => {
    setTerms((prev) => {
      const next = prev.filter((t) => t !== term)
      safeSetItem(searchKey(bucket), next)
      return next
    })
  }

  const clearAll = () => {
    setTerms([])
    safeSetItem(searchKey(bucket), [])
  }

  return (
    <RecentSearchContext.Provider value={{ terms, addTerm, removeTerm, clearAll }}>
      {children}
    </RecentSearchContext.Provider>
  )
}

export function useRecentSearch() {
  const context = useContext(RecentSearchContext)
  if (!context) {
    throw new Error('useRecentSearch must be used within a RecentSearchProvider')
  }
  return context
}
