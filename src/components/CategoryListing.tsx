import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, Search, X } from 'lucide-react'
import ProductCard from './ProductCard'
import { sizeOptions } from '../mock/productDetail'
import type { Gender, Product } from '../types'

const TABS = [
  { id: 'all', label: '모두 보기' },
  { id: '아우터', label: '아우터' },
  { id: '상의', label: '상의' },
  { id: '하의', label: '하의' },
]

const SUB_CATEGORIES: Record<string, string[]> = {
  아우터: ['코트', '자켓·블레이저', '패딩', '가디건'],
  상의: ['셔츠', '티셔츠', '니트·스웨트', '후드'],
  하의: ['데님', '슬랙스', '반바지'],
}

const SORT_OPTIONS = [
  { id: 'default', label: '기본순' },
  { id: 'price-asc', label: '가격 낮은순' },
  { id: 'price-desc', label: '가격 높은순' },
]

const GENDER_TABS: { id: 'all' | Gender; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'men', label: 'MEN' },
  { id: 'women', label: 'WOMEN' },
]

interface CategoryListingProps {
  basePath: string
  products: Product[]
  defaultGender: Gender
  categoryParam: string
}

function CategoryListing({ basePath, products, defaultGender, categoryParam }: CategoryListingProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const subParam = searchParams.get('sub') ?? 'all'
  const sizeParam = searchParams.get('size') ?? 'all'
  const sortParam = searchParams.get('sort') ?? 'default'
  const qParam = searchParams.get('q') ?? ''
  const genderOverride = searchParams.get('gender')

  const [queryInput, setQueryInput] = useState(qParam)

  useEffect(() => {
    setQueryInput(qParam)
  }, [qParam])

  const isSearching = qParam.trim().length > 0
  const effectiveGender: 'all' | Gender = isSearching ? (genderOverride as 'all' | Gender) || 'all' : defaultGender
  const genderLabel = effectiveGender === 'all' ? '전체' : effectiveGender.toUpperCase()

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(overrides).forEach(([key, value]) => {
      if (!value || value === 'all' || value === 'default') params.delete(key)
      else params.set(key, value)
    })
    return `${basePath}?${params.toString()}`
  }

  // category는 'all'이어도 URL에 명시적으로 남아있어야 함(없으면 목록 화면 자체를 벗어나 랜딩 페이지로 취급됨)
  const categoryTabUrl = (id: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('category', id)
    params.delete('sub')
    return `${basePath}?${params.toString()}`
  }

  const handleQueryChange = (value: string) => {
    setQueryInput(value)
    navigate(buildUrl({ q: value || undefined }), { replace: true })
  }

  const title = isSearching ? `"${qParam}" 검색 결과` : categoryParam === 'all' ? '전체 상품' : categoryParam

  const genderProducts =
    effectiveGender === 'all' ? products : products.filter((product) => product.gender === effectiveGender)

  const searchedProducts = isSearching
    ? genderProducts.filter((product) => product.name.includes(qParam.trim()))
    : genderProducts

  const categoryProducts =
    categoryParam === 'all'
      ? searchedProducts
      : searchedProducts.filter((product) => product.category === categoryParam)

  const subCategories = SUB_CATEGORIES[categoryParam] ?? []

  const bySub =
    subParam === 'all'
      ? categoryProducts
      : categoryProducts.filter((product) => product.subCategory === subParam)

  const bySize = sizeParam === 'all' ? bySub : bySub.filter((product) => product.sizes.includes(sizeParam))

  const displayedProducts = [...bySize].sort((a, b) => {
    if (sortParam === 'price-asc') return (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
    if (sortParam === 'price-desc') return (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
    return 0
  })

  const subTabClass = (active: boolean) =>
    `rounded-full border px-16 py-6 text-body-sm no-underline transition-colors active:scale-95 ${
      active
        ? 'border-primary bg-primary text-surface'
        : 'border-line text-secondary hover:border-primary hover:text-primary'
    }`

  return (
    <div className="px-24 pb-32 pt-32 md:px-32 md:pt-48 lg:px-40 lg:pb-64">
      <Helmet>
        <title>{`NOVERA | ${genderLabel} | ${title}`}</title>
      </Helmet>
      <div className="mb-24">
        <p className="text-caption mb-8 tracking-[0.08em] text-secondary">NOVERA | {genderLabel}</p>
        <h1 className="text-h1">{title}</h1>
      </div>

      <div className="relative mb-24 max-w-480">
        <Search
          size={18}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 text-secondary"
        />
        <input
          value={queryInput}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="상품명을 검색해보세요"
          className="text-sm w-full rounded-sm border border-line py-12 pl-44 pr-40 text-primary outline-none focus:border-primary"
        />
        {queryInput && (
          <button
            type="button"
            onClick={() => navigate(buildUrl({ q: undefined, gender: undefined }))}
            aria-label="검색어 지우기"
            className="absolute right-12 top-1/2 flex h-24 w-24 -translate-y-1/2 items-center justify-center text-secondary transition-colors active:scale-90 hover:text-primary"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {isSearching && (
        <div className="flex flex-wrap gap-8 pb-16">
          {GENDER_TABS.map((tab) => (
            <Link
              key={tab.id}
              to={buildUrl({ gender: tab.id === 'all' ? undefined : tab.id })}
              className={subTabClass(effectiveGender === tab.id)}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-24 border-b border-line">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            to={categoryTabUrl(tab.id)}
            className={`-mb-px border-b py-12 text-sm font-medium no-underline transition-colors active:scale-95 hover:border-primary hover:text-primary ${
              categoryParam === tab.id ? 'border-primary text-primary' : 'border-transparent text-disabled'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {categoryParam !== 'all' && subCategories.length > 1 && (
        <div className="flex flex-wrap gap-8 pt-16">
          <Link to={buildUrl({ sub: undefined })} className={subTabClass(subParam === 'all')}>
            전체
          </Link>
          {subCategories.map((sub) => (
            <Link key={sub} to={buildUrl({ sub })} className={subTabClass(subParam === sub)}>
              {sub}
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-8 pt-16">
        <Link to={buildUrl({ size: undefined })} className={subTabClass(sizeParam === 'all')}>
          전체 사이즈
        </Link>
        {sizeOptions.map((size) => (
          <Link key={size} to={buildUrl({ size })} className={subTabClass(sizeParam === size)}>
            {size}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between py-16 text-secondary">
        <span className="text-body-sm">{displayedProducts.length}개 상품</span>
        <div className="relative">
          <select
            value={sortParam}
            onChange={(e) => navigate(buildUrl({ sort: e.target.value }))}
            className="text-body-sm appearance-none rounded-sm border border-line py-8 pl-12 pr-36 text-primary"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-secondary"
          />
        </div>
      </div>

      {displayedProducts.length > 0 ? (
        <div className="product-grid gap-y-32">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <p className="text-body-sm">해당 조건에 맞는 상품이 없습니다.</p>
      )}
    </div>
  )
}

export default CategoryListing
