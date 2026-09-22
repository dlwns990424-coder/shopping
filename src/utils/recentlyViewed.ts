import { safeSetItem } from './storage'

const MAX_ITEMS = 8

// 장바구니/위시리스트/최근검색어와 동일하게 계정별(또는 게스트)로 스코프한다 — 예전엔
// 전역 고정 키 하나만 써서 같은 브라우저를 여러 계정이 공유하면 서로의 "최근 본 상품"이
// 그대로 보이는 문제가 있었다(2026-09-22 데이터 흐름 점검에서 발견).
export const GUEST_BUCKET = 'guest'

function recentlyViewedKey(bucket: string) {
  return `shop_recently_viewed:${bucket}`
}

export function getRecentlyViewedIds(bucket: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(recentlyViewedKey(bucket)) ?? '[]') || []
  } catch {
    return []
  }
}

export function addRecentlyViewed(productId: string, bucket: string) {
  const ids = [productId, ...getRecentlyViewedIds(bucket).filter((id) => id !== productId)]
  safeSetItem(recentlyViewedKey(bucket), ids.slice(0, MAX_ITEMS))
}
