import { Fragment, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import { useOrderHistory } from '../../context/OrderHistoryContext'
import ConfirmModal from '../../components/ConfirmModal'
import type { Order, User, UserRole } from '../../types'
import { formatPrice } from '../../utils/formatPrice'

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

  const users = listUsers()

  const filteredUsers = users.filter((member) => {
    if (roleFilter !== 'all' && member.role !== roleFilter) return false
    if (search && !member.nickname.includes(search) && !member.email.includes(search)) return false
    return true
  })

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
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
          className="text-body-sm rounded-sm border border-line px-12 py-8"
        >
          <option value="all">전체 권한</option>
          <option value="user">일반회원</option>
          <option value="admin">관리자</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
              {filteredUsers.map((member) => {
                const stat = statsByEmail.get(member.email) ?? { count: 0, total: 0 }
                const isSelf = currentUser?.email === member.email
                const isExpanded = expandedEmail === member.email
                const memberOrders = orders.filter((order) => order.userEmail === member.email)
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
                        <select
                          value={member.role}
                          onChange={(e) => setUserRole(member.email, e.target.value as UserRole)}
                          className="text-body-sm rounded-sm border border-line px-8 py-4"
                        >
                          <option value="user">일반회원</option>
                          <option value="admin">관리자</option>
                        </select>
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
                                {memberOrders.map((order) => (
                                  <tr key={order.id}>
                                    <td className="py-4 pr-16">{order.id}</td>
                                    <td className="py-4 pr-16">{order.date}</td>
                                    <td className="py-4 pr-16">{order.status}</td>
                                    <td className="py-4 pr-16 text-right">{formatPrice(orderTotal(order))}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
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
