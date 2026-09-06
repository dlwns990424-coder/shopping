import { Fragment, useState } from 'react'
import { useOrderHistory } from '../../context/OrderHistoryContext'
import OrderItemRow from '../../components/OrderItemRow'
import Button from '../../components/Button'
import type { Order, OrderStatus } from '../../types'

const ORDER_STATUSES: OrderStatus[] = ['결제완료', '배송준비', '배송중', '배송완료', '취소']

function formatPrice(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`
}

function orderTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function OrderManage() {
  const { orders, updateOrderStatuses } = useOrderHistory()

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [search, setSearch] = useState('')
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
      <h1 className="text-h1">주문관리</h1>

      <div className="flex flex-wrap items-center gap-8">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
          className="text-body-sm rounded-sm border border-line px-12 py-8"
        >
          <option value="all">전체 상태</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
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
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
            className="text-body-sm rounded-sm border border-line px-12 py-8"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
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
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatuses([order.id], e.target.value as OrderStatus)}
                        className="text-body-sm rounded-sm border border-line px-8 py-4"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr className="border-b border-line bg-surface-muted">
                      <td colSpan={7} className="px-16 py-16">
                        <div className="text-body-sm mb-12 flex flex-col gap-2 text-secondary">
                          <p>
                            {order.shippingName} · {order.shippingPhone}
                          </p>
                          <p>
                            {order.shippingAddress} {order.shippingAddressDetail}
                          </p>
                          {order.deliveryRequest && <p>배송 요청: {order.deliveryRequest}</p>}
                        </div>
                        <div className="flex flex-col divide-y divide-line">
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
