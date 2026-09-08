import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const navLinks = (
    <nav className="flex flex-col gap-16">
      <Link to="/admin" onClick={() => setSidebarOpen(false)}>
        대시보드
      </Link>
      <Link to="/admin/products" onClick={() => setSidebarOpen(false)}>
        상품관리
      </Link>
      <Link to="/admin/orders" onClick={() => setSidebarOpen(false)}>
        주문관리
      </Link>
      <Link to="/admin/members" onClick={() => setSidebarOpen(false)}>
        회원관리
      </Link>
      <Link to="/admin/sales" onClick={() => setSidebarOpen(false)}>
        매출관리
      </Link>
      <Link to="/admin/content" onClick={() => setSidebarOpen(false)}>
        콘텐츠 관리
      </Link>
    </nav>
  )

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <div className="flex h-56 shrink-0 items-center justify-between border-b border-line px-24 lg:hidden">
        <span className="text-sm font-bold">NOVERA ADMIN</span>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="메뉴 열기"
          className="inline-flex h-32 w-32 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-primary"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-240 shrink-0 overflow-y-auto border-r border-line bg-surface p-24 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-24 flex items-center justify-between lg:hidden">
          <span className="text-sm font-bold">MENU</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="메뉴 닫기"
            className="inline-flex h-32 w-32 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-primary"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        {navLinks}
      </aside>

      <main className="flex-1 p-24">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
