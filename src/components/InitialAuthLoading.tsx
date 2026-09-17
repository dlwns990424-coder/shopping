import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

const LOADING_DISPLAY_DELAY = 150

function InitialAuthLoading({ children }: { children: ReactNode }) {
  const { loading } = useAuth()
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (!loading) return

    const timer = window.setTimeout(() => setShowLoading(true), LOADING_DISPLAY_DELAY)
    return () => window.clearTimeout(timer)
  }, [loading])

  if (!loading) return children

  return (
    <div className="flex min-h-svh items-center justify-center bg-surface px-20" aria-live="polite">
      {showLoading && (
        <div className="flex flex-col items-center gap-20" role="status">
          <img src="/images/brand/novera-logo-header.png" alt="NOVERA" className="h-auto w-120" />
          <span className="h-24 w-24 animate-spin rounded-full border-2 border-line border-t-primary" />
          <span className="sr-only">로그인 상태를 확인하고 있습니다.</span>
        </div>
      )}
    </div>
  )
}

export default InitialAuthLoading
