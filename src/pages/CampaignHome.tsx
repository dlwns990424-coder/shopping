import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useContent } from '../context/ContentContext'
import { useScrollProgress } from '../hooks/useScrollProgress'
import EditorialSubBanners, { type EditorialSubBanner } from '../components/EditorialSubBanners'

const EDITORIAL_SUB_BANNER_IDS = ['sub-1', 'sub-2', 'sub-3', 'sub-4']

// 홈 히어로 쇼케이스 전용 서브배너 필터 URL — Men/Women 페이지의 에디토리얼 서브배너와
// 동일한 site_content(카테고리/서브카테고리)를 그대로 재사용해서 관리자 데이터를 이중으로 안 만든다.
function editorialBannerUrl(page: 'men' | 'women', category: string, sub: string) {
  const params = new URLSearchParams({ category: category || 'all' })
  if (sub) params.set('sub', sub)
  return `/${page}?${params.toString()}`
}

function useEditorialSubBanners(content: Record<string, string>, page: 'men' | 'women'): EditorialSubBanner[] {
  return EDITORIAL_SUB_BANNER_IDS.map((id) => ({
    id: `${page}-${id}`,
    title: content[`${page}.editorial_sub_banner.${id}.title`] ?? '',
    subtitle: content[`${page}.editorial_sub_banner.${id}.subtitle`] ?? '',
    image: content[`${page}.editorial_sub_banner.${id}.image`] ?? '',
    category: content[`${page}.editorial_sub_banner.${id}.category`] || 'all',
    sub: content[`${page}.editorial_sub_banner.${id}.sub`] ?? '',
    order: Number(content[`${page}.editorial_sub_banner.${id}.order`]) || 0,
  }))
    .sort((a, b) => a.order - b.order)
    .map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      to: editorialBannerUrl(page, banner.category, banner.sub),
    }))
}

