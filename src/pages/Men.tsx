import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
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
        genderLabel="MEN"
        basePath="/men"
        products={menProducts}
        categoryParam={categoryParam}
      />
    )
  }

  const shirtProducts = menProducts.filter((product) => product.subCategory === '셔츠').slice(0, 4)
  const outerProducts = menProducts.filter((product) => product.category === '아우터').slice(0, 4)

  return (
    <div>
      <Helmet>
        <title>T&amp;L | MEN</title>
      </Helmet>

      <section className="relative -mt-64 flex h-screen items-end overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 gap-[2px]">
          <div className="bg-line" />
          <div className="bg-disabled" />
          <div className="bg-line" />
        </div>
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 px-24 pt-32 pb-48 text-surface md:px-32 lg:px-40">
          <p className="text-caption mb-8 tracking-[0.08em] text-surface">
            {content['men.hero.eyebrow'] ?? 'T&L | MEN'}
          </p>
          <h1 className="text-h1 text-surface">
            {content['men.hero.title'] ?? '댄디하고 심플한 무드의 새 시즌 컬렉션'}
          </h1>
        </div>
      </section>

      <section className="mt-20 px-24 md:px-32 lg:px-40">
        <div className="product-grid">
          {shirtProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div
          className="relative flex aspect-[21/8] min-h-280 items-end overflow-hidden rounded-none bg-secondary bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://res.cloudinary.com/reformation/image/upload/c_scale,w_3840,w_1920/v1/home%20banner%202025/9.2%20Sale%20Third%20Banner.desktop?_i=AH)",
          }}
        >
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative z-10 px-24 pt-32 pb-48 md:px-32 lg:px-40">
            <h2 className="text-h2 text-surface">{content['men.sale_banner.title'] ?? "Sale's up to 50% off"}</h2>
          </div>
        </div>
      </section>

      <section className="mt-20 px-24 md:px-32 lg:px-40">
        <div className="product-grid">
          {outerProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      <section className="mt-20 px-24 pb-20 md:px-32 lg:px-40">
        <div className="page-section__header">
          <h2 className="text-base font-bold">SHOP BY CATEGORY</h2>
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
