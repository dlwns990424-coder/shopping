import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

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
  return (
    <div>
      <section className="relative -mt-64 flex h-screen items-end overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 gap-[2px]">
          <div className="bg-line" />
          <div className="bg-disabled" />
          <div className="bg-line" />
        </div>
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 px-24 py-32 text-surface lg:p-64">
          <p className="text-caption mb-8 tracking-[0.08em] text-surface">T&amp;L</p>
          <h1 className="text-h1 text-surface">계절을 입다, 데일리를 완성하다</h1>
        </div>
      </section>

      <section className="mt-20 px-24 md:px-48 lg:px-80">
        <div className="relative flex h-screen items-end overflow-hidden rounded-none bg-secondary">
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative z-10 p-32">
            <h2 className="text-h2 text-surface">NEW SEASON LAYER</h2>
            <p className="text-body-sm text-surface">이번 시즌 놓치면 안될 아이템을 만나보세요</p>
          </div>
        </div>
      </section>

      <section className="mt-20 px-24 md:px-48 lg:px-80">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          <Link to="/men" className="group relative flex h-screen items-end overflow-hidden rounded-none bg-secondary">
            <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
            <div className="relative z-10 p-32 text-surface">
              <h2 className="text-h1 mb-8 text-surface">MEN</h2>
              <p className="text-body-sm mb-16 text-surface">댄디하고 심플한 무드의 새 시즌 컬렉션</p>
              <span className="text-button border-b border-surface pb-2 text-surface">SHOP MEN&apos;S</span>
            </div>
          </Link>
          <Link
            to="/women"
            className="group relative flex h-screen items-end overflow-hidden rounded-none bg-secondary"
          >
            <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
            <div className="relative z-10 p-32 text-surface">
              <h2 className="text-h1 mb-8 text-surface">WOMEN</h2>
              <p className="text-body-sm mb-16 text-surface">세련되고 감각적인 무드의 새 시즌 컬렉션</p>
              <span className="text-button border-b border-surface pb-2 text-surface">SHOP WOMEN&apos;S</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="mt-20 px-24 pb-20 md:px-48 lg:px-80">
        <div className="grid grid-cols-2 gap-0 lg:grid-cols-4">
          {EVENT_BANNERS.map((banner) => (
            <Link
              key={banner.id}
              to={banner.to}
              className="group relative flex aspect-[2/3] items-end overflow-hidden rounded-none bg-secondary"
            >
              <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
              <div className="relative z-10 flex flex-col gap-8 p-20 text-surface">
                <p className="text-h3 text-surface">{banner.label}</p>
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
