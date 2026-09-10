import { forwardRef, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useProducts } from '../context/ProductsContext'
import SearchOverlay from './SearchOverlay'

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
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, to, onClick, children, light, ariaExpanded, ariaControls },
  ref,
) {
  const content = (
    <>
      <span className="sr-only">{label}</span>
      {children}
    </>
  )
  const className = `inline-flex h-44 w-44 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-colors active:scale-90 ${
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
  const { products } = useProducts()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const activeGender = getActiveGender(location.pathname, products)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement | null>(null)
  const firstMenuLinkRef = useRef<HTMLButtonElement | null>(null)

  const isHeroPage =
    (location.pathname === '/' || location.pathname === '/men' || location.pathname === '/women') &&
    !searchParams.get('category')
  const isTransparent = isHeroPage && !scrolled && !searchOpen && !menuOpen && !hovered

  useEffect(() => {
    setSearchOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    firstMenuLinkRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuToggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  useEffect(() => {
    if (!isHeroPage) {
      setScrolled(false)
      return
    }
    const handleScroll = () => setScrolled(window.scrollY > TRANSPARENT_SCROLL_THRESHOLD)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHeroPage])

  const handleMobileProtectedClick = (e: MouseEvent) => {
    setMenuOpen(false)
    if (!user) {
      e.preventDefault()
      openLoginModal()
    }
  }

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

  return (
    <header
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      className={`fixed inset-x-0 top-0 z-header flex h-48 items-center gap-16 border-b px-20 transition-colors duration-300 md:h-64 md:gap-32 md:px-32 lg:px-40 ${
        isTransparent ? 'border-transparent bg-transparent' : 'border-line bg-surface'
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-[160px] bg-gradient-to-b from-black/20 to-transparent transition-opacity duration-300 ${
          isTransparent ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <Link to="/" className="inline-flex shrink-0 items-center">
        <img
          src="/images/brand/novera-logo-header.png"
          alt="NOVERA"
          className={`block h-22 w-auto transition-[filter] duration-300 md:h-26 ${
            isTransparent ? 'brightness-0 invert' : ''
          }`}
        />
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

      <div className="md:hidden">
        <IconButton
          ref={menuToggleRef}
          label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => setMenuOpen((prev) => !prev)}
          light={isTransparent}
          ariaExpanded={menuOpen}
          ariaControls="mobile-menu-panel"
        >
          {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </IconButton>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-48 z-modal bg-black/40 animate-[fade-in_0.2s_ease-out_forwards] md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-menu-panel"
            className="fixed inset-x-0 top-48 z-modal border-b border-line bg-surface shadow-lg animate-[menu-in_0.2s_ease-out_forwards] md:hidden"
          >
            <nav className="flex flex-col px-20">
              <button
                ref={firstMenuLinkRef}
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
