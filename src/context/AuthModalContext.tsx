import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

interface AuthModalContextValue {
  openLoginModal: () => void
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const openLoginModal = () => setOpen(true)
  const close = () => setOpen(false)

  const handleLogin = () => {
    close()
    navigate('/login')
  }

  return (
    <AuthModalContext.Provider value={{ openLoginModal }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-24">
          <div className="flex w-full max-w-360 flex-col gap-16 rounded-md bg-surface p-24 text-center">
            <p className="text-h3">로그인이 필요합니다</p>
            <p className="text-body-sm text-secondary">이 기능은 로그인 후 이용하실 수 있어요.</p>
            <div className="mt-8 flex flex-col gap-8">
              <Button variant="primary" size="large" className="w-full" onClick={handleLogin}>
                로그인하기
              </Button>
              <Button variant="secondary" size="large" className="w-full" onClick={close}>
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
