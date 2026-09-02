import { Link } from 'react-router-dom'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import HeroPillButton from '../components/HeroPillButton'
import { products } from '../mock/products'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero__overlay" />
        <div className="home-hero__copy">
          <h1 className="text-display">2026 NEW SEASON COLLECTION</h1>
          <p className="text-body-lg">댄디하고 심플한 무드의 새로운 시작</p>
          <HeroPillButton>쇼핑하기</HeroPillButton>
        </div>
      </section>

      <section className="page-section">
        <div className="home-category-tiles">
          <CategoryCard to="/men" label="MEN" />
          <CategoryCard to="/women" label="WOMEN" />
        </div>
      </section>

      <section className="page-section">
        <div className="home-editorial">
          <div className="home-editorial__overlay" />
          <div className="home-editorial__caption">
            <h2 className="text-h2">THE ESSENTIAL LAYER</h2>
            <p className="text-body-sm">겨울을 준비하는 첫 번째 아우터</p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-section__header">
          <h2 className="text-h2">NEW ARRIVAL</h2>
          <Link to="/men" className="text-body-sm">더보기 +</Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
