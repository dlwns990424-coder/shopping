import { Fragment, useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useOrderHistory } from '../../context/OrderHistoryContext'
import ConfirmModal from '../../components/ConfirmModal'
import Button from '../../components/Button'
import Input from '../../components/Input'
import type { User, UserRole } from '../../types'
import { formatPrice } from '../../utils/formatPrice'
import { NICKNAME_REGEX, PHONE_REGEX } from '../../utils/validators'
import { orderTotal, isRevenueOrder } from '../../utils/orderStats'

const MEMBERS_PER_PAGE = 20
const RECENT_ORDERS_LIMIT = 5

type SortKey = 'joinedAt' | 'orderCount' | 'total'

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function MemberManage() {
  const { user: currentUser, listUsers, setUserRole, deleteUser, updateMemberInfo, setUserSuspended } =
    useAuth()
  const { orders } = useOrderHistory()

  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [roleConfirmTarget, setRoleConfirmTarget] = useState<User | null>(null)
  const [suspendConfirmTarget, setSuspendConfirmTarget] = useState<User | null>(null)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ nickname: '', phone: '' })
  const [editError, setEditError] = useState<string | null>(null)
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const users = listUsers()

  const statsByEmail = new Map<string, { count: number; total: number }>()
  for (const order of orders) {
    const stat = statsByEmail.get(order.userEmail) ?? { count: 0, total: 0 }
    stat.count += 1
    if (isRevenueOrder(order)) stat.total += orderTotal(order)
    statsByEmail.set(order.userEmail, stat)
  }

  const searchDigits = digitsOnly(search)
  const filteredUsers = users.filter((member) => {
    if (roleFilter !== 'all' && member.role !== roleFilter) return false
    if (!search) return true
    if (member.nickname.includes(search) || member.email.includes(search)) return true
    return searchDigits.length > 0 && digitsOnly(member.phone).includes(searchDigits)
  })

  const sortedUsers = sortKey
    ? [...filteredUsers].sort((a, b) => {
        const statA = statsByEmail.get(a.email) ?? { count: 0, total: 0 }
        const statB = statsByEmail.get(b.email) ?? { count: 0, total: 0 }
        const cmp =
          sortKey === 'joinedAt'
            ? a.joinedAt.localeCompare(b.joinedAt)
            : sortKey === 'orderCount'
              ? statA.count - statB.count
              : statA.total - statB.total
        return sortDir === 'asc' ? cmp : -cmp
      })
    : filteredUsers

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / MEMBERS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pagedUsers = sortedUsers.slice(
    (safePage - 1) * MEMBERS_PER_PAGE,
    safePage * MEMBERS_PER_PAGE,
  )

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(1)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) deleteUser(deleteTarget.email)
    setDeleteTarget(null)
  }

  const handleRoleChange = (member: User, role: UserRole) => {
    if (role === 'admin') {
      setRoleConfirmTarget(member)
    } else {
      setUserRole(member.email, role)
    }
  }

  const openEditModal = (member: User) => {
    setEditTarget(member)
    setEditForm({ nickname: member.nickname, phone: member.phone })
    setEditError(null)
  }

  const handleEditSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!NICKNAME_REGEX.test(editForm.nickname)) {
      setEditError('닉네임은 영문/한글/숫자 2~10자로 입력해주세요.')
      return
    }
    if (!PHONE_REGEX.test(editForm.phone)) {
      setEditError('휴대폰번호를 정확하게 입력해주세요.')
      return
    }
    if (editTarget) updateMemberInfo(editTarget.email, editForm)
    setEditTarget(null)
  }

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return null
    return sortDir === 'desc' ? <ChevronDown size={12} strokeWidth={2} /> : <ChevronUp size={12} strokeWidth={2} />
  }

  return (
    <div className="flex flex-col gap-24">
      <Helmet>
        <title>NOVERA Admin | 회원관리</title>
      </Helmet>
      <h1 className="text-h1">회원관리</h1>

      <p className="text-body-sm text-secondary">총 {sortedUsers.length}명</p>

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
          placeholder="닉네임, 이메일 또는 휴대폰번호 검색"
          className="text-body-sm rounded-sm border border-line px-12 py-8"
        />
      </div>

      {sortedUsers.length === 0 ? (
        <p className="text-body-sm text-secondary">조건에 맞는 회원이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-800 border-collapse text-left">
            <thead>
              <tr className="text-body-sm border-b border-line text-secondary">
                <th className="py-8 pr-16 font-medium">닉네임</th>
                <th className="py-8 pr-16 font-medium">이메일</th>
                <th className="py-8 pr-16 font-medium">휴대폰번호</th>
                <th className="py-8 pr-16 font-medium">
                  <button type="button" onClick={() => handleSort('joinedAt')} className="inline-flex items-center gap-4 hover:text-primary">
                    가입일 {sortIcon('joinedAt')}
                  </button>
                </th>
                <th className="py-8 pr-16 text-right font-medium">
                  <button type="button" onClick={() => handleSort('orderCount')} className="inline-flex items-center gap-4 hover:text-primary">
                    주문 수 {sortIcon('orderCount')}
                  </button>
                </th>
                <th className="py-8 pr-16 text-right font-medium">
                  <button type="button" onClick={() => handleSort('total')} className="inline-flex items-center gap-4 hover:text-primary">
                    누적 구매액 {sortIcon('total')}
                  </button>
                </th>
                <th className="py-8 pr-16 font-medium">상태</th>
                <th className="py-8 pr-16 font-medium">권한</th>
                <th className="py-8 pr-16 font-medium">수정</th>
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
                        <div className="flex items-center gap-8">
                          <span className={`text-body-sm ${member.suspended ? 'text-point' : 'text-secondary'}`}>
                            {member.suspended ? '정지됨' : '활성'}
                          </span>
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() =>
                              member.suspended
                                ? setUserSuspended(member.email, false)
                                : setSuspendConfirmTarget(member)
                            }
                            className="text-body-sm text-secondary underline hover:text-point disabled:cursor-not-allowed disabled:text-disabled disabled:no-underline"
                          >
                            {member.suspended ? '해제' : '정지'}
                          </button>
                        </div>
                      </td>
                      <td className="py-8 pr-16" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={member.role}
                            disabled={isSelf}
                            onChange={(e) => handleRoleChange(member, e.target.value as UserRole)}
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
                      <td className="py-8 pr-16" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => openEditModal(member)}
                          className="text-body-sm text-secondary hover:text-point disabled:cursor-not-allowed disabled:text-disabled disabled:hover:text-disabled"
                        >
                          수정
                        </button>
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
                        <td colSpan={10} className="px-16 py-16">
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
                                    <th className="py-4 pr-16 font-medium">배송지</th>
                                    <th className="py-4 pr-16 text-right font-medium">금액</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                      <td className="py-4 pr-16">{order.id}</td>
                                      <td className="py-4 pr-16">{order.date}</td>
                                      <td className="py-4 pr-16">{order.status}</td>
                                      <td className="py-4 pr-16">
                                        {order.shippingName} · {order.shippingAddress}
                                      </td>
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

      {roleConfirmTarget && (
        <ConfirmModal
          message={`${roleConfirmTarget.nickname}(${roleConfirmTarget.email}) 회원에게 관리자 권한을 부여하시겠습니까?`}
          confirmLabel="부여"
          onConfirm={() => {
            setUserRole(roleConfirmTarget.email, 'admin')
            setRoleConfirmTarget(null)
          }}
          onCancel={() => setRoleConfirmTarget(null)}
        />
      )}

      {suspendConfirmTarget && (
        <ConfirmModal
          message={`${suspendConfirmTarget.nickname}(${suspendConfirmTarget.email}) 계정을 정지하시겠습니까? 정지된 계정은 로그인할 수 없습니다.`}
          confirmLabel="정지"
          onConfirm={() => {
            setUserSuspended(suspendConfirmTarget.email, true)
            setSuspendConfirmTarget(null)
          }}
          onCancel={() => setSuspendConfirmTarget(null)}
        />
      )}

      {editTarget && (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-24">
          <form
            onSubmit={handleEditSubmit}
            className="flex w-full max-w-360 flex-col gap-16 rounded-md bg-surface p-24"
          >
            <h2 className="text-h3">회원 정보 수정</h2>
            <Input
              id="member-edit-nickname"
              label="닉네임"
              value={editForm.nickname}
              onChange={(e) => setEditForm((prev) => ({ ...prev, nickname: e.target.value }))}
            />
            <Input
              id="member-edit-phone"
              label="휴대폰번호"
              value={editForm.phone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            {editError && <p className="text-body-sm text-point">{editError}</p>}
            <div className="mt-8 flex flex-col gap-8">
              <Button type="submit" variant="primary" size="large" className="w-full">
                저장
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="large"
                className="w-full"
                onClick={() => setEditTarget(null)}
              >
                취소
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default MemberManage
