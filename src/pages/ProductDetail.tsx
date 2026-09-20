import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Heart } from 'lucide-react'
import ProductGallery from '../components/ProductGallery'
import SizeSelector from '../components/SizeSelector'
import QuantityStepper from '../components/QuantityStepper'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import RecentlyViewed from '../components/RecentlyViewed'
import ReviewSection from '../components/ReviewSection'
import Toast from '../components/Toast'
import { useProducts } from '../context/ProductsContext'
import { addRecentlyViewed, getRecentlyViewedIds } from '../utils/recentlyViewed'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useReviews } from '../context/ReviewsContext'
import { formatPrice } from '../utils/formatPrice'
import { animateScrollTo } from '../utils/animateScrollTo'
import { SHIPPING_FEE } from '../constants'
import { getSizeChartValue, SIZE_CHART_BY_SUBCATEGORY } from '../constants/sizeChart'
import { clampOrderQuantity, MAX_ORDER_QUANTITY } from '../constants/purchase'
import { NotFoundContent } from './NotFound'

// 로그인 안 된 상태로 담기/구매를 누르면 로그인 모달→/login→복귀 과정에서 이 페이지가
// 통째로 재마운트되어 선택한 사이즈·수량이 날아간다. 그 사이만 잠깐 붙잡아두는 용도라
// 상품ID가 다르면(다른 상품 보다 로그인한 경우 등) 무시하고, 읽는 즉시 지워서 1회성으로 쓴다.
const PENDING_SELECTION_KEY = 'pdp_pending_selection'
const STICKY_TAB_SCROLL_DURATION_MS = 300
type ProductDetailAnchor = 'productInfo' | 'size' | 'review' | 'related'

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// subCategory(코트↔코트) → category(아우터 전체) → gender 순으로 폴백하며 채운다.
// 각 단계 안에서는 셔플해서 매번 같은 4개로 고정되지 않게 한다.
function pickRelatedProducts(pools: Product[][], count: number): Product[] {
  const picked: Product[] = []
  const usedIds = new Set<string>()
  for (const pool of pools) {
    if (picked.length >= count) break
    for (const item of shuffle(pool)) {
      if (picked.length >= count) break
      if (usedIds.has(item.id)) continue
      picked.push(item)
      usedIds.add(item.id)
    }
  }
  return picked
}

