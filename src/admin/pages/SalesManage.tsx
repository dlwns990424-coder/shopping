import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ChevronDown } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useOrderHistory } from '../../context/OrderHistoryContext'
import { useProducts } from '../../context/ProductsContext'
import { formatPrice } from '../../utils/formatPrice'
import { orderTotal, isRevenueOrder } from '../../utils/orderStats'
import type { OrderStatus } from '../../types'

function formatAxisValue(value: number) {
  if (value === 0) return '0'
  if (value >= 10000) return `${Math.round(value / 10000)}만`
  return value.toLocaleString('ko-KR')
}

type Period = 'today' | 'week' | 'month' | 'all' | 'custom'

const ORDER_STATUSES: OrderStatus[] = ['결제완료', '배송준비', '배송중', '배송완료', '취소']

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'all', label: '전체' },
  { value: 'custom', label: '직접 선택' },
]

function SalesManage() {
  const { orders } = useOrderHistory()
  const { products, loading: productsLoading, error: productsError } = useProducts()
  const todayStr = new Date().toISOString().slice(0, 10)

  const [period, setPeriod] = useState<Period>('month')
  const [customStart, setCustomStart] = useState(todayStr)
  const [customEnd, setCustomEnd] = useState(todayStr)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 6)
  const weekAgoStr = weekAgo.toISOString().slice(0, 10)
  const monthPrefix = todayStr.slice(0, 7)
  const rangeStart = customStart <= customEnd ? customStart : customEnd
  const rangeEnd = customStart <= customEnd ? customEnd : customStart

  const periodOrders = orders.filter((order) => {
    if (period === 'today') return order.date === todayStr
    if (period === 'week') return order.date >= weekAgoStr
    if (period === 'month') return order.date.startsWith(monthPrefix)
    if (period === 'custom') return order.date >= rangeStart && order.date <= rangeEnd
    return true
  })

  const revenueOrders = periodOrders.filter(isRevenueOrder)
  const totalRevenue = revenueOrders.reduce((sum, order) => sum + orderTotal(order), 0)
  const orderCount = periodOrders.length
  const cancelCount = orderCount - revenueOrders.length
  const aov = revenueOrders.length > 0 ? Math.round(totalRevenue / revenueOrders.length) : 0
  const cancelRate = orderCount > 0 ? Math.round((cancelCount / orderCount) * 100) : 0

  const kpis = [
    { label: '총 매출', value: formatPrice(totalRevenue) },
    { label: '주문 수', value: `${orderCount}건` },
    { label: '평균 주문금액', value: formatPrice(aov) },
    { label: '취소율', value: `${cancelRate}%` },
  ]

  const revenueByDate = new Map<string, number>()
  for (const order of revenueOrders) {
    revenueByDate.set(order.date, (revenueByDate.get(order.date) ?? 0) + orderTotal(order))
  }
  const chartData = [...revenueByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date: date.slice(5), revenue }))

  const productByName = new Map(products.map((product) => [product.name, product]))
  const productStats = new Map<string, { quantity: number; revenue: number }>()
  const categoryStats = new Map<string, number>()
  for (const order of revenueOrders) {
    for (const item of order.items) {
      const stat = productStats.get(item.name) ?? { quantity: 0, revenue: 0 }
      stat.quantity += item.quantity
      stat.revenue += item.price * item.quantity
      productStats.set(item.name, stat)

      const product = productByName.get(item.name)
      const categoryLabel = product
        ? `${product.gender === 'men' ? 'MEN' : 'WOMEN'} · ${product.category}`
        : '기타'
      categoryStats.set(categoryLabel, (categoryStats.get(categoryLabel) ?? 0) + item.price * item.quantity)
    }
  }

  const bestSellers = [...productStats.entries()].sort(([, a], [, b]) => b.quantity - a.quantity).slice(0, 5)
  const categoryBreakdown = [...categoryStats.entries()].sort(([, a], [, b]) => b - a)
  const statusCounts = ORDER_STATUSES.map((status) => ({
    status,
    count: periodOrders.filter((order) => order.status === status).length,
  }))

  return (
    <div className="flex flex-col gap-32">
      <Helmet>
        <title>NOVERA Admin | 매출관리</title>
      </Helmet>
      <h1 className="text-h1">매출관리</h1>

      <div className="flex flex-wrap items-center gap-8">
        <div className="relative w-fit">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="text-body-sm appearance-none rounded-sm border border-line py-8 pl-12 pr-36"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-secondary"
          />
        </div>
        {period === 'custom' && (
          <div className="flex items-center gap-8">
            <input
              type="date"
              value={customStart}
              max={todayStr}
              onChange={(e) => setCustomStart(e.target.value)}
              className="text-body-sm rounded-sm border border-line px-12 py-8"
            />
            <span className="text-body-sm text-secondary">~</span>
            <input
              type="date"
              value={customEnd}
              max={todayStr}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="text-body-sm rounded-sm border border-line px-12 py-8"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-16 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-sm border border-line px-20 py-16">
            <p className="text-body-sm text-secondary">{kpi.label}</p>
            <p className="text-h2 mt-8">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-h3 mb-10 font-bold">일별 매출 추이</h2>
        {chartData.length === 0 ? (
          <p className="text-body-sm text-secondary">해당 기간에 매출이 없습니다.</p>
        ) : (
          <div className="h-256 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#d4d4d4" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6b6b6b' }}
                  axisLine={{ stroke: '#d4d4d4' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b6b6b' }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={formatAxisValue}
                />
                <Tooltip
                  formatter={(value) => formatPrice(Number(value))}
                  contentStyle={{ fontSize: 13, borderRadius: 4, borderColor: '#d4d4d4' }}
                />
                <Bar dataKey="revenue" name="매출" fill="#45697a" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-32 lg:grid-cols-2">
        <div>
          <h2 className="text-h3 mb-10 font-bold">베스트셀러 TOP 5</h2>
          {bestSellers.length === 0 ? (
            <p className="text-body-sm text-secondary">해당 기간에 판매된 상품이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-360 border-collapse text-left">
                <thead>
                  <tr className="text-body-sm border-b border-line text-secondary">
                    <th className="py-8 pr-16 font-medium">상품명</th>
                    <th className="py-8 pr-16 text-right font-medium">판매수량</th>
                    <th className="py-8 pl-16 text-right font-medium">매출</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellers.map(([name, stat]) => (
                    <tr key={name} className="text-body-sm border-b border-line">
                      <td className="py-8 pr-16">{name}</td>
                      <td className="py-8 pr-16 text-right">{stat.quantity}개</td>
                      <td className="py-8 pl-16 text-right">{formatPrice(stat.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-h3 mb-10 font-bold">카테고리별 매출</h2>
          {productsLoading ? (
            <p className="text-body-sm text-secondary">불러오는 중...</p>
          ) : productsError ? (
            <p className="text-body-sm text-point">{productsError}</p>
          ) : categoryBreakdown.length === 0 ? (
            <p className="text-body-sm text-secondary">해당 기간에 매출이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-360 border-collapse text-left">
                <thead>
                  <tr className="text-body-sm border-b border-line text-secondary">
                    <th className="py-8 pr-16 font-medium">카테고리</th>
                    <th className="py-8 pr-16 text-right font-medium">매출</th>
                    <th className="py-8 pl-16 text-right font-medium">비중</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map(([label, revenue]) => (
                    <tr key={label} className="text-body-sm border-b border-line">
                      <td className="py-8 pr-16">{label}</td>
                      <td className="py-8 pr-16 text-right">{formatPrice(revenue)}</td>
                      <td className="py-8 pl-16 text-right">
                        {totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-h3 mb-10 font-bold">주문 상태 분포</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-360 max-w-480 border-collapse text-left">
            <tbody>
              {statusCounts.map(({ status, count }) => (
                <tr key={status} className="text-body-sm border-b border-line">
                  <td className="py-8 pr-16">{status}</td>
                  <td className="py-8 pr-16 text-right">{count}건</td>
                  <td className="py-8 pl-16 text-right text-secondary">
                    {orderCount > 0 ? Math.round((count / orderCount) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalesManage
