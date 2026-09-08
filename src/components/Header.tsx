import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useProducts } from '../context/ProductsContext'
import SearchOverlay from './SearchOverlay'

type Gender = 'men' | 'women'

function getActiveGender(pathname: string, products: { id: string; gender: Gender }[]): Gender | null {
  if (pathname === '/men') return 'men'
  if (pathname === '/women') return 'women'

  const match = pathname.match(/^\/products\/(.+)$/)
  if (match) {
    const product = products.find((item) => item.id === match[1])
    if (product) return product.gender
  }

  return null
}

interface IconButtonProps {
  label: string
  to?: string
  onClick?: () => void
  children: ReactNode
}

function IconButton({ label, to, onClick, children }: IconButtonProps) {
  const content = (
    <>
      <span className="sr-only">{label}</span>
      {children}
    </>
  )
  const className =
    'inline-flex h-44 w-44 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-primary transition-colors hover:text-disabled active:scale-90'

  if (to) {
    return (
      <Link to={to} className={className} aria-label={label}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" className={className} aria-label={label} onClick={onClick}>
      {content}
    </button>
  )
}

function Header() {
  const { user } = useAuth()
  const { openLoginModal } = useAuthModal()
  const { products } = useProducts()
  const location = useLocation()
  const activeGender = getActiveGender(location.pathname, products)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setSearchOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  const handleMobileProtectedClick = (e: MouseEvent) => {
    setMenuOpen(false)
    if (!user) {
      e.preventDefault()
      openLoginModal()
    }
  }

  const navLinkClass = (active: boolean) =>
    `border-b py-4 text-sm font-medium no-underline transition-colors hover:border-primary hover:text-primary ${
      active ? 'border-primary text-primary' : 'border-transparent text-disabled'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-header flex h-64 items-center gap-16 border-b border-line bg-surface px-24 md:gap-32 md:px-32 lg:px-40">
      <Link to="/" className="inline-flex shrink-0 items-center">
        <img src="/images/brand/novera-logo-header.png" alt="NOVERA" className="block h-22 w-auto md:h-26" />
      </Link>

      <nav className="flex flex-1 gap-16 md:gap-24">
        <Link to="/men" className={navLinkClass(activeGender === 'men')}>
          MEN
        </Link>
        <Link to="/women" className={navLinkClass(activeGender === 'women')}>
          WOMEN
        </Link>
      </nav>

      <div className="hidden items-center gap-8 md:flex md:gap-16">
        <IconButton label="검색" onClick={() => setSearchOpen((prev) => !prev)}>
          <Search size={20} strokeWidth={1.5} />
        </IconButton>
        <IconButton label="위시리스트" to="/wishlist">
          <Heart size={20} strokeWidth={1.5} />
        </IconButton>
        <IconButton
          label="장바구니"
          to={user ? '/cart' : undefined}
          onClick={user ? undefined : openLoginModal}
        >
          <ShoppingBag size={20} strokeWidth={1.5} />
        </IconButton>
        <IconButton
          label="마이페이지"
          to={user ? '/mypage' : undefined}
          onClick={user ? undefined : openLoginModal}
        >
          <User size={20} strokeWidth={1.5} />
        </IconButton>
      </div>

      <div className="md:hidden">
        <IconButton label={menuOpen ? '메뉴 닫기' : '메뉴 열기'} onClick={() => setMenuOpen((prev) => !prev)}>
          {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </IconButton>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-64 z-modal bg-black/40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-x-0 top-64 z-modal border-b border-line bg-surface shadow-lg md:hidden">
            <nav className="flex flex-col px-24">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setSearchOpen(true)
                }}
                className="flex items-center gap-12 border-none bg-transparent py-16 text-left text-body text-primary"
              >
                <Search size={20} strokeWidth={1.5} />
                검색
              </button>
              <Link
                to="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-12 py-16 text-body text-primary no-underline"
              >
                <Heart size={20} strokeWidth={1.5} />
                위시리스트
              </Link>
              <Link
                to={user ? '/cart' : '#'}
                onClick={handleMobileProtectedClick}
                className="flex items-center gap-12 py-16 text-body text-primary no-underline"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                장바구니
              </Link>
              <Link
                to={user ? '/mypage' : '#'}
                onClick={handleMobileProtectedClick}
                className="flex items-center gap-12 py-16 text-body text-primary no-underline"
              >
                <User size={20} strokeWidth={1.5} />
                마이페이지
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}

export default Header
