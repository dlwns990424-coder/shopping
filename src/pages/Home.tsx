import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useContent } from '../context/ContentContext'
import { useProducts } from '../context/ProductsContext'
import { useBestsellers } from '../context/BestsellersContext'
import ProductRow from '../components/ProductRow'
import HomeBanner from '../components/HomeBanner'
import type { Product } from '../types'

const NEW_ARRIVALS_LIMIT = 8
const BESTSELLER_LIMIT = 5
const SALE_LIMIT = 8

function discountRate(product: Product) {
  return product.salePrice != null ? (product.price - product.salePrice) / product.price : 0
}

function Home() {
  const { content } = useContent()
  const { products } = useProducts()
  const { bestsellerProductIds } = useBestsellers()

  // 태블릿(md)+데스크톱(lg)은 아래 신규 레이어 히어로(home.hero_layered.*)로 대체됨 —
  // home.hero.image_desktop/image_tablet은 더는 안 쓰지만, 관리자 화면에는 아직 남아있음(정리는 별도).
  const heroMobile = content['home.hero.image_mobile']

  const heroLayeredBg = content['home.hero_layered.bg_image']
  const heroLayeredCard = content['home.hero_layered.card_image']
  const heroLayeredLeftModel = content['home.hero_layered.left_model']
  const heroLayeredRightModel = content['home.hero_layered.right_model']
  const heroLayeredSeasonLabel = content['home.hero_layered.season_label'] || '2026 가을 컬렉션'

  const saleBannerTitle = content['home.sale_banner.title'] || 'SEASON OFF SALE'
  const saleBannerSubtitle = content['home.sale_banner.subtitle']
  const saleBannerImageDesktop = content['home.sale_banner.image_desktop']
  const saleBannerImageMobile = content['home.sale_banner.image_mobile']

  const productById = new Map(products.map((product) => [product.id, product]))

  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, NEW_ARRIVALS_LIMIT)

  const bestsellers = bestsellerProductIds
    .map((id) => productById.get(id))
    .filter((product): product is Product => product != null)
    .slice(0, BESTSELLER_LIMIT)

  const saleProducts = [...products]
    .filter((product) => product.salePrice != null)
    .sort((a, b) => discountRate(b) - discountRate(a))
    .slice(0, SALE_LIMIT)

  return (
    <div className="pb-64 md:pb-96 lg:pb-128">
      <Helmet>
        <title>NOVERA</title>
      </Helmet>

      {/* 모바일 전용(md 미만): 기존 배경 1장 + 하단 텍스트 히어로 */}
      <Link
        to="/shop?category=all&sort=new"
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
            to="/shop?category=all&sort=new"
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

      <ProductRow title="BEST SELLERS" moreHref="/shop?category=all&sort=best" products={bestsellers} showRank />

      <ProductRow title="NEW ARRIVALS" moreHref="/shop?category=all&sort=new" products={newArrivals} />

      <HomeBanner
        title={saleBannerTitle}
        subtitle={saleBannerSubtitle}
        imageMobile={saleBannerImageMobile}
        imageDesktop={saleBannerImageDesktop}
        href="/shop?category=all&sale=true"
        products={saleProducts}
      />
    </div>
  )
}

export default Home
