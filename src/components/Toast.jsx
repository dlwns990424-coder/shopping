import { useEffect } from 'react'
import './Toast.css'

function Toast({ message, show, onClose, duration = 1500 }) {
  useEffect(() => {
    if (!show) return undefined
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [show, duration, onClose])

  if (!show) return null

  return (
    <div className="toast" role="status">
      {message}
    </div>
  )
}

export default Toast
