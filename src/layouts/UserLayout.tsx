import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ScrollTopButton from '../components/ScrollTopButton'

function UserLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1 pt-48 md:pt-54 lg:pt-60">
        <Outlet />
      </main>
      <Footer />
      <ScrollTopButton />
    </div>
  )
}

export default UserLayout
