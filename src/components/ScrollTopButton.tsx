import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'

const SHOW_AFTER_PX = 480

function ScrollTopButton() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  // 상품 상세페이지는 모바일에서 하단에 구매 버튼바가 고정돼 있어서, 이 버튼도
  // 그 위로 띄워야 겹치지 않는다(데스크톱은 그 바가 없어서 기본 위치 그대로).
  const isProductDetail = /^\/products\//.test(location.pathname)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로 이동"
      className={`fixed right-16 z-fixed-bar flex h-44 w-44 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-md transition-all duration-300 active:scale-90 md:right-24 ${
        isProductDetail ? 'bottom-96 lg:bottom-24' : 'bottom-24'
      } ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <ArrowUp size={20} strokeWidth={1.5} />
    </button>
  )
}

export default ScrollTopButton
