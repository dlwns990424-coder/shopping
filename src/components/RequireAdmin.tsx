import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RequireAdmin() {
  const { user, logout } = useAuth()

  useEffect(() => {
    if (user?.suspended) logout()
  }, [user, logout])

  if (!user || user.role !== 'admin' || user.suspended) return <Navigate to="/" replace />

  return <Outlet />
}

export default RequireAdmin
