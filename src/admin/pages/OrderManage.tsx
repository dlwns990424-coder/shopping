import { Fragment, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useOrderHistory } from '../../context/OrderHistoryContext'
import OrderItemRow from '../../components/OrderItemRow'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import type { ReturnStatus, ShippingStatus } from '../../types'
import { formatPrice } from '../../utils/formatPrice'
import { CANCELABLE_SHIPPING_STATUSES, orderTotal } from '../../utils/orderStats'

const SHIPPING_STATUSES: ShippingStatus[] = ['결제완료', '배송준비', '배송중', '배송완료', '취소']

type ReturnFilter = 'all' | 'none' | ReturnStatus

function shippingStatusConfirmMessage(status: ShippingStatus, count: number): string {
  const subject = count > 1 ? `주문 ${count}건을` : '이 주문을'
  if (status === '배송완료') {
    return `${subject} 배송완료 처리하시겠습니까? 이후 고객이 반품을 신청할 수 있는 기간이 시작됩니다.`
  }
  if (status === '취소') {
    return `${subject} 취소 처리하시겠습니까?`
  }
  return `${subject} '${status}' 상태로 변경하시겠습니까?`
}

function OrderManage() {
  const { orders, loading, error, updateShippingStatuses, updateReturnStatus } = useOrderHistory()
  const [searchParams] = useSearchParams()

  const [statusFilter, setStatusFilter] = useState<'all' | ShippingStatus>('all')
  const [returnFilter, setReturnFilter] = useState<ReturnFilter>('all')
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<ShippingStatus>(SHIPPING_STATUSES[0])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ orderIds: string[]; status: ShippingStatus } | null>(
    null,
  )
  const [returnStatusTarget, setReturnStatusTarget] = useState<{ orderId: string; next: ReturnStatus } | null>(null)

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.shippingStatus !== statusFilter) return false
    if (returnFilter === 'none' && order.returnStatus) return false
    if (returnFilter !== 'all' && returnFilter !== 'none' && order.returnStatus !== returnFilter) return false
    if (search && !order.id.includes(search) && !order.userEmail.includes(search)) return false
    return true
  })

  // 취소되었거나 반품이 조금이라도 진행된(요청/접수/완료) 주문은 배송상태를 더 바꿀 이유가 없는
  // 최종/예외 상태라, 일괄변경 체크박스 자체를 막아서 실수로 상태를 되돌리는 걸 사전에 방지한다.
  const isBulkSelectable = (order: (typeof orders)[number]) =>
    order.shippingStatus !== '취소' && !order.returnStatus
  const selectableOrders = filteredOrders.filter(isBulkSelectable)

  const allSelected = selectableOrders.length > 0 && selectableOrders.every((order) => selectedIds.has(order.id))

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(selectableOrders.map((order) => order.id)))
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkApply = () => {
    if (selectedIds.size === 0) return
    setStatusChangeTarget({ orderIds: Array.from(selectedIds), status: bulkStatus })
  }

  const handleShippingStatusChange = (orderId: string, status: ShippingStatus) => {
    setStatusChangeTarget({ orderIds: [orderId], status })
  }

  const confirmStatusChange = () => {
    if (!statusChangeTarget) return
    updateShippingStatuses(statusChangeTarget.orderIds, statusChangeTarget.status)
    setSelectedIds(new Set())
    setStatusChangeTarget(null)
  }

  const confirmReturnStatusChange = () => {
    if (!returnStatusTarget) return
    updateReturnStatus(returnStatusTarget.orderId, returnStatusTarget.next)
    setReturnStatusTarget(null)
  }

  return (
    <div className="flex flex-col gap-24">
      <Helmet>
        <title>NOVERA Admin | 주문관리</title>
      </Helmet>
      <h1 className="text-h1">주문관리</h1>

      {error && <p className="text-body-sm text-point">{error}</p>}

      <div className="flex flex-wrap items-center gap-8">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ShippingStatus)}
            className="text-body-sm appearance-none rounded-sm border border-line py-8 pl-12 pr-36"
          >
            <option value="all">전체 배송상태</option>
            {SHIPPING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-secondary"
          />
        </div>
        <div className="relative">
          <select
            value={returnFilter}
            onChange={(e) => setReturnFilter(e.target.value as ReturnFilter)}
            className="text-body-sm appearance-none rounded-sm border border-line py-8 pl-12 pr-36"
          >
            <option value="all">전체 반품상태</option>
            <option value="none">반품 없음</option>
            <option value="반품요청">반품요청</option>
            <option value="반품접수">반품접수</option>
            <option value="반품완료">반품완료</option>
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-secondary"
          />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="주문번호 또는 이메일 검색"
          className="text-body-sm rounded-sm border border-line px-12 py-8"
        />
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-8 rounded-sm border border-line bg-surface-muted px-16 py-12">
          <span className="text-body-sm">{selectedIds.size}건 선택됨</span>
          <div className="relative">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as ShippingStatus)}
              className="text-body-sm appearance-none rounded-sm border border-line py-8 pl-12 pr-36"
            >
              {SHIPPING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-secondary"
            />
          </div>
          <Button size="small" onClick={handleBulkApply}>
            배송상태 일괄 변경
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-body-sm text-secondary">불러오는 중...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-body-sm text-secondary">조건에 맞는 주문이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-800 border-collapse text-left">
            <thead>
              <tr className="text-body-sm border-b border-line text-secondary">
                <th className="w-32 py-8 pr-8">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th className="py-8 pr-16 font-medium">주문번호</th>
                <th className="py-8 pr-16 font-medium">날짜</th>
                <th className="py-8 pr-16 font-medium">주문자</th>
                <th className="py-8 pr-16 font-medium">상품 수</th>
                <th className="py-8 pr-16 text-right font-medium">금액</th>
                <th className="py-8 pl-16 font-medium">배송상태</th>
                <th className="py-8 pl-16 font-medium">반품상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <Fragment key={order.id}>
                  <tr
                    onClick={() => setExpandedId((prev) => (prev === order.id ? null : order.id))}
                    className="text-body-sm cursor-pointer border-b border-line hover:bg-surface-muted"
                  >
                    <td className="py-8 pr-8" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelectOne(order.id)}
                        disabled={!isBulkSelectable(order)}
                        title={!isBulkSelectable(order) ? '취소·반품된 주문은 배송상태를 일괄변경할 수 없습니다' : undefined}
                        className="disabled:cursor-not-allowed disabled:opacity-30"
                      />
                    </td>
                    <td className="py-8 pr-16">{order.id}</td>
                    <td className="py-8 pr-16">{order.date}</td>
                    <td className="py-8 pr-16">{order.userEmail}</td>
                    <td className="py-8 pr-16">{order.items.length}개</td>
                    <td className="py-8 pr-16 text-right">{formatPrice(orderTotal(order))}</td>
                    <td className="py-8 pl-16" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-8">
                        <div className="relative inline-block">
                          <select
                            value={order.shippingStatus}
                            onChange={(e) => handleShippingStatusChange(order.id, e.target.value as ShippingStatus)}
                            className="text-body-sm h-28 w-96 appearance-none rounded-sm border border-line py-4 pl-8 pr-28"
                          >
                            {SHIPPING_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            strokeWidth={1.5}
                            className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-secondary"
                          />
                        </div>
                        {/* 조건부로 마운트/언마운트하면 이 버튼이 생겼다 없어졌다 할 때마다
                            테이블이 auto layout이라 컬럼 폭이 같이 흔들려서(다른 행까지 밀림),
                            항상 마운트해두고 invisible로만 토글해 폭을 고정한다. */}
                        <Button
                          size="small"
                          variant="secondary"
                          className={`h-28 !py-0 ${CANCELABLE_SHIPPING_STATUSES.has(order.shippingStatus) ? '' : 'invisible'}`}
                          disabled={!CANCELABLE_SHIPPING_STATUSES.has(order.shippingStatus)}
                          onClick={() => setStatusChangeTarget({ orderIds: [order.id], status: '취소' })}
                        >
                          취소
                        </Button>
                      </div>
                    </td>
                    <td className="py-8 pl-16" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-8">
                        <span className="w-64 shrink-0">{order.returnStatus ?? '-'}</span>
                        {/* 위와 동일한 이유로 항상 마운트하고 invisible로만 토글 */}
                        <Button
                          size="small"
                          variant="secondary"
                          className={`h-28 !py-0 ${
                            order.returnStatus === '반품요청' || order.returnStatus === '반품접수' ? '' : 'invisible'
                          }`}
                          disabled={order.returnStatus !== '반품요청' && order.returnStatus !== '반품접수'}
                          onClick={() =>
                            setReturnStatusTarget({
                              orderId: order.id,
                              next: order.returnStatus === '반품요청' ? '반품접수' : '반품완료',
                            })
                          }
                        >
                          {order.returnStatus === '반품접수' ? '환불 완료' : '접수 처리'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr className="border-b border-line bg-surface-muted">
                      <td colSpan={8} className="px-16 py-16">
                        <div className="mb-16 grid grid-cols-1 gap-12 rounded-sm border border-line bg-surface p-16 sm:grid-cols-2">
                          <div>
                            <p className="text-caption text-secondary">주문자</p>
                            <p className="text-body-sm text-primary">{order.userEmail}</p>
                          </div>
                          <div>
                            <p className="text-caption text-secondary">받는 사람</p>
                            <p className="text-body-sm text-primary">
                              {order.shippingName} · {order.shippingPhone}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-caption text-secondary">배송지</p>
                            <p className="text-body-sm text-primary">
                              {order.shippingAddress} {order.shippingAddressDetail}
                            </p>
                          </div>
                          {order.deliveryRequest && (
                            <div className="sm:col-span-2">
                              <p className="text-caption text-secondary">배송 요청사항</p>
                              <p className="text-body-sm text-primary">{order.deliveryRequest}</p>
                            </div>
                          )}
                          {order.returnReason && (
                            <div className="sm:col-span-2">
                              <p className="text-caption text-secondary">반품 사유</p>
                              <p className="text-body-sm text-primary">
                                {order.returnReason}
                                {order.returnDetail && ` · ${order.returnDetail}`}
                              </p>
                              {order.returnPhotos && order.returnPhotos.length > 0 && (
                                <div className="mt-8 flex flex-wrap gap-8">
                                  {order.returnPhotos.map((url) => (
                                    <img key={url} src={url} alt="반품 사진" className="h-56 w-56 rounded-sm object-cover" />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex max-h-400 flex-col divide-y divide-line overflow-y-auto">
                          {order.items.map((item, index) => (
                            <OrderItemRow
                              key={`${order.id}-${index}`}
                              item={{ ...item, price: formatPrice(item.price) }}
                              responsive={false}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {statusChangeTarget && (
        <ConfirmModal
          message={shippingStatusConfirmMessage(statusChangeTarget.status, statusChangeTarget.orderIds.length)}
          confirmLabel="변경"
          cancelLabel="닫기"
          onConfirm={confirmStatusChange}
          onCancel={() => setStatusChangeTarget(null)}
        />
      )}

      {returnStatusTarget && (
        <ConfirmModal
          message={
            returnStatusTarget.next === '반품완료'
              ? '환불 완료 처리하시겠습니까? 매출 집계에도 반영됩니다.'
              : '반품 접수 처리하시겠습니까?'
          }
          confirmLabel={returnStatusTarget.next === '반품완료' ? '환불 완료' : '접수 처리'}
          cancelLabel="닫기"
          onConfirm={confirmReturnStatusChange}
          onCancel={() => setReturnStatusTarget(null)}
        />
      )}
    </div>
  )
}

export default OrderManage
