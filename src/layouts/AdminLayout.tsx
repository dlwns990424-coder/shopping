import { Outlet, Link } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className="flex min-h-svh">
      <aside className="w-240 shrink-0 border-r border-line p-24">
        <nav className="flex flex-col gap-16">
          <Link to="/admin">대시보드</Link>
          <Link to="/admin/products">상품관리</Link>
          <Link to="/admin/orders">주문관리</Link>
          <Link to="/admin/members">회원관리</Link>
          <Link to="/admin/sales">매출관리</Link>
        </nav>
      </aside>

      <main className="flex-1 p-24">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
