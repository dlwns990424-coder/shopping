import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import type { CartItem, Order } from '../types'
import Button from './Button'
import ConfirmModal from './ConfirmModal'
import OrderItemRow from './OrderItemRow'
import ReturnRequestModal from './ReturnRequestModal'
import ReviewFormModal from './ReviewFormModal'
import Toast from './Toast'
import { useAuth } from '../context/AuthContext'
import { useOrderHistory } from '../context/OrderHistoryContext'
import { useReviews } from '../context/ReviewsContext'
import { formatPrice } from '../utils/formatPrice'
import {
  CANCELABLE_SHIPPING_STATUSES,
  RETURN_WINDOW_DAYS,
  isReturnWindowOpen,
  orderItemsTotal,
  orderTotal,
} from '../utils/orderStats'

type StatusFilter = 'all' | 'preparing' | 'shipping' | 'delivered' | 'cancelled'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'preparing', label: '배송준비중' },
  { value: 'shipping', label: '배송중' },
  { value: 'delivered', label: '배송완료' },
  { value: 'cancelled', label: '취소·반품' },
]

// 취소되었거나 반품이 진행 중/완료된 주문은 배송 상태가 뭐든(반품은 배송완료 상태에서 시작) "취소·반품"으로 묶는다.
function statusFilterOf(order: Order): StatusFilter {
  if (order.shippingStatus === '취소' || order.returnStatus) return 'cancelled'
  if (order.shippingStatus === '결제완료' || order.shippingStatus === '배송준비') return 'preparing'
  if (order.shippingStatus === '배송중') return 'shipping'
  return 'delivered'
}

