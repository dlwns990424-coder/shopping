import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function UserLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1 pt-64">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default UserLayout
