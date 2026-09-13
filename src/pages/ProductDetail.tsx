import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, Heart } from 'lucide-react'
import SizeSelector from '../components/SizeSelector'
import QuantityStepper from '../components/QuantityStepper'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import RecentlyViewed from '../components/RecentlyViewed'
import ReviewSection from '../components/ReviewSection'
import Toast from '../components/Toast'
import InfoTooltip from '../components/InfoTooltip'
import { useProducts } from '../context/ProductsContext'
import { addRecentlyViewed, getRecentlyViewedIds } from '../utils/recentlyViewed'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { formatPrice } from '../utils/formatPrice'
import { SHIPPING_FEE } from '../constants'
import { RETURN_WINDOW_DAYS } from '../utils/orderStats'

// 로그인 안 된 상태로 담기/구매를 누르면 로그인 모달→/login→복귀 과정에서 이 페이지가
// 통째로 재마운트되어 선택한 사이즈·수량이 날아간다. 그 사이만 잠깐 붙잡아두는 용도라
// 상품ID가 다르면(다른 상품 보다 로그인한 경우 등) 무시하고, 읽는 즉시 지워서 1회성으로 쓴다.
const PENDING_SELECTION_KEY = 'pdp_pending_selection'

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
  const { addItem } = useCart()
  const { isWishlisted, toggle } = useWishlist()
  const { user } = useAuth()
  const { openLoginModal } = useAuthModal()
  const { products, loading } = useProducts()
  const product = products.find((item) => item.id === productId)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [showToast, setShowToast] = useState(false)
  const [descriptionOpen, setDescriptionOpen] = useState(true)
  const [activeAnchor, setActiveAnchor] = useState<'info' | 'review' | 'related'>('info')

  useEffect(() => {
    if (product) addRecentlyViewed(product.id)
  }, [product])

  // 스크롤 위치에 따라 상단 탭("정보"/"리뷰"/"추천")의 활성 표시를 갱신한다.
  // "정보"는 모바일/데스크톱 전용 블록에 중복 렌더링되므로(위 사이즈 섹션과 동일한 이유)
  // 매번 실제로 보이는 쪽을 다시 찾는다 — 리사이즈로 breakpoint가 바뀌어도 안전하다.
  useEffect(() => {
    const getTargets = () => {
      const infoCandidates = document.querySelectorAll<HTMLElement>('[data-anchor="info"]')
      const infoEl = Array.from(infoCandidates).find((el) => el.offsetParent !== null)
      const reviewEl = document.getElementById('review-section')
      const relatedEl = document.getElementById('related-section')
      const targets: Array<{ anchor: 'info' | 'review' | 'related'; el: HTMLElement }> = []
      if (infoEl) targets.push({ anchor: 'info', el: infoEl })
      if (reviewEl) targets.push({ anchor: 'review', el: reviewEl })
      if (relatedEl) targets.push({ anchor: 'related', el: relatedEl })
      return targets
    }

    // 헤더(최대 64px) + 탭바 높이만큼 여유를 둬서, 섹션 제목이 탭바 아래로 막
    // 넘어온 시점에 활성으로 바뀌게 한다.
    const ACTIVE_THRESHOLD_PX = 140

    const handleScroll = () => {
      const targets = getTargets()
      let current: 'info' | 'review' | 'related' = 'info'
      for (const { anchor, el } of targets) {
        if (el.getBoundingClientRect().top <= ACTIVE_THRESHOLD_PX) {
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
            setQuantity(saved.quantity)
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

  if (loading) {
    return (
      <div className="page-section">
        <p className="text-body-lg">불러오는 중...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page-section">
        <p className="text-body-lg">상품을 찾을 수 없습니다.</p>
      </div>
    )
  }

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
  const relatedProducts = pickRelatedProducts(relatedPools, 4)
  const hasOtherRecentlyViewed = getRecentlyViewedIds().some((id) => id !== product.id)

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

  // "정보"는 모바일/데스크톱 전용 블록에 각각 한 번씩 중복 렌더링되므로(위 사이즈 섹션과
  // 동일한 이유) 실제로 보이는 쪽을 찾아서 스크롤한다. "리뷰"/"추천 상품"은 중복 없이
  // 페이지 하단에 한 번만 있어서 id로 바로 찾는다.
  const scrollToAnchor = (anchor: 'info' | 'review' | 'related') => {
    if (anchor === 'info') {
      const sections = document.querySelectorAll<HTMLElement>('[data-anchor="info"]')
      const visible = Array.from(sections).find((el) => el.offsetParent !== null)
      visible?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const id = anchor === 'review' ? 'review-section' : 'related-section'
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    addItem(product, selectedSize, quantity)
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

  // 상품명/가격/찜/컬러/사이즈 — 모바일 요약 블록과 데스크톱 정보 컬럼에서 공유(중복 작성 방지).
  // selectedSize 등은 이 컴포넌트 하나의 state라 두 군데 어디서 눌러도 항상 같이 갱신됨.
  const purchaseEssentials = (
    <>
      <div className="flex items-start justify-between gap-16">
        <div>
          <h1 className="text-h3 font-bold mb-8">{product.name}</h1>
          {product.salePrice != null ? (
            <p className="flex items-center gap-8">
              <span className="text-body-sm text-disabled line-through">{formatPrice(product.price)}</span>
              <span className="text-price font-medium text-point">{formatPrice(product.salePrice)}</span>
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
          <Heart size={20} strokeWidth={1.5} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
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

      <div className="flex flex-col items-start gap-12">
        <p className="text-body-lg">수량</p>
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </div>

      <InfoTooltip label="배송·반품 안내">
        배송비 {formatPrice(SHIPPING_FEE)} · 배송완료 후 {RETURN_WINDOW_DAYS}일 이내 반품 신청이 가능합니다.
      </InfoTooltip>

      {/* 모바일/태블릿 전용: 하단 고정바까지 안 가도 여기서 바로 구매할 수 있게. 데스크톱은 바로 아래에 구매 버튼이 있어 중복이라 숨김 */}
      <Button variant="primary" size="large" className="w-full lg:hidden" onClick={handleBuyNow}>
        바로 구매
      </Button>

      {!user && <p className="text-caption text-secondary">로그인 후 담기·구매가 가능합니다.</p>}
    </>
  )

  const descriptionBlock = (
    <div className="flex flex-col gap-12">
      <button
        type="button"
        onClick={() => setDescriptionOpen((prev) => !prev)}
        className="flex cursor-pointer items-center justify-between border-none bg-transparent p-0 text-h3"
        aria-expanded={descriptionOpen}
      >
        <span>제품 정보</span>
        <ChevronDown
          size={20}
          strokeWidth={1.5}
          className={`transition-transform duration-200 ${descriptionOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {descriptionOpen && (
        <p className="text-body-sm whitespace-pre-line leading-[1.6] text-secondary">{product.description}</p>
      )}
    </div>
  )

  return (
    <div className="pb-112 lg:pb-0">
      <Helmet>
        <title>{`NOVERA | ${product.name}`}</title>
      </Helmet>

      {/* 모바일 전용 탭바: 데스크톱은 좌측 이미지 칼럼 밑으로 옮겨서 별도로 둠(아래) */}
      <nav className="sticky top-48 z-fixed-bar flex justify-center gap-16 border-b border-line bg-surface-muted px-20 text-body text-secondary md:gap-80 lg:hidden">
        <button
          type="button"
          onClick={() => scrollToAnchor('info')}
          className={`cursor-pointer rounded-sm border-none px-20 py-16 font-medium hover:text-primary ${
            activeAnchor === 'info' ? 'bg-line text-primary underline underline-offset-8' : 'bg-transparent'
          }`}
        >
          정보
        </button>
        <button
          type="button"
          onClick={() => scrollToAnchor('review')}
          className={`cursor-pointer rounded-sm border-none px-20 py-16 font-medium hover:text-primary ${
            activeAnchor === 'review' ? 'bg-line text-primary underline underline-offset-8' : 'bg-transparent'
          }`}
        >
          리뷰
        </button>
        <button
          type="button"
          onClick={() => scrollToAnchor('related')}
          className={`cursor-pointer rounded-sm border-none px-20 py-16 font-medium hover:text-primary ${
            activeAnchor === 'related' ? 'bg-line text-primary underline underline-offset-8' : 'bg-transparent'
          }`}
        >
          추천
        </button>
      </nav>

      {/* 모바일 전용: 사진 1장만 보고 바로 이름/가격/사이즈에 닿도록 순서를 다시 짬(데스크톱은 아래 별도 블록, 손 안 댐) */}
      <div className="flex flex-col gap-32 px-20 pt-32 md:px-32 lg:hidden">
        <div
          data-anchor="info"
          className="aspect-[4/5] scroll-mt-96 bg-surface-muted bg-cover bg-center bg-no-repeat md:scroll-mt-112"
          style={{ backgroundImage: `url(${product.image})` }}
        />

        {purchaseEssentials}

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

        {descriptionBlock}
      </div>

      {/* 데스크톱 전용 탭바: 그리드 안쪽 sticky는 그리드 영역을 벗어나면(리뷰/추천 지나서) 같이 사라지는 문제가 있어서,
          그리드 밖으로 꺼내 페이지 전체 기준 fixed로 바꿈 — 맨 아래로 스크롤해도 항상 보임.
          그리드와 동일한 mx-auto/max-w-1920/grid-cols-[11fr_9fr]를 그대로 복제해서 버튼 위치를 이미지 칼럼과 맞춤 */}
      <nav className="fixed inset-x-0 top-64 z-fixed-bar hidden bg-surface-muted text-body text-secondary lg:block">
        <div className="mx-auto grid max-w-1920 grid-cols-[11fr_9fr] gap-64">
          <div className="flex justify-center gap-80 px-20">
            <button
              type="button"
              onClick={() => scrollToAnchor('info')}
              className={`cursor-pointer rounded-sm border-none px-20 py-16 font-medium hover:text-primary ${
                activeAnchor === 'info' ? 'bg-line text-primary underline underline-offset-8' : 'bg-transparent'
              }`}
            >
              정보
            </button>
            <button
              type="button"
              onClick={() => scrollToAnchor('review')}
              className={`cursor-pointer rounded-sm border-none px-20 py-16 font-medium hover:text-primary ${
                activeAnchor === 'review' ? 'bg-line text-primary underline underline-offset-8' : 'bg-transparent'
              }`}
            >
              리뷰
            </button>
            <button
              type="button"
              onClick={() => scrollToAnchor('related')}
              className={`cursor-pointer rounded-sm border-none px-20 py-16 font-medium hover:text-primary ${
                activeAnchor === 'related' ? 'bg-line text-primary underline underline-offset-8' : 'bg-transparent'
              }`}
            >
              추천
            </button>
          </div>
        </div>
      </nav>

      {/* 데스크톱 전용: 좌(이미지 1열)/우(정보, sticky) 5.5:4.5 비율, 1600px에서 폭 제한. 회색 캔버스 위에 흰색 패널 2개.
          위 fixed 탭바가 실제 공간을 안 차지하니(fixed는 흐름에서 빠짐) pt-56으로 탭바 높이만큼 띄워줌 */}
      <div className="hidden lg:mx-auto lg:grid lg:max-w-1920 lg:grid-cols-[11fr_9fr] lg:gap-x-64 lg:pt-56">
        <div className="bg-surface">
          <div data-anchor="info" className="grid scroll-mt-112 grid-cols-1 gap-4 px-40 py-40">
            {[product.image, ...product.detailImages].map((src, index) => (
              <div
                key={index}
                className="aspect-[4/5] bg-surface-muted bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${src})` }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-32 self-start bg-surface-muted px-40 py-40 lg:sticky lg:top-96">
          {purchaseEssentials}

          <div className="flex flex-col gap-12">
            <Button variant="secondary" size="large" className="w-full" onClick={handleAddToCart}>
              장바구니 담기
            </Button>
            <Button variant="primary" size="large" className="w-full" onClick={handleBuyNow}>
              바로 구매
            </Button>
          </div>

          {descriptionBlock}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-fixed-bar flex gap-8 border-t border-line bg-surface px-20 pb-[calc(12px+env(safe-area-inset-bottom))] pt-12 lg:hidden">
        <Button variant="secondary" size="large" className="flex-1" onClick={handleAddToCart}>
          장바구니 담기
        </Button>
        <Button variant="primary" size="large" className="flex-1" onClick={handleBuyNow}>
          바로 구매
        </Button>
      </div>

      <section id="review-section" className="page-section scroll-mt-96 md:scroll-mt-112">
        <div className="page-section__header">
          <h2 className="text-xl font-bold lg:text-2xl">리뷰</h2>
        </div>
        <ReviewSection productId={product.id} />
      </section>

      <section id="related-section" className="page-section scroll-mt-96 md:scroll-mt-112">
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

      <Toast message="장바구니에 담았습니다." show={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}

export default ProductDetail
