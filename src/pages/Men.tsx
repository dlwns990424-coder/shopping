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
import { menCategories } from '../mock/categories'
import type { Product } from '../types'

const NEW_ARRIVALS_LIMIT = 8
const BESTSELLER_LIMIT = 5

function Men() {
  const [searchParams] = useSearchParams()
  const { products } = useProducts()
  const { content, loading: contentLoading } = useContent()
  const { bestsellerProductIds } = useBestsellers()
  const categoryParam = searchParams.get('category')

  if (categoryParam) {
    return <CategoryListing basePath="/men" products={products} defaultGender="men" categoryParam={categoryParam} />
  }

  const menProducts = products.filter((product) => product.gender === 'men')
  const productById = new Map(menProducts.map((product) => [product.id, product]))
  const newArrivals = [...menProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, NEW_ARRIVALS_LIMIT)
  const bestsellers = bestsellerProductIds
    .map((id) => productById.get(id))
    .filter((product): product is Product => product != null)
    .slice(0, BESTSELLER_LIMIT)

  const heroImage = content['men.hero.image_mobile']

  const editorial = {
    title: content['men.editorial_sub_banner.sub-1.title'] || 'THE NEW TAILORING',
    image: content['men.editorial_sub_banner.sub-1.image'] ?? '',
  }

  const menCategoriesWithContent = menCategories.map((category) => ({
    ...category,
    label: content[`men.category_${category.id}.label`] ?? category.label,
    image: content[`men.category_${category.id}.image`] || category.image,
  }))

  return (
    <div className="pb-124 md:pb-96 lg:pb-128">
      <Helmet>
        <title>NOVERA | MEN</title>
      </Helmet>

      <HomeHero
        to="/men?category=all&sort=new"
        image={heroImage}
        title={content['men.hero.title'] ?? '댄디하고 심플한 무드의 새 시즌 컬렉션'}
        subtitle={content['men.hero.subtitle'] || '이번 시즌 새롭게 만나는 NOVERA의 제안'}
        loading={contentLoading}
      />

      <section className="mt-64 px-20 pb-32 md:mt-96 md:px-32 md:pb-48 lg:mt-128 lg:px-80 lg:pb-64 xl:px-140 2xl:px-200">
        <div className="mx-auto max-w-1600">
          <CategoryCarousel categories={menCategoriesWithContent} />
        </div>
        <div className="mt-32 flex justify-center">
          <Link
            to="/men?category=all"
            className="inline-flex h-[42px] items-center justify-center rounded-sm border border-primary bg-transparent px-24 text-[14px] text-primary no-underline transition-colors hover:bg-surface-muted active:scale-[0.98] md:h-[44px] md:w-[260px]"
          >
            전체 제품 보기
          </Link>
        </div>
      </section>

      <ProductRow title="NEW ARRIVALS" products={newArrivals} featuredHeading />

      <EditorialFeature
        image={editorial.image}
        title={editorial.title}
        to="/men?category=all"
      />

      <ProductRow
        title="MOST LOVED"
        moreHref="/men?category=all&sort=best"
        products={bestsellers}
        featuredHeading
      />

    </div>
  )
}

export default Men
