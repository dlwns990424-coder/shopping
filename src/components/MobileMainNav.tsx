import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Menu, Star, Home, Heart, Search, User as UserIcon, X } from 'lucide-react'
import CategoryCard from './CategoryCard'
import { menCategories, womenCategories } from '../mock/categories'
import type { Gender, User } from '../types'
import type { BottomNavMode } from '../utils/bottomNavMode'
import { useScrollDirectionVisible } from '../hooks/useScrollDirectionVisible'
import { useRecentSearch } from '../context/RecentSearchContext'

interface MobileMainNavProps {
  gender: Gender
  user: User | null
  openLoginModal: () => void
  mode: BottomNavMode
}

function MinimalHomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      className="h-[20px] w-[20px] shrink-0"
      viewBox="0 0 24 24"
      fill={active ? '#000' : 'none'}
      stroke={active ? 'none' : 'currentColor'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 10.5 12 3.5l8.5 7v9.25a.75.75 0 0 1-.75.75H4.25a.75.75 0 0 1-.75-.75V10.5Z" />
      {active ? (
        <rect x="11" y="15" width="2" height="5.5" fill="#fff" stroke="none" />
      ) : (
        <path d="M12 20.5V15" fill="none" stroke="currentColor" />
      )}
    </svg>
  )
}

