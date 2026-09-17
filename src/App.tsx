import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { RecentSearchProvider } from './context/RecentSearchContext'
import { OrderHistoryProvider } from './context/OrderHistoryContext'
import { ReviewsProvider } from './context/ReviewsContext'
import { AuthModalProvider } from './context/AuthModalContext'
import { ProductsProvider } from './context/ProductsContext'
import { ContentProvider } from './context/ContentContext'
import { BestsellersProvider } from './context/BestsellersContext'
import ScrollToTop from './components/ScrollToTop'
import InitialAuthLoading from './components/InitialAuthLoading'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'

import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

import Men from './pages/Men'
import Women from './pages/Women'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Order from './pages/Order'
import OrderComplete from './pages/OrderComplete'
import MyPage from './pages/MyPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'

import Dashboard from './admin/pages/Dashboard'
import ProductManage from './admin/pages/ProductManage'
import OrderManage from './admin/pages/OrderManage'
import MemberManage from './admin/pages/MemberManage'
import SalesManage from './admin/pages/SalesManage'
import ContentManage from './admin/pages/ContentManage'

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <InitialAuthLoading>
          <ProductsProvider>
            <ContentProvider>
              <BestsellersProvider>
              <CartProvider>
                <WishlistProvider>
                  <RecentSearchProvider>
                    <OrderHistoryProvider>
                      <ReviewsProvider>
                      <BrowserRouter>
                        <AuthModalProvider>
                          <ScrollToTop />
                          <Routes>
                            <Route element={<UserLayout />}>
                              <Route path="/" element={<Navigate to="/men" replace />} />
                              <Route path="/men" element={<Men />} />
                              <Route path="/women" element={<Women />} />
                              <Route path="/shop" element={<Shop />} />
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

                              <Route path="*" element={<NotFound />} />
                            </Route>

                            <Route element={<RequireAdmin />}>
                              <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="products" element={<ProductManage />} />
                                <Route path="orders" element={<OrderManage />} />
                                <Route path="members" element={<MemberManage />} />
                                <Route path="sales" element={<SalesManage />} />
                                <Route path="content" element={<ContentManage />} />
                              </Route>
                            </Route>
                          </Routes>
                        </AuthModalProvider>
                      </BrowserRouter>
                      </ReviewsProvider>
                    </OrderHistoryProvider>
                  </RecentSearchProvider>
                </WishlistProvider>
              </CartProvider>
              </BestsellersProvider>
            </ContentProvider>
          </ProductsProvider>
        </InitialAuthLoading>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
