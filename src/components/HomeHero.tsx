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

      {!mediaReady && <div className="hero-skeleton absolute inset-0" />}

      {mediaReady && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-[20%] z-10 px-20 text-surface md:px-32 lg:px-80 xl:px-140 2xl:px-200">
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
