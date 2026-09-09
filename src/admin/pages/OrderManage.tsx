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
import { orderTotal } from '../../utils/orderStats'

const SHIPPING_STATUSES: ShippingStatus[] = ['결제완료', '배송준비', '배송중', '배송완료', '취소']

// 배송이 시작되면(배송중/배송완료) "취소"가 아니라 반품 절차로 넘어가야 하므로
// 바로 취소 버튼은 아직 출고되지 않은 상태에서만 노출한다.
const CANCELABLE_STATUSES = new Set<ShippingStatus>(['결제완료', '배송준비'])

type ReturnFilter = 'all' | 'none' | ReturnStatus

function OrderManage() {
  const { orders, updateShippingStatuses, updateReturnStatus } = useOrderHistory()
  const [searchParams] = useSearchParams()

  const [statusFilter, setStatusFilter] = useState<'all' | ShippingStatus>('all')
  const [returnFilter, setReturnFilter] = useState<ReturnFilter>('all')
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<ShippingStatus>(SHIPPING_STATUSES[0])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cancelTargetIds, setCancelTargetIds] = useState<string[] | null>(null)

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.shippingStatus !== statusFilter) return false
    if (returnFilter === 'none' && order.returnStatus) return false
    if (returnFilter !== 'all' && returnFilter !== 'none' && order.returnStatus !== returnFilter) return false
    if (search && !order.id.includes(search) && !order.userEmail.includes(search)) return false
    return true
  })

  const allSelected = filteredOrders.length > 0 && filteredOrders.every((order) => selectedIds.has(order.id))

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(filteredOrders.map((order) => order.id)))
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
    if (bulkStatus === '취소') {
      setCancelTargetIds(Array.from(selectedIds))
      return
    }
    updateShippingStatuses(Array.from(selectedIds), bulkStatus)
    setSelectedIds(new Set())
  }

  const handleShippingStatusChange = (orderId: string, status: ShippingStatus) => {
    if (status === '취소') {
      setCancelTargetIds([orderId])
      return
    }
    updateShippingStatuses([orderId], status)
  }

  const confirmCancel = () => {
    if (!cancelTargetIds) return
    updateShippingStatuses(cancelTargetIds, '취소')
    setSelectedIds(new Set())
    setCancelTargetIds(null)
  }

  return (
    <div className="flex flex-col gap-24">
      <Helmet>
        <title>NOVERA Admin | 주문관리</title>
      </Helmet>
      <h1 className="text-h1">주문관리</h1>

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

      {filteredOrders.length === 0 ? (
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
                            className="text-body-sm h-28 appearance-none rounded-sm border border-line py-4 pl-8 pr-28"
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
                        {CANCELABLE_STATUSES.has(order.shippingStatus) && (
                          <Button
                            size="small"
                            variant="secondary"
                            className="h-28 !py-0"
                            onClick={() => setCancelTargetIds([order.id])}
                          >
                            취소
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="py-8 pl-16" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-8">
                        <span>{order.returnStatus ?? '-'}</span>
                        {order.returnStatus === '반품요청' && (
                          <Button
                            size="small"
                            variant="secondary"
                            className="h-28 !py-0"
                            onClick={() => updateReturnStatus(order.id, '반품접수')}
                          >
                            접수 처리
                          </Button>
                        )}
                        {order.returnStatus === '반품접수' && (
                          <Button
                            size="small"
                            variant="secondary"
                            className="h-28 !py-0"
                            onClick={() => updateReturnStatus(order.id, '반품완료')}
                          >
                            환불 완료
                          </Button>
                        )}
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

      {cancelTargetIds && (
        <ConfirmModal
          message={`주문 ${cancelTargetIds.length}건을 취소 처리할까요?`}
          confirmLabel="취소 처리"
          cancelLabel="닫기"
          onConfirm={confirmCancel}
          onCancel={() => setCancelTargetIds(null)}
        />
      )}
    </div>
  )
}

export default OrderManage
