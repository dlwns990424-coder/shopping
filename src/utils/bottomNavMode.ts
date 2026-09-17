export type BottomNavMode = 'fixed' | 'scroll-aware' | 'hidden'

const BOTTOM_NAV_HIDDEN_PATHS = new Set(['/cart', '/order', '/order/complete', '/login', '/signup'])

export function getBottomNavMode(pathname: string, hasCategoryFilter: boolean): BottomNavMode {
  if (BOTTOM_NAV_HIDDEN_PATHS.has(pathname) || /^\/products\//.test(pathname)) return 'hidden'
  if (pathname === '/men' || pathname === '/women') return hasCategoryFilter ? 'scroll-aware' : 'fixed'
  if (pathname === '/shop' || pathname === '/mypage' || pathname === '/wishlist') return 'scroll-aware'
  return 'hidden'
}
