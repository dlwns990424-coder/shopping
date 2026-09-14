import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface EditorialSubBanner {
  id: string
  title: string
  subtitle: string
  image: string
  to: string
}

interface EditorialSubBannersProps {
  banners: EditorialSubBanner[]
  // 데스크톱 카드 폭(flex-basis). Men/Women은 그리드 절반 컬럼 안에서 쓰여서 45%가 맞지만,
  // 전체 폭 컨테이너에서 쓰는 곳(예: 캠페인 페이지)은 같은 절대 크기를 내려면 더 작은 값이 필요하다.
  desktopBasis?: string
  // 카드 안 제목/부제목 폰트 크기 오버라이드(예: 캠페인 페이지는 카드가 커서 기본값이 작아 보임).
  titleClassName?: string
  subtitleClassName?: string
}

// 데스크톱: 2.2개씩 보이고(다음 카드가 살짝 걸쳐서 더 있다는 걸 알 수 있게) 화살표로 한 개씩 이동.
// 모바일: 1.3개씩 보이게 폭을 잡아서
// 다음 카드가 살짝 걸치게 하고, 화살표 없이 터치 드래그로만 넘긴다(ProductCarousel과 동일한 Embla 설정).
function EditorialSubBanners({
  banners,
  desktopBasis = '45%',
  titleClassName = 'text-body-lg font-medium',
  subtitleClassName = 'text-caption text-surface/80',
}: EditorialSubBannersProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    skipSnaps: true,
    duration: 15, // 버튼 클릭 시 슬라이드 이동 애니메이션 속도(기본값 25보다 빠르게)
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

  if (banners.length === 0) return null

  return (
    <div className="relative">
      <div className="overflow-hidden touch-pan-y" ref={emblaRef}>
        <div className="-ml-12 flex">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="min-w-0 flex-[0_0_77%] pl-12 lg:flex-[0_0_var(--desktop-basis)]"
              style={{ '--desktop-basis': desktopBasis } as React.CSSProperties}
            >
              <Link
                to={banner.to}
                className="group relative flex aspect-[4/5] items-end overflow-hidden rounded-sm bg-secondary bg-cover bg-center"
                style={banner.image ? { backgroundImage: `url(${banner.image})` } : undefined}
              >
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="relative z-10 flex flex-col gap-4 p-16 text-surface">
                  <p className={titleClassName}>{banner.title}</p>
                  <p className={subtitleClassName}>{banner.subtitle}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="이전 배너"
        aria-hidden={!canScrollPrev}
        tabIndex={canScrollPrev ? 0 : -1}
        className={`absolute left-0 top-1/2 hidden h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-md transition-opacity duration-200 lg:flex ${
          canScrollPrev ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="다음 배너"
        aria-hidden={!canScrollNext}
        tabIndex={canScrollNext ? 0 : -1}
        className={`absolute right-0 top-1/2 hidden h-40 w-40 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-md transition-opacity duration-200 lg:flex ${
          canScrollNext ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export default EditorialSubBanners
