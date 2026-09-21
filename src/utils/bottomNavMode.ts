export type BottomNavMode = 'fixed' | 'hidden'

const BOTTOM_NAV_HIDDEN_PATHS = new Set(['/cart', '/order', '/order/complete', '/login', '/signup'])
const BOTTOM_NAV_FIXED_PATHS = new Set(['/men', '/women', '/shop', '/mypage', '/wishlist'])

export function getBottomNavMode(pathname: string): BottomNavMode {
  if (BOTTOM_NAV_HIDDEN_PATHS.has(pathname) || /^\/products\//.test(pathname)) return 'hidden'
  if (BOTTOM_NAV_FIXED_PATHS.has(pathname)) return 'fixed'
  return 'hidden'
}
