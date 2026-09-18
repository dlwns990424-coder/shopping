import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import ProductCard from './ProductCard'
import CarouselArrowButton from './CarouselArrowButton'
import type { Product } from '../types'

interface ProductCarouselProps {
  products: Product[]
}

function ProductCarousel({ products }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 4,
    containScroll: 'trimSnaps',
    skipSnaps: true,
    breakpoints: {
      '(max-width: 767px)': { slidesToScroll: 1 },
    },
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  if (products.length === 0) return null

  return (
    <div className="relative">
      <div className="overflow-hidden touch-pan-y" ref={emblaRef}>
        <div className="-ml-16 flex">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative min-w-0 flex-[0_0_45%] pl-16 md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 hidden lg:block">
        <div className="w-1/4 pl-16" aria-hidden="true">
          <div className="aspect-[3/4]" />
        </div>
        <CarouselArrowButton
          direction="previous"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canScrollPrev}
          label="이전 상품"
        />
        <CarouselArrowButton
          direction="next"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canScrollNext}
          label="다음 상품"
        />
      </div>
    </div>
  )
}

export default ProductCarousel
