import { useState } from 'react'
import { Link } from 'react-router-dom'

interface HomeHeroProps {
  to: string
  imageMobile: string
  imageTablet: string
  imageDesktop: string
  title: string
  subtitle: string
  loading: boolean
}

const frameClassName =
  'relative flex aspect-[3/4] items-end overflow-hidden text-inherit no-underline md:-mt-64 md:aspect-square lg:aspect-auto lg:h-screen'

// 실제 타이틀(h1: 32/38/44px)·서브타이틀(p: 18px) 위치·크기를 흉내낸 뼈대 —
// 로딩 중에도 텍스트가 들어설 자리와 대략적인 길이감을 미리 보여줘서 레이아웃 시프트를 줄인다.
function HeroSkeletonBars() {
  return (
    <div className="absolute inset-x-0 bottom-[16%] z-10 flex flex-col gap-12 px-20 md:px-32 lg:px-80 xl:px-140 2xl:px-200">
      <div className="hero-skeleton-bar h-32 w-[65%] max-w-360 md:h-38 md:w-[50%] md:max-w-420 lg:h-44 lg:w-[38%] lg:max-w-480" />
      <div className="hero-skeleton-bar h-18 w-[42%] max-w-220 md:w-[32%] md:max-w-260 lg:w-[24%] lg:max-w-300" />
    </div>
  )
}

function HomeHero({ to, imageMobile, imageTablet, imageDesktop, title, subtitle, loading }: HomeHeroProps) {
  const [loadedImageSet, setLoadedImageSet] = useState('')
  const [failedImageSet, setFailedImageSet] = useState('')

  const mobileSrc = imageMobile || imageTablet || imageDesktop
  const tabletSrc = imageTablet || imageDesktop || imageMobile
  const desktopSrc = imageDesktop || imageTablet || imageMobile
  const imageSet = [mobileSrc, tabletSrc, desktopSrc].join('|')

  if (loading) {
    return (
      <div className={frameClassName} aria-label="히어로 콘텐츠 불러오는 중" aria-busy="true">
        <div className="hero-skeleton absolute inset-0" />
        <HeroSkeletonBars />
      </div>
    )
  }

  const imageLoaded = loadedImageSet === imageSet
  const imageFailed = failedImageSet === imageSet
  const mediaReady = !mobileSrc || imageLoaded || imageFailed

  return (
    <Link to={to} className={frameClassName}>
      {mobileSrc && !imageFailed ? (
        <picture className="absolute inset-0 block h-full w-full">
          <source media="(min-width: 1024px)" srcSet={desktopSrc} />
          <source media="(min-width: 768px)" srcSet={tabletSrc} />
          <img
            src={mobileSrc}
            alt=""
            fetchPriority="high"
            onLoad={() => setLoadedImageSet(imageSet)}
            onError={() => setFailedImageSet(imageSet)}
            className={`h-full w-full object-cover object-center transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </picture>
      ) : (
        <div className="absolute inset-0 bg-surface-muted" />
      )}

      {!mediaReady && (
        <>
          <div className="hero-skeleton absolute inset-0" />
          <HeroSkeletonBars />
        </>
      )}

      {mediaReady && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-[16%] z-10 px-20 text-surface md:px-32 lg:px-80 xl:px-140 2xl:px-200">
            <h1 className="whitespace-pre-line font-display text-[32px] font-medium leading-[1.2] tracking-[0.025em] text-surface drop-shadow-md md:text-[38px] lg:text-[44px]">
              {title}
            </h1>
            <p className="mt-12 text-[18px] font-light text-surface drop-shadow-md">{subtitle}</p>
          </div>
        </>
      )}
    </Link>
  )
}

export default HomeHero
