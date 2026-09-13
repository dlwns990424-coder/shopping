import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import type { Review } from '../types'

interface AddReviewInput {
  productId: string
  rating: number
  content: string
  photos: string[]
}

interface ReviewsContextValue {
  reviews: Review[]
  loading: boolean
  addReview: (input: AddReviewInput) => Promise<{ success: boolean; message?: string }>
  deleteReview: (id: string) => Promise<boolean>
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null)

interface ReviewRow {
  id: string
  product_id: string
  user_id: string
  nickname: string
  rating: number
  content: string
  photos: string[]
  created_at: string
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    nickname: row.nickname,
    rating: row.rating,
    content: row.content,
    photos: row.photos ?? [],
    createdAt: row.created_at,
  }
}

// 상품 상세페이지는 비로그인 방문자도 보므로, 로그인 여부와 무관하게 항상 전체를 불러온다
// (읽기 RLS가 전체 공개라 anon key로도 조회 가능).
export function ReviewsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (!error) setReviews((data ?? []).map(toReview))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addReview = async ({ productId, rating, content, photos }: AddReviewInput) => {
    if (!user) return { success: false, message: '로그인이 필요합니다.' }

    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: user.id,
      nickname: user.nickname,
      rating,
      content,
      photos,
    })
    if (error) {
      // unique(user_id, product_id) 위반 = 이미 리뷰를 작성함, RLS 위반 = 구매(배송완료) 이력 없음
      if (error.code === '23505') {
        return { success: false, message: '이미 이 상품에 리뷰를 작성하셨습니다.' }
      }
      return { success: false, message: '구매(배송완료)한 상품만 리뷰를 작성할 수 있습니다.' }
    }
    await load()
    return { success: true }
  }

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) return false
    setReviews((prev) => prev.filter((review) => review.id !== id))
    return true
  }

  return (
    <ReviewsContext.Provider value={{ reviews, loading, addReview, deleteReview }}>
      {children}
    </ReviewsContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewsContext)
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider')
  }
  return context
}
