import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, Search, X } from 'lucide-react'
import Button from './Button'
import ProductCard from './ProductCard'
import { CATEGORY_TABS as TABS, SUB_CATEGORIES } from '../constants/categoryFilters'
import { useBestsellers } from '../context/BestsellersContext'
import type { Gender, Product } from '../types'

const PRODUCTS_PER_PAGE = 12

const SORT_OPTIONS = [
  { id: 'default', label: '기본순' },
  { id: 'new', label: '신상품순' },
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
  defaultGender: 'all' | Gender
  categoryParam: string
  heroImageMobile?: string
  heroImageDesktop?: string
}

function CategoryListing({
  basePath,
  products,
  defaultGender,
  categoryParam,
  heroImageMobile,
  heroImageDesktop,
}: CategoryListingProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const subParam = searchParams.get('sub') ?? 'all'
  const sortParam = searchParams.get('sort') ?? 'default'
  const qParam = searchParams.get('q') ?? ''
  const genderOverride = searchParams.get('gender')
  const saleOnly = searchParams.get('sale') === 'true'
  const { bestsellerProductIds } = useBestsellers()

  const [queryInput, setQueryInput] = useState(qParam)
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE)

  useEffect(() => {
    setQueryInput(qParam)
  }, [qParam])

  const isSearching = qParam.trim().length > 0
  // 검색 중이거나(기존 동작), basePath 자체가 성별 무관("/shop")이면 URL의 gender로
  // 세부 필터링 가능. Men/Women 페이지(defaultGender가 'men'|'women' 고정)는 기존과 동일하게
  // genderOverride를 무시하고 defaultGender를 그대로 쓴다.
  const effectiveGender: 'all' | Gender =
    isSearching || defaultGender === 'all' ? (genderOverride as 'all' | Gender) || 'all' : defaultGender
  const genderLabel = effectiveGender === 'all' ? '전체' : effectiveGender.toUpperCase()
  const genderPathLabel = effectiveGender === 'men' ? '남자' : effectiveGender === 'women' ? '여자' : '전체'
  const genderHomePath =
    effectiveGender === 'men' ? '/men' : effectiveGender === 'women' ? '/women' : '/shop?category=all'

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE)
  }, [categoryParam, subParam, sortParam, qParam, effectiveGender])

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams)
    params.delete('size')
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
    params.delete('size')
    return `${basePath}?${params.toString()}`
  }

  const handleQueryChange = (value: string) => {
    setQueryInput(value)
    navigate(buildUrl({ q: value || undefined }), { replace: true })
  }

  const title = isSearching
    ? `"${qParam}" 검색 결과`
    : saleOnly
      ? '할인 상품'
      : sortParam === 'best'
        ? '베스트'
        : categoryParam === 'all'
          ? '전체 상품'
          : categoryParam

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

  const bySale = saleOnly ? bySub.filter((product) => product.salePrice != null) : bySub

  const discountRate = (product: Product) =>
    product.salePrice != null ? (product.price - product.salePrice) / product.price : 0

  const bestRank = new Map(bestsellerProductIds.map((id, index) => [id, index]))

  const displayedProducts = [...bySale].sort((a, b) => {
    if (sortParam === 'price-asc') return (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
    if (sortParam === 'price-desc') return (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
    if (sortParam === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortParam === 'best') {
      const rankA = bestRank.get(a.id) ?? Number.MAX_SAFE_INTEGER
      const rankB = bestRank.get(b.id) ?? Number.MAX_SAFE_INTEGER
      return rankA - rankB
    }
    if (saleOnly) return discountRate(b) - discountRate(a)
    return 0
  })

  const subTabClass = (active: boolean) =>
    `rounded-full border px-16 py-6 text-body-sm no-underline transition-colors active:scale-95 ${
      active
        ? 'border-primary bg-primary text-surface'
        : 'border-line text-secondary hover:border-primary hover:text-primary'
    }`

  return (
    <div className="pb-92 md:pb-48 lg:pb-64">
      <Helmet>
        <title>{`NOVERA | ${genderLabel} | ${title}`}</title>
      </Helmet>

      {(heroImageMobile || heroImageDesktop) && (
        <div className="relative mb-24 h-[50vh] overflow-hidden bg-secondary md:mb-32">
          <div
            className="absolute inset-0 hidden bg-cover bg-center lg:block"
            style={heroImageDesktop ? { backgroundImage: `url(${heroImageDesktop})` } : undefined}
          />
          <div
            className="absolute inset-0 bg-cover bg-center lg:hidden"
            style={
              heroImageMobile || heroImageDesktop
                ? { backgroundImage: `url(${heroImageMobile || heroImageDesktop})` }
                : undefined
            }
          />
        </div>
      )}

      <div
        className={`px-20 md:px-32 lg:px-80 xl:px-140 2xl:px-200 ${
          isSearching ? 'pt-32 md:pt-48' : 'pt-16 md:pt-24 lg:pt-48'
        }`}
      >
      <div className={isSearching ? 'mb-24' : 'lg:mb-24'}>
        {isSearching ? (
          <p className="text-caption mb-8 tracking-[0.08em] text-secondary">NOVERA | {genderLabel}</p>
        ) : (
          <nav
            aria-label="현재 상품 분류"
            className="text-caption mb-8 hidden items-center gap-6 tracking-[0.08em] text-secondary lg:flex"
          >
            <Link to={genderHomePath} className="text-secondary no-underline hover:text-primary">
              {genderPathLabel}
            </Link>
            <span aria-hidden="true">&gt;</span>
            <span>{title}</span>
          </nav>
        )}
        <h1
          className={
            isSearching
              ? 'text-[40px] font-bold leading-[1.25] tracking-[-0.02em]'
              : 'text-h2 sr-only lg:not-sr-only'
          }
        >
          {title}
        </h1>
      </div>

      {isSearching && (
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
      )}

      {(isSearching || defaultGender === 'all') && (
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

      <div className="-mx-20 grid grid-cols-4 border-b border-line md:mx-0 md:flex md:gap-24">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            to={categoryTabUrl(tab.id)}
            className={`-mb-px w-full border-b py-12 text-center text-sm font-medium no-underline transition-colors active:scale-95 hover:border-primary hover:text-primary md:w-auto ${
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
        <>
          <div className="product-grid gap-y-32">
            {displayedProducts.slice(0, visibleCount).map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          {displayedProducts.length > visibleCount && (
            <div className="mt-32 flex justify-center">
              <Button
                variant="secondary"
                onClick={() => setVisibleCount((count) => count + PRODUCTS_PER_PAGE)}
              >
                더보기
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-body-sm">해당 조건에 맞는 상품이 없습니다.</p>
      )}
      </div>
    </div>
  )
}

export default CategoryListing
