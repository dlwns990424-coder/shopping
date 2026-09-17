import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { getBottomNavMode } from '../utils/bottomNavMode'
import { animateScrollTo } from '../utils/animateScrollTo'
import { useScrollDirectionVisible } from '../hooks/useScrollDirectionVisible'

const SHOW_AFTER_PX = 480
const SCROLL_TO_TOP_DURATION_MS = 400

function ScrollTopButton() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [visible, setVisible] = useState(false)
  // 상품 상세페이지와 장바구니는 모바일에서 하단에 구매 버튼바가 고정돼 있어서, 이 버튼도
  // 그 위로 띄워야 겹치지 않는다(데스크톱은 그 바가 없어서 기본 위치 그대로).
  const isProductDetail = /^\/products\//.test(location.pathname)
  const isCart = location.pathname === '/cart'
  // 모바일 하단 내비게이션(60px)이 떠 있는 페이지에서도 겹치지 않게 그 위로 띄우고,
  // 스크롤에 따라 하단 내비가 숨겨지고 나타나는 것과 같이 움직이게 한다.
  const bottomNavMode = getBottomNavMode(location.pathname, Boolean(searchParams.get('category')))
  const hasBottomNav = bottomNavMode !== 'hidden'
  const bottomNavVisible = useScrollDirectionVisible(bottomNavMode === 'scroll-aware')

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const bottomClass = isProductDetail || isCart
    ? 'bottom-[calc(96px+env(safe-area-inset-bottom))] lg:bottom-24'
    : hasBottomNav
      ? 'bottom-[calc(88px+env(safe-area-inset-bottom))] md:bottom-24'
      : 'bottom-[max(24px,env(safe-area-inset-bottom))]'

  const shouldShow = visible && (bottomNavMode !== 'scroll-aware' || bottomNavVisible)

  return (
    <button
      type="button"
      onClick={() => animateScrollTo(0, SCROLL_TO_TOP_DURATION_MS)}
      aria-label="맨 위로 이동"
      className={`fixed right-16 z-fixed-bar flex h-44 w-44 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-md transition-all duration-300 active:scale-90 md:right-24 ${bottomClass} ${
        shouldShow ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <ArrowUp size={20} strokeWidth={1.5} />
    </button>
  )
}

export default ScrollTopButton
