import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MyPageNav from '../components/MyPageNav'
import AccountSettingsForm from '../components/AccountSettingsForm'
import OrderHistory from '../components/OrderHistory'
import RecentlyViewed from '../components/RecentlyViewed'

function MyPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'settings'

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="page-section flex flex-col gap-32">
      <h1 className="text-h1">마이페이지</h1>

      <div className="grid grid-cols-1 gap-32 lg:grid-cols-[200px_1fr] lg:gap-64">
        <MyPageNav activeTab={activeTab} onLogout={handleLogout} />

        <div className="min-h-0 lg:min-h-600">
          {activeTab === 'orders' && <OrderHistory />}
          {activeTab === 'recent' && <RecentlyViewed />}
          {activeTab !== 'orders' && activeTab !== 'recent' && <AccountSettingsForm />}
        </div>
      </div>
    </div>
  )
}

export default MyPage
