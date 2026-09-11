import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { useAuth } from './AuthContext'

interface AuthModalContextValue {
  openLoginModal: () => void
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // 모달의 "로그인하기" 버튼을 거치지 않고 다른 경로로 로그인에 성공해도
  // 남아있지 않도록, 로그인 상태가 되는 순간 자동으로 닫는다.
  useEffect(() => {
    if (user) setOpen(false)
  }, [user])

  const openLoginModal = () => setOpen(true)
  const close = () => setOpen(false)

  const handleLogin = () => {
    close()
    navigate('/login', { state: { from: location.pathname + location.search } })
  }

  return (
    <AuthModalContext.Provider value={{ openLoginModal }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-24">
          <div className="flex w-full max-w-360 flex-col gap-16 rounded-md bg-surface p-24 text-center">
            <p className="text-h3">로그인이 필요합니다</p>
            <p className="text-body-sm text-secondary">이 기능은 로그인 후 이용하실 수 있어요.</p>
            <div className="mt-8 flex flex-col gap-8">
              <Button variant="primary" size="medium" className="w-full !py-8" onClick={handleLogin}>
                로그인하기
              </Button>
              <Button variant="secondary" size="medium" className="w-full !py-8" onClick={close}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}
