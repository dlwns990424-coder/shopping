import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

interface ProductGalleryProps {
  images: string[]
  scrollMarginClassName?: string
}

// 상품 상세의 메인 이미지 갤러리 — 최대 4장, 메인 이미지는 스와이프로 넘기고
// 하단 썸네일을 눌러서도 바로 이동할 수 있다(화살표 버튼 없음, 참고 사이트와 동일).
function ProductGallery({ images, scrollMarginClassName = '' }: ProductGalleryProps) {
  const shown = images.slice(0, 4)
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

  if (shown.length === 0) return null

  return (
    <div className={scrollMarginClassName}>
      <div className="overflow-hidden touch-pan-y" ref={emblaRef}>
        <div className="flex">
          {shown.map((src, index) => (
            <div key={index} className="min-w-0 flex-[0_0_100%]">
              <div
                className="aspect-[4/5] bg-surface-muted bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${src})` }}
              />
            </div>
          ))}
        </div>
      </div>

      {shown.length > 1 && (
        <div className="mt-12 grid grid-cols-2 gap-8">
          {shown.map((src, index) => (
            <button
              key={index}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`${index + 1}번째 이미지 보기`}
              aria-current={selectedIndex === index}
              className={`aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-sm border bg-cover bg-center bg-no-repeat bg-surface-muted p-0 transition-colors ${
                selectedIndex === index ? 'border-primary' : 'border-line'
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery
