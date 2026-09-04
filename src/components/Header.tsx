import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { products } from '../mock/products'
import logo from '../assets/logo.png'

type Gender = 'men' | 'women'

function getActiveGender(pathname: string): Gender | null {
  if (pathname === '/' || pathname === '/men') return 'men'
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
  children: ReactNode
}

function IconButton({ label, to, children }: IconButtonProps) {
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
    <button type="button" className={className} aria-label={label}>
      {content}
    </button>
  )
}

function Header() {
  const { user } = useAuth()
  const location = useLocation()
  const activeGender = getActiveGender(location.pathname)

  const navLinkClass = (active: boolean) =>
    `border-b py-4 text-sm font-medium no-underline transition-colors hover:border-primary hover:text-primary ${
      active ? 'border-primary text-primary' : 'border-transparent text-disabled'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-[100] flex h-64 items-center gap-32 border-b border-line bg-surface px-32">
      <Link to="/" className="inline-flex items-center">
        <img src={logo} alt="T&L" className="block h-26 w-auto" />
      </Link>

      <nav className="flex flex-1 gap-24">
        <Link to="/men" className={navLinkClass(activeGender === 'men')}>
          MEN
        </Link>
        <Link to="/women" className={navLinkClass(activeGender === 'women')}>
          WOMEN
        </Link>
      </nav>

      <div className="flex items-center gap-16">
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
