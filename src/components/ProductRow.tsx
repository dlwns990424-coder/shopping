import { Link } from 'react-router-dom'
import ProductCarousel from './ProductCarousel'
import type { Product } from '../types'

interface ProductRowProps {
  title: string
  moreHref?: string
  products: Product[]
  featuredHeading?: boolean
}

// Home/Men/Women의 신상품·베스트·할인상품 행에서 공용으로 쓰는 "타이틀 + 더보기 + 캐러셀" 섹션.
// products가 비어있으면(카탈로그가 작아 조건에 맞는 상품이 없을 수 있음) 섹션 자체를 숨긴다.
function ProductRow({ title, moreHref, products, featuredHeading = false }: ProductRowProps) {
  if (products.length === 0) return null

  return (
    <section className="mt-64 px-20 md:mt-80 md:px-32 lg:mt-100 lg:px-80 xl:px-140 2xl:px-200">
      <div
        className={`relative mx-auto mb-24 flex max-w-1600 md:mb-32 lg:mb-40 ${
          featuredHeading ? 'items-end justify-between gap-16' : 'items-center justify-center'
        }`}
      >
        <h2
          className={
            featuredHeading
              ? 'font-display min-w-0 text-left text-[24px] font-medium leading-[1.15] tracking-[0.035em] text-primary md:text-[30px] lg:text-[36px]'
              : 'text-center text-[32px] font-normal leading-[1.3] tracking-[-0.03em] text-primary md:text-[50px]'
          }
        >
          {title}
        </h2>
        {moreHref && (
          <Link
            to={moreHref}
            className={
              featuredHeading
                ? 'shrink-0 text-body-sm text-secondary underline [text-underline-offset:6px] transition-colors hover:text-primary'
                : 'absolute right-20 text-body-sm text-secondary underline [text-underline-offset:6px] transition-colors hover:text-primary md:right-32 lg:right-40'
            }
          >
            VIEW MORE
          </Link>
        )}
      </div>
      <div className="mx-auto max-w-1600">
        <ProductCarousel products={products} />
      </div>
    </section>
  )
}

export default ProductRow
