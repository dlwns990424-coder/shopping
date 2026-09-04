import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'

import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

import Men from './pages/Men'
import Women from './pages/Women'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Order from './pages/Order'
import OrderComplete from './pages/OrderComplete'
import MyPage from './pages/MyPage'
import Login from './pages/Login'
import Signup from './pages/Signup'

import ProductManage from './admin/pages/ProductManage'
import OrderManage from './admin/pages/OrderManage'
import MemberManage from './admin/pages/MemberManage'
import SalesManage from './admin/pages/SalesManage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="/" element={<Men />} />
            <Route path="/men" element={<Men />} />
            <Route path="/women" element={<Women />} />
            <Route path="/products/:productId" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<Order />} />
            <Route path="/order/complete" element={<OrderComplete />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="products" element={<ProductManage />} />
            <Route path="orders" element={<OrderManage />} />
            <Route path="members" element={<MemberManage />} />
            <Route path="sales" element={<SalesManage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
