import { safeSetItem } from './storage'

const STORAGE_KEY = 'shop_recently_viewed'
const MAX_ITEMS = 8

export function getRecentlyViewedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') || []
  } catch {
    return []
  }
}

export function addRecentlyViewed(productId: string) {
  const ids = [productId, ...getRecentlyViewedIds().filter((id) => id !== productId)]
  safeSetItem(STORAGE_KEY, ids.slice(0, MAX_ITEMS))
}
