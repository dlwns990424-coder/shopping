import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MyPageNav from '../components/MyPageNav'
import AccountSettingsForm from '../components/AccountSettingsForm'
import OrderHistory from '../components/OrderHistory'
import RecentlyViewed from '../components/RecentlyViewed'
import Button from '../components/Button'

function MyPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'settings'
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleConfirmLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="page-section flex flex-col gap-32">
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-24">
          <div className="flex w-full max-w-360 flex-col gap-16 rounded-md bg-surface p-24 text-center">
            <p className="text-h3">로그아웃 하시겠습니까?</p>
            <div className="mt-8 flex flex-col gap-8">
              <Button variant="primary" size="large" className="w-full" onClick={handleConfirmLogout}>
                로그아웃
              </Button>
              <Button
                variant="secondary"
                size="large"
                className="w-full"
                onClick={() => setShowLogoutConfirm(false)}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyPage
