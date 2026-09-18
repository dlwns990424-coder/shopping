import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import CategoryCard from './CategoryCard'
import CarouselArrowButton from './CarouselArrowButton'
import type { Category } from '../types'

interface CategoryCarouselProps {
  categories: Category[]
}

function CategoryCarousel({ categories }: CategoryCarouselProps) {
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

  if (categories.length === 0) return null

  return (
    <div className="relative">
      <div className="overflow-hidden touch-pan-y" ref={emblaRef}>
        <div className="-ml-12 flex">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative min-w-0 flex-[0_0_22%] pl-12 md:flex-[0_0_14.28%] lg:flex-[0_0_11.111%]"
            >
              <CategoryCard {...category} />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 hidden lg:block">
        <div className="w-[11.111%] pl-12" aria-hidden="true">
          <div className="aspect-[3/4]" />
        </div>
        <CarouselArrowButton
          direction="previous"
          placement="outside"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canScrollPrev}
          label="이전 카테고리"
        />
        <CarouselArrowButton
          direction="next"
          placement="outside"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canScrollNext}
          label="다음 카테고리"
        />
      </div>
    </div>
  )
}

export default CategoryCarousel
