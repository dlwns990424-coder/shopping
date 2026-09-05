import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { products } from '../mock/products'
import logo from '../assets/logo.png'

type Gender = 'men' | 'women'

function getActiveGender(pathname: string): Gender | null {
  if (pathname === '/men') return 'men'
  if (pathname === '/women') return 'women'

  const match = pathname.match(/^\/products\/(.+)$/)
  if (match) {
    const product = products.find((item) => item.id === match[1])
    if (product) return product.gender as Gender
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
    'inline-flex h-32 w-32 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-primary transition-colors hover:text-disabled'

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
  const location = useLocation()
  const activeGender = getActiveGender(location.pathname)

  const navLinkClass = (active: boolean) =>
    `border-b py-4 text-sm font-medium no-underline transition-colors hover:border-primary hover:text-primary ${
      active ? 'border-primary text-primary' : 'border-transparent text-disabled'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-header flex h-64 items-center gap-16 border-b border-line bg-surface px-24 md:gap-32 md:px-48 lg:px-80">
      <Link to="/" className="inline-flex shrink-0 items-center">
        <img src={logo} alt="T&L" className="block h-22 w-auto md:h-26" />
      </Link>

      <nav className="flex flex-1 gap-16 md:gap-24">
        <Link to="/men" className={navLinkClass(activeGender === 'men')}>
          MEN
        </Link>
        <Link to="/women" className={navLinkClass(activeGender === 'women')}>
          WOMEN
        </Link>
      </nav>

      <div className="flex items-center gap-8 md:gap-16">
        <IconButton label="검색">
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
    </header>
  )
}

export default Header
