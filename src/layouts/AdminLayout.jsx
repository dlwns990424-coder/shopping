import { Outlet, Link } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <nav>
          <Link to="/admin/products">상품관리</Link>
          <Link to="/admin/orders">주문관리</Link>
          <Link to="/admin/members">회원관리</Link>
          <Link to="/admin/sales">매출관리</Link>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
