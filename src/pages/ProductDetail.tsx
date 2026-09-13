import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Heart } from 'lucide-react'
import SizeSelector from '../components/SizeSelector'
import QuantityStepper from '../components/QuantityStepper'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import RecentlyViewed from '../components/RecentlyViewed'
import Toast from '../components/Toast'
import { useProducts } from '../context/ProductsContext'
import { addRecentlyViewed, getRecentlyViewedIds } from '../utils/recentlyViewed'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { formatPrice } from '../utils/formatPrice'

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

  useEffect(() => {
    if (product) addRecentlyViewed(product.id)
  }, [product])

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

  const handleAddToCart = () => {
    if (!user) {
      savePendingSelection()
      openLoginModal()
      return
    }
    if (!selectedSize) {
      setSizeError(true)
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
          className={`flex h-40 w-40 shrink-0 cursor-pointer items-center justify-center rounded-sm border bg-transparent transition-colors ${
            isWishlisted(product.id) ? 'border-point text-point' : 'border-line text-primary'
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

      <div className="flex flex-col gap-12">
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
        {sizeError && <p className="text-caption text-point">사이즈를 선택해주세요.</p>}
      </div>

      <div className="flex flex-col items-start gap-12">
        <p className="text-body-lg">수량</p>
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </div>

      {!user && <p className="text-caption text-secondary">로그인 후 담기·구매가 가능합니다.</p>}
    </>
  )

  const descriptionBlock = (
    <div className="flex flex-col gap-12">
      <p className="text-h3">제품 정보</p>
      <p className="text-body-sm whitespace-pre-line leading-[1.6] text-secondary">{product.description}</p>
    </div>
  )

  return (
    <div className="pb-112 lg:pb-0">
      <Helmet>
        <title>{`NOVERA | ${product.name}`}</title>
      </Helmet>

      {/* 모바일 전용: 사진 1장만 보고 바로 이름/가격/사이즈에 닿도록 순서를 다시 짬(데스크톱은 아래 별도 블록, 손 안 댐) */}
      <div className="flex flex-col gap-32 px-20 pt-32 md:px-32 lg:hidden">
        <div
          className="aspect-[4/5] bg-surface-muted bg-cover bg-center bg-no-repeat md:aspect-auto md:h-[420px]"
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

      {/* 데스크톱 전용: 기존 좌(이미지 2열)/우(정보, sticky) 배치 그대로 */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_456px] lg:gap-64 lg:px-40 lg:pt-48">
        <div className="grid grid-cols-2 gap-4">
          {[product.image, ...product.detailImages].map((src, index) => (
            <div
              key={index}
              className="aspect-[4/5] bg-surface-muted bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-32 self-start lg:sticky lg:top-96">
          {purchaseEssentials}
          {descriptionBlock}

          <div className="flex flex-col gap-12">
            <Button variant="secondary" size="large" className="w-full" onClick={handleAddToCart}>
              장바구니 담기
            </Button>
            <Button variant="primary" size="large" className="w-full" onClick={handleBuyNow}>
              바로 구매
            </Button>
          </div>
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

      <section className="page-section">
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
