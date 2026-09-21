import { Outlet, useLocation, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ScrollTopButton from '../components/ScrollTopButton'
import { getBottomNavMode } from '../utils/bottomNavMode'
import { getCompactHeaderConfig } from '../utils/headerNavigation'

function UserLayout() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const compactHeader = getCompactHeaderConfig(location.pathname, searchParams)
  const bottomNavMode = getBottomNavMode(location.pathname)
  const hasBottomNav = bottomNavMode !== 'hidden'

  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className={`flex-1 ${compactHeader ? 'main-header-offset-back' : 'main-header-offset-brand'}`}>
        <Outlet />
      </main>
      <Footer reserveBottomNavSpace={hasBottomNav} />
      <ScrollTopButton />
    </div>
  )
}

export default UserLayout
