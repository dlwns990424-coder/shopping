import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import type { Review } from '../types'
import {
  MAX_REVIEW_HEIGHT,
  MAX_REVIEW_LENGTH,
  MAX_REVIEW_WEIGHT,
  MIN_REVIEW_HEIGHT,
  MIN_REVIEW_WEIGHT,
} from '../constants/reviewConstraints'

interface AddReviewInput {
  productId: string
  rating: number
  content: string
  photos: string[]
  purchasedOption: string | null
  height: number | null
  weight: number | null
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
  purchased_option: string | null
  height: number | null
  weight: number | null
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
    purchasedOption: row.purchased_option ?? null,
    height: row.height ?? null,
    weight: row.weight ?? null,
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

  const addReview = async ({ productId, rating, content, photos, purchasedOption, height, weight }: AddReviewInput) => {
    if (!user) return { success: false, message: '로그인이 필요합니다.' }
    const trimmedContent = content.trim()
    if (!trimmedContent) return { success: false, message: '리뷰 내용을 입력해주세요.' }
    if (trimmedContent.length > MAX_REVIEW_LENGTH) {
      return { success: false, message: `리뷰는 최대 ${MAX_REVIEW_LENGTH}자까지 작성할 수 있습니다.` }
    }
    if (
      height != null &&
      (!Number.isFinite(height) || height < MIN_REVIEW_HEIGHT || height > MAX_REVIEW_HEIGHT)
    ) {
      return {
        success: false,
        message: `키는 ${MIN_REVIEW_HEIGHT}~${MAX_REVIEW_HEIGHT}cm 범위로 입력해주세요.`,
      }
    }
    if (
      weight != null &&
      (!Number.isFinite(weight) || weight < MIN_REVIEW_WEIGHT || weight > MAX_REVIEW_WEIGHT)
    ) {
      return {
        success: false,
        message: `몸무게는 ${MIN_REVIEW_WEIGHT}~${MAX_REVIEW_WEIGHT}kg 범위로 입력해주세요.`,
      }
    }

    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: user.id,
      nickname: user.nickname,
      rating,
      content: trimmedContent,
      photos,
      purchased_option: purchasedOption,
      height,
      weight,
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
    // count를 안 받으면 RLS에 막혀 0행이 지워져도 error가 없어서 "성공"으로 오판한다.
    const { error, count } = await supabase.from('reviews').delete({ count: 'exact' }).eq('id', id)
    if (error || !count) return false
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
