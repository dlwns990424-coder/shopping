const STORAGE_KEY = 'shop_recently_viewed'
const MAX_ITEMS = 8

export function getRecentlyViewedIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function addRecentlyViewed(productId) {
  const ids = [productId, ...getRecentlyViewedIds().filter((id) => id !== productId)]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)))
}
