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
    <div className="page-section mb-60 flex flex-col gap-32 md:mb-0">
      <Helmet>
        <title>NOVERA | 마이페이지</title>
      </Helmet>
      <h1 className="text-h1 max-w-1000">마이페이지</h1>

      {/* lg 미만: 사이드바가 콘텐츠 위에 쌓이는 기존 방식 그대로.
          lg 이상: 사이드바는 왼쪽에 절대위치로 고정하고, 콘텐츠는 사이드바 유무와 무관하게
          "화면 전체 폭" 기준으로 가운데 정렬한다(그리드 1fr 트랙 안에서의 중앙정렬과 달리
          사이드바 옆에 어중간한 빈 공간이 남는 느낌이 없음). 대신 좁은 데스크톱 폭(lg)에서
          콘텐츠가 사이드바와 겹치지 않도록, 화면이 좁을수록 콘텐츠 최대폭도 단계적으로
          줄어들게 해서(lg→xl→2xl 갈수록 넓어짐) 겹칠 여지 자체를 없앤다. */}
      <div className="flex flex-col gap-32 lg:relative lg:block">
        <div className="lg:absolute lg:left-0 lg:top-0 lg:w-200">
          <MyPageNav activeTab={activeTab} onLogout={() => setShowLogoutConfirm(true)} />
        </div>

        <div className="mx-auto min-h-0 lg:max-w-450 lg:min-h-600 xl:max-w-700 2xl:max-w-950">
          {activeTab === 'orders' && <OrderHistory />}
          {activeTab === 'recent' && <RecentlyViewed dense />}
          {activeTab !== 'orders' && activeTab !== 'recent' && <AccountSettingsForm />}
        </div>

        <button
          type="button"
          className="cursor-pointer self-start border-none bg-transparent px-16 text-sm text-secondary transition-colors active:scale-95 hover:text-point lg:hidden"
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