function OrderHistory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { orders, loading, error, updateShippingStatuses, requestReturn } = useOrderHistory()
  const { reviews, addReview, deleteReview } = useReviews()
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [returnTargetId, setReturnTargetId] = useState<string | null>(null)
  const [reviewTarget, setReviewTarget] = useState<CartItem | null>(null)
  const [showReviewToast, setShowReviewToast] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [reviewDeleteTargetId, setReviewDeleteTargetId] = useState<string | null>(null)
  const [deletingReview, setDeletingReview] = useState(false)
  const [showReviewDeleteToast, setShowReviewDeleteToast] = useState(false)

  // 최신순 정렬 — orders 자체가 이미 created_at desc로 내려오므로 그대로 필터만 적용한다.
  const myOrders = orders.filter((order) => order.userEmail === user?.email)
  const filteredOrders =
    statusFilter === 'all' ? myOrders : myOrders.filter((order) => statusFilterOf(order) === statusFilter)

  const openCancelModal = (id: string) => {
    setCancelError(null)
    setCancelTargetId(id)
  }

  const closeCancelModal = () => {
    setCancelTargetId(null)
    setCancelError(null)
  }

  const confirmCancel = async () => {
    if (!cancelTargetId) return
    setCancelling(true)
    setCancelError(null)
    const success = await updateShippingStatuses([cancelTargetId], '취소')
    setCancelling(false)
    if (!success) {
      setCancelError('주문 취소에 실패했습니다. 잠시 후 다시 시도해주세요.')
      return
    }
    setCancelTargetId(null)
  }

  const submitReturn = async (reason: string, detail: string, photos: string[]) => {
    if (!returnTargetId) return false
    const success = await requestReturn(returnTargetId, reason, detail, photos)
    if (success) setReturnTargetId(null)
    return success
  }

  const submitReview = async (rating: number, content: string, photos: string[]) => {
    if (!reviewTarget?.productId) return { success: false, message: '리뷰 등록에 실패했습니다.' }
    const result = await addReview({ productId: reviewTarget.productId, rating, content, photos })
    if (result.success) {
      setReviewTarget(null)
      setShowReviewToast(true)
    }
    return result
  }

  const confirmDeleteReview = async () => {
    if (!reviewDeleteTargetId) return
    setDeletingReview(true)
    const success = await deleteReview(reviewDeleteTargetId)
    setDeletingReview(false)
    setReviewDeleteTargetId(null)
    if (success) setShowReviewDeleteToast(true)
  }

  if (loading) {
    return <p className="text-body-sm text-secondary">불러오는 중...</p>
  }

  if (error && myOrders.length === 0) {
    return <p className="text-body-sm text-point">{error}</p>
  }

  if (myOrders.length === 0) {
    return (
      <div className="flex min-h-320 flex-col items-center justify-center gap-16 px-20 py-64 text-center">
        <ShoppingBag size={48} strokeWidth={1.2} className="text-disabled" />
        <p className="text-h3">아직 주문한 상품이 없습니다</p>
        <p className="text-body text-secondary">마음에 드는 상품을 만나보세요</p>
        <Button variant="primary" size="large" onClick={() => navigate('/')}>
          쇼핑하러 가기
        </Button>
      </div>
    )
  }

  return (
    <div className="flex max-w-1200 flex-col gap-16">
      <div className="flex flex-wrap gap-8">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full border px-16 py-6 text-body-sm transition-colors active:scale-95 ${
              statusFilter === filter.value
                ? 'border-primary bg-primary text-surface'
                : 'border-line text-secondary hover:border-primary hover:text-primary'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <p className="py-32 text-center text-body-sm text-secondary">해당하는 주문이 없습니다.</p>
      )}

      {filteredOrders.map((order) => (
        <div key={order.id} className="rounded-sm border border-line px-24 py-16">
          <div className="border-b border-line pb-16">
            <div className="text-body-sm flex justify-between text-secondary">
              <span>{order.date}</span>
              <span className="text-primary">
                {order.shippingStatus}
                {order.returnStatus && ` · ${order.returnStatus}`}
              </span>
            </div>
            <div className="mt-8 flex items-baseline justify-between">
              <span className="text-caption text-secondary">
                상품금액 {formatPrice(orderItemsTotal(order))} + 배송비 {formatPrice(order.shippingFee ?? 0)}
              </span>
              <span className="text-price">{formatPrice(orderTotal(order))}</span>
            </div>
          </div>
          <div className="text-body-sm flex flex-col gap-2 border-b border-line py-16 text-secondary">
            <p>
              {order.shippingName} · {order.shippingPhone}
            </p>
            <p>
              {order.shippingAddress} {order.shippingAddressDetail}
            </p>
            {order.deliveryRequest && <p>배송 요청: {order.deliveryRequest}</p>}
          </div>
          {order.items.map((item, index) => {
            const myReview = reviews.find(
              (review) => review.productId === item.productId && review.userId === user?.id,
            )
            return (
              <div
                key={`${order.id}-${index}`}
                className="[&:not(:last-of-type)]:border-b [&:not(:last-of-type)]:border-line"
              >
                <OrderItemRow item={{ ...item, price: formatPrice(item.price) }} linkToProduct />
                {/* 반품이 조금이라도 연관된(요청/접수/완료) 주문은 리뷰 작성 불가 — RLS에서도 동일하게 막힘 */}
                {order.shippingStatus === '배송완료' &&
                  !order.returnStatus &&
                  item.productId &&
                  (myReview ? (
                    <div className="flex items-center gap-8 pb-16">
                      <p className="text-caption text-secondary">리뷰 작성 완료</p>
                      <button
                        type="button"
                        onClick={() => setReviewDeleteTargetId(myReview.id)}
                        className="cursor-pointer border-none bg-transparent p-0 text-caption text-secondary underline hover:text-primary"
                      >
                        삭제
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="small"
                      variant="secondary"
                      className="mb-16"
                      onClick={() => setReviewTarget(item)}
                    >
                      리뷰 작성
                    </Button>
                  ))}
              </div>
            )
          })}
          {order.returnStatus && (
            <div className="text-body-sm mt-16 flex flex-col gap-8 rounded-sm bg-surface-muted p-12 text-secondary">
              <p>
                반품 사유: <span className="text-primary">{order.returnReason}</span>
              </p>
              {order.returnDetail && <p>{order.returnDetail}</p>}
              {order.returnPhotos && order.returnPhotos.length > 0 && (
                <div className="flex flex-wrap gap-8">
                  {order.returnPhotos.map((url) => (
                    <img key={url} src={url} alt="반품 사진" className="h-56 w-56 rounded-sm object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}
          {CANCELABLE_SHIPPING_STATUSES.has(order.shippingStatus) && (
            <Button
              size="small"
              variant="secondary"
              className="mt-16"
              onClick={() => openCancelModal(order.id)}
            >
              주문취소
            </Button>
          )}
          {order.shippingStatus === '배송완료' &&
            !order.returnStatus &&
            (isReturnWindowOpen(order) ? (
              <Button
                size="small"
                variant="secondary"
                className="mt-16"
                onClick={() => setReturnTargetId(order.id)}
              >
                반품 신청
              </Button>
            ) : (
              <div className="mt-16 flex flex-col items-start gap-4">
                <Button size="small" variant="secondary" disabled>
                  반품 신청
                </Button>
                <p className="text-caption text-secondary">
                  반품 가능 기간({RETURN_WINDOW_DAYS}일)이 지났습니다.
                </p>
              </div>
            ))}
        </div>
      ))}

      {cancelTargetId && (
        <ConfirmModal
          message="이 주문을 취소하시겠어요?"
          confirmLabel="주문취소"
          cancelLabel="닫기"
          confirming={cancelling}
          error={cancelError}
          onConfirm={confirmCancel}
          onCancel={closeCancelModal}
        />
      )}

      {returnTargetId && <ReturnRequestModal onCancel={() => setReturnTargetId(null)} onSubmit={submitReturn} />}

      {reviewTarget && (
        <ReviewFormModal
          productName={reviewTarget.name}
          onCancel={() => setReviewTarget(null)}
          onSubmit={submitReview}
        />
      )}

      {reviewDeleteTargetId && (
        <ConfirmModal
          message="리뷰를 삭제하시겠습니까?"
          confirmLabel="삭제"
          confirming={deletingReview}
          onConfirm={confirmDeleteReview}
          onCancel={() => setReviewDeleteTargetId(null)}
        />
      )}

      <Toast message="리뷰가 등록되었습니다." show={showReviewToast} onClose={() => setShowReviewToast(false)} />
      <Toast
        message="리뷰가 삭제되었습니다."
        show={showReviewDeleteToast}
        onClose={() => setShowReviewDeleteToast(false)}
      />
    </div>
  )
}

export default OrderHistory
