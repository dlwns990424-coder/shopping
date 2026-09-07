import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight } from 'lucide-react'
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

  return (
    <div>
      <Helmet>
        <title>T&amp;L</title>
      </Helmet>

      <section className="relative -mt-64 flex h-screen items-end overflow-hidden">
        {content['home.hero.image'] ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${content['home.hero.image']})` }}
          />
        ) : (
          <div className="absolute inset-0 grid grid-cols-3 gap-[2px]">
            <div className="bg-line" />
            <div className="bg-disabled" />
            <div className="bg-line" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 px-24 py-32 text-surface lg:p-64">
          <p className="text-caption mb-8 tracking-[0.08em] text-surface">
            {content['home.hero.eyebrow'] ?? 'T&L'}
          </p>
          <h1 className="text-h1 text-surface">
            {content['home.hero.title'] ?? '계절을 입다, 데일리를 완성하다'}
          </h1>
        </div>
      </section>

      <section className="mt-20">
        <div
          className="relative flex h-screen items-end overflow-hidden rounded-none bg-secondary bg-cover bg-center"
          style={
            content['home.season_banner.image']
              ? { backgroundImage: `url(${content['home.season_banner.image']})` }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative z-10 px-24 pt-32 pb-48 md:px-32 lg:px-40">
            <h2 className="text-h2 text-surface">
              {content['home.season_banner.title'] ?? 'NEW SEASON LAYER'}
            </h2>
            <p className="text-body-sm text-surface">
              {content['home.season_banner.subtitle'] ?? '이번 시즌 놓치면 안될 아이템을 만나보세요'}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          <Link
            to="/men"
            className="group relative flex h-screen items-end overflow-hidden rounded-none bg-secondary bg-cover bg-center"
            style={
              content['home.men_banner.image']
                ? { backgroundImage: `url(${content['home.men_banner.image']})` }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
            <div className="relative z-10 px-24 pt-32 pb-48 text-surface md:px-32 lg:px-40">
              <h2 className="text-h1 mb-8 text-surface">MEN</h2>
              <p className="text-body-sm mb-16 text-surface">
                {content['home.men_banner.copy'] ?? '댄디하고 심플한 무드의 새 시즌 컬렉션'}
              </p>
              <span className="text-button border-b border-surface pb-2 text-surface">SHOP MEN&apos;S</span>
            </div>
          </Link>
          <Link
            to="/women"
            className="group relative flex h-screen items-end overflow-hidden rounded-none bg-secondary bg-cover bg-center"
            style={
              content['home.women_banner.image']
                ? { backgroundImage: `url(${content['home.women_banner.image']})` }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
            <div className="relative z-10 px-24 pt-32 pb-48 text-surface md:px-32 lg:px-40">
              <h2 className="text-h1 mb-8 text-surface">WOMEN</h2>
              <p className="text-body-sm mb-16 text-surface">
                {content['home.women_banner.copy'] ?? '세련되고 감각적인 무드의 새 시즌 컬렉션'}
              </p>
              <span className="text-button border-b border-surface pb-2 text-surface">SHOP WOMEN&apos;S</span>
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
              <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
              <div className="relative z-10 flex flex-col gap-8 px-24 pt-32 pb-48 text-surface md:px-32 lg:px-40">
                <p className="text-h3 text-surface">
                  {content[`home.event_banner.${banner.id}.label`] ?? banner.label}
                </p>
                <span className="text-button inline-flex w-fit items-center gap-4 border-b border-surface pb-2 text-surface">
                  이동
                  <ArrowRight size={14} strokeWidth={1.5} />
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
