import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// 모달 6곳(SearchOverlay, WishlistSizeModal, CartOptionModal, ReviewFormModal,
// ReturnRequestModal, ImageCropModal)이 각자 body 스크롤 잠금·Escape 닫기·포커스 트랩을
// 따로 구현하면서 일부는 트랩이 빠지는 등 제각각이었다 — 하나로 모아 전부 동일하게 맞춘다.
// enabled=false는 SearchOverlay처럼 컴포넌트가 항상 마운트된 채 열림 상태만 토글하는
// 경우를 위한 것으로, 닫혀있는 동안은 스크롤 잠금·리스너를 걸지 않는다.
export function useModalA11y(
  dialogRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  enabled = true,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!enabled) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFrame = window.requestAnimationFrame(() => {
      const target =
        initialFocusRef?.current ?? dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      target?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.getClientRects().length > 0,
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && (activeElement === first || !dialog.contains(activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (activeElement === last || !dialog.contains(activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [dialogRef, onClose, enabled, initialFocusRef])
}
