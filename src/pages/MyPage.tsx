import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import MyPageNav from '../components/MyPageNav'
import AccountSettingsForm from '../components/AccountSettingsForm'
import OrderHistory from '../components/OrderHistory'
import RecentlyViewed from '../components/RecentlyViewed'
import ConfirmModal from '../components/ConfirmModal'

function MyPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'orders'
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleConfirmLogout = async () => {
    // RequireAuth가 "보호된 페이지에 로그인 안 된 채로 있다"고 오인해 로그인 모달을
    // 띄우지 않도록, 유저 상태를 지우기 전에 먼저 페이지를 벗어난다.
    navigate('/')
    await logout()
  }

  return (
    <div className="page-section flex flex-col gap-32">
      <Helmet>
        <title>NOVERA | 마이페이지</title>
      </Helmet>
      <h1 className="text-h1">마이페이지</h1>

      <div className="grid grid-cols-1 gap-32 md:grid-cols-[200px_1fr] md:gap-48 lg:gap-64">
        <MyPageNav activeTab={activeTab} onLogout={() => setShowLogoutConfirm(true)} />

        <div className="min-h-0 md:min-h-600">
          {activeTab === 'orders' && <OrderHistory />}
          {activeTab === 'recent' && <RecentlyViewed />}
          {activeTab !== 'orders' && activeTab !== 'recent' && <AccountSettingsForm />}
        </div>

        <button
          type="button"
          className="cursor-pointer self-start border-none bg-transparent px-16 text-sm text-secondary transition-colors active:scale-95 hover:text-point md:hidden"
          onClick={() => setShowLogoutConfirm(true)}
        >
          로그아웃
        </button>
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          message="로그아웃 하시겠습니까?"
          confirmLabel="로그아웃"
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  )
}

export default MyPage
