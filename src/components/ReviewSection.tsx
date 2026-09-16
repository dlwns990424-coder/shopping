import { useEffect, useState } from 'react'
import { ChevronDown, Star, X } from 'lucide-react'
import StarRating from './StarRating'
import Button from './Button'
import ReviewFormModal from './ReviewFormModal'
import ConfirmModal from './ConfirmModal'
import Toast from './Toast'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useOrderHistory } from '../context/OrderHistoryContext'
import { useReviews } from '../context/ReviewsContext'

interface ReviewSectionProps {
  productId: string
}

// 리뷰가 많아질 걸 대비해 처음엔 일부만 보여주고 "더보기"를 누를 때마다 이만큼씩 더 쌓는다(무신사 방식 참고).
const REVIEWS_PAGE_SIZE = 5

type SortOrder = 'latest' | 'rating-desc' | 'rating-asc'

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'rating-desc', label: '별점 높은순' },
  { value: 'rating-asc', label: '별점 낮은순' },
]

function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth()
  const { openLoginModal } = useAuthModal()
  const { orders } = useOrderHistory()
  const { reviews, addReview, deleteReview } = useReviews()
  const [showForm, setShowForm] = useState(false)
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE)
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteToast, setShowDeleteToast] = useState(false)

  // 다른 상품 페이지로 이동해도 이 컴포넌트는 재마운트되지 않으므로, productId가 바뀌면 펼친 개수/정렬을 초기화한다.
  useEffect(() => {
    setVisibleCount(REVIEWS_PAGE_SIZE)
    setSortOrder('latest')
  }, [productId])

  const productReviews = reviews.filter((review) => review.productId === productId)
  const averageRating =
    productReviews.length > 0
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
      : 0

  const sortedReviews = [...productReviews].sort((a, b) => {
    if (sortOrder === 'rating-desc') return b.rating - a.rating
    if (sortOrder === 'rating-asc') return a.rating - b.rating
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const alreadyReviewed = Boolean(user) && productReviews.some((review) => review.userId === user!.id)
  // 배송완료된 주문 중 이 상품이 포함된 게 있어야만 "실제 구매자"로 인정 —
  // 최종 검증은 어차피 서버(RLS)가 하지만, UX상 미리 버튼을 감춰서 헛수고를 막는다.
  const hasVerifiedPurchase =
    Boolean(user) &&
    orders.some(
      (order) =>
        order.userEmail === user!.email &&
        order.shippingStatus === '배송완료' &&
        !order.returnStatus &&
        order.items.some((item) => item.productId === productId),
    )

  const handleWriteClick = () => {
    if (!user) {
      openLoginModal()
      return
    }
    setShowForm(true)
  }

  const handleSubmit = async (
    rating: number,
    content: string,
    photos: string[],
    height: number | null,
    weight: number | null,
  ) => {
    // 어떤 옵션(컬러·사이즈)으로 구매했는지는 사용자가 직접 입력하지 않고, 본인의 배송완료
    // 주문에서 이 상품이 담긴 항목을 찾아 자동으로 채운다(hasVerifiedPurchase와 동일한 조건).
    const matchingOrder = orders.find(
      (order) =>
        order.userEmail === user?.email &&
        order.shippingStatus === '배송완료' &&
        !order.returnStatus &&
        order.items.some((item) => item.productId === productId),
    )
    const purchasedOption = matchingOrder?.items.find((item) => item.productId === productId)?.option ?? null

    const result = await addReview({ productId, rating, content, photos, purchasedOption, height, weight })
    if (result.success) setShowForm(false)
    return result
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    const success = await deleteReview(deleteTargetId)
    setDeleting(false)
    setDeleteTargetId(null)
    if (success) setShowDeleteToast(true)
  }

  return (
    <>
      <div className="flex items-center justify-between gap-16">
        <h2 className="text-xl font-bold lg:text-2xl">리뷰</h2>
        {!user && (
          <Button variant="secondary" size="small" onClick={handleWriteClick}>
            내 리뷰 작성하기
          </Button>
        )}
        {user && alreadyReviewed && (
          <p className="text-caption text-secondary">이미 리뷰를 작성하셨습니다</p>
        )}
        {user && !alreadyReviewed && hasVerifiedPurchase && (
          <Button variant="secondary" size="small" onClick={handleWriteClick}>
            내 리뷰 작성하기
          </Button>
        )}
        {user && !alreadyReviewed && !hasVerifiedPurchase && (
          <p className="text-caption text-secondary">구매 후 배송완료 상태에서 작성할 수 있습니다</p>
        )}
      </div>

      {/* 전체 평점 — 개별 리뷰 별점(작은 별 5개)과 헷갈리지 않게 별 1개 아이콘 + 큰 숫자로 표시 */}
      <div className="mt-16 flex items-center gap-8">
        <Star size={28} strokeWidth={1.5} className="text-star" fill="currentColor" />
        <span className="text-2xl font-bold">{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</span>
        <span className="text-body-sm text-secondary">({productReviews.length})</span>
      </div>

      {productReviews.length === 0 ? (
        <p className="text-body-sm mt-16 text-secondary">아직 작성된 리뷰가 없습니다.</p>
      ) : (
        <>
          <div className="mt-16 flex justify-end">
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as SortOrder)
                  setVisibleCount(REVIEWS_PAGE_SIZE)
                }}
                className="cursor-pointer appearance-none rounded-sm border border-line bg-surface py-6 pl-12 pr-32 text-body-sm text-secondary"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-secondary"
              />
            </div>
          </div>

          <div className="mt-24 flex flex-col gap-16">
            {sortedReviews.slice(0, visibleCount).map((review) => (
              <div key={review.id} className="flex justify-between gap-16 border-b border-line pb-16 last:border-b-0">
                {/* 좌: 구매 옵션 → 별점 → 리뷰 내용 → 사진(정사각형, 최대 160px, 1장) */}
                <div className="flex min-w-0 flex-1 flex-col gap-8">
                  {review.purchasedOption && (
                    <p className="text-body-sm text-secondary">
                      상품 옵션
                      <span className="ml-8 text-primary">{review.purchasedOption.replace(' · ', ' / ')}</span>
                    </p>
                  )}
                  <StarRating value={review.rating} size={16} />
                  <p className="text-body whitespace-pre-line text-primary">{review.content}</p>
                  {review.photos.length > 0 && (
                    <img
                      src={review.photos[0]}
                      alt="리뷰 사진"
                      className="aspect-square w-full max-w-160 rounded-sm border border-line object-cover"
                    />
                  )}
                </div>

                {/* 우: 닉네임 → 키/몸무게 → (간격) → 작성일 */}
                <div className="flex shrink-0 flex-col items-end gap-4 text-right">
                  <div className="flex items-center gap-8">
                    <span className="text-body font-medium text-primary">{review.nickname}</span>
                    {user && review.userId === user.id && (
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(review.id)}
                        className="flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-secondary hover:text-primary"
                        aria-label="리뷰 삭제"
                      >
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                  <p className="text-body-sm mt-8 text-secondary">
                    {review.height != null ? `키 ${review.height}cm` : '키 작성하지 않음'}
                  </p>
                  <p className="text-body-sm text-secondary">
                    {review.weight != null ? `몸무게 ${review.weight}kg` : '몸무게 작성하지 않음'}
                  </p>
                  <p className="text-caption mt-8 text-disabled">
                    {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < sortedReviews.length && (
            <Button
              variant="secondary"
              size="small"
              className="mt-16 w-full"
              onClick={() => setVisibleCount((prev) => prev + REVIEWS_PAGE_SIZE)}
            >
              리뷰 더보기 ({sortedReviews.length - visibleCount})
            </Button>
          )}
        </>
      )}

      {showForm && <ReviewFormModal onCancel={() => setShowForm(false)} onSubmit={handleSubmit} />}

      {deleteTargetId && (
        <ConfirmModal
          message="리뷰를 삭제하시겠습니까?"
          confirmLabel="삭제"
          confirming={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      <Toast message="리뷰가 삭제되었습니다." show={showDeleteToast} onClose={() => setShowDeleteToast(false)} />
    </>
  )
}

export default ReviewSection
