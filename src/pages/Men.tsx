import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CategoryCard from '../components/CategoryCard'
import CategoryListing from '../components/CategoryListing'
import EditorialSubBanners from '../components/EditorialSubBanners'
import { useProducts } from '../context/ProductsContext'
import { useContent } from '../context/ContentContext'
import { menCategories } from '../mock/categories'

const EDITORIAL_SUB_BANNER_IDS = ['sub-1', 'sub-2', 'sub-3', 'sub-4']

function editorialBannerUrl(category: string, sub: string) {
  const params = new URLSearchParams({ category: category || 'all' })
  if (sub) params.set('sub', sub)
  return `/men?${params.toString()}`
}

function Men() {
  const [searchParams] = useSearchParams()
  const { products } = useProducts()
  const { content } = useContent()
  const categoryParam = searchParams.get('category')

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

  const heroDesktop = content['men.hero.image_desktop']
  const heroTablet = content['men.hero.image_tablet'] || heroDesktop
  const heroMobile = content['men.hero.image_mobile'] || heroDesktop

  // TEMP: 관리자가 아직 타이틀/서브타이틀을 안 넣어서 레이아웃 확인용 임시 문구 — 실제 값 들어오면 제거
  const editorialTitle = content['men.editorial.title'] || '이번 시즌, 새로운 무드를 제안합니다'
  const editorialSubtitle =
    content['men.editorial.subtitle'] || '폭넓은 스타일을 선보이는 NOVERA의 세계에서 제안하는 시즌별 컬렉션과 엄선된 아이템'
  const editorialImage = content['men.editorial.image']
  const editorialSubBanners = EDITORIAL_SUB_BANNER_IDS.map((id) => ({
    id,
    title: content[`men.editorial_sub_banner.${id}.title`] ?? '',
    subtitle: content[`men.editorial_sub_banner.${id}.subtitle`] ?? '',
    image: content[`men.editorial_sub_banner.${id}.image`] ?? '',
    category: content[`men.editorial_sub_banner.${id}.category`] || 'all',
    sub: content[`men.editorial_sub_banner.${id}.sub`] ?? '',
    order: Number(content[`men.editorial_sub_banner.${id}.order`]) || 0,
  }))
    .sort((a, b) => a.order - b.order)
    .map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      to: editorialBannerUrl(banner.category, banner.sub),
    }))

  return (
    <div>
      <Helmet>
        <title>NOVERA | MEN</title>
      </Helmet>

      <section className="relative -mt-48 flex aspect-[3/4] items-end overflow-hidden md:-mt-64 md:aspect-square lg:aspect-auto lg:h-screen">
        {heroDesktop || heroTablet || heroMobile ? (
          <>
            <div
              className="absolute inset-0 hidden bg-cover bg-center lg:block"
              style={heroDesktop ? { backgroundImage: `url(${heroDesktop})` } : undefined}
            />
            <div
              className="absolute inset-0 hidden bg-cover bg-center md:block lg:hidden"
              style={heroTablet ? { backgroundImage: `url(${heroTablet})` } : undefined}
            />
            <div
              className="absolute inset-0 bg-cover bg-center md:hidden"
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
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
        {/* bottom-[20%]: 완전 중앙정렬 대신 바닥에서 살짝 띄운 위치 — 어떤 히어로 사진이 올라와도
            안전한 하단 그라디언트 스크림은 유지하면서, 텍스트가 가장자리에 눌려있는 느낌만 해소 */}
        <div className="absolute inset-x-0 bottom-[20%] z-10 px-20 text-surface md:px-32 lg:px-40">
          <h1 className="text-[52px] font-medium leading-[1.2] text-surface drop-shadow-md">
            {content['men.hero.title'] ?? '댄디하고 심플한 무드의 새 시즌 컬렉션'}
          </h1>
          <p className="mt-12 text-[18px] text-surface drop-shadow-md">
            {content['men.hero.subtitle'] || '이번 시즌 새롭게 만나는 NOVERA의 제안'}
          </p>
        </div>
      </section>

      <section className="mt-32 px-20 pb-32 md:mt-48 md:px-32 md:pb-48 lg:mt-64 lg:px-40 lg:pb-64">
        <div className="page-section__header">
          <h2 className="text-xl font-bold lg:text-2xl">카테고리</h2>
        </div>
        <div className="category-grid">
          {menCategories.map((category) => (
            <CategoryCard
              key={category.id}
              to={category.to}
              label={content[`men.category_${category.id}.label`] ?? category.label}
              image={content[`men.category_${category.id}.image`] || category.image}
              imageFit={category.imageFit}
            />
          ))}
        </div>
      </section>

      {/* 모바일/태블릿 전용: 타이틀 → 메인 이미지 → 서브배너 순서(데스크톱은 아래 별도 블록) */}
      <section className="mt-32 bg-surface-muted px-20 pb-32 pt-32 md:mt-48 md:px-32 md:pb-48 md:pt-48 lg:hidden">
        <h2 className="text-[40px] font-bold leading-[1.2]">{editorialTitle}</h2>
        <p className="mt-8 text-body-sm text-secondary">{editorialSubtitle}</p>
        <div
          className="mt-16 aspect-[3/4] bg-surface bg-cover bg-center"
          style={editorialImage ? { backgroundImage: `url(${editorialImage})` } : undefined}
        />
        <div className="mt-16">
          <EditorialSubBanners banners={editorialSubBanners} />
        </div>
      </section>

      {/* 데스크톱 전용: 좌(메인 이미지, 풀하이트) / 우(타이틀+서브배너) 5:5.
          min-h로 섹션 기본 높이를 키움 — 우측 컬럼 콘텐츠는 그대로 두고 좌측 이미지만 그 높이만큼 같이 늘어남(items-stretch 기본값) */}
      <section className="hidden bg-surface-muted lg:mt-64 lg:block lg:px-40 lg:pb-64 lg:pt-64">
        <div className="grid grid-cols-2 items-stretch gap-x-64 lg:min-h-720">
          <div
            className="bg-surface bg-cover bg-center"
            style={editorialImage ? { backgroundImage: `url(${editorialImage})` } : undefined}
          />
          <div className="flex h-full flex-col">
            {/* 타이틀을 맨 위(이미지 경계선)에 붙이지 않고, 이 위쪽 빈 공간(경계선~서브배너) 안에서 세로 중앙에 오도록 */}
            <div className="flex flex-1 flex-col justify-center">
              <h2 className="text-[40px] font-bold leading-[1.2]">{editorialTitle}</h2>
              <p className="mt-8 text-body-sm text-secondary">{editorialSubtitle}</p>
            </div>
            <EditorialSubBanners banners={editorialSubBanners} />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Men
