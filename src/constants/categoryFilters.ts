export const PRODUCT_CATEGORIES = ['아우터', '상의', '하의']

export const CATEGORY_TABS = [
  { id: 'all', label: '모두 보기' },
  ...PRODUCT_CATEGORIES.map((category) => ({ id: category, label: category })),
]

export const SUB_CATEGORIES: Record<string, string[]> = {
  아우터: ['코트', '자켓·블레이저', '패딩', '가디건'],
  상의: ['셔츠', '티셔츠', '니트·스웨트', '후드'],
  하의: ['데님', '슬랙스', '반바지'],
}
