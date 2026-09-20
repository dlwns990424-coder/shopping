import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function GuestRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Outlet />

  const requestedPath = (location.state as { from?: string } | null)?.from
  const destination =
    requestedPath && requestedPath.startsWith('/') && !['/login', '/signup'].includes(requestedPath)
      ? requestedPath
      : '/men'

  return <Navigate to={destination} replace />
}

export default GuestRoute
