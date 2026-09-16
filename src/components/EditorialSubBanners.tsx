import useEmblaCarousel from 'embla-carousel-react'
import { Link } from 'react-router-dom'

export interface EditorialSubBanner {
  id: string
  title: string
  subtitle: string
  image: string
  to: string
}

interface EditorialSubBannersProps {
  banners: EditorialSubBanner[]
  titleClassName?: string
  subtitleClassName?: string
}

function BannerCard({
  banner,
  titleClassName,
  subtitleClassName,
}: {
  banner: EditorialSubBanner
  titleClassName: string
  subtitleClassName: string
}) {
  return (
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
  )
}

// 모바일(md 미만)만 다음 카드가 살짝 걸치는 스와이프 캐러셀(터치 드래그, 화살표 없음).
// 태블릿+데스크톱(md 이상)은 3장이 한 화면에 다 들어와서 캐러셀이 필요 없으므로 고정 3열 그리드로 보여준다.
function EditorialSubBanners({
  banners,
  titleClassName = 'text-body-lg font-medium',
  subtitleClassName = 'text-caption text-surface/80',
}: EditorialSubBannersProps) {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    skipSnaps: true,
  })

  if (banners.length === 0) return null

  return (
    <>
      <div className="overflow-hidden touch-pan-y md:hidden" ref={emblaRef}>
        <div className="-ml-20 flex">
          {banners.map((banner) => (
            <div key={banner.id} className="min-w-0 flex-[0_0_77%] pl-20">
              <BannerCard banner={banner} titleClassName={titleClassName} subtitleClassName={subtitleClassName} />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden gap-20 md:grid md:grid-cols-3">
        {banners.map((banner) => (
          <BannerCard key={banner.id} banner={banner} titleClassName={titleClassName} subtitleClassName={subtitleClassName} />
        ))}
      </div>
    </>
  )
}

export default EditorialSubBanners
