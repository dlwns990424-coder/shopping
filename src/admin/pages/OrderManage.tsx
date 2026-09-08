import { Fragment, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useOrderHistory } from '../../context/OrderHistoryContext'
import OrderItemRow from '../../components/OrderItemRow'
import Button from '../../components/Button'
import type { OrderStatus } from '../../types'
import { formatPrice } from '../../utils/formatPrice'
import { orderTotal } from '../../utils/orderStats'

const ORDER_STATUSES: OrderStatus[] = ['결제완료', '배송준비', '배송중', '배송완료', '취소']

function OrderManage() {
  const { orders, updateOrderStatuses } = useOrderHistory()
  const [searchParams] = useSearchParams()

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>(ORDER_STATUSES[0])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
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
    updateOrderStatuses(Array.from(selectedIds), bulkStatus)
    setSelectedIds(new Set())
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
            onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
            className="text-body-sm appearance-none rounded-sm border border-line py-8 pl-12 pr-36"
          >
            <option value="all">전체 상태</option>
            {ORDER_STATUSES.map((status) => (
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
              onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
              className="text-body-sm appearance-none rounded-sm border border-line py-8 pl-12 pr-36"
            >
              {ORDER_STATUSES.map((status) => (
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
            일괄 변경
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
                <th className="py-8 pl-16 font-medium">상태</th>
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
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatuses([order.id], e.target.value as OrderStatus)}
                          className="text-body-sm appearance-none rounded-sm border border-line py-4 pl-8 pr-28"
                        >
                          {ORDER_STATUSES.map((status) => (
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
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr className="border-b border-line bg-surface-muted">
                      <td colSpan={7} className="px-16 py-16">
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
    </div>
  )
}

export default OrderManage
