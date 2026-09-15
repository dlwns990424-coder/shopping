import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CategoryCard from '../components/CategoryCard'
import CategoryListing from '../components/CategoryListing'
import ProductRow from '../components/ProductRow'
import { useProducts } from '../context/ProductsContext'
import { useContent } from '../context/ContentContext'
import { useBestsellers } from '../context/BestsellersContext'
import { womenCategories } from '../mock/categories'
import type { Product } from '../types'

const BESTSELLER_LIMIT = 5
const SALE_LIMIT = 8

function discountRate(product: Product) {
  return product.salePrice != null ? (product.price - product.salePrice) / product.price : 0
}

function Women() {
  const [searchParams] = useSearchParams()
  const { products } = useProducts()
  const { content } = useContent()
  const { bestsellerProductIds } = useBestsellers()
  const categoryParam = searchParams.get('category')

  if (categoryParam) {
    return (
      <CategoryListing basePath="/women" products={products} defaultGender="women" categoryParam={categoryParam} />
    )
  }

  const womenProducts = products.filter((product) => product.gender === 'women')
  const productById = new Map(womenProducts.map((product) => [product.id, product]))
  const bestsellers = bestsellerProductIds
    .map((id) => productById.get(id))
    .filter((product): product is Product => product != null)
    .slice(0, BESTSELLER_LIMIT)
  const saleProducts = [...womenProducts]
    .filter((product) => product.salePrice != null)
    .sort((a, b) => discountRate(b) - discountRate(a))
    .slice(0, SALE_LIMIT)

  const heroFallback =
    'https://res.cloudinary.com/reformation/image/upload/c_scale,w_3840,w_2000/v1/home%20banner%202025/craftcore_des?_i=AH'
  const heroDesktop = content['women.hero.image_desktop'] || heroFallback
  const heroTablet = content['women.hero.image_tablet'] || content['women.hero.image_desktop'] || heroFallback
  const heroMobile = content['women.hero.image_mobile'] || content['women.hero.image_desktop'] || heroFallback

  return (
    <div className="pb-64 md:pb-96 lg:pb-128">
      <Helmet>
        <title>NOVERA | WOMEN</title>
      </Helmet>

      <Link
        to="/women?category=all&sort=new"
        className="relative -mt-48 flex aspect-[3/4] items-end overflow-hidden text-inherit no-underline md:-mt-64 md:aspect-square lg:aspect-auto lg:h-screen"
      >
        <div
          className="absolute inset-0 hidden bg-cover bg-center lg:block"
          style={{ backgroundImage: `url(${heroDesktop})` }}
        />
        <div
          className="absolute inset-0 hidden bg-cover bg-center md:block lg:hidden"
          style={{ backgroundImage: `url(${heroTablet})` }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: `url(${heroMobile})` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
        {/* bottom-[20%]: 완전 중앙정렬 대신 바닥에서 살짝 띄운 위치 — 어떤 히어로 사진이 올라와도
            안전한 하단 그라디언트 스크림은 유지하면서, 텍스트가 가장자리에 눌려있는 느낌만 해소 */}
        <div className="absolute inset-x-0 bottom-[20%] z-10 px-20 text-surface md:px-32 lg:px-40">
          <h1 className="text-[52px] font-normal leading-[1.2] tracking-[-0.02em] text-surface drop-shadow-md">
            {content['women.hero.title'] ?? '세련되고 감각적인 무드의 새 시즌 컬렉션'}
          </h1>
          <p className="mt-12 text-[18px] font-light text-surface drop-shadow-md">
            {content['women.hero.subtitle'] || '이번 시즌 새롭게 만나는 NOVERA의 제안'}
          </p>
        </div>
      </Link>

      <section className="mt-32 px-20 pb-32 md:mt-48 md:px-32 md:pb-48 lg:mt-64 lg:px-40 lg:pb-64">
        <div className="page-section__header">
          <h2 className="text-xl font-bold lg:text-2xl">카테고리</h2>
        </div>
        <div className="category-grid">
          {womenCategories.map((category) => (
            <CategoryCard
              key={category.id}
              to={category.to}
              label={content[`women.category_${category.id}.label`] ?? category.label}
              image={content[`women.category_${category.id}.image`] || category.image}
              imageFit={category.imageFit}
            />
          ))}
        </div>
      </section>

      <ProductRow title="베스트" moreHref="/women?category=all&sort=best" products={bestsellers} showRank />

      <ProductRow title="할인상품" moreHref="/women?category=all&sale=true" products={saleProducts} />
    </div>
  )
}

export default Women
