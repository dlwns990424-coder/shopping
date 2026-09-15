import { useSearchParams } from 'react-router-dom'
import CategoryListing from '../components/CategoryListing'
import { useProducts } from '../context/ProductsContext'

// Home의 신상품/베스트/할인상품처럼 성별 구분 없이 전체 카탈로그를 보여줘야 하는
// 목적지 전용 페이지. Men/Women은 이 라우트를 쓰지 않고 자기 라우트(/men, /women)를
// defaultGender 고정값 그대로 재사용한다(CategoryListing.tsx 참고).
function Shop() {
  const [searchParams] = useSearchParams()
  const { products } = useProducts()
  const categoryParam = searchParams.get('category') ?? 'all'

  return <CategoryListing basePath="/shop" products={products} defaultGender="all" categoryParam={categoryParam} />
}

export default Shop
