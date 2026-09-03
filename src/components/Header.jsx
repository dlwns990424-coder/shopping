import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import './Header.css'

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isMenActive = location.pathname === '/' || location.pathname === '/men'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <Link to="/" className="site-header__logo">
        <img src={logo} alt="T&L" className="site-header__logo-img" />
      </Link>

      <nav className="site-header__nav">
        <Link to="/men" className={isMenActive ? 'is-active' : ''}>
          MEN
        </Link>
        <NavLink to="/women" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          WOMEN
        </NavLink>
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
        {user && (
          <button type="button" className="site-header__logout text-caption" onClick={handleLogout}>
            로그아웃
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
