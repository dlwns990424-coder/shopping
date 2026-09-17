import { forwardRef, useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import SearchOverlay from './SearchOverlay'
import MobileMainNav from './MobileMainNav'
import { getBottomNavMode } from '../utils/bottomNavMode'

const TRANSPARENT_SCROLL_THRESHOLD = 100

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
  light?: boolean
  ariaExpanded?: boolean
  ariaControls?: string
  badgeCount?: number
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, to, onClick, children, light, ariaExpanded, ariaControls, badgeCount },
  ref,
) {
  const content = (
    <>
      <span className="sr-only">{label}</span>
      {children}
      {Boolean(badgeCount) && (
        <span
          aria-hidden
          className="absolute right-2 top-2 flex h-16 w-16 items-center justify-center rounded-full bg-point text-[10px] font-semibold leading-none text-surface"
        >
          {badgeCount! > 9 ? '9+' : badgeCount}
        </span>
      )}
    </>
  )
  const className = `relative inline-flex h-44 w-44 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-colors active:scale-90 ${
    light ? 'text-white hover:text-white/70' : 'text-primary hover:text-disabled'
  }`

  if (to) {
    return (
      <Link to={to} className={className} aria-label={label}>
        {content}
      </Link>
    )
  }
  return (
    <button
      ref={ref}
      type="button"
      className={className}
      aria-label={label}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      onClick={onClick}
    >
      {content}
    </button>
  )
})

function Header() {
  const { user } = useAuth()
  const { openLoginModal } = useAuthModal()
  const { items: cartItems } = useCart()
  const { products } = useProducts()
  const location = useLocation()
  // Cart.tsx의 "총 N개 상품"과 동일하게 라인(종류) 개수 기준으로 통일 — 수량 합산 아님
  const cartCount = cartItems.length
  const [searchParams] = useSearchParams()
  const activeGender = getActiveGender(location.pathname, products)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)

  const isHeroPage =
    (location.pathname === '/men' || location.pathname === '/women') && !searchParams.get('category')
  const isTransparent = isHeroPage && !scrolled && !searchOpen && !hovered
  const bottomNavMode = getBottomNavMode(location.pathname, Boolean(searchParams.get('category')))

  useEffect(() => {
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isHeroPage) {
      setScrolled(false)
      return
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > TRANSPARENT_SCROLL_THRESHOLD)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHeroPage])

  const navLinkClass = (active: boolean) =>
    `border-b py-4 text-sm font-medium no-underline transition-colors ${
      isTransparent
        ? active
          ? 'border-white text-white'
          : 'border-transparent text-white/70 hover:border-white hover:text-white'
        : active
          ? 'border-primary text-primary hover:border-primary hover:text-primary'
          : 'border-transparent text-disabled hover:border-primary hover:text-primary'
    }`

  const genderTabClass = (active: boolean) =>
    `flex h-44 w-1/2 items-center justify-center border-b text-sm font-medium no-underline transition-colors ${
      active ? 'border-primary text-primary' : 'border-transparent text-disabled'
    }`

  return (
    <header
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      className={`fixed inset-x-0 top-0 z-header flex h-48 items-center gap-16 border-b border-line/50 bg-surface px-20 transition-colors duration-300 md:h-54 md:gap-32 md:px-32 lg:h-60 lg:px-80 xl:px-140 2xl:px-200 ${
        isTransparent ? 'md:border-transparent md:bg-transparent' : ''
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[160px] bg-gradient-to-b from-black/20 to-transparent transition-opacity duration-300 md:block ${
          isTransparent ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <Link to="/" className="inline-flex shrink-0 items-center">
        <img
          src="/images/brand/novera-logo-header.png"
          alt="NOVERA"
          className={`block h-22 w-auto transition-[filter] duration-300 md:h-26 ${
            isTransparent ? 'md:brightness-0 md:invert' : ''
          }`}
        />
      </Link>

      <nav className="hidden flex-1 gap-24 md:flex">
        <Link to="/men" className={navLinkClass(activeGender === 'men')}>
          MEN
        </Link>
        <Link to="/women" className={navLinkClass(activeGender === 'women')}>
          WOMEN
        </Link>
      </nav>

      <div className="hidden items-center gap-8 md:flex md:gap-16">
        <IconButton label="검색" onClick={() => setSearchOpen((prev) => !prev)} light={isTransparent}>
          <Search size={20} strokeWidth={1.5} />
        </IconButton>
        <IconButton label="위시리스트" to="/wishlist" light={isTransparent}>
          <Heart size={20} strokeWidth={1.5} />
        </IconButton>
        <IconButton
          label="장바구니"
          to={user ? '/cart' : undefined}
          onClick={user ? undefined : openLoginModal}
          light={isTransparent}
          badgeCount={user ? cartCount : 0}
        >
          <ShoppingBag size={20} strokeWidth={1.5} />
        </IconButton>
        <IconButton
          label="마이페이지"
          to={user ? '/mypage' : undefined}
          onClick={user ? undefined : openLoginModal}
          light={isTransparent}
        >
          <User size={20} strokeWidth={1.5} />
        </IconButton>
      </div>

      <div className="ml-auto flex items-center gap-8 md:hidden">
        <IconButton label="검색" onClick={() => setSearchOpen((prev) => !prev)} light={false}>
          <Search size={20} strokeWidth={1.5} />
        </IconButton>
        <IconButton
          label="장바구니"
          to={user ? '/cart' : undefined}
          onClick={user ? undefined : openLoginModal}
          light={false}
          badgeCount={user ? cartCount : 0}
        >
          <ShoppingBag size={20} strokeWidth={1.5} />
        </IconButton>
      </div>

      <nav className="fixed inset-x-0 top-48 z-header flex h-44 border-b border-line/50 bg-surface md:hidden">
        <Link to="/men" className={genderTabClass(activeGender === 'men')}>
          MEN
        </Link>
        <Link to="/women" className={genderTabClass(activeGender === 'women')}>
          WOMEN
        </Link>
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <MobileMainNav
        gender={activeGender ?? 'men'}
        user={user}
        openLoginModal={openLoginModal}
        mode={bottomNavMode}
      />
    </header>
  )
}

export default Header
