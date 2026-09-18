import { useEffect, useState } from 'react'
import { Star, X } from 'lucide-react'
import StarRating from './StarRating'
import Button from './Button'
import ReviewFormModal from './ReviewFormModal'
import ConfirmModal from './ConfirmModal'
import Toast from './Toast'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useOrderHistory } from '../context/OrderHistoryContext'
import { useReviews } from '../context/ReviewsContext'
import SortDropdown from './SortDropdown'

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
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  // 다른 상품 페이지로 이동해도 이 컴포넌트는 재마운트되지 않으므로, productId가 바뀌면 펼친 개수/정렬을 초기화한다.
  useEffect(() => {
    setVisibleCount(REVIEWS_PAGE_SIZE)
    setSortOrder('latest')
    setSelectedPhoto(null)
  }, [productId])

  useEffect(() => {
    if (!selectedPhoto) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPhoto(null)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedPhoto])

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
            <SortDropdown
              value={sortOrder}
              options={SORT_OPTIONS}
              ariaLabel="리뷰 정렬 기준"
              onChange={(value) => {
                setSortOrder(value as SortOrder)
                setVisibleCount(REVIEWS_PAGE_SIZE)
              }}
            />
          </div>

          <div className="mt-24 flex flex-col gap-16">
            {sortedReviews.slice(0, visibleCount).map((review) => (
              <div
                key={review.id}
                className="flex justify-between gap-16 border-b border-line pb-16 md:grid md:grid-cols-[minmax(0,1fr)_136px] md:gap-32 lg:grid-cols-[minmax(0,1fr)_152px] lg:gap-40"
              >
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
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(review.photos[0])}
                      className="group w-full max-w-160 cursor-zoom-in rounded-sm border border-line bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      aria-label="리뷰 사진 크게 보기"
                    >
                      <img
                        src={review.photos[0]}
                        alt="리뷰 사진"
                        className="aspect-square w-full rounded-sm object-cover transition-opacity group-hover:opacity-90"
                      />
                    </button>
                  )}
                </div>

                {/* 우: 닉네임 → 키/몸무게 → (간격) → 작성일 */}
                <div className="flex shrink-0 flex-col items-end gap-4 pt-16 text-right md:w-full">
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
                  {review.height != null && (
                    <p className="text-body-sm mt-8 text-secondary">키 {review.height}cm</p>
                  )}
                  {review.weight != null && (
                    <p className={`text-body-sm text-secondary ${review.height == null ? 'mt-8' : ''}`}>
                      몸무게 {review.weight}kg
                    </p>
                  )}
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

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-modal bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="리뷰 사진 확대 보기"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="absolute inset-x-0 top-0 z-10 flex h-64 items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-16 sm:px-24 lg:px-40"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-body-sm font-medium text-white sm:text-body">리뷰 이미지</p>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="flex h-40 w-40 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:h-44 sm:w-44"
              aria-label="확대 이미지 닫기"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex h-full w-full items-center justify-center px-16 pb-56 pt-64 sm:px-24 sm:pb-64 lg:px-80 lg:pb-72 lg:pt-72">
            <img
              src={selectedPhoto}
              alt="확대된 리뷰 사진"
              className="max-h-full max-w-full rounded-sm object-contain shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
              onClick={(event) => event.stopPropagation()}
            />
          </div>

          <p
            className="text-caption absolute inset-x-0 bottom-20 text-center text-white/60 sm:bottom-24"
            onClick={(event) => event.stopPropagation()}
          >
            화면 바깥을 누르면 닫힙니다
          </p>
        </div>
      )}

      <Toast message="리뷰가 삭제되었습니다." show={showDeleteToast} onClose={() => setShowDeleteToast(false)} />
    </>
  )
}

export default ReviewSection
