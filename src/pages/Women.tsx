import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CategoryCard from '../components/CategoryCard'
import ProductCarousel from '../components/ProductCarousel'
import CategoryListing from '../components/CategoryListing'
import { useProducts } from '../context/ProductsContext'
import { useContent } from '../context/ContentContext'
import { womenCategories } from '../mock/categories'

function Women() {
  const [searchParams] = useSearchParams()
  const { products } = useProducts()
  const { content } = useContent()
  const categoryParam = searchParams.get('category')
  const womenProducts = products.filter((product) => product.gender === 'women')

  if (categoryParam) {
    return (
      <CategoryListing
        basePath="/women"
        products={products}
        defaultGender="women"
        categoryParam={categoryParam}
      />
    )
  }

  const featuredProducts = womenProducts
    .filter((product) => product.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))

  return (
    <div>
      <Helmet>
        <title>NOVERA | WOMEN</title>
      </Helmet>

      <section className="relative -mt-64 flex h-[60vh] items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${
              content['women.hero.image'] ||
              'https://res.cloudinary.com/reformation/image/upload/c_scale,w_3840,w_2000/v1/home%20banner%202025/craftcore_des?_i=AH'
            })`,
          }}
        />
        <div className="relative z-10 px-24 pt-32 pb-48 text-surface md:px-32 lg:px-40">
          <h1 className="text-h1 text-surface">
            {content['women.hero.title'] ?? '세련되고 감각적인 무드의 새 시즌 컬렉션'}
          </h1>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mt-20 px-24 md:px-32 lg:px-40">
          <ProductCarousel products={featuredProducts} />
        </section>
      )}

      <section className="mt-20 px-24 pb-20 md:px-32 lg:px-40">
        <div className="page-section__header">
          <h2 className="text-base font-bold">SHOP BY CATEGORY</h2>
        </div>
        <div className="category-grid">
          {womenCategories.map((category) => (
            <CategoryCard
              key={category.id}
              to={category.to}
              label={category.label}
              image={category.image}
              imageFit={category.imageFit}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Women
