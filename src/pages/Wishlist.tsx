import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Heart } from 'lucide-react'
import Button from '../components/Button'
import Checkbox from '../components/Checkbox'
import ConfirmModal from '../components/ConfirmModal'
import WishlistCard from '../components/WishlistCard'
import { useProducts } from '../context/ProductsContext'
import { useWishlist } from '../context/WishlistContext'
import { OUTLINE_SECTION_BUTTON_CLASS } from '../constants/ui'

const WISHLIST_PAGE_SIZE = 12
const WISHLIST_VIEW_STATE_KEY = 'novera:wishlist-view-state'

interface WishlistViewState {
  visibleCount: number
  scrollY: number
}

function readWishlistViewState(): WishlistViewState | null {
  try {
    const raw = sessionStorage.getItem(WISHLIST_VIEW_STATE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<WishlistViewState>
    if (typeof value.visibleCount !== 'number' || typeof value.scrollY !== 'number') return null
    return {
      visibleCount: Math.max(WISHLIST_PAGE_SIZE, value.visibleCount),
      scrollY: Math.max(0, value.scrollY),
    }
  } catch {
    return null
  }
}

function Wishlist() {
  const navigate = useNavigate()
  const { ids, loading: wishlistLoading, removeMany } = useWishlist()
  const { products, loading: productsLoading } = useProducts()
  const items = products.filter((product) => ids.includes(product.id))

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmingRemoveSelected, setConfirmingRemoveSelected] = useState(false)
  const [restoredViewState] = useState(readWishlistViewState)
  const [visibleCount, setVisibleCount] = useState(
    restoredViewState?.visibleCount ?? WISHLIST_PAGE_SIZE,
  )
  const hasRestoredViewRef = useRef(false)

  useLayoutEffect(() => {
    if (
      hasRestoredViewRef.current ||
      !restoredViewState ||
      wishlistLoading ||
      productsLoading ||
      items.length === 0
    ) {
      return
    }

    hasRestoredViewRef.current = true
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: restoredViewState.scrollY, left: 0, behavior: 'auto' })
      sessionStorage.removeItem(WISHLIST_VIEW_STATE_KEY)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [items.length, productsLoading, restoredViewState, wishlistLoading])

  const allSelected = items.length > 0 && selectedIds.length === items.length

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds([])
  }

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : items.map((item) => item.id))
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const handleRemoveSelected = () => {
    removeMany(selectedIds)
    setSelectedIds([])
    setConfirmingRemoveSelected(false)
  }

  const saveViewState = () => {
    sessionStorage.setItem(
      WISHLIST_VIEW_STATE_KEY,
      JSON.stringify({ visibleCount, scrollY: window.scrollY } satisfies WishlistViewState),
    )
  }

  if (wishlistLoading || productsLoading) {
    return (
      <div className="utility-page-min-height page-section">
        <Helmet>
          <title>NOVERA | 위시리스트</title>
        </Helmet>
        <p className="text-body-lg">불러오는 중...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="utility-page-min-height flex flex-col items-center justify-center gap-16 px-20 py-64 text-center">
        <Helmet>
          <title>NOVERA | 위시리스트</title>
        </Helmet>
        <Heart size={48} strokeWidth={1} className="text-disabled" />
        <p className="text-h3">아직 찜한 상품이 없습니다</p>
        <p className="text-body text-secondary">마음에 드는 상품을 위시리스트에 담아보세요</p>
        <Button variant="primary" size="large" className="h-44 !py-0" onClick={() => navigate('/')}>
          쇼핑하러 가기
        </Button>
      </div>
    )
  }

  return (
    <div className="page-section utility-page-min-height">
      <Helmet>
        <title>NOVERA | 위시리스트</title>
      </Helmet>
      <h1 className="text-h2 mb-16 hidden md:block">위시리스트</h1>
      <div className="mb-16 flex items-center justify-between">
        {selectionMode ? (
          <Checkbox
            checked={allSelected}
            onChange={toggleAll}
            label={`전체선택 (${selectedIds.length}/${items.length})`}
          />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-16">
          {selectionMode ? (
            <>
              <button
                type="button"
                className="text-body-sm cursor-pointer border-none bg-transparent text-secondary disabled:cursor-default disabled:text-disabled"
                onClick={() => setConfirmingRemoveSelected(true)}
                disabled={selectedIds.length === 0}
              >
                선택삭제
              </button>
              <button
                type="button"
                className="text-body-sm cursor-pointer border-none bg-transparent text-secondary"
                onClick={exitSelectionMode}
              >
                취소
              </button>
            </>
          ) : (
            <button
              type="button"
              className="text-body-sm cursor-pointer border-none bg-transparent text-secondary hover:text-primary"
              onClick={() => setSelectionMode(true)}
            >
              선택
            </button>
          )}
        </div>
      </div>

      <div className="product-grid gap-y-32 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {items.slice(0, visibleCount).map((product) => (
          <WishlistCard
            key={product.id}
            product={product}
            selectionMode={selectionMode}
            selected={selectedIds.includes(product.id)}
            onToggleSelect={() => toggleOne(product.id)}
            onProductClick={saveViewState}
          />
        ))}
      </div>

      {items.length > visibleCount && (
        <div className="mt-32 flex justify-center">
          <button
            type="button"
            className={OUTLINE_SECTION_BUTTON_CLASS}
            onClick={() => setVisibleCount((count) => count + WISHLIST_PAGE_SIZE)}
          >
            더보기 ({items.length - visibleCount}개)
          </button>
        </div>
      )}

      {confirmingRemoveSelected && (
        <ConfirmModal
          message={`선택한 ${selectedIds.length}개 상품을 찜 목록에서 삭제할까요?`}
          confirmLabel="삭제"
          cancelLabel="취소"
          onConfirm={handleRemoveSelected}
          onCancel={() => setConfirmingRemoveSelected(false)}
        />
      )}
    </div>
  )
}

export default Wishlist
