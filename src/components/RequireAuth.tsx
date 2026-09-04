import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'

function RequireAuth() {
  const { user } = useAuth()
  const { openLoginModal } = useAuthModal()

  useEffect(() => {
    if (!user) openLoginModal()
  }, [user, openLoginModal])

  if (!user) return <Navigate to="/" replace />

  return <Outlet />
}

export default RequireAuth
