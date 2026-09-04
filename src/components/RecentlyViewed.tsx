import { useState } from 'react'
import ProductCard from './ProductCard'
import { products } from '../mock/products'
import { getRecentlyViewedIds } from '../utils/recentlyViewed'
import type { Product } from '../types'

function RecentlyViewed() {
  const [ids] = useState(getRecentlyViewedIds)

  const items = ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))

  if (items.length === 0) {
    return <p className="text-body-sm">아직 본 상품이 없습니다.</p>
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
