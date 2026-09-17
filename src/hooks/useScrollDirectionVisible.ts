import { useEffect, useRef, useState } from 'react'

const DIRECTION_THRESHOLD_PX = 4

// 스크롤을 내리면 숨고 올리면 다시 보이는 요소(하단 내비 등)에 공용으로 쓰는 훅.
// enabled가 false면 항상 보이는 상태로 고정한다.
export function useScrollDirectionVisible(enabled: boolean) {
  const [visible, setVisible] = useState(true)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setVisible(true)
      return
    }
    lastScrollYRef.current = window.scrollY
    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollYRef.current
      if (currentY <= 0) {
        setVisible(true)
      } else if (delta > DIRECTION_THRESHOLD_PX) {
        setVisible(false)
      } else if (delta < -DIRECTION_THRESHOLD_PX) {
        setVisible(true)
      }
      lastScrollYRef.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enabled])

  return visible
}
