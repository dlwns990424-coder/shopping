import { forwardRef, useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search, Heart, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import SearchOverlay from './SearchOverlay'
import MobileMainNav from './MobileMainNav'
import { getBottomNavMode } from '../utils/bottomNavMode'
import { getCompactHeaderConfig } from '../utils/headerNavigation'

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
  const navigate = useNavigate()
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
  const compactHeader = getCompactHeaderConfig(location.pathname, searchParams)
  const tabletGlobalHeader = Boolean(compactHeader?.tabletGlobalHeader)

  const handleBack = () => {
    if (searchOpen) {
      setSearchOpen(false)
      return
    }

    const historyState = window.history.state as { idx?: number } | null
    if (typeof historyState?.idx === 'number' && historyState.idx > 0) {
      navigate(-1)
      return
    }

    const loginFrom = (location.state as { from?: string } | null)?.from
    const productFallback = activeGender ? `/${activeGender}?category=all` : compactHeader?.fallbackPath
    navigate(loginFrom ?? productFallback ?? '/men', { replace: true })
  }

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
    `flex h-full min-w-64 items-center justify-center text-sm font-medium no-underline transition-colors ${
      isTransparent
        ? active
          ? 'text-white'
          : 'text-white/70 hover:text-white'
        : active
          ? 'text-primary'
          : 'text-disabled hover:text-primary'
    }`

  const navIndicatorClass = (active: boolean) =>
    `relative flex h-full items-center after:absolute after:inset-x-0 after:bottom-0 after:h-px after:transition-colors ${
      active ? (isTransparent ? 'after:bg-white' : 'after:bg-primary') : 'after:bg-transparent'
    }`

  const genderTabClass = (active: boolean) =>
    `flex h-44 w-1/2 items-center justify-center border-b text-sm font-medium no-underline transition-colors ${
      active ? 'border-primary text-primary' : 'border-transparent text-disabled'
    }`

  return (
    <header
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      className={`app-header fixed inset-x-0 top-0 z-header flex items-center gap-16 border-b border-line/50 bg-surface transition-colors duration-300 md:gap-32 ${
        isTransparent ? 'md:border-transparent md:bg-transparent' : ''
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[160px] bg-gradient-to-b from-black/35 to-transparent transition-opacity duration-300 md:block ${
          isTransparent ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {compactHeader && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로가기"
          className={`relative z-10 -ml-12 flex h-44 w-44 shrink-0 items-center justify-center text-primary transition-transform active:scale-90 md:ml-0 ${
            tabletGlobalHeader ? 'md:hidden' : 'lg:hidden'
          }`}
        >
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
      )}

      <Link
        to="/"
        className={`${
          compactHeader
            ? tabletGlobalHeader
              ? 'hidden md:inline-flex'
              : 'hidden lg:inline-flex'
            : 'inline-flex'
        } shrink-0 items-center`}
      >
        <img
          src="/images/brand/novera-logo-header.png"
          alt="NOVERA"
          className={`block h-22 w-auto transition-[filter] duration-300 md:h-26 ${
            isTransparent ? 'md:brightness-0 md:invert' : ''
          }`}
        />
      </Link>

      {compactHeader?.breadcrumb ? (
        <nav
          aria-label="현재 상품 분류"
          className={`relative z-10 -ml-8 min-w-0 flex-1 items-center gap-6 text-sm font-semibold text-primary ${
            tabletGlobalHeader ? 'flex md:hidden' : 'flex lg:hidden'
          }`}
        >
          <Link to={compactHeader.breadcrumb.rootPath} className="shrink-0 text-primary no-underline">
            {compactHeader.breadcrumb.rootLabel}
          </Link>
          <span aria-hidden="true" className="shrink-0 text-secondary">
            &gt;
          </span>
          <span className="truncate">{compactHeader.breadcrumb.currentLabel}</span>
        </nav>
      ) : compactHeader ? (
        <p
          className={
            compactHeader.alignTitleLeft
              ? `relative z-10 -ml-8 min-w-0 flex-1 items-center truncate text-sm font-semibold text-primary ${
                  tabletGlobalHeader ? 'flex md:hidden' : 'flex lg:hidden'
                }`
              : `pointer-events-none absolute inset-x-76 bottom-0 h-48 items-center justify-center truncate px-8 text-center text-sm font-semibold text-primary md:h-54 ${
                  tabletGlobalHeader ? 'flex md:hidden' : 'flex lg:hidden'
                }`
          }
        >
          {compactHeader.title}
        </p>
      ) : null}

      <nav
        className={`${
          compactHeader ? (tabletGlobalHeader ? 'hidden md:flex' : 'hidden lg:flex') : 'hidden md:flex'
        } ml-16 h-full flex-1 gap-24 lg:ml-24`}
      >
        <Link to="/men" className={navLinkClass(activeGender === 'men')}>
          <span className={navIndicatorClass(activeGender === 'men')}>MEN</span>
        </Link>
        <Link to="/women" className={navLinkClass(activeGender === 'women')}>
          <span className={navIndicatorClass(activeGender === 'women')}>WOMEN</span>
        </Link>
      </nav>

      <div
        className={`${
          compactHeader ? (tabletGlobalHeader ? 'hidden md:flex' : 'hidden lg:flex') : 'hidden md:flex'
        } items-center gap-8`}
      >
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

      {!compactHeader && (
        <div className="-mr-12 ml-auto flex items-center gap-0 md:hidden">
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
      )}

      {compactHeader?.showShoppingActions && (
        <div
          className={`relative z-10 -mr-12 ml-auto items-center gap-0 md:mr-0 ${
            tabletGlobalHeader ? 'flex md:hidden' : 'flex lg:hidden'
          }`}
        >
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
      )}

      {!compactHeader && (
        <nav className="mobile-gender-tabs fixed inset-x-0 z-header flex h-44 border-b border-line/50 bg-surface md:hidden">
          <Link to="/men" className={genderTabClass(activeGender === 'men')}>
            MEN
          </Link>
          <Link to="/women" className={genderTabClass(activeGender === 'women')}>
            WOMEN
          </Link>
        </nav>
      )}

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        compactHeader={Boolean(compactHeader)}
      />

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
