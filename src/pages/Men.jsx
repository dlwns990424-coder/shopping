import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import { products } from '../mock/products'
import { menCategories } from '../mock/categories'
import './GenderPage.css'

function Men() {
  const menProducts = products.filter((product) => product.gender === 'men')

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
        <div className="page-section__header">
          <h2 className="text-h2">NEW ARRIVAL</h2>
          <span className="text-body-sm">더보기 +</span>
        </div>
        <div className="product-grid">
          {menProducts.map((product) => (
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
            <CategoryCard key={category.id} to={category.to} label={category.label} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Men
