import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import StarRating from './StarRating'
import Button from './Button'
import ReviewFormModal from './ReviewFormModal'
import ConfirmModal from './ConfirmModal'
import Toast from './Toast'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useOrderHistory } from '../context/OrderHistoryContext'
import { useReviews } from '../context/ReviewsContext'
import { useProducts } from '../context/ProductsContext'

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
  const { products } = useProducts()
  const product = products.find((item) => item.id === productId)
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

  // TEMP: UI 미리보기용 목업 — 사용자가 직접 확인하는 동안만 유지, 이후 제거 예정
  const MOCK_PREVIEW_REVIEWS = [
    {
      id: 'mock-1',
      productId,
      userId: 'mock-user-1',
      nickname: 'so****',
      rating: 5,
      content: '핏이 생각보다 예쁘고 기장도 딱 맞았어요. 재질도 부드럽고 겨울에 안에 니트 입어도 여유있게 들어갑니다. 다음에 다른 컬러로 또 구매하고 싶어요.',
      photos: [product?.image ?? ''].filter(Boolean),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-2',
      productId,
      userId: 'mock-user-2',
      nickname: 'ji****',
      rating: 4,
      content: '색감 예쁘고 만족스러운데 생각보다 얇아서 완전 한겨울엔 히트텍이나 니트 레이어드 필수일 것 같아요.',
      photos: [],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
  const productReviews = [...MOCK_PREVIEW_REVIEWS, ...reviews.filter((review) => review.productId === productId)]
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

  const handleSubmit = async (rating: number, content: string, photos: string[]) => {
    const result = await addReview({ productId, rating, content, photos })
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
      <div className="flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-8">
          <StarRating value={averageRating} />
          <span className="text-body-sm text-secondary">
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'} ({productReviews.length})
          </span>
        </div>
        {!user && (
          <Button variant="secondary" size="small" onClick={handleWriteClick}>
            리뷰 작성
          </Button>
        )}
        {user && alreadyReviewed && (
          <p className="text-caption text-secondary">이미 리뷰를 작성하셨습니다</p>
        )}
        {user && !alreadyReviewed && hasVerifiedPurchase && (
          <Button variant="secondary" size="small" onClick={handleWriteClick}>
            리뷰 작성
          </Button>
        )}
        {user && !alreadyReviewed && !hasVerifiedPurchase && (
          <p className="text-caption text-secondary">구매 후 배송완료 상태에서 작성할 수 있습니다</p>
        )}
      </div>

      {productReviews.length === 0 ? (
        <p className="text-body-sm mt-16 text-secondary">아직 작성된 리뷰가 없습니다.</p>
      ) : (
        <>
          <div className="mt-16 flex justify-end">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as SortOrder)
                setVisibleCount(REVIEWS_PAGE_SIZE)
              }}
              className="cursor-pointer rounded-sm border border-line bg-surface px-12 py-6 text-body-sm text-secondary"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-12 flex flex-col gap-16">
            {sortedReviews.slice(0, visibleCount).map((review) => (
              <div key={review.id} className="flex flex-col gap-8 border-b border-line pb-16 last:border-b-0">
                <div className="flex items-center gap-8">
                  <StarRating value={review.rating} size={14} />
                  <span className="text-body-sm font-medium">{review.nickname}</span>
                  <span className="text-caption text-secondary">
                    {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  {user && review.userId === user.id && (
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(review.id)}
                      className="ml-auto flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-secondary hover:text-primary"
                      aria-label="리뷰 삭제"
                    >
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <p className="text-body-sm whitespace-pre-line text-secondary">{review.content}</p>
                {review.photos.length > 0 && (
                  <div className="flex flex-wrap gap-8">
                    {review.photos.map((url) => (
                      <img
                        key={url}
                        src={url}
                        alt="리뷰 사진"
                        className="h-96 w-96 rounded-sm border border-line object-cover"
                      />
                    ))}
                  </div>
                )}
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
