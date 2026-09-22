import { useState } from 'react'
import ProductCard from './ProductCard'
import Button from './Button'
import { useProducts } from '../context/ProductsContext'
import { useAuth } from '../context/AuthContext'
import { getRecentlyViewedIds, GUEST_BUCKET } from '../utils/recentlyViewed'
import type { Product } from '../types'

interface RecentlyViewedProps {
  excludeId?: string
  hideWhenEmpty?: boolean
  dense?: boolean
  collapsible?: boolean
  maxColumns?: 4 | 5
}

// dense 모드 컬럼 수(2/3/3/4/5)에 맞춰 첫 줄 이후를 숨긴다. 브레이크포인트별로
// "몇 개가 1줄인지"가 달라서 아이템 개수 대신 nth-child로 화면 크기별 분기한다.
const COLLAPSED_GRID_CLASS =
  '[&>*:nth-child(n+3)]:hidden md:[&>*:nth-child(n+3)]:block md:[&>*:nth-child(n+4)]:hidden xl:[&>*:nth-child(n+4)]:block xl:[&>*:nth-child(n+5)]:hidden 2xl:[&>*:nth-child(n+5)]:block 2xl:[&>*:nth-child(n+6)]:hidden'

function RecentlyViewed({
  excludeId,
  hideWhenEmpty = false,
  dense = false,
  collapsible = false,
  maxColumns = 5,
}: RecentlyViewedProps) {
  const { products } = useProducts()
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  // localStorage 동기 읽기라 상태로 캐싱할 이유가 없음 — 캐싱하면 상품 상세를
  // SPA 내비게이션으로 옮겨다닐 때(리마운트 없음) 목록이 첫 조회 시점에 고정되는 버그가 있었음.
  const ids = getRecentlyViewedIds(user?.id ?? GUEST_BUCKET)

  const items = ids
    .filter((id) => id !== excludeId)
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))

  if (items.length === 0) {
    return hideWhenEmpty ? null : <p className="text-body-sm">아직 본 상품이 없습니다.</p>
  }

  const collapsed = collapsible && !expanded
  const needsMoreAt2 = items.length > 2
  const needsMoreAt3 = items.length > 3
  const needsMoreAt4 = items.length > 4
  const needsMoreAt5 = items.length > 5
  const denseGridClass =
    maxColumns === 4
      ? 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4'
      : 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'

  return (
    <div>
      <div
        className={`product-grid gap-y-32 ${dense ? denseGridClass : ''} ${collapsed ? COLLAPSED_GRID_CLASS : ''}`}
      >
        {items.map((product) => (
          <ProductCard key={product.id} {...product} wishlistButtonAtEdge />
        ))}
      </div>
      {collapsed && needsMoreAt2 && (
        <div
          className={`mt-24 flex justify-center ${needsMoreAt3 ? '' : 'md:hidden'} ${
            needsMoreAt4 ? '' : 'xl:hidden'
          } ${needsMoreAt5 ? '' : '2xl:hidden'}`}
        >
          <Button variant="secondary" size="small" onClick={() => setExpanded(true)}>
            더보기
          </Button>
        </div>
      )}
    </div>
  )
}

export default RecentlyViewed
