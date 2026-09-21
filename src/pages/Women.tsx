import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CategoryCarousel from '../components/CategoryCarousel'
import CategoryListing from '../components/CategoryListing'
import ProductRow from '../components/ProductRow'
import EditorialFeature from '../components/EditorialFeature'
import HomeHero from '../components/HomeHero'
import { useProducts } from '../context/ProductsContext'
import { useContent } from '../context/ContentContext'
import { useBestsellers } from '../context/BestsellersContext'
import { womenCategories } from '../mock/categories'
import type { Product } from '../types'
import { buildEditorialLink, type EditorialDestination } from '../utils/editorialLink'
import { OUTLINE_SECTION_BUTTON_CLASS } from '../constants/ui'

const NEW_ARRIVALS_LIMIT = 8
const BESTSELLER_LIMIT = 5

function Women() {
  const [searchParams] = useSearchParams()
  const { products } = useProducts()
  const { content, loading: contentLoading } = useContent()
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

  const legacyEditorialImage = content['women.editorial_sub_banner.sub-1.image'] ?? ''
  const editorial = {
    title:
      content['women.editorial_banner.title'] ||
      content['women.editorial_sub_banner.sub-1.title'] ||
      'THE NEW TAILORING',
    subtitle:
      content['women.editorial_banner.subtitle'] ?? content['women.editorial_sub_banner.sub-1.subtitle'] ?? '',
    buttonLabel: content['women.editorial_banner.button_label'] || '컬렉션 보기',
    destination: (content['women.editorial_banner.link_destination'] as EditorialDestination | undefined) ?? 'women',
    category: content['women.editorial_banner.link_category'] || 'all',
    subcategory: content['women.editorial_banner.link_subcategory'] ?? '',
    enabled:
      content['women.editorial_banner.enabled'] == null
        ? Boolean(legacyEditorialImage)
        : content['women.editorial_banner.enabled'] === 'true',
    imageMobile: content['women.editorial_banner.image_mobile'] || legacyEditorialImage,
    imageTablet: content['women.editorial_banner.image_tablet'] || legacyEditorialImage,
    imageDesktop: content['women.editorial_banner.image_desktop'] || legacyEditorialImage,
  }

  const womenCategoriesWithContent = womenCategories.map((category) => ({
    ...category,
    label: content[`women.category_${category.id}.label`] ?? category.label,
    image: content[`women.category_${category.id}.image`] || category.image,
  }))

  const heroLink = buildEditorialLink({
    destination: (content['women.hero.link_destination'] as EditorialDestination | undefined) ?? 'women',
    category: content['women.hero.link_category'] || 'all',
    subcategory: content['women.hero.link_subcategory'] ?? '',
  })

  return (
    <div className="pb-124 md:pb-96 lg:pb-128">
      <Helmet>
        <title>NOVERA | WOMEN</title>
      </Helmet>

      <HomeHero
        to={heroLink}
        imageMobile={content['women.hero.image_mobile'] ?? ''}
        imageTablet={content['women.hero.image_tablet'] ?? ''}
        imageDesktop={content['women.hero.image_desktop'] ?? ''}
        title={content['women.hero.title'] ?? '세련되고 감각적인 무드의 새 시즌 컬렉션'}
        subtitle={content['women.hero.subtitle'] || '이번 시즌 새롭게 만나는 NOVERA의 제안'}
        loading={contentLoading}
      />

      <section className="mt-64 px-20 md:mt-96 md:px-32 lg:mt-128 lg:px-80 xl:px-140 2xl:px-200">
        <div className="mx-auto max-w-1600">
          <CategoryCarousel categories={womenCategoriesWithContent} />
        </div>
        <div className="mt-32 flex justify-center">
          <Link
            to="/women?category=all"
            className={OUTLINE_SECTION_BUTTON_CLASS}
          >
            전체상품 보기
          </Link>
        </div>
      </section>

      <ProductRow title="NEW ARRIVALS" products={newArrivals} featuredHeading />

      <EditorialFeature
        imageMobile={editorial.imageMobile}
        imageTablet={editorial.imageTablet}
        imageDesktop={editorial.imageDesktop}
        title={editorial.title}
        subtitle={editorial.subtitle}
        buttonLabel={editorial.buttonLabel}
        enabled={editorial.enabled}
        to={buildEditorialLink(editorial)}
      />

      <ProductRow
        title="BEST SELLERS"
        moreHref="/women?category=all&sort=best"
        products={bestsellers}
        featuredHeading
      />

    </div>
  )
}

export default Women
