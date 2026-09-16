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

// 상품 상세의 메인 이미지 갤러리 — 최대 4장을 2장씩 한 페이지로 묶어 보여주고(참고 사이트와 동일),
// 스와이프는 페이지 단위로 넘어간다. 하단 썸네일도 페이지와 동일하게 2장 세트로 묶어 한 줄로 배치하고,
// 클릭하면 해당 페이지로 바로 이동한다(화살표 버튼 없음).
function ProductGallery({ images, scrollMarginClassName = '' }: ProductGalleryProps) {
  const pairs = chunkIntoPairs(images.slice(0, 4))
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

  if (pairs.length === 0) return null

  return (
    <div className={scrollMarginClassName}>
      <div className="overflow-hidden touch-pan-y" ref={emblaRef}>
        <div className="flex">
          {pairs.map((pair, pairIndex) => (
            <div key={pairIndex} className="min-w-0 flex-[0_0_100%]">
              <div className="grid grid-cols-2 gap-8">
                {pair.map((src, imgIndex) => (
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

      {pairs.length > 1 && (
        <div className="mt-12 flex justify-start gap-8">
          {pairs.map((pair, pairIndex) => (
            <button
              key={pairIndex}
              type="button"
              onClick={() => emblaApi?.scrollTo(pairIndex)}
              aria-label={`${pairIndex + 1}번째 이미지 세트 보기`}
              aria-current={selectedIndex === pairIndex}
              className={`grid h-80 w-150 shrink-0 cursor-pointer grid-cols-2 gap-4 overflow-hidden rounded-sm border p-0 transition-colors ${
                selectedIndex === pairIndex ? 'border-primary' : 'border-line'
              }`}
            >
              {pair.map((src, imgIndex) => (
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
