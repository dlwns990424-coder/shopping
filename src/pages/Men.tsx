import { Link, useSearchParams } from 'react-router-dom'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import CategoryListing from '../components/CategoryListing'
import { products } from '../mock/products'
import { menCategories } from '../mock/categories'

function Men() {
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const menProducts = products.filter((product) => product.gender === 'men')

  if (categoryParam) {
    return (
      <CategoryListing
        genderLabel="MEN"
        basePath="/men"
        products={menProducts}
        categoryParam={categoryParam}
      />
    )
  }

  const displayedProducts = menProducts.slice(0, 8)

  return (
    <div>
      <section className="relative -mt-64 flex h-screen items-end overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 gap-[2px]">
          <div className="bg-line" />
          <div className="bg-disabled" />
          <div className="bg-line" />
        </div>
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 px-24 py-32 text-surface lg:p-64">
          <p className="text-caption mb-8 tracking-[0.08em] text-surface">T&amp;L | MEN</p>
          <h1 className="text-h1 text-surface">댄디하고 심플한 무드의 새 시즌 컬렉션</h1>
        </div>
      </section>

      <section className="page-section">
        <div className="relative flex aspect-[21/8] min-h-280 items-end overflow-hidden rounded-sm bg-secondary">
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative z-10 p-32">
            <h2 className="text-h2 text-surface">THE ESSENTIAL LAYER</h2>
            <p className="text-body-sm text-surface">겨울을 준비하는 첫 번째 아우터</p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-section__header">
          <h2 className="text-h2">SHOP BY CATEGORY</h2>
        </div>
        <div className="category-grid">
          {menCategories.map((category) => (
            <CategoryCard key={category.id} to={category.to} label={category.label} image={category.image} />
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="page-section__header">
          <h2 className="text-h2">NEW ARRIVAL</h2>
          <Link to="/men?category=all" className="text-body-sm">더보기 +</Link>
        </div>
        <div className="product-grid">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Men
