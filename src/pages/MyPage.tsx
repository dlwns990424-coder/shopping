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
  const activeTab = searchParams.get('tab') || 'settings'
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleConfirmLogout = async () => {
    await logout()
    navigate('/')
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
