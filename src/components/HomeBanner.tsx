import { Link } from 'react-router-dom'
import ProductCarousel from './ProductCarousel'
import type { Product } from '../types'

interface HomeBannerProps {
  title: string
  subtitle?: string
  imageMobile?: string
  imageDesktop?: string
  href: string
  products: Product[]
}

// Home의 신상품/세일 섹션 전용 — 풀블리드(max-w-1600 밖) 이미지 배너 1장 + 그 아래
// 타이틀 없는 상품 캐러셀(성별 통합) 조합. 배너 전체는 클릭 불가능(순수 이미지+텍스트)하고,
// 목적지로 가는 유일한 통로는 배너 안의 "MORE" 버튼 하나뿐이다.
function HomeBanner({ title, subtitle, imageMobile, imageDesktop, href, products }: HomeBannerProps) {
  return (
    <section className="mt-64 md:mt-96 lg:mt-128">
      <div className="relative flex h-[50vh] w-full items-center overflow-hidden bg-secondary">
        <div
          className="absolute inset-0 hidden bg-cover bg-center lg:block"
          style={imageDesktop ? { backgroundImage: `url(${imageDesktop})` } : undefined}
        />
        <div
          className="absolute inset-0 bg-cover bg-center lg:hidden"
          style={imageMobile || imageDesktop ? { backgroundImage: `url(${imageMobile || imageDesktop})` } : undefined}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex w-full flex-col items-center gap-12 px-20 text-center text-surface md:px-32 lg:px-40">
          <h2 className="text-[32px] font-light leading-[1.2] tracking-[-0.02em] text-surface drop-shadow-md md:text-[50px]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[16px] text-surface drop-shadow-md md:text-[18px]">{subtitle}</p>
          )}
          <Link
            to={href}
            className="mt-4 rounded-sm border border-surface px-20 py-8 text-[13px] tracking-[0.08em] text-surface no-underline drop-shadow-md transition-colors hover:bg-surface hover:text-primary"
          >
            MORE
          </Link>
        </div>
      </div>

      {products.length > 0 && (
        <div className="mx-auto mt-24 max-w-1600 px-20 md:px-32 lg:px-40">
          <ProductCarousel products={products} />
        </div>
      )}
    </section>
  )
}

export default HomeBanner
