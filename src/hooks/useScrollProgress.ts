import { useEffect, useState, type RefObject } from 'react'

// ref가 가리키는 sticky 컨테이너를 스크롤해서 통과하는 동안의 진행률(0~1)을 반환.
// 컨테이너 높이가 뷰포트보다 큰 만큼(예: h-[250vh])이 실제 스크롤 가능한 구간이 되고,
// 그 구간을 다 지나면 1로 고정된다.
export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollableDistance = rect.height - window.innerHeight
      if (scrollableDistance <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0)
        return
      }
      const scrolled = -rect.top
      const next = Math.min(1, Math.max(0, scrolled / scrollableDistance))
      setProgress(next)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [ref])

  return progress
}
