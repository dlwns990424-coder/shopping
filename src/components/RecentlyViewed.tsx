import ProductCard from './ProductCard'
import { useProducts } from '../context/ProductsContext'
import { getRecentlyViewedIds } from '../utils/recentlyViewed'
import type { Product } from '../types'

interface RecentlyViewedProps {
  excludeId?: string
  hideWhenEmpty?: boolean
}

function RecentlyViewed({ excludeId, hideWhenEmpty = false }: RecentlyViewedProps) {
  const { products } = useProducts()
  // localStorage 동기 읽기라 상태로 캐싱할 이유가 없음 — 캐싱하면 상품 상세를
  // SPA 내비게이션으로 옮겨다닐 때(리마운트 없음) 목록이 첫 조회 시점에 고정되는 버그가 있었음.
  const ids = getRecentlyViewedIds()

  const items = ids
    .filter((id) => id !== excludeId)
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))

  if (items.length === 0) {
    return hideWhenEmpty ? null : <p className="text-body-sm">아직 본 상품이 없습니다.</p>
  }

  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}

export default RecentlyViewed
