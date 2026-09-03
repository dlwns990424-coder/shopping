import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { products } from '../mock/products'
import logo from '../assets/logo.png'
import './Header.css'

function getActiveGender(pathname) {
  if (pathname === '/' || pathname === '/men') return 'men'
  if (pathname === '/women') return 'women'

  const match = pathname.match(/^\/products\/(.+)$/)
  if (match) {
    const product = products.find((item) => item.id === match[1])
    if (product) return product.gender
  }

  return null
}

function IconButton({ label, to, children }) {
  const content = (
    <>
      <span className="sr-only">{label}</span>
      {children}
    </>
  )
  if (to) {
    return (
      <Link to={to} className="icon-button" aria-label={label}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" className="icon-button" aria-label={label}>
      {content}
    </button>
  )
}

function Header() {
  const { user } = useAuth()
  const location = useLocation()
  const activeGender = getActiveGender(location.pathname)

  return (
    <header className="site-header">
      <Link to="/" className="site-header__logo">
        <img src={logo} alt="T&L" className="site-header__logo-img" />
      </Link>

      <nav className="site-header__nav">
        <Link to="/men" className={activeGender === 'men' ? 'is-active' : ''}>
          MEN
        </Link>
        <Link to="/women" className={activeGender === 'women' ? 'is-active' : ''}>
          WOMEN
        </Link>
      </nav>

      <div className="site-header__icons">
        <IconButton label="검색">
          <Search size={20} strokeWidth={1.5} />
        </IconButton>
        <IconButton label="위시리스트">
          <Heart size={20} strokeWidth={1.5} />
        </IconButton>
        <IconButton label="장바구니" to="/cart">
          <ShoppingBag size={20} strokeWidth={1.5} />
        </IconButton>
        <IconButton label="마이페이지" to={user ? '/mypage' : '/login'}>
          <User size={20} strokeWidth={1.5} />
        </IconButton>
      </div>
    </header>
  )
}

export default Header
