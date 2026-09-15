import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import useEmblaCarousel from 'embla-carousel-react'
import { useContent } from '../context/ContentContext'

// 라벨/이미지/성별/카테고리/서브카테고리/노출순서는 전부 관리자 페이지
// (EventBannerManager)에서 site_content로 관리됨 — 여기엔 4개 슬롯의 id만 고정.
const EVENT_BANNER_IDS = ['men-outer', 'women-knit', 'men-denim', 'women-shirt']

function eventBannerUrl(gender: string, category: string, sub: string) {
  const params = new URLSearchParams({ category: category || 'all' })
  if (sub) params.set('sub', sub)
  return `/${gender}?${params.toString()}`
}

interface EventBanner {
  id: string
  label: string
  image: string
  gender: string
  category: string
  sub: string
}

function EventBannerCard({ banner }: { banner: EventBanner }) {
  return (
    <Link
      to={eventBannerUrl(banner.gender, banner.category, banner.sub)}
      className="group relative flex aspect-[2/3] items-end overflow-hidden rounded-none bg-secondary bg-cover bg-center"
      style={banner.image ? { backgroundImage: `url(${banner.image})` } : undefined}
    >
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
      <div className="relative z-10 flex flex-col gap-8 px-16 pt-16 pb-20 text-surface md:px-32 md:pt-32 md:pb-48 lg:px-40">
        <p className="text-[20px] font-medium leading-[1.3] text-surface md:text-[28px]">{banner.label}</p>
        <span className="w-fit text-sm font-normal text-surface underline [text-underline-offset:6px] transition-colors duration-300 lg:text-base lg:group-hover:text-surface/70">
          SHOP NOW
        </span>
      </div>
    </Link>
  )
}

