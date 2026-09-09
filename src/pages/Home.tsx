import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useContent } from '../context/ContentContext'

interface EventBanner {
  id: string
  label: string
  to: string
}

const EVENT_BANNERS: EventBanner[] = [
  { id: 'men-outer', label: '가을 아우터', to: '/men?category=아우터' },
  { id: 'women-knit', label: '니트 · 스웨트', to: '/women?category=상의&sub=니트·스웨트' },
  { id: 'men-denim', label: '데님 컬렉션', to: '/men?category=하의&sub=데님' },
  { id: 'women-shirt', label: '셔츠 & 블라우스', to: '/women?category=상의&sub=셔츠' },
]

function Home() {
  const { content } = useContent()

  const heroDesktop = content['home.hero.image_desktop']
  const heroMobile = content['home.hero.image_mobile'] || heroDesktop
  const menBannerDesktop = content['home.men_banner.image_desktop']
  const menBannerMobile = content['home.men_banner.image_mobile'] || menBannerDesktop
  const womenBannerDesktop = content['home.women_banner.image_desktop']
  const womenBannerMobile = content['home.women_banner.image_mobile'] || womenBannerDesktop

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
          {EVENT_BANNERS.map((banner) => (
            <Link
              key={banner.id}
              to={banner.to}
              className="group relative flex aspect-[2/3] items-end overflow-hidden rounded-none bg-secondary bg-cover bg-center"
              style={
                content[`home.event_banner.${banner.id}.image`]
                  ? { backgroundImage: `url(${content[`home.event_banner.${banner.id}.image`]})` }
                  : undefined
              }
            >
              <div className="relative z-10 flex flex-col gap-8 px-24 pt-32 pb-48 text-surface md:px-32 lg:px-40">
                <p className="text-h3 text-surface">
                  {content[`home.event_banner.${banner.id}.label`] ?? banner.label}
                </p>
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