function MobileMainNav({ gender, user, openLoginModal, mode }: MobileMainNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [menuGender, setMenuGender] = useState<Gender>(gender)
  const [drawerQuery, setDrawerQuery] = useState('')
  const { addTerm } = useRecentSearch()
  const navVisible = useScrollDirectionVisible(mode === 'scroll-aware')
  const categoryButtonRef = useRef<HTMLButtonElement | null>(null)
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!categoryOpen) return
    const categoryButton = categoryButtonRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCategoryOpen(false)
        return
      }

      if (e.key !== 'Tab') return

      const drawer = drawerRef.current
      if (!drawer) return

      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (e.shiftKey && (activeElement === first || !drawer.contains(activeElement))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (activeElement === last || !drawer.contains(activeElement))) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      categoryButton?.focus()
    }
  }, [categoryOpen])

  const menuCategories = menuGender === 'men' ? menCategories : womenCategories

  const handleProtectedClick = (e: MouseEvent) => {
    if (!user) {
      e.preventDefault()
      openLoginModal()
    }
  }

  const handleDrawerSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const query = drawerQuery.trim()
    if (!query) return

    addTerm(query)
    setDrawerQuery('')
    setCategoryOpen(false)
    navigate(`/${menuGender}?category=all&q=${encodeURIComponent(query)}&gender=${menuGender}`)
  }

  const tabClass = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-4 text-[12px] font-medium no-underline transition-colors ${
      active ? 'text-primary' : 'text-disabled'
    }`

  const isBestActive = location.pathname === `/${gender}` && searchParams.get('sort') === 'best'
  const isHomeActive = mode === 'fixed' && !categoryOpen
  const isWishlistActive = location.pathname === '/wishlist'
  const isMyPageActive = location.pathname === '/mypage'

  if (mode === 'hidden') return null

  return (
    <>
      <nav
        className={`mobile-main-nav fixed inset-x-0 bottom-0 z-header flex items-stretch border-t border-line/50 bg-surface transition-transform duration-300 md:hidden ${
          navVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <button
          ref={categoryButtonRef}
          type="button"
          onClick={() => {
            if (!categoryOpen) setMenuGender(gender)
            setCategoryOpen((prev) => !prev)
          }}
          className={tabClass(categoryOpen)}
          aria-expanded={categoryOpen}
          aria-controls="category-drawer"
        >
          <Menu size={20} strokeWidth={1.5} stroke={categoryOpen ? 'black' : 'currentColor'} />
          카테고리
        </button>
        <Link to={`/${gender}?category=all&sort=best`} className={tabClass(isBestActive)}>
          <Star
            size={20}
            strokeWidth={1.5}
            fill={isBestActive ? 'black' : 'none'}
            stroke={isBestActive ? 'black' : 'currentColor'}
          />
          베스트
        </Link>
        <Link to={`/${gender}`} className={tabClass(isHomeActive)}>
          <MinimalHomeIcon active={isHomeActive} />
          홈
        </Link>
        <Link to="/wishlist" className={tabClass(isWishlistActive)}>
          <Heart
            size={20}
            strokeWidth={1}
            fill={isWishlistActive ? 'black' : 'none'}
            stroke={isWishlistActive ? 'black' : 'currentColor'}
          />
          좋아요
        </Link>
        <Link to={user ? '/mypage' : '#'} onClick={handleProtectedClick} className={tabClass(isMyPageActive)}>
          <UserIcon
            size={20}
            strokeWidth={1.5}
            fill={isMyPageActive ? 'black' : 'none'}
            stroke={isMyPageActive ? 'black' : 'currentColor'}
          />
          마이페이지
        </Link>
      </nav>

      <div
        aria-hidden="true"
        className={`fixed inset-0 z-modal bg-black/40 transition-opacity duration-300 md:hidden ${
          categoryOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setCategoryOpen(false)}
      />
      <div
        ref={drawerRef}
        id="category-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="카테고리 메뉴"
        aria-hidden={!categoryOpen}
        inert={!categoryOpen}
        className={`mobile-category-drawer fixed inset-y-0 left-0 z-modal w-full overflow-y-auto bg-surface shadow-lg transition-transform duration-300 ease-out md:hidden ${
          categoryOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-56 items-center gap-8 px-20">
          <form onSubmit={handleDrawerSearch} className="relative flex-1">
            <button
              type="submit"
              aria-label="상품 검색"
              className="absolute left-0 top-1/2 flex h-40 w-40 -translate-y-1/2 items-center justify-center text-secondary"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <input
              value={drawerQuery}
              onChange={(e) => setDrawerQuery(e.target.value)}
              placeholder="상품명, 카테고리, 색상을 검색해보세요"
              className="h-40 w-full rounded-sm border border-line bg-surface pl-40 pr-12 text-sm text-primary outline-none focus:border-primary"
            />
          </form>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setCategoryOpen(false)}
            aria-label="카테고리 닫기"
            className="flex h-44 w-44 items-center justify-center text-primary transition-transform active:scale-90"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex border-b border-line">
          <button
            type="button"
            onClick={() => setMenuGender('men')}
            className={`w-1/2 border-b px-20 py-12 text-center text-sm font-medium transition-colors ${
              menuGender === 'men' ? 'border-primary text-primary' : 'border-transparent text-disabled'
            }`}
          >
            MEN
          </button>
          <button
            type="button"
            onClick={() => setMenuGender('women')}
            className={`w-1/2 border-b px-20 py-12 text-center text-sm font-medium transition-colors ${
              menuGender === 'women' ? 'border-primary text-primary' : 'border-transparent text-disabled'
            }`}
          >
            WOMEN
          </button>
        </div>

        <div className="grid grid-cols-3 gap-x-12 gap-y-16 px-20 py-20">
          <Link
            to={`/${menuGender}`}
            onClick={() => setCategoryOpen(false)}
            className="group block px-6 text-inherit no-underline"
          >
            <div className="flex aspect-[3/4] items-center justify-center rounded-sm bg-surface-muted text-primary transition-transform active:scale-[0.98]">
              <Home size={28} strokeWidth={1.5} />
            </div>
            <p className="mt-8 text-center text-[13px] font-medium text-primary">
              {menuGender === 'men' ? '남성 메인' : '여성 메인'}
            </p>
          </Link>
          <Link
            to={`/${menuGender}?category=all`}
            onClick={() => setCategoryOpen(false)}
            className="group block px-6 text-inherit no-underline"
          >
            <div className="flex aspect-[3/4] items-center justify-center rounded-sm bg-surface-muted text-primary transition-transform active:scale-[0.98]">
              <span className="text-2xl font-semibold tracking-wide">ALL</span>
            </div>
            <p className="mt-8 text-center text-[13px] font-medium text-primary">전체상품</p>
          </Link>
          {menuCategories.map((category) => (
            <div key={category.id} onClick={() => setCategoryOpen(false)} className="px-6">
              <CategoryCard {...category} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default MobileMainNav
