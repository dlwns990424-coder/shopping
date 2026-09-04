import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { OrderHistoryProvider } from './context/OrderHistoryContext'
import { AuthModalProvider } from './context/AuthModalContext'
import ScrollToTop from './components/ScrollToTop'
import RequireAuth from './components/RequireAuth'

import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

import Home from './pages/Home'
import Men from './pages/Men'
import Women from './pages/Women'
import ProductDetail from './pages/ProductDetail'
import Wishlist from './pages/Wishlist'
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
      <CartProvider>
        <WishlistProvider>
          <OrderHistoryProvider>
            <BrowserRouter>
              <AuthModalProvider>
                <ScrollToTop />
                <Routes>
                  <Route element={<UserLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/men" element={<Men />} />
                    <Route path="/women" element={<Women />} />
                    <Route path="/products/:productId" element={<ProductDetail />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route element={<RequireAuth />}>
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/order" element={<Order />} />
                      <Route path="/order/complete" element={<OrderComplete />} />
                      <Route path="/mypage" element={<MyPage />} />
                    </Route>
                  </Route>

                  <Route path="/admin" element={<AdminLayout />}>
                    <Route path="products" element={<ProductManage />} />
                    <Route path="orders" element={<OrderManage />} />
                    <Route path="members" element={<MemberManage />} />
                    <Route path="sales" element={<SalesManage />} />
                  </Route>
                </Routes>
              </AuthModalProvider>
            </BrowserRouter>
          </OrderHistoryProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
