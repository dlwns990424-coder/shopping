import { Fragment, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useOrderHistory } from '../../context/OrderHistoryContext'
import ConfirmModal from '../../components/ConfirmModal'
import Button from '../../components/Button'
import type { Order, User, UserRole } from '../../types'
import { formatPrice } from '../../utils/formatPrice'

const MEMBERS_PER_PAGE = 20
const RECENT_ORDERS_LIMIT = 5

function orderTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function MemberManage() {
  const { user: currentUser, listUsers, setUserRole, deleteUser } = useAuth()
  const { orders } = useOrderHistory()

  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const users = listUsers()

  const filteredUsers = users.filter((member) => {
    if (roleFilter !== 'all' && member.role !== roleFilter) return false
    if (search && !member.nickname.includes(search) && !member.email.includes(search)) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / MEMBERS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pagedUsers = filteredUsers.slice(
    (safePage - 1) * MEMBERS_PER_PAGE,
    safePage * MEMBERS_PER_PAGE,
  )

  const statsByEmail = new Map<string, { count: number; total: number }>()
  for (const order of orders) {
    const stat = statsByEmail.get(order.userEmail) ?? { count: 0, total: 0 }
    stat.count += 1
    stat.total += orderTotal(order)
    statsByEmail.set(order.userEmail, stat)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) deleteUser(deleteTarget.email)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-24">
      <Helmet>
        <title>NOVERA Admin | 회원관리</title>
      </Helmet>
      <h1 className="text-h1">회원관리</h1>

      <div className="flex flex-wrap items-center gap-8">
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as 'all' | UserRole)
              setPage(1)
            }}
            className="text-body-sm appearance-none rounded-sm border border-line py-8 pl-12 pr-36"
          >
            <option value="all">전체 권한</option>
            <option value="user">일반회원</option>
            <option value="admin">관리자</option>
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-secondary"
          />
        </div>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="닉네임 또는 이메일 검색"
          className="text-body-sm rounded-sm border border-line px-12 py-8"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-body-sm text-secondary">조건에 맞는 회원이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-800 border-collapse text-left">
            <thead>
              <tr className="text-body-sm border-b border-line text-secondary">
                <th className="py-8 pr-16 font-medium">닉네임</th>
                <th className="py-8 pr-16 font-medium">이메일</th>
                <th className="py-8 pr-16 font-medium">휴대폰번호</th>
                <th className="py-8 pr-16 font-medium">가입일</th>
                <th className="py-8 pr-16 text-right font-medium">주문 수</th>
                <th className="py-8 pr-16 text-right font-medium">누적 구매액</th>
                <th className="py-8 pr-16 font-medium">권한</th>
                <th className="py-8 pl-16 font-medium">삭제</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((member) => {
                const stat = statsByEmail.get(member.email) ?? { count: 0, total: 0 }
                const isSelf = currentUser?.email === member.email
                const isExpanded = expandedEmail === member.email
                const memberOrders = orders.filter((order) => order.userEmail === member.email)
                const recentOrders = memberOrders.slice(0, RECENT_ORDERS_LIMIT)
                return (
                  <Fragment key={member.email}>
                    <tr
                      onClick={() => setExpandedEmail((prev) => (prev === member.email ? null : member.email))}
                      className="text-body-sm cursor-pointer border-b border-line hover:bg-surface-muted"
                    >
                      <td className="py-8 pr-16">{member.nickname}</td>
                      <td className="py-8 pr-16">{member.email}</td>
                      <td className="py-8 pr-16">{member.phone}</td>
                      <td className="py-8 pr-16">{member.joinedAt ? member.joinedAt.slice(0, 10) : '-'}</td>
                      <td className="py-8 pr-16 text-right">{stat.count}건</td>
                      <td className="py-8 pr-16 text-right">{formatPrice(stat.total)}</td>
                      <td className="py-8 pr-16" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={member.role}
                            disabled={isSelf}
                            onChange={(e) => setUserRole(member.email, e.target.value as UserRole)}
                            className="text-body-sm appearance-none rounded-sm border border-line py-4 pl-8 pr-28 disabled:cursor-not-allowed disabled:text-disabled"
                          >
                            <option value="user">일반회원</option>
                            <option value="admin">관리자</option>
                          </select>
                          <ChevronDown
                            size={14}
                            strokeWidth={1.5}
                            className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-secondary"
                          />
                        </div>
                      </td>
                      <td className="py-8 pl-16" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => setDeleteTarget(member)}
                          className="text-body-sm text-secondary hover:text-point disabled:cursor-not-allowed disabled:text-disabled disabled:hover:text-disabled"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-line bg-surface-muted">
                        <td colSpan={8} className="px-16 py-16">
                          {memberOrders.length === 0 ? (
                            <p className="text-body-sm text-secondary">주문 내역이 없습니다.</p>
                          ) : (
                            <>
                              <table className="w-full border-collapse text-left">
                                <thead>
                                  <tr className="text-body-sm text-secondary">
                                    <th className="py-4 pr-16 font-medium">주문번호</th>
                                    <th className="py-4 pr-16 font-medium">날짜</th>
                                    <th className="py-4 pr-16 font-medium">상태</th>
                                    <th className="py-4 pr-16 text-right font-medium">금액</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                      <td className="py-4 pr-16">{order.id}</td>
                                      <td className="py-4 pr-16">{order.date}</td>
                                      <td className="py-4 pr-16">{order.status}</td>
                                      <td className="py-4 pr-16 text-right">{formatPrice(orderTotal(order))}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {memberOrders.length > RECENT_ORDERS_LIMIT && (
                                <div className="mt-8 flex items-center justify-between">
                                  <span className="text-body-sm text-secondary">
                                    최근 {RECENT_ORDERS_LIMIT}건만 표시 중 · 총 {memberOrders.length}건
                                  </span>
                                  <Link
                                    to={`/admin/orders?search=${encodeURIComponent(member.email)}`}
                                    className="text-body-sm text-primary underline hover:text-point"
                                  >
                                    전체 주문 보기 →
                                  </Link>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-8">
              <Button
                variant="secondary"
                size="small"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                이전
              </Button>
              <span className="text-body-sm text-secondary">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="small"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`${deleteTarget.nickname}(${deleteTarget.email}) 회원을 삭제하시겠습니까?`}
          confirmLabel="삭제"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default MemberManage
