import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useOrderHistory } from '../../context/OrderHistoryContext'
import type { Order } from '../../types'

function formatPrice(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`
}

function orderTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function Dashboard() {
  const { listUsers } = useAuth()
  const { orders } = useOrderHistory()

  const today = new Date().toISOString().slice(0, 10)
  const totalRevenue = orders.reduce((sum, order) => sum + orderTotal(order), 0)
  const todayOrderCount = orders.filter((order) => order.date === today).length
  const memberCount = listUsers().length
  const recentOrders = orders.slice(0, 8)

  const kpis = [
    { label: '총 매출', value: formatPrice(totalRevenue) },
    { label: '총 주문 수', value: `${orders.length}건` },
    { label: '오늘 주문 수', value: `${todayOrderCount}건` },
    { label: '총 회원 수', value: `${memberCount}명` },
  ]

  return (
    <div className="flex flex-col gap-32">
      <h1 className="text-h1">대시보드</h1>

      <div className="grid grid-cols-2 gap-16 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-sm border border-line px-20 py-16">
            <p className="text-body-sm text-secondary">{kpi.label}</p>
            <p className="text-h2 mt-8">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="text-h3 font-bold">최근 주문</h2>
          <Link to="/admin/orders" className="text-body-sm text-secondary hover:text-primary">
            전체 보기
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-body-sm text-secondary">아직 주문이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-560 border-collapse text-left">
              <thead>
                <tr className="text-body-sm border-b border-line text-secondary">
                  <th className="py-8 pr-16 font-medium">주문번호</th>
                  <th className="py-8 pr-16 font-medium">날짜</th>
                  <th className="py-8 pr-16 font-medium">주문자</th>
                  <th className="py-8 pr-16 font-medium">상태</th>
                  <th className="py-8 pr-16 text-right font-medium">금액</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-body-sm border-b border-line">
                    <td className="py-8 pr-16">{order.id}</td>
                    <td className="py-8 pr-16">{order.date}</td>
                    <td className="py-8 pr-16">{order.userEmail}</td>
                    <td className="py-8 pr-16">{order.status}</td>
                    <td className="py-8 pr-16 text-right">{formatPrice(orderTotal(order))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
