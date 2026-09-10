import { useState } from 'react'
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
  const [ids] = useState(getRecentlyViewedIds)

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
