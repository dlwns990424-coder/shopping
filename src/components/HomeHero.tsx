import { useState } from 'react'
import { Link } from 'react-router-dom'

interface HomeHeroProps {
  to: string
  image: string
  title: string
  subtitle: string
  loading: boolean
}

const frameClassName =
  'relative flex aspect-[3/4] items-end overflow-hidden text-inherit no-underline md:-mt-64 md:aspect-square lg:aspect-auto lg:h-screen'

function HomeHero({ to, image, title, subtitle, loading }: HomeHeroProps) {
  const [loadedImage, setLoadedImage] = useState('')
  const [failedImage, setFailedImage] = useState('')

  if (loading) {
    return (
      <div className={frameClassName} aria-label="히어로 콘텐츠 불러오는 중" aria-busy="true">
        <div className="hero-skeleton absolute inset-0" />
      </div>
    )
  }

  const imageLoaded = loadedImage === image
  const imageFailed = failedImage === image
  const mediaReady = !image || imageLoaded || imageFailed

  return (
    <Link to={to} className={frameClassName}>
      {image && !imageFailed ? (
        <img
          src={image}
          alt=""
          fetchPriority="high"
          onLoad={() => setLoadedImage(image)}
          onError={() => setFailedImage(image)}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-surface-muted" />
      )}

      {!mediaReady && <div className="hero-skeleton absolute inset-0" />}

      {mediaReady && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-[20%] z-10 px-20 text-surface md:px-32 lg:px-80 xl:px-140 2xl:px-200">
            <h1 className="text-[32px] font-normal leading-[1.2] tracking-[-0.02em] text-surface drop-shadow-md md:text-[38px] lg:text-[44px]">
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
