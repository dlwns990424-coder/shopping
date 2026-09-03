import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import './CategoryListing.css'

const TABS = [
  { id: '아우터', label: '아우터' },
  { id: '상의', label: '상의' },
  { id: '하의', label: '하의' },
]

function CategoryListing({ genderLabel, basePath, products, categoryParam }) {
  const title = categoryParam === 'all' ? '전체 상품' : categoryParam
  const displayedProducts =
    categoryParam === 'all'
      ? products
      : products.filter((product) => product.category === categoryParam)

  return (
    <div className="category-listing">
      <div className="category-listing__header">
        <p className="text-caption">T&amp;L | {genderLabel}</p>
        <h1 className="text-h1">{title}</h1>
      </div>

      <div className="category-listing__tabs">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            to={`${basePath}?category=${tab.id}`}
            className={`category-listing__tab${categoryParam === tab.id ? ' is-active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="category-listing__meta">
        <span className="text-body-sm">{displayedProducts.length}개 상품</span>
      </div>

      {displayedProducts.length > 0 ? (
        <div className="product-grid">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <p className="text-body-sm">해당 카테고리에 상품이 없습니다.</p>
      )}
    </div>
  )
}

export default CategoryListing
