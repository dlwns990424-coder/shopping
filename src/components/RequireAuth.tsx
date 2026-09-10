import { useEffect, useRef } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'

function RequireAuth() {
  const { user, loading } = useAuth()
  const { openLoginModal } = useAuthModal()
  // 이 화면에 있는 동안 한 번이라도 로그인 상태였다면(=방금 직접 로그아웃한 것),
  // 로그인 안내 모달을 다시 띄우지 않는다 — 세션이 아예 없어서 들어온 경우에만 안내한다.
  const wasAuthenticated = useRef(false)

  useEffect(() => {
    if (user) wasAuthenticated.current = true
  }, [user])

  useEffect(() => {
    if (!loading && !user && !wasAuthenticated.current) openLoginModal()
  }, [loading, user, openLoginModal])

  if (loading) return null
  if (!user) return <Navigate to="/" replace />

  return <Outlet />
}

export default RequireAuth
