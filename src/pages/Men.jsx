import { Link, useSearchParams } from 'react-router-dom'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import CategoryListing from '../components/CategoryListing'
import { products } from '../mock/products'
import { menCategories } from '../mock/categories'
import './GenderPage.css'

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
    <div className="men-page">
      <section className="gender-hero">
        <div className="gender-hero__images">
          <div className="gender-hero__image" />
          <div className="gender-hero__image" />
          <div className="gender-hero__image" />
        </div>
        <div className="gender-hero__overlay" />
        <div className="gender-hero__copy">
          <p className="text-caption">T&amp;L | MEN</p>
          <h1 className="text-h1">댄디하고 심플한 무드의 새 시즌 컬렉션</h1>
        </div>
      </section>

      <section className="page-section">
        <div className="editorial-banner">
          <div className="editorial-banner__overlay" />
          <div className="editorial-banner__caption">
            <h2 className="text-h2">THE ESSENTIAL LAYER</h2>
            <p className="text-body-sm">겨울을 준비하는 첫 번째 아우터</p>
          </div>
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
    </div>
  )
}

export default Men