function CampaignHome() {
  const { content } = useContent()

  // 데스크톱: 히어로 이미지가 섹션1→섹션2 내내 같은 레이어로 고정되어 있고, 스크롤 진행률(progress)
  // 하나로 순서대로 제어한다 — 도입부(0~0.2: scale 1.05→1.0, 타이틀 페이드아웃) → 인용구가 아래에서
  // 위로 슬라이드업되며 등장(0.2~0.32) → 유지(0.32~0.45) → 인용구가 계속 위로 슬라이드업되며 퇴장하는
  // 동안(0.45~0.6) 동시에 좌우 젠더배너 슬라이드인 + 설명이 아래에서 위로 슬라이드업 등장(0.45~0.6,
  // 배너가 100% 자리잡는 시점과 설명이 중앙에 도착하는 시점을 일치시킴) → 유지(0.6~0.85) → 설명도
  // 동일하게 위로 슬라이드업되며 퇴장(0.85~1). 전부 opacity가 아닌 위치 이동이라 컨테이너의
  // overflow-hidden에 의해 화면 밖으로 나가면 자연스럽게 가려진다. 스크롤을 올리면 전부 역재생된다.
  const combinedRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress(combinedRef)

  const introProgress = Math.min(1, progress / 0.2)
  const heroImageScale = 1.05 - introProgress * 0.05
  const titleOpacity = 1 - introProgress

  // 인용구·설명 둘 다 아래에서 위로 이동하면서 동시에 opacity 0→1로 자연스럽게 나타나고,
  // 퇴장할 때도 위로 이동하며 opacity 1→0으로 사라진다(이동만 있으면 아직 자리 잡기 전에도
  // 다 보여서 화면 아래쪽에 텍스트가 잘린 채 불쑥 나타나 보이는 문제가 있었음).
  const quoteEnter = Math.min(1, Math.max(0, (progress - 0.2) / 0.2))
  const quoteExit = Math.min(1, Math.max(0, (progress - 0.5) / 0.2))
  const quoteTranslateY = (1 - quoteEnter) * 60 - quoteExit * 60
  const quoteOpacity = quoteEnter - quoteExit

  const descriptionEnter = Math.min(1, Math.max(0, (progress - 0.5) / 0.2))
  const descriptionExit = Math.min(1, Math.max(0, (progress - 0.85) / 0.15))
  const descriptionTranslateY = (1 - descriptionEnter) * 60 - descriptionExit * 60
  const descriptionOpacity = descriptionEnter - descriptionExit

  // 좌우 젠더배너는 인용구가 위로 퇴장하는 것과 같은 구간(0.5~0.7)에 슬라이드인된다.
  const bannerSlideProgress = Math.min(1, Math.max(0, (progress - 0.5) / 0.2))
  const menTranslateX = (1 - bannerSlideProgress) * -100
  const womenTranslateX = (1 - bannerSlideProgress) * 100

  // 모바일: 좌우 3분할 대신, 이미지(타이틀→인용구→설명)가 먼저 보이고 그 다음 MEN, 그 다음 WOMEN이
  // 화면 전체를 덮으며 아래에서 위로 순서대로 올라오는 방식(스크롤 방향과 일치하는 자연스러운 등장).
  const mobileRef = useRef<HTMLDivElement>(null)
  const mobileProgress = useScrollProgress(mobileRef)

  const mobileIntroProgress = Math.min(1, mobileProgress / 0.15)
  const mobileHeroImageScale = 1.05 - mobileIntroProgress * 0.05
  const mobileTitleOpacity = 1 - mobileIntroProgress

  // 인용구·설명 둘 다 데스크톱과 동일하게 위로 이동 + opacity 0→1(등장)/1→0(퇴장)을 함께 적용한다.
  // 설명은 MEN 배너가 슬라이드인되기 시작하는 시점(0.65)에 맞춰 함께 위로 퇴장한다.
  const mobileQuoteEnter = Math.min(1, Math.max(0, (mobileProgress - 0.15) / 0.15))
  const mobileQuoteExit = Math.min(1, Math.max(0, (mobileProgress - 0.35) / 0.15))
  const mobileQuoteTranslateY = (1 - mobileQuoteEnter) * 60 - mobileQuoteExit * 60
  const mobileQuoteOpacity = mobileQuoteEnter - mobileQuoteExit

  const mobileDescriptionEnter = Math.min(1, Math.max(0, (mobileProgress - 0.5) / 0.15))
  const mobileDescriptionExit = Math.min(1, Math.max(0, (mobileProgress - 0.65) / 0.15))
  const mobileDescriptionTranslateY = (1 - mobileDescriptionEnter) * 60 - mobileDescriptionExit * 60
  const mobileDescriptionOpacity = mobileDescriptionEnter - mobileDescriptionExit
  // 배경 이미지도 설명이 퇴장하는 것과 완전히 같은 양·같은 타이밍으로 위로 올라가서 한 덩어리처럼 움직인다.
  const mobileImageTranslateY = -mobileDescriptionExit * 60

  const mobileMenTranslateY = (1 - Math.min(1, Math.max(0, (mobileProgress - 0.65) / 0.15))) * 100
  const mobileWomenTranslateY = (1 - Math.min(1, Math.max(0, (mobileProgress - 0.85) / 0.15))) * 100

  // 라벨은 Home 젠더배너와 동일하게 화면 하단+그라데이션으로 고정된 모습이지만, 배너 패널의 슬라이드가
  // 시작되자마자 독립적으로 빠르게 먼저 나타나서 패널이 100% 다 올라오기 전에 이미 다 보이게 한다.
  const mobileMenLabelOpacity = Math.min(1, Math.max(0, (mobileProgress - 0.65) / 0.08))
  const mobileWomenLabelOpacity = Math.min(1, Math.max(0, (mobileProgress - 0.85) / 0.08))

  const menImage = content['home.campaign.men_image']
  const womenImage = content['home.campaign.women_image']
  // TODO: home.campaign.* 관리자 업로드 UI 연동 전까지 임시로 로컬 이미지를 사용(시각 확인용).
  const heroImageDesktop =
    content['home.campaign.hero_image_desktop'] || '/images/banner/women-banner-1-background.png'
  const heroImageMobile = content['home.campaign.hero_image_mobile'] || heroImageDesktop

  const menSubBanners = useEditorialSubBanners(content, 'men')
  const womenSubBanners = useEditorialSubBanners(content, 'women')
  const exploreBanners = [...menSubBanners, ...womenSubBanners]

  return (
    <div>
      <Helmet>
        <title>NOVERA | 클래식, 도시의 방식으로</title>
      </Helmet>

      {/* 모바일: 좌우 분할 대신 순차 등장. 이미지(타이틀→인용구→설명) 다음, MEN 전체화면 배너가
          아래에서 위로 슬라이드업되어 덮고, 이어서 WOMEN 배너가 그 위를 또 덮는다. 전부 스크롤
          진행률(mobileProgress) 기반이라 스크롤을 올리면 그대로 역재생된다. */}
      <div ref={mobileRef} className="js-campaign-hero-boundary relative -mt-48 h-[520vh] md:-mt-64 lg:hidden">
        <div className="sticky top-0 h-screen overflow-hidden bg-primary">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              ...(heroImageMobile ? { backgroundImage: `url(${heroImageMobile})` } : {}),
              transform: `scale(${mobileHeroImageScale}) translateY(${mobileImageTranslateY}vh)`,
            }}
          />
          <div className="absolute inset-0 bg-black/25" />

          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex w-full -translate-y-1/2 flex-col items-center gap-8 px-20 text-center text-surface"
            style={{ opacity: mobileTitleOpacity }}
          >
            <h1>
              <img
                src="/images/brand/novera-wordmark-light.png"
                alt="NOVERA"
                className="h-128 w-auto brightness-0 invert drop-shadow-md md:h-176"
              />
            </h1>
            <p className="w-full max-w-344 break-keep text-[26px] font-medium leading-[1.5] tracking-[-0.02em] drop-shadow-md md:max-w-440 md:text-[30px]">
              {content['home.campaign.hero_title_a'] || (
                <>
                  오래도록 사랑받아온 클래식을,
                  <br />
                  지금 이 도시에 맞게 다시 그립니다
                </>
              )}
            </p>
          </div>

          <div className="absolute inset-0 z-10 flex items-center justify-center px-20 text-center text-surface">
            <p
              className="absolute inset-x-0 mx-auto max-w-320 break-keep text-[30px] font-light leading-[1.6] tracking-[-0.02em] drop-shadow-md md:max-w-460 md:text-[38px]"
              style={{ transform: `translateY(${mobileQuoteTranslateY}vh)`, opacity: mobileQuoteOpacity }}
            >
              “{content['home.campaign.quote'] || '출근길의 분주한 거리와 오래된 골목, 그 일상 속에서 우리의 영감은 시작됩니다'}”
            </p>
            <p
              className="absolute inset-x-0 mx-auto max-w-320 break-keep text-[28px] font-light leading-[1.6] tracking-[-0.02em] drop-shadow-md md:max-w-460 md:text-[36px]"
              style={{ transform: `translateY(${mobileDescriptionTranslateY}vh)`, opacity: mobileDescriptionOpacity }}
            >
              {content['home.campaign.description'] || '이번 가을, 니트와 트위드 같은 클래식한 소재로 단정하면서도 편안한 데일리 컬렉션을 선보입니다'}
            </p>
          </div>

          <Link
            to="/men"
            className="absolute inset-0 z-20 overflow-hidden bg-secondary bg-cover bg-center"
            style={{
              ...(menImage ? { backgroundImage: `url(${menImage})` } : {}),
              transform: `translateY(${mobileMenTranslateY}%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-[21] flex items-end justify-center text-center text-surface"
            style={{ opacity: mobileMenLabelOpacity }}
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <span className="relative z-10 pb-64 text-[20px] font-medium drop-shadow-md md:text-[24px]">남성 쇼핑하기</span>
          </div>

          <Link
            to="/women"
            className="absolute inset-0 z-30 overflow-hidden bg-secondary bg-cover bg-center"
            style={{
              ...(womenImage ? { backgroundImage: `url(${womenImage})` } : {}),
              transform: `translateY(${mobileWomenTranslateY}%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-[31] flex items-end justify-center text-center text-surface"
            style={{ opacity: mobileWomenLabelOpacity }}
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <span className="relative z-10 pb-64 text-[20px] font-medium drop-shadow-md md:text-[24px]">여성 쇼핑하기</span>
          </div>
        </div>
      </div>

      {/* 데스크톱: 히어로+3분할을 하나의 sticky 영역으로 묶는다. 히어로 이미지는 이 구간 내내 같은
          레이어로 유지되며 scale만 1.05→1.0으로 줄어들고, 그 위 3분할 그리드에서 좌(MEN)·우(WOMEN)가
          슬라이드인 되어 좌우를 덮는다(가운데만 이미지가 계속 드러남). 이후 가운데 텍스트가
          인용구→설명으로 전환된다. 전부 스크롤 진행률(progress) 기반이라 스크롤을 올리면 그대로
          역재생된다. */}
      <div ref={combinedRef} className="js-campaign-hero-boundary relative hidden h-[550vh] lg:-mt-64 lg:block">
        <div className="sticky top-0 h-screen overflow-hidden bg-primary">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              ...(heroImageDesktop ? { backgroundImage: `url(${heroImageDesktop})` } : {}),
              transform: `scale(${heroImageScale})`,
            }}
          />
          <div className="absolute inset-0 bg-black/25" />

          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex w-full -translate-y-1/2 flex-col items-center gap-16 px-32 text-center text-surface"
            style={{ opacity: titleOpacity }}
          >
            <h1>
              <img
                src="/images/brand/novera-wordmark-light.png"
                alt="NOVERA"
                className="h-200 w-auto brightness-0 invert drop-shadow-md"
              />
            </h1>
            <p className="max-w-560 break-keep text-[30px] font-medium leading-[1.5] tracking-[-0.02em] drop-shadow-md">
              {content['home.campaign.hero_title_a'] || (
                <>
                  오래도록 사랑받아온 클래식을,
                  <br />
                  지금 이 도시에 맞게 다시 그립니다
                </>
              )}
            </p>
          </div>

          <div className="absolute inset-0 grid grid-cols-3">
            <Link
              to="/men"
              className="group relative flex items-end overflow-hidden bg-secondary bg-cover bg-center"
              style={{
                ...(menImage ? { backgroundImage: `url(${menImage})` } : {}),
                transform: `translateX(${menTranslateX}%)`,
              }}
            >
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="relative z-10 w-full px-40 pb-48 text-center text-[18px] font-medium text-surface transition-colors duration-300 group-hover:text-surface/70">
                남성 쇼핑하기
              </span>
            </Link>

            <div className="relative flex items-center justify-center text-center text-surface">
              <p
                className="absolute inset-x-0 mx-auto max-w-560 break-keep text-[44px] font-light leading-[1.5] tracking-[-0.02em] drop-shadow-md"
                style={{ transform: `translateY(${quoteTranslateY}vh)`, opacity: quoteOpacity }}
              >
                “{content['home.campaign.quote'] || '출근길의 분주한 거리와 오래된 골목, 그 일상 속에서 우리의 영감은 시작됩니다'}”
              </p>
              <p
                className="absolute inset-x-0 mx-auto max-w-480 break-keep text-[40px] font-light leading-[1.6] tracking-[-0.02em] drop-shadow-md"
                style={{ transform: `translateY(${descriptionTranslateY}vh)`, opacity: descriptionOpacity }}
              >
                {content['home.campaign.description'] || '이번 가을, 니트와 트위드 같은 클래식한 소재로 단정하면서도 편안한 데일리 컬렉션을 선보입니다'}
              </p>
            </div>

            <Link
              to="/women"
              className="group relative flex items-end overflow-hidden bg-secondary bg-cover bg-center"
              style={{
                ...(womenImage ? { backgroundImage: `url(${womenImage})` } : {}),
                transform: `translateX(${womenTranslateX}%)`,
              }}
            >
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="relative z-10 w-full px-40 pb-48 text-center text-[18px] font-medium text-surface transition-colors duration-300 group-hover:text-surface/70">
                여성 쇼핑하기
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* 섹션 3 — 더 둘러보기: Men + Women 에디토리얼 서브배너 8개를 한 캐러셀로.
          타이틀은 좌측에 세로 중앙 정렬, 캐러셀은 전체 폭을 그대로 쓰되 카드 자체 크기만
          Men/Women과 맞춘다(desktopBasis로 flex-basis만 축소 — 컨테이너 폭은 안 줄임). */}
      <section className="page-section flex flex-col gap-24 lg:flex-row lg:items-center lg:gap-80">
        <div className="flex shrink-0 flex-col items-center gap-8 text-center lg:w-320">
          <h2 className="text-[32px] font-bold leading-[1.3] tracking-[-0.02em]">더 둘러보기</h2>
          <p className="break-keep text-[16px] leading-[1.5] text-secondary">
            {content['home.campaign.explore_subtitle'] || 'MEN과 WOMEN의 새로운 에디토리얼을 한 곳에서 만나보세요'}
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <EditorialSubBanners
            banners={exploreBanners}
            desktopBasis="30%"
            titleClassName="text-[20px] font-medium"
            subtitleClassName="text-[14px] text-surface/80"
          />
        </div>
      </section>
    </div>
  )
}

export default CampaignHome
