import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RequireAdmin() {
  const { user } = useAuth()

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />

  return <Outlet />
}

export default RequireAdmin
