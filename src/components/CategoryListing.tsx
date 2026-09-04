import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import type { Product } from '../types'

const TABS = [
  { id: '아우터', label: '아우터' },
  { id: '상의', label: '상의' },
  { id: '하의', label: '하의' },
]

interface CategoryListingProps {
  genderLabel: string
  basePath: string
  products: Product[]
  categoryParam: string
}

function CategoryListing({ genderLabel, basePath, products, categoryParam }: CategoryListingProps) {
  const title = categoryParam === 'all' ? '전체 상품' : categoryParam
  const displayedProducts =
    categoryParam === 'all'
      ? products
      : products.filter((product) => product.category === categoryParam)

  return (
    <div className="px-24 pb-32 pt-32 lg:px-80 lg:pb-64 lg:pt-48">
      <div className="mb-24">
        <p className="text-caption mb-8 tracking-[0.08em] text-secondary">
          T&amp;L | {genderLabel}
        </p>
        <h1 className="text-h1">{title}</h1>
      </div>

      <div className="flex gap-24 border-b border-line">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            to={`${basePath}?category=${tab.id}`}
            className={`-mb-px border-b py-12 text-sm font-medium no-underline transition-colors hover:border-primary hover:text-primary ${
              categoryParam === tab.id ? 'border-primary text-primary' : 'border-transparent text-disabled'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="py-16 text-secondary">
        <span className="text-body-sm">{displayedProducts.length}개 상품</span>
      </div>

      {displayedProducts.length > 0 ? (
        <div className="product-grid gap-y-32">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} {...product} showInfo />
          ))}
        </div>
      ) : (
        <p className="text-body-sm">해당 카테고리에 상품이 없습니다.</p>
      )}
    </div>
  )
}

export default CategoryListing
