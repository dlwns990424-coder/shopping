import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

interface ProductGalleryProps {
  images: string[]
  scrollMarginClassName?: string
}

// 2장씩 묶어 페이지를 만든다. 마지막에 1장이 남으면 그 페이지는 grid-cols-2 안에
// 한 칸만 채워져서, 두 장짜리 페이지와 동일한 칸 크기를 그대로 유지한다(폭 전체로 안 늘어남).
function chunkIntoPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = []
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2))
  }
  return pairs
}

// 상품 상세의 메인 이미지 갤러리 — 모바일은 최대 4장을 한 장씩, 태블릿 이상은 두 장씩 묶는다.
// 하단 썸네일도 현재 화면의 묶음 단위와 맞추고, 클릭하면 해당 페이지로 이동한다.
function ProductGallery({ images, scrollMarginClassName = '' }: ProductGalleryProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  )
  const limitedImages = images.slice(0, 4)
  const pages = isMobile ? limitedImages.map((image) => [image]) : chunkIntoPairs(limitedImages)
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.reInit()
    emblaApi.scrollTo(0, true)
  }, [emblaApi, isMobile])

  if (pages.length === 0) return null

  return (
    <div className={scrollMarginClassName}>
      <div className="overflow-hidden touch-pan-y" ref={emblaRef}>
        <div className="flex">
          {pages.map((page, pageIndex) => (
            <div key={pageIndex} className="min-w-0 flex-[0_0_100%]">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {page.map((src, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="aspect-[4/5] bg-surface-muted bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${src})` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="mt-12 flex justify-start gap-8">
          {pages.map((page, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              onClick={() => emblaApi?.scrollTo(pageIndex)}
              aria-label={`${pageIndex + 1}번째 ${isMobile ? '이미지' : '이미지 세트'} 보기`}
              aria-current={selectedIndex === pageIndex}
              className={`grid h-80 w-60 shrink-0 cursor-pointer grid-cols-1 gap-4 overflow-hidden rounded-sm border p-0 transition-colors md:w-150 md:grid-cols-2 ${
                selectedIndex === pageIndex ? 'border-primary' : 'border-line'
              }`}
            >
              {page.map((src, imgIndex) => (
                <div
                  key={imgIndex}
                  className="h-full w-full bg-cover bg-center bg-no-repeat bg-surface-muted"
                  style={{ backgroundImage: `url(${src})` }}
                />
              ))}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery
