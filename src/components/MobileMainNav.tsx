import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Menu, Star, Home, Heart, User as UserIcon, X } from 'lucide-react'
import CategoryCard from './CategoryCard'
import { menCategories, womenCategories } from '../mock/categories'
import type { Gender, User } from '../types'
import type { BottomNavMode } from '../utils/bottomNavMode'
import { useScrollDirectionVisible } from '../hooks/useScrollDirectionVisible'

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
  const [searchParams] = useSearchParams()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [menuGender, setMenuGender] = useState<Gender>(gender)
  const navVisible = useScrollDirectionVisible(mode === 'scroll-aware')
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!categoryOpen) return
    setMenuGender(gender)
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCategoryOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [categoryOpen, gender])

  const menuCategories = menuGender === 'men' ? menCategories : womenCategories

  const handleProtectedClick = (e: MouseEvent) => {
    if (!user) {
      e.preventDefault()
      openLoginModal()
    }
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
        className={`fixed inset-x-0 bottom-0 z-header flex h-60 items-stretch border-t border-line/50 bg-surface transition-transform duration-300 md:hidden ${
          navVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setCategoryOpen((prev) => !prev)}
          className={tabClass(categoryOpen)}
          aria-expanded={categoryOpen}
          aria-controls="category-drawer"
        >
          <Menu size={20} strokeWidth={1.5} />
          카테고리
        </button>
        <Link to={`/${gender}?category=all&sort=best`} className={tabClass(isBestActive)}>
          <Star size={20} strokeWidth={1.5} fill={isBestActive ? 'black' : 'none'} />
          베스트
        </Link>
        <Link to={`/${gender}`} className={tabClass(isHomeActive)}>
          <MinimalHomeIcon active={isHomeActive} />
          홈
        </Link>
        <Link to="/wishlist" className={tabClass(isWishlistActive)}>
          <Heart size={20} strokeWidth={1.5} fill={isWishlistActive ? 'black' : 'none'} />
          좋아요
        </Link>
        <Link to={user ? '/mypage' : '#'} onClick={handleProtectedClick} className={tabClass(isMyPageActive)}>
          <UserIcon size={20} strokeWidth={1.5} fill={isMyPageActive ? 'black' : 'none'} />
          마이페이지
        </Link>
      </nav>

      <div
        className={`fixed inset-0 z-modal bg-black/40 transition-opacity duration-300 md:hidden ${
          categoryOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setCategoryOpen(false)}
      />
      <div
        id="category-drawer"
        className={`fixed inset-y-0 left-0 z-modal w-full overflow-y-auto bg-surface shadow-lg transition-transform duration-300 ease-out md:hidden ${
          categoryOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-48 items-center justify-end px-20">
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