function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { items: cartItems, addItem } = useCart()
  const { isWishlisted, toggle } = useWishlist()
  const { user } = useAuth()
  const { openLoginModal } = useAuthModal()
  const { products, loading } = useProducts()
  const { reviews } = useReviews()
  const product = products.find((item) => item.id === productId)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('장바구니에 담았습니다.')
  const [activeAnchor, setActiveAnchor] = useState<ProductDetailAnchor>('productInfo')
  const scrollingToAnchorRef = useRef<ProductDetailAnchor | null>(null)

  useEffect(() => {
    if (product) addRecentlyViewed(product.id)
  }, [product])

  // 스크롤 위치에 따라 상단 탭("상품정보"/"사이즈 및 소재"/"리뷰"/"추천")의 활성 표시를 갱신한다.
  // "상품정보"/"사이즈 및 소재"는 모바일/데스크톱 전용 블록에 중복 렌더링되므로 매번 실제로
  // 보이는 쪽을 다시 찾는다 — 리사이즈로 breakpoint가 바뀌어도 안전하다.
  useEffect(() => {
    const getTargets = () => {
      const findVisible = (selector: string) =>
        Array.from(document.querySelectorAll<HTMLElement>(selector)).find((el) => el.offsetParent !== null)
      const productInfoEl = findVisible('[data-anchor="productInfo"]')
      const sizeEl = findVisible('[data-anchor="size"]')
      const reviewEl = findVisible('[data-anchor="review"]')
      const relatedEl = findVisible('[data-anchor="related"]')
      const targets: Array<{ anchor: 'productInfo' | 'size' | 'review' | 'related'; el: HTMLElement }> = []
      if (productInfoEl) targets.push({ anchor: 'productInfo', el: productInfoEl })
      if (sizeEl) targets.push({ anchor: 'size', el: sizeEl })
      if (reviewEl) targets.push({ anchor: 'review', el: reviewEl })
      if (relatedEl) targets.push({ anchor: 'related', el: relatedEl })
      return targets
    }

    // 헤더(최대 60px) + 탭바 높이만큼 여유를 둬서, 섹션 제목이 탭바 아래로 막
    // 넘어온 시점에 활성으로 바뀌게 한다.
    const ACTIVE_THRESHOLD_PX = 140
    const COMPACT_MAX_WIDTH_PX = 1023
    const SCROLL_POSITION_TOLERANCE_PX = 2

    const handleScroll = () => {
      if (scrollingToAnchorRef.current) return

      const targets = getTargets()
      const isCompactViewport = window.innerWidth <= COMPACT_MAX_WIDTH_PX
      let current: ProductDetailAnchor = 'productInfo'
      for (const { anchor, el } of targets) {
        const scrollMarginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || ACTIVE_THRESHOLD_PX
        const activationThreshold = isCompactViewport
          ? scrollMarginTop + SCROLL_POSITION_TOLERANCE_PX
          : ACTIVE_THRESHOLD_PX
        if (el.getBoundingClientRect().top <= activationThreshold) {
          current = anchor
        }
      }
      setActiveAnchor(current)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [productId])

  // 라우트 파라미터만 바뀌면 컴포넌트가 재마운트되지 않아, 상품을 이동해도
  // 이전 상품에서 고른 사이즈·수량이 그대로 남아있던 문제를 막는다 — 단, 로그인
  // 유도 후 복귀 시 저장해둔 선택값이 있으면 리셋 대신 그걸 복원한다.
  // 두 동작을 한 effect로 합쳐서 처리한 이유: React 18 StrictMode(개발 모드)는
  // 마운트 effect를 두 번 연달아 실행하는데, "복원"과 "리셋"이 서로 다른 effect로
  // 나뉘어 있으면 1차 실행에서 정상 복원된 값을 2차 실행의 리셋 effect가 덮어써버리는
  // 버그가 있었다(로그인 후 사이즈/수량이 항상 초기화되던 원인). productId별로 한 번만
  // 처리하도록 ref로 막아서 이 이중 실행에도 안전하게 만든다.
  const processedProductIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (processedProductIdRef.current === productId) return
    processedProductIdRef.current = productId

    if (user && productId) {
      try {
        const raw = sessionStorage.getItem(PENDING_SELECTION_KEY)
        if (raw) {
          const saved = JSON.parse(raw) as { productId: string; selectedSize: string | null; quantity: number }
          if (saved.productId === productId) {
            sessionStorage.removeItem(PENDING_SELECTION_KEY)
            setSelectedSize(saved.selectedSize)
            setSizeError(false)
            setQuantity(clampOrderQuantity(saved.quantity))
            return
          }
        }
      } catch {
        // 저장된 값이 깨져있어도 페이지는 정상 동작해야 하므로 무시하고 아래에서 리셋한다.
      }
    }

    setSelectedSize(null)
    setSizeError(false)
    setQuantity(1)
  }, [productId, user])

  // 셔플이 들어가서(subCategory→category→gender 폴백 풀 안에서 매번 섞음) 렌더될 때마다 다시
  // 계산하면 스크롤로 activeAnchor가 바뀔 때마다(리렌더 유발) 추천 상품이 계속 바뀌어 보이는
  // 버그가 있었다. product가 바뀔 때만(=다른 상품 페이지로 이동할 때만) 재계산하도록 고정한다.
  const relatedProducts = useMemo(() => {
    if (!product) return []
    const recentlyViewedIds = new Set(getRecentlyViewedIds())
    const candidates = products.filter((item) => item.id !== product.id && item.gender === product.gender)
    const freshCandidates = candidates.filter((item) => !recentlyViewedIds.has(item.id))
    const relatedPools = [
      freshCandidates.filter((item) => item.subCategory === product.subCategory),
      freshCandidates.filter((item) => item.category === product.category),
      freshCandidates,
      // 같은 성별에 신상품이 4개가 안 될 만큼 적으면 "최근 본 상품"과 겹치더라도 채운다.
      candidates.filter((item) => item.subCategory === product.subCategory),
      candidates.filter((item) => item.category === product.category),
      candidates,
    ]
    return pickRelatedProducts(relatedPools, 4)
  }, [product, products])

  if (loading) {
    return (
      <div className="page-section">
        <p className="text-body-lg">불러오는 중...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <NotFoundContent
        title="상품을 찾을 수 없습니다."
        message="판매가 종료되었거나 존재하지 않는 상품입니다."
        documentTitle="상품을 찾을 수 없습니다 | NOVERA"
      />
    )
  }

  const hasOtherRecentlyViewed = getRecentlyViewedIds().some((id) => id !== product.id)
  const reviewCount = reviews.filter((review) => review.productId === product.id).length

  const handleSelectSize = (size: string) => {
    setSelectedSize(size)
    setSizeError(false)
  }

  const savePendingSelection = () => {
    try {
      sessionStorage.setItem(
        PENDING_SELECTION_KEY,
        JSON.stringify({ productId: product.id, selectedSize, quantity })
      )
    } catch {
      // 저장 실패해도 로그인 유도 자체는 계속 진행되어야 한다.
    }
  }

  // 모바일 하단 고정바에서 누르면 사이즈 선택 영역이 이미 스크롤 밖으로 벗어나 있을 수
  // 있어서, 에러 문구만으로는 원인이 안 보일 수 있다 — 현재 보이는(mobile/desktop 중
  // display:none이 아닌) 사이즈 영역으로 스크롤해서 강조한다.
  const scrollToSizeSection = () => {
    const sections = document.querySelectorAll<HTMLElement>('[data-size-section]')
    const visible = Array.from(sections).find((el) => el.offsetParent !== null)
    visible?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // 각 섹션은 모바일/태블릿과 데스크톱 전용 블록에 중복 렌더링될 수 있으므로,
  // 현재 breakpoint에서 실제로 보이는 쪽을 찾아서 스크롤한다.
  // scrollIntoView 대신 목표 좌표를 직접 계산해서 scrollTo로 이동한다 — scrollIntoView는
  // scroll-margin-top 계산이 브라우저/타이밍에 따라 미묘하게 어긋나는 경우가 있어서(스크롤이
  // 의도한 지점보다 훨씬 더 내려가 sticky 탭바가 화면 밖으로 사라지는 버그가 있었다),
  // 매번 같은 결과가 나오는 이 방식이 더 안전하다.
  const scrollToAnchor = (anchor: ProductDetailAnchor) => {
    const el = Array.from(document.querySelectorAll<HTMLElement>(`[data-anchor="${anchor}"]`)).find(
      (item) => item.offsetParent !== null,
    )
    if (!el) return
    const scrollMarginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
    const target = window.scrollY + el.getBoundingClientRect().top - scrollMarginTop
    scrollingToAnchorRef.current = anchor
    setActiveAnchor(anchor)
    animateScrollTo(target, STICKY_TAB_SCROLL_DURATION_MS, () => {
      if (scrollingToAnchorRef.current === anchor) scrollingToAnchorRef.current = null
    })
  }

  const handleAddToCart = () => {
    if (!user) {
      savePendingSelection()
      openLoginModal()
      return
    }
    if (!selectedSize) {
      setSizeError(true)
      scrollToSizeSection()
      return
    }
    const cartItemId = `${product.id}-${product.color.label}-${selectedSize}`
    const existingQuantity = cartItems.find((item) => item.id === cartItemId)?.quantity ?? 0
    const reachesMaximum = existingQuantity + quantity > MAX_ORDER_QUANTITY
    addItem(product, selectedSize, quantity)
    setToastMessage(
      reachesMaximum
        ? `동일 옵션은 최대 ${MAX_ORDER_QUANTITY}개까지 담을 수 있어 수량을 조정했습니다.`
        : '장바구니에 담았습니다.',
    )
    setShowToast(true)
  }

  const handleBuyNow = () => {
    if (!user) {
      savePendingSelection()
      openLoginModal()
      return
    }
    if (!selectedSize) {
      setSizeError(true)
      scrollToSizeSection()
      return
    }
    navigate('/order', {
      state: {
        items: [
          {
            id: `${product.id}-${product.color.label}-${selectedSize}`,
            productId: product.id,
            name: product.name,
            option: `${product.color.label} · ${selectedSize}`,
            price: product.salePrice ?? product.price,
            quantity,
            image: product.image,
          },
        ],
      },
    })
  }

  // 상품명/가격/찜/컬러/사이즈/수량 — 모바일 요약 블록과 데스크톱 정보 컬럼에서 공유(중복 작성 방지).
  // selectedSize 등은 이 컴포넌트 하나의 state라 두 군데 어디서 눌러도 항상 같이 갱신됨.
  // 배송안내/구매버튼(shippingAndCta)과 분리해둔 이유: 모바일은 그 사이에 "제품 정보"를 끼워 넣어야 해서(아래).
  const purchaseSelectors = (
    <>
      <div className="flex items-start justify-between gap-16">
        <div>
          <h1 className="text-h3 font-bold mb-8">{product.name}</h1>
          {product.salePrice != null ? (
            <p className="flex items-center gap-8">
              <span className="text-price font-semibold text-point">{formatPrice(product.salePrice)}</span>
              <span className="text-body-sm text-disabled line-through">{formatPrice(product.price)}</span>
            </p>
          ) : (
            <p className="text-price font-medium">{formatPrice(product.price)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => toggle(product.id)}
          className={`flex h-40 w-40 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-colors ${
            isWishlisted(product.id) ? 'text-danger' : 'text-primary'
          }`}
          aria-label={isWishlisted(product.id) ? '찜 해제' : '위시리스트 추가'}
          aria-pressed={isWishlisted(product.id)}
        >
          <Heart size={20} strokeWidth={2} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex flex-col gap-12">
        <p className="text-body-lg">컬러: {product.color.label}</p>
        <div
          className="h-32 w-32 rounded-full border border-line"
          style={{ backgroundColor: product.color.hex }}
          aria-label={product.color.label}
        />
      </div>

      <div
        data-size-section
        className={`-m-8 flex flex-col gap-12 rounded-sm p-8 ring-1 transition-colors duration-300 ${
          sizeError ? 'bg-danger/5 ring-danger' : 'ring-transparent'
        }`}
      >
        <p className="text-body-lg">사이즈</p>
        <div className="flex flex-wrap gap-8">
          {product.sizes.map((size) => (
            <SizeSelector
              key={size}
              size={size}
              selected={selectedSize === size}
              onClick={() => handleSelectSize(size)}
            />
          ))}
        </div>
        {sizeError && <p className="text-caption text-danger">사이즈를 선택해주세요.</p>}
      </div>

      {selectedSize && (
        <div className="flex flex-col items-start gap-12">
          <p className="text-body-lg">수량</p>
          <QuantityStepper value={quantity} onChange={setQuantity} max={MAX_ORDER_QUANTITY} />
          <p className="text-caption text-secondary">
            동일 상품·사이즈는 최대 {MAX_ORDER_QUANTITY}개까지 구매할 수 있습니다.
          </p>
        </div>
      )}
    </>
  )

  const shippingAndCta = (
    <div className="flex flex-col gap-4 text-body-sm text-secondary">
      <p className="font-medium text-primary">배송 정보</p>
      <p>택배 배송(일반)</p>
      <p>배송비 기본 {formatPrice(SHIPPING_FEE)}</p>
    </div>
  )

  // 데스크톱은 기존 그대로 "선택 UI 다음에 바로 배송안내" 순서를 유지(변경 없음).
  const purchaseEssentials = (
    <>
      {purchaseSelectors}
      {shippingAndCta}
    </>
  )

  const descriptionBlock = (
    <div className="flex flex-col gap-12 rounded-sm border border-line/50 p-24">
      <p className="text-h3">{product.name}</p>
      <p className="text-body-sm whitespace-pre-line leading-[1.6] text-secondary">{product.description}</p>
    </div>
  )

  // 실측사이즈 표. 측정 항목 구성은 subCategory 단위로 고정(sizeChart.ts 참고), 실제 cm 수치는 관리자 입력 없이
  // base+step 공식으로 자동 생성한 임의 값 — 실제 실측을 반영한 수치는 아니다(추후 상품별 실측값으로 교체 예정).
  // 도식 이미지는 해상도 문제로 보류 — 표만 먼저 넣는다.
  const sizeChartFields = SIZE_CHART_BY_SUBCATEGORY[product.subCategory] ?? []
  const sizeAndMaterialBlock = (
    <div className="flex flex-col gap-16">
      <h2 className="text-xl font-bold lg:text-2xl">사이즈 가이드</h2>
      <p className="text-body text-secondary lg:text-body-lg">
        소재 특성 및 측정 방법에 따라 약 1-3cm의 오차가 발생할 수 있으며, 이는 불량 사유에 해당하지 않는 점 참고
        부탁드립니다.
      </p>

      {sizeChartFields.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-360 border-collapse text-center">
            <thead>
              <tr className="border-b border-line/50 bg-surface-muted text-body text-secondary lg:text-body-lg">
                <th className="px-12 py-8 text-left font-medium">사이즈</th>
                {product.sizes.map((size) => (
                  <th key={size} className="px-12 py-8 font-medium">
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeChartFields.map((field) => (
                <tr key={field.label} className="border-b border-line/50 text-body lg:text-body-lg">
                  <td className="px-12 py-8 text-left font-medium">{field.label}</td>
                  {product.sizes.map((size, index) => (
                    <td key={size} className="px-12 py-8 text-secondary">
                      {getSizeChartValue(field, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // 데스크톱(이미지 위)과 모바일/태블릿(이미지-상품명 사이)에서 위치만 다르고 내용은 동일해서 공용으로 뺐다.
  const breadcrumbLinks = (
    <>
      <Link to={`/${product.gender}`} className="hover:text-primary">
        {product.gender === 'men' ? 'MEN' : 'WOMEN'}
      </Link>
      <span aria-hidden="true">/</span>
      <Link to={`/${product.gender}?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">
        {product.category}
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-primary">{product.subCategory}</span>
    </>
  )

  const tabNavItems: Array<{ anchor: 'productInfo' | 'size' | 'review' | 'related'; label: string }> = [
    { anchor: 'productInfo', label: '상품정보' },
    { anchor: 'size', label: '사이즈' },
    { anchor: 'review', label: `리뷰 ${reviewCount}` },
    { anchor: 'related', label: '추천' },
  ]

  return (
    <div className="pb-112 lg:pb-0">
      <Helmet>
        <title>{`NOVERA | ${product.name}`}</title>
      </Helmet>

      {/* 헤더 바로 아래 위치 표시(브레드크럼). 데스크톱 전용 — 아래 그리드와 동일한 폭/패딩을 맞춰서 이미지 칼럼
          시작 위치와 정렬한다. 모바일/태블릿은 이미지와 상품명 사이로 위치가 달라서 아래에 별도로 둔다. */}
      <nav
        aria-label="현재 위치"
        className="hidden items-center gap-8 px-20 pt-16 pb-16 text-body-sm text-secondary lg:mx-auto lg:flex lg:max-w-1920 lg:px-80 lg:pt-24 lg:pb-32 xl:px-140 2xl:px-200"
      >
        {breadcrumbLinks}
      </nav>

      {/* 모바일 전용: 사진 1장만 보고 바로 이름/가격/사이즈에 닿도록 순서를 다시 짬(데스크톱은 아래 별도 블록, 손 안 댐) */}
      <div className="flex flex-col gap-32 px-20 pt-32 md:px-32 lg:hidden">
        <ProductGallery images={[product.image, ...product.detailImages]} />

        {/* 데스크톱과 달리 이미지 바로 위가 아니라, 이미지와 상품명 사이에 위치 */}
        <nav aria-label="현재 위치" className="flex items-center gap-8 text-body-sm text-secondary">
          {breadcrumbLinks}
        </nav>

        {purchaseEssentials}

        {/* 방금 지운 모바일 전용 "바로 구매" 버튼이 있던 자리 — 탭바를 여기로 옮겨서, 처음엔 일반 콘텐츠처럼
            있다가 스크롤이 이 지점을 넘어가면 그때부터 헤더 아래 고정(sticky)된다. 4등분(grid-cols-4)해서
            가운데로 몰리지 않게 하고, 활성 탭은 블랙 border-bottom, 비활성은 연한 회색 border-bottom으로 표시한다. */}
        <nav className="sticky top-[var(--mobile-header-height)] z-fixed-bar grid h-40 grid-cols-4 bg-surface text-body tracking-[-0.02em] md:top-[var(--tablet-header-height)]">
          {tabNavItems.map(({ anchor, label }) => (
            <button
              key={anchor}
              type="button"
              onClick={() => scrollToAnchor(anchor)}
              className={`flex h-full cursor-pointer items-center justify-center whitespace-nowrap border-0 border-b bg-transparent px-1 text-center font-medium ${
                activeAnchor === anchor ? 'text-primary border-primary' : 'text-disabled border-line/50'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div
          data-anchor="productInfo"
          className="scroll-mt-[calc(var(--mobile-header-height)+40px)] md:scroll-mt-[calc(var(--tablet-header-height)+40px)]"
        >
          {descriptionBlock}
        </div>

        {product.detailImages.length > 0 && (
          <div className="flex flex-col gap-4">
            {product.detailImages.map((src, index) => (
              <div
                key={index}
                className="aspect-[4/5] bg-surface-muted bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${src})` }}
              />
            ))}
          </div>
        )}

        <div
          data-anchor="size"
          className="scroll-mt-[calc(var(--mobile-header-height)+40px)] md:scroll-mt-[calc(var(--tablet-header-height)+40px)]"
        >
          {sizeAndMaterialBlock}
        </div>

        {/* 리뷰와 추천 상품을 탭바와 같은 컨테이너 안에 둬서, 모바일·태블릿에서는 추천 상품을
            살펴보는 동안에도 탭바가 유지되고 추천 영역이 끝난 뒤에만 sticky가 해제되게 한다. */}
        <div
          data-anchor="review"
          className="scroll-mt-[calc(var(--mobile-header-height)+40px)] md:scroll-mt-[calc(var(--tablet-header-height)+40px)]"
        >
          <ReviewSection productId={product.id} />
        </div>

        <section
          data-anchor="related"
          className="scroll-mt-[calc(var(--mobile-header-height)+40px)] md:scroll-mt-[calc(var(--tablet-header-height)+40px)] md:pt-16"
        >
          <div className="page-section__header">
            <h2 className="text-xl font-bold">추천 상품</h2>
          </div>
          <div className="product-grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} {...item} />
            ))}
          </div>
        </section>
      </div>

      {/* 데스크톱 전용: 좌(이미지+제품정보+탭바+상세이미지+리뷰)/우(구매 패널, sticky) 65:35 비율, 1600px에서 폭 제한.
          탭바는 모바일과 동일하게 좌측 칼럼 안의 일반 흐름 요소로 두고 sticky로 붙인다 — 그리드를
          더는 복제할 필요 없이 좌측 칼럼 폭에 자연히 맞음. 헤더 높이(64px)만큼 top을 줘서 그 아래에 붙는다. */}
      <div className="hidden lg:mx-auto lg:grid lg:max-w-1920 lg:grid-cols-[13fr_7fr] lg:gap-x-64 lg:px-80 xl:px-140 2xl:px-200">
        <div className="bg-surface">
          <ProductGallery images={[product.image, ...product.detailImages]} />

          <div data-anchor="productInfo" className="scroll-mt-112 pt-40 pb-30">
            {descriptionBlock}
          </div>

          {/* 4등분(grid-cols-4)해서 가운데로 몰리지 않게 하고, 활성 탭은 border-bottom(블랙)으로,
              비활성은 연한 회색 밑줄로 표시한다(모바일 탭바와 동일한 색 규칙). */}
          <nav className="sticky top-60 z-fixed-bar grid grid-cols-4 bg-surface text-body tracking-[-0.02em]">
            {tabNavItems.map(({ anchor, label }) => (
              <button
                key={anchor}
                type="button"
                onClick={() => scrollToAnchor(anchor)}
                className={`cursor-pointer border-0 border-b bg-transparent px-20 py-16 text-center font-medium ${
                  activeAnchor === anchor ? 'text-primary border-primary' : 'text-disabled border-line/50'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {product.detailImages.length > 0 && (
            <div className="flex flex-col gap-4 py-40">
              {product.detailImages.map((src, index) => (
                <div
                  key={index}
                  className="aspect-[4/5] bg-surface-muted bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${src})` }}
                />
              ))}
            </div>
          )}

          <div data-anchor="size" className="scroll-mt-112 border-t border-line py-40 pr-40">
            {sizeAndMaterialBlock}
          </div>

          {/* 오른쪽 구매 칸(sticky)이 리뷰까지 따라 내려오도록, 좌측 칼럼 안에 리뷰를 포함시켜서 칼럼 높이를 늘린다.
              타이틀+리뷰작성 버튼은 ReviewSection 안으로 옮겨서 버튼을 타이틀 바로 아래 둘 수 있게 했다. */}
          <div data-anchor="review" className="scroll-mt-112 border-t border-line py-40 pr-40">
            <ReviewSection productId={product.id} />
          </div>
        </div>

        <div className="flex flex-col gap-32 self-start bg-surface px-40 py-40 lg:sticky lg:top-60">
          {purchaseEssentials}

          <div className="flex flex-col gap-12">
            <Button variant="secondary" size="large" className="h-44 w-full !py-0" onClick={handleAddToCart}>
              장바구니 담기
            </Button>
            <Button variant="primary" size="large" className="h-44 w-full !py-0" onClick={handleBuyNow}>
              바로 구매
            </Button>
          </div>
        </div>
      </div>

      <div className="safe-fixed-bar-x fixed inset-x-0 bottom-0 z-fixed-bar flex gap-8 border-t border-line bg-surface pb-[calc(12px+env(safe-area-inset-bottom))] pt-12 lg:hidden">
        <Button
          variant="secondary"
          size="large"
          className="h-44 flex-1 !py-0 !text-[14px] tracking-[-0.02em]"
          onClick={handleAddToCart}
        >
          장바구니 담기
        </Button>
        <Button
          variant="primary"
          size="large"
          className="h-44 flex-1 !py-0 !text-[14px] tracking-[-0.02em]"
          onClick={handleBuyNow}
        >
          바로 구매
        </Button>
      </div>

      <section data-anchor="related" className="page-section hidden lg:block lg:scroll-mt-130">
        <div className="page-section__header">
          <h2 className="text-xl font-bold lg:text-2xl">추천 상품</h2>
        </div>
        <div className="product-grid">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
      </section>

      {hasOtherRecentlyViewed && (
        <section className="page-section">
          <div className="page-section__header">
            <h2 className="text-xl font-bold lg:text-2xl">최근 본 상품</h2>
          </div>
          <RecentlyViewed excludeId={product.id} hideWhenEmpty dense collapsible />
        </section>
      )}

      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}

export default ProductDetail
