import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useContent } from '../context/ContentContext'

// 라벨/이미지/성별/카테고리/서브카테고리/노출순서는 전부 관리자 페이지
// (EventBannerManager)에서 site_content로 관리됨 — 여기엔 4개 슬롯의 id만 고정.
const EVENT_BANNER_IDS = ['men-outer', 'women-knit', 'men-denim', 'women-shirt']

function eventBannerUrl(gender: string, category: string, sub: string) {
  const params = new URLSearchParams({ category: category || 'all' })
  if (sub) params.set('sub', sub)
  return `/${gender}?${params.toString()}`
}

function Home() {
  const { content } = useContent()

  const heroDesktop = content['home.hero.image_desktop']
  const heroMobile = content['home.hero.image_mobile'] || heroDesktop
  const menBannerDesktop = content['home.men_banner.image_desktop']
  const menBannerMobile = content['home.men_banner.image_mobile'] || menBannerDesktop
  const womenBannerDesktop = content['home.women_banner.image_desktop']
  const womenBannerMobile = content['home.women_banner.image_mobile'] || womenBannerDesktop

  const eventBanners = EVENT_BANNER_IDS.map((id) => ({
    id,
    label: content[`home.event_banner.${id}.label`] ?? '',
    image: content[`home.event_banner.${id}.image`] ?? '',
    gender: content[`home.event_banner.${id}.gender`] || 'men',
    category: content[`home.event_banner.${id}.category`] || 'all',
    sub: content[`home.event_banner.${id}.sub`] ?? '',
    order: Number(content[`home.event_banner.${id}.order`]) || 0,
  })).sort((a, b) => a.order - b.order)

  return (
    <div>
      <Helmet>
        <title>NOVERA</title>
      </Helmet>

      <section className="relative -mt-64 flex h-screen items-end overflow-hidden">
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
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
        <div className="relative z-10 px-24 py-32 text-surface lg:p-64">
          <h1 className="text-h1 text-[40px] font-medium text-[#fff] drop-shadow-md lg:text-[50px]">
            {content['home.hero.title'] ?? '계절을 입다, 데일리를 완성하다'}
          </h1>
        </div>
      </section>

      <section className="mt-20">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          <Link
            to="/men"
            className="group relative flex h-screen items-end overflow-hidden rounded-none bg-secondary"
          >
            <div
              className="absolute inset-0 hidden bg-cover bg-center lg:block"
              style={menBannerDesktop ? { backgroundImage: `url(${menBannerDesktop})` } : undefined}
            />
            <div
              className="absolute inset-0 bg-cover bg-center lg:hidden"
              style={menBannerMobile ? { backgroundImage: `url(${menBannerMobile})` } : undefined}
            />
            <div className="relative z-10 px-24 pt-32 pb-48 text-surface md:px-32 lg:px-40">
              <h2 className="text-h1 mb-8 text-surface">MEN</h2>
              <p className="text-body-sm mb-16 text-surface">
                {content['home.men_banner.copy'] ?? '댄디하고 심플한 무드의 새 시즌 컬렉션'}
              </p>
              <span className="text-button border-b border-surface pb-2 text-surface group-hover:text-point">
                SHOP MEN&apos;S
              </span>
            </div>
          </Link>
          <Link
            to="/women"
            className="group relative flex h-screen items-end overflow-hidden rounded-none bg-secondary"
          >
            <div
              className="absolute inset-0 hidden bg-cover bg-center lg:block"
              style={womenBannerDesktop ? { backgroundImage: `url(${womenBannerDesktop})` } : undefined}
            />
            <div
              className="absolute inset-0 bg-cover bg-center lg:hidden"
              style={womenBannerMobile ? { backgroundImage: `url(${womenBannerMobile})` } : undefined}
            />
            <div className="relative z-10 px-24 pt-32 pb-48 text-surface md:px-32 lg:px-40">
              <h2 className="text-h1 mb-8 text-surface">WOMEN</h2>
              <p className="text-body-sm mb-16 text-surface">
                {content['home.women_banner.copy'] ?? '세련되고 감각적인 무드의 새 시즌 컬렉션'}
              </p>
              <span className="text-button border-b border-surface pb-2 text-surface group-hover:text-point">
                SHOP WOMEN&apos;S
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="mt-20 pb-20">
        <div className="grid grid-cols-2 gap-0 lg:grid-cols-4">
          {eventBanners.map((banner) => (
            <Link
              key={banner.id}
              to={eventBannerUrl(banner.gender, banner.category, banner.sub)}
              className="group relative flex aspect-[2/3] items-end overflow-hidden rounded-none bg-secondary bg-cover bg-center"
              style={banner.image ? { backgroundImage: `url(${banner.image})` } : undefined}
            >
              <div className="relative z-10 flex flex-col gap-8 px-24 pt-32 pb-48 text-surface md:px-32 lg:px-40">
                <p className="text-h3 text-surface">{banner.label}</p>
                <span className="text-button w-fit border-b border-surface pb-2 text-surface group-hover:text-point">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
