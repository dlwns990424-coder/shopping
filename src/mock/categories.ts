import type { Category } from '../types'

const ALL_CATEGORY_IMAGE = '/images/hero/women-coat-02-model-02-v2.png'

export const menCategories: Category[] = [
  { id: 'all', label: '모두 보기', to: '/men?category=all', image: ALL_CATEGORY_IMAGE, imageFit: 'cover' },
  { id: 'outer', label: '아우터', to: '/men?category=아우터', image: '/images/products/men/coats/men-coat-01.png' },
  { id: 'top', label: '상의', to: '/men?category=상의', image: '/images/products/men/shirts/men-shirt-01.png' },
  { id: 'bottom', label: '하의', to: '/men?category=하의', image: '/images/products/men/jeans/men-jeans-01.png' },
]

export const womenCategories: Category[] = [
  { id: 'all', label: '모두 보기', to: '/women?category=all', image: ALL_CATEGORY_IMAGE, imageFit: 'cover' },
  { id: 'outer', label: '아우터', to: '/women?category=아우터', image: '/images/products/women/coats/women-coat-01.png' },
  { id: 'top', label: '상의', to: '/women?category=상의', image: '/images/products/women/shirts/women-shirt-01.png' },
  { id: 'bottom', label: '하의', to: '/women?category=하의', image: '/images/products/women/jeans/women-jeans-01.png' },
]
