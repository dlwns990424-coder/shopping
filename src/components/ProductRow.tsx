import { Link } from 'react-router-dom'
import ProductCarousel from './ProductCarousel'
import type { Product } from '../types'

interface ProductRowProps {
  title: string
  moreHref: string
  products: Product[]
}

// Home/Men/Women의 신상품·베스트·할인상품 행에서 공용으로 쓰는 "타이틀 + 더보기 + 캐러셀" 섹션.
// products가 비어있으면(카탈로그가 작아 조건에 맞는 상품이 없을 수 있음) 섹션 자체를 숨긴다.
function ProductRow({ title, moreHref, products }: ProductRowProps) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto mt-64 max-w-1600 md:mt-96 lg:mt-128">
      <div className="relative mb-24 flex items-center justify-center px-20 md:px-32 lg:px-80 xl:px-140 2xl:px-200">
        <h2 className="text-center text-[32px] font-normal leading-[1.3] tracking-[-0.03em] text-primary md:text-[50px]">
          {title}
        </h2>
        <Link
          to={moreHref}
          className="absolute right-20 text-body-sm text-secondary underline [text-underline-offset:6px] transition-colors hover:text-primary md:right-32 lg:right-40"
        >
          더보기
        </Link>
      </div>
      <div className="px-20 md:px-32 lg:px-80 xl:px-140 2xl:px-200">
        <ProductCarousel products={products} />
      </div>
    </section>
  )
}

export default ProductRow
