import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CategoryCard from '../components/CategoryCard'
import ProductCarousel from '../components/ProductCarousel'
import CategoryListing from '../components/CategoryListing'
import { useProducts } from '../context/ProductsContext'
import { useContent } from '../context/ContentContext'
import { menCategories } from '../mock/categories'

function Men() {
  const [searchParams] = useSearchParams()
  const { products } = useProducts()
  const { content } = useContent()
  const categoryParam = searchParams.get('category')
  const menProducts = products.filter((product) => product.gender === 'men')

  if (categoryParam) {
    return (
      <CategoryListing
        basePath="/men"
        products={products}
        defaultGender="men"
        categoryParam={categoryParam}
      />
    )
  }

  const featuredProducts = menProducts
    .filter((product) => product.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))

  const heroDesktop = content['men.hero.image_desktop']
  const heroMobile = content['men.hero.image_mobile'] || heroDesktop

  return (
    <div>
      <Helmet>
        <title>NOVERA | MEN</title>
      </Helmet>

      <section className="relative -mt-64 flex h-[60vh] items-end overflow-hidden">
        {heroDesktop || heroMobile ? (
          <>
            <div
              className="absolute inset-0 hidden bg-cover bg-center lg:block"
              style={heroDesktop ? { backgroundImage: `url(${heroDesktop})` } : undefined}
            />
            <div
              className="absolute inset-0 bg-cover bg-center lg:hidden"
              style={heroMobile ? { backgroundImage: `url(${heroMobile})` } : undefined}
            />
          </>
        ) : (
          <div className="absolute inset-0 grid grid-cols-3 gap-[2px]">
            <div className="bg-line" />
            <div className="bg-disabled" />
            <div className="bg-line" />
          </div>
        )}
        <div className="relative z-10 px-24 pt-32 pb-48 text-surface md:px-32 lg:px-40">
          <h1 className="text-h1 text-surface">
            {content['men.hero.title'] ?? '댄디하고 심플한 무드의 새 시즌 컬렉션'}
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
          {menCategories.map((category) => (
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

export default Men
