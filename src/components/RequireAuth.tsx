import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'

function RequireAuth() {
  const { user, loading } = useAuth()
  const { openLoginModal } = useAuthModal()

  useEffect(() => {
    if (!loading && !user) openLoginModal()
  }, [loading, user, openLoginModal])

  if (loading) return null
  if (!user) return <Navigate to="/" replace />

  return <Outlet />
}

export default RequireAuth
