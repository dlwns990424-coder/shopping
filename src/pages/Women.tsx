import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CategoryCarousel from '../components/CategoryCarousel'
import CategoryListing from '../components/CategoryListing'
import ProductRow from '../components/ProductRow'
import EditorialSubBanners from '../components/EditorialSubBanners'
import { useProducts } from '../context/ProductsContext'
import { useContent } from '../context/ContentContext'
import { useBestsellers } from '../context/BestsellersContext'
import { womenCategories } from '../mock/categories'
import type { Product } from '../types'

const NEW_ARRIVALS_LIMIT = 8
const BESTSELLER_LIMIT = 5

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
  const newArrivals = [...womenProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, NEW_ARRIVALS_LIMIT)
  const bestsellers = bestsellerProductIds
    .map((id) => productById.get(id))
    .filter((product): product is Product => product != null)
    .slice(0, BESTSELLER_LIMIT)

  const heroImage = content['women.hero.image_mobile']

  const editorialBanners = ['sub-1', 'sub-2', 'sub-3'].map((id) => ({
    id: `women-${id}`,
    title: content[`women.editorial_sub_banner.${id}.title`] ?? '',
    subtitle: content[`women.editorial_sub_banner.${id}.subtitle`] ?? '',
    image: content[`women.editorial_sub_banner.${id}.image`] ?? '',
    to: '/women?category=all',
  }))

  const womenCategoriesWithContent = womenCategories.map((category) => ({
    ...category,
    label: content[`women.category_${category.id}.label`] ?? category.label,
    image: content[`women.category_${category.id}.image`] || category.image,
  }))

  return (
    <div className="pb-124 md:pb-96 lg:pb-128">
      <Helmet>
        <title>NOVERA | WOMEN</title>
      </Helmet>

      {/* 히어로: 이미지 1장 + 하단 텍스트, 모바일~데스크톱 공용 */}
      <Link
        to="/women?category=all&sort=new"
        className="relative flex aspect-[3/4] items-end overflow-hidden text-inherit no-underline md:-mt-64 md:aspect-square lg:aspect-auto lg:h-screen"
      >
        {heroImage ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        ) : (
          <div className="absolute inset-0 grid grid-cols-3 gap-[2px]">
            <div className="bg-line" />
            <div className="bg-disabled" />
            <div className="bg-line" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-[20%] z-10 px-20 text-surface md:px-32 lg:px-80 xl:px-140 2xl:px-200">
          <h1 className="text-[32px] font-normal leading-[1.2] tracking-[-0.02em] text-surface drop-shadow-md md:text-[38px] lg:text-[44px]">
            {content['women.hero.title'] ?? '세련되고 감각적인 무드의 새 시즌 컬렉션'}
          </h1>
          <p className="mt-12 text-[18px] font-light text-surface drop-shadow-md">
            {content['women.hero.subtitle'] || '이번 시즌 새롭게 만나는 NOVERA의 제안'}
          </p>
        </div>
      </Link>

      <section className="mt-64 px-20 pb-32 md:mt-96 md:px-32 md:pb-48 lg:mt-128 lg:px-80 lg:pb-64 xl:px-140 2xl:px-200">
        <div className="mx-auto max-w-1600">
          <CategoryCarousel categories={womenCategoriesWithContent} />
        </div>
        <div className="mt-32 flex justify-center">
          <Link
            to="/women?category=all"
            className="inline-flex h-[42px] items-center justify-center rounded-sm border border-primary bg-transparent px-24 text-[14px] text-primary no-underline transition-colors hover:bg-surface-muted active:scale-[0.98] md:h-[44px] md:w-[260px]"
          >
            전체 제품 보기
          </Link>
        </div>
      </section>

      <section className="mt-64 px-20 md:mt-96 md:px-32 lg:mt-128 lg:px-80 xl:px-140 2xl:px-200">
        <div className="mx-auto max-w-1600">
          <EditorialSubBanners banners={editorialBanners} />
        </div>
      </section>

      <ProductRow title="신상품이 입고되었어요" products={newArrivals} featuredHeading />

      <ProductRow
        title="베스트 상품을 확인해보세요"
        moreHref="/women?category=all&sort=best"
        products={bestsellers}
        featuredHeading
      />

    </div>
  )
}

export default Women