function Home() {
  const { content } = useContent()
  const [eventEmblaRef] = useEmblaCarousel({
    align: 'center',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    skipSnaps: true,
  })

  // 태블릿(md)+데스크톱(lg)은 아래 신규 레이어 히어로(home.hero_layered.*)로 대체됨 —
  // home.hero.image_desktop/image_tablet은 더는 안 쓰지만, 관리자 화면에는 아직 남아있음(정리는 별도).
  const heroMobile = content['home.hero.image_mobile']

  const heroLayeredBg = content['home.hero_layered.bg_image']
  const heroLayeredCard = content['home.hero_layered.card_image']
  const heroLayeredLeftModel = content['home.hero_layered.left_model']
  const heroLayeredRightModel = content['home.hero_layered.right_model']
  const heroLayeredSeasonLabel = content['home.hero_layered.season_label'] || '2026 가을 컬렉션'
  const menBannerDesktop = content['home.men_banner.image_desktop']
  const menBannerMobile = content['home.men_banner.image_mobile'] || menBannerDesktop
  const womenBannerDesktop = content['home.women_banner.image_desktop']
  const womenBannerMobile = content['home.women_banner.image_mobile'] || womenBannerDesktop

  const impactTitle = content['home.impact_banner.title'] || '이번 시즌 놓치지 말아야 할 이벤트'
  const impactDescription =
    content['home.impact_banner.description'] || '지금 만나는 NOVERA의 특별한 시즌 프로모션'
  const impactImageDesktop = content['home.impact_banner.image_desktop']
  const impactImageMobile = content['home.impact_banner.image_mobile'] || impactImageDesktop
  const impactGender = content['home.impact_banner.gender'] || 'men'
  const impactCategory = content['home.impact_banner.category'] || 'all'
  const impactSub = content['home.impact_banner.sub'] ?? ''
  const impactBannerUrl = `${eventBannerUrl(impactGender, impactCategory, impactSub)}&banner=impact`

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

      {/* 모바일 전용(md 미만): 기존 배경 1장 + 하단 텍스트 히어로 */}
      <Link
        to="/campaign/home"
        className="relative -mt-48 flex aspect-[3/4] items-end overflow-hidden text-inherit no-underline md:hidden"
      >
        {heroMobile ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroMobile})` }} />
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
        <div className="absolute inset-x-0 bottom-[20%] z-10 px-20 text-surface">
          <h1 className="text-[52px] font-medium leading-[1.2] tracking-[-0.02em] text-[#fff] drop-shadow-md">
            {content['home.hero.title'] ?? '계절을 입다, 데일리를 완성하다'}
          </h1>
          <p className="mt-12 text-[18px] text-[#fff] drop-shadow-md">
            {content['home.hero.subtitle'] || '지금, NOVERA에서 새로운 시즌을 시작하세요'}
          </p>
        </div>
      </Link>

      {/* 태블릿+데스크톱(md 이상): 배경 위에 가운데 카드(카드용 사진 + 텍스트) + 좌우 누끼 인물.
          카드는 화면 중앙에 폭 고정 상한(max-w-1500)으로 떠 있고, 인물은 화면 가장자리에
          h+w 둘 다 상한을 걸어서(object-contain이 더 타이트한 쪽에 맞춤) 배치 — 세로가 긴
          화면(포트레이트 태블릿)에서도 폭이 카드를 과하게 침범 안 하고, 가로가 짧은 화면에서도
          인물이 작아지지 않게 함. object-position을 카드 쪽(안쪽)으로 줘서, 레터박스 여백이
          생기면 화면 바깥쪽에 생기고 인물은 항상 카드 쪽으로 최대한 붙게 함. */}
      <div className="relative hidden overflow-hidden md:-mt-64 md:block md:h-screen">
        {/* -inset-[2%] + scale로 아주 살짝 키워서, 옅은 블러가 레이어 가장자리를 노출하지 않게 함 */}
        <div
          className="absolute -inset-[2%] scale-105 bg-cover bg-center blur-[2px]"
          style={
            heroLayeredBg
              ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${heroLayeredBg})` }
              : undefined
          }
        />

        {heroLayeredRightModel && (
          <img
            src={heroLayeredRightModel}
            alt=""
            className="pointer-events-none absolute bottom-[-50%] left-[calc(50%-min(39%,550px))] z-20 h-[150%] -translate-x-1/2 object-contain object-bottom"
          />
        )}
        {heroLayeredLeftModel && (
          <img
            src={heroLayeredLeftModel}
            alt=""
            className="pointer-events-none absolute bottom-[-50%] left-[calc(50%+min(39%,550px))] z-20 h-[150%] -translate-x-1/2 object-contain object-bottom"
          />
        )}

        <div className="absolute left-1/2 top-1/2 z-10 h-[70%] w-[78%] max-w-1100 -translate-x-1/2 -translate-y-1/2 rounded-sm shadow-lg">
          <Link
            to="/campaign/home"
            className="relative block h-full w-full overflow-hidden rounded-sm text-inherit no-underline"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={heroLayeredCard ? { backgroundImage: `url(${heroLayeredCard})` } : undefined}
            />
            <div className="relative flex h-full flex-col items-center justify-center gap-4 px-16 text-center text-surface">
              <img
                src="/images/brand/novera-wordmark-light.png"
                alt="NOVERA"
                className="-mb-16 h-128 w-auto brightness-0 invert drop-shadow-md md:h-176"
              />
              <div className="flex flex-col items-center gap-12">
                <p className="text-2xl font-normal tracking-[-0.02em] text-surface drop-shadow-md lg:text-3xl">
                  {heroLayeredSeasonLabel}
                </p>
                <span className="text-base font-normal text-surface underline [text-underline-offset:6px] drop-shadow-md">
                  둘러보기
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <section className="mt-40 md:mt-48 lg:mt-64">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          <Link
            to="/men"
            className="group relative flex aspect-[4/5] items-end rounded-none bg-secondary lg:aspect-auto lg:h-screen"
          >
            <div
              className="absolute inset-0 hidden bg-cover bg-center lg:block"
              style={menBannerDesktop ? { backgroundImage: `url(${menBannerDesktop})` } : undefined}
            />
            <div
              className="absolute inset-0 bg-cover bg-center lg:hidden"
              style={menBannerMobile ? { backgroundImage: `url(${menBannerMobile})` } : undefined}
            />
            <div className="relative z-10 w-full lg:sticky lg:bottom-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="relative px-20 pt-64 pb-48 text-surface md:px-32 lg:px-40">
                <h2 className="mb-16 text-[48px] font-normal leading-[1.3] tracking-[-0.02em] text-surface">MEN</h2>
                <span className="text-base font-normal text-surface underline [text-underline-offset:6px] transition-colors duration-300 lg:group-hover:text-surface/70">
                  SHOP MEN&apos;S
                </span>
              </div>
            </div>
          </Link>
          <Link
            to="/women"
            className="group relative flex aspect-[4/5] items-end rounded-none bg-secondary lg:aspect-auto lg:h-screen"
          >
            <div
              className="absolute inset-0 hidden bg-cover bg-center lg:block"
              style={womenBannerDesktop ? { backgroundImage: `url(${womenBannerDesktop})` } : undefined}
            />
            <div
              className="absolute inset-0 bg-cover bg-center lg:hidden"
              style={womenBannerMobile ? { backgroundImage: `url(${womenBannerMobile})` } : undefined}
            />
            <div className="relative z-10 w-full lg:sticky lg:bottom-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="relative px-20 pt-64 pb-48 text-surface md:px-32 lg:px-40">
                <h2 className="mb-16 text-[48px] font-normal leading-[1.3] tracking-[-0.02em] text-surface">WOMEN</h2>
                <span className="text-base font-normal text-surface underline [text-underline-offset:6px] transition-colors duration-300 lg:group-hover:text-surface/70">
                  SHOP WOMEN&apos;S
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="mt-40 md:mt-48 lg:mt-64">
        <Link
          to={impactBannerUrl}
          className="group relative flex aspect-[4/5] items-end rounded-none bg-secondary lg:aspect-[21/9]"
        >
          <div
            className="absolute inset-0 hidden bg-cover bg-center lg:block"
            style={impactImageDesktop ? { backgroundImage: `url(${impactImageDesktop})` } : undefined}
          />
          <div
            className="absolute inset-0 bg-cover bg-center lg:hidden"
            style={impactImageMobile ? { backgroundImage: `url(${impactImageMobile})` } : undefined}
          />
          <div className="relative z-10 w-full lg:sticky lg:bottom-0">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="relative px-20 pb-32 pt-64 text-surface md:px-32 lg:px-40 lg:pb-48">
              <h2 className="text-4xl font-normal leading-[1.3] tracking-[-0.02em] text-surface lg:text-5xl">
                {impactTitle}
              </h2>
              <p className="mb-16 mt-8 text-[24px] text-surface">{impactDescription}</p>
              <span className="text-base font-normal text-surface underline [text-underline-offset:6px] transition-colors duration-300 lg:group-hover:text-surface/70">
                SHOP NOW
              </span>
            </div>
          </div>
        </Link>
      </section>

      <section className="mt-40 pb-32 md:mt-48 md:pb-48 lg:mt-64 lg:pb-64">
        {/* 모바일: EditorialSubBanners와 동일하게 1.3개씩 보이는 스와이프 캐러셀(버튼 없이 터치 드래그만) */}
        <div className="overflow-hidden touch-pan-y px-20 md:hidden" ref={eventEmblaRef}>
          <div className="-ml-20 flex">
            {eventBanners.map((banner) => (
              <div key={banner.id} className="min-w-0 flex-[0_0_77%] pl-20">
                <EventBannerCard banner={banner} />
              </div>
            ))}
          </div>
        </div>

        {/* 태블릿+데스크톱: 기존 4열 그리드 */}
        <div className="hidden md:grid md:grid-cols-4 md:gap-0">
          {eventBanners.map((banner) => (
            <EventBannerCard key={banner.id} banner={banner} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
