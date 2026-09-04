import { useEffect } from 'react'

interface ToastProps {
  message: string
  show: boolean
  onClose: () => void
  duration?: number
}

function Toast({ message, show, onClose, duration = 1500 }: ToastProps) {
  useEffect(() => {
    if (!show) return undefined
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [show, duration, onClose])

  if (!show) return null

  return (
    <div
      className="fixed left-1/2 top-80 z-[1000] whitespace-nowrap rounded-md bg-primary px-24 py-14 text-sm font-medium text-surface shadow-[0_4px_16px_rgba(0,0,0,0.16)] animate-[toast-in_0.2s_ease_forwards]"
      role="status"
    >
      {message}
    </div>
  )
}

export default Toast
