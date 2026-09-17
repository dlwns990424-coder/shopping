let activeFrameId: number | null = null

export function animateScrollTo(top: number, duration: number, onComplete?: () => void) {
  if (activeFrameId != null) {
    window.cancelAnimationFrame(activeFrameId)
    activeFrameId = null
  }

  const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const targetTop = Math.min(Math.max(0, top), maxScrollTop)
  const startTop = window.scrollY
  const distance = targetTop - startTop
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduceMotion || duration <= 0 || Math.abs(distance) < 1) {
    window.scrollTo({ top: targetTop })
    onComplete?.()
    return
  }

  const startedAt = performance.now()

  const step = (now: number) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    const easedProgress = 1 - (1 - progress) ** 3
    window.scrollTo({ top: startTop + distance * easedProgress })

    if (progress < 1) {
      activeFrameId = window.requestAnimationFrame(step)
    } else {
      activeFrameId = null
      onComplete?.()
    }
  }

  activeFrameId = window.requestAnimationFrame(step)
}
