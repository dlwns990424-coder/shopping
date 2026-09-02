import { NavLink, Link } from 'react-router-dom'
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
  return (
    <header className="site-header">
      <Link to="/" className="site-header__logo">
        T&amp;L
      </Link>

      <nav className="site-header__nav">
        <NavLink to="/men" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          MEN
        </NavLink>
        <NavLink to="/women" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          WOMEN
        </NavLink>
      </nav>

      <div className="site-header__icons">
        <IconButton label="검색">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="6" />
            <line x1="18" y1="18" x2="13.5" y2="13.5" />
          </svg>
        </IconButton>
        <IconButton label="위시리스트">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              d="M12 21s-7.5-4.6-10-9.1C.5 8.5 2 5 5.5 5c2 0 3.5 1.2 4.5 2.8C11 6.2 12.5 5 14.5 5 18 5 19.5 8.5 22 11.9 19.5 16.4 12 21 12 21z"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
        <IconButton label="장바구니" to="/cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
        </IconButton>
        <IconButton label="마이페이지" to="/mypage">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
          </svg>
        </IconButton>
      </div>
    </header>
  )
}

export default Header
