import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CategoryCard from './CategoryCard'
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

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canScrollPrev}
        aria-label="이전 카테고리"
        className="absolute left-0 top-1/2 hidden h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-md transition-opacity disabled:opacity-30 lg:flex"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canScrollNext}
        aria-label="다음 카테고리"
        className="absolute right-0 top-1/2 hidden h-40 w-40 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-md transition-opacity disabled:opacity-30 lg:flex"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export default CategoryCarousel
