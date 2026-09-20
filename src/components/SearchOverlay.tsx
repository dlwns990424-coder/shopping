import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useRecentSearch } from '../context/RecentSearchContext'
import { filterProductsByQuery } from '../utils/productSearch'
import ProductPrice from './ProductPrice'

const PREVIEW_LIMIT = 6

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
  compactHeader?: boolean
}

function SearchOverlay({ open, onClose, compactHeader = false }: SearchOverlayProps) {
  const { products } = useProducts()
  const { terms: recentTerms, addTerm, removeTerm, clearAll } = useRecentSearch()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus())

    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.offsetParent !== null)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleDocumentKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleDocumentKeyDown)
      previouslyFocusedRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  const trimmedQuery = query.trim()
  const matches = trimmedQuery ? filterProductsByQuery(products, trimmedQuery) : []
  const preview = matches.slice(0, PREVIEW_LIMIT)

  const handleSelect = () => {
    addTerm(trimmedQuery)
    onClose()
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-x-0 bottom-0 z-modal bg-black/40 ${
          compactHeader ? 'search-overlay-offset-back' : 'search-overlay-offset-brand'
        }`}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-overlay-title"
        className={`fixed inset-x-0 z-modal overflow-y-auto border-b border-line bg-surface shadow-lg ${
          compactHeader ? 'search-overlay-offset-back' : 'search-overlay-offset-brand'
        }`}
      >
        <div className="px-20 py-24 md:px-32 lg:px-80 xl:px-140 2xl:px-200">
          <div className="mx-auto w-full max-w-960">
          <h2 id="search-overlay-title" className="sr-only">상품 검색</h2>
          <div className="flex items-center gap-8">
            <div className="relative flex-1">
              <Search
                size={18}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 text-secondary"
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="상품명, 카테고리, 색상을 검색해보세요"
                className="text-sm w-full rounded-sm border border-line py-12 pl-44 pr-16 text-primary outline-none focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="검색 닫기"
              className="flex h-44 w-44 shrink-0 items-center justify-center text-secondary transition-colors active:scale-90 hover:text-primary"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {trimmedQuery && (
            matches.length > 0 ? (
              <div className="mt-16 flex flex-col gap-4">
                {preview.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    onClick={handleSelect}
                    className="flex items-center gap-12 rounded-sm p-8 text-inherit no-underline transition-colors hover:bg-surface-muted"
                  >
                    <div
                      className="h-56 w-56 shrink-0 rounded-sm bg-surface-muted bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                    <div className="flex flex-col gap-2">
                      <p className="text-body text-primary">
                        {product.name}
                        <span className="text-caption ml-8 text-secondary">
                          {product.gender === 'men' ? 'MEN' : 'WOMEN'} · {product.category} · {product.subCategory}
                        </span>
                      </p>
                      <ProductPrice price={product.price} salePrice={product.salePrice} />
                    </div>
                  </Link>
                ))}
                <Link
                  to={`/shop?category=all&q=${encodeURIComponent(trimmedQuery)}`}
                  onClick={handleSelect}
                  className="text-body-sm mt-8 text-secondary underline underline-offset-2 hover:text-primary"
                >
                  전체 {matches.length}개 결과 보기
                </Link>
              </div>
            ) : (
              <p className="text-body-sm mt-16 text-secondary">검색 결과가 없습니다.</p>
            )
          )}

          {!trimmedQuery && recentTerms.length > 0 && (
            <div className="mt-16">
              <div className="mb-8 flex items-center justify-between">
                <p className="text-caption text-secondary">최근 검색어</p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-caption cursor-pointer border-none bg-transparent text-secondary hover:text-primary"
                >
                  전체 삭제
                </button>
              </div>
              <div className="flex flex-wrap gap-8">
                {recentTerms.map((term) => (
                  <span
                    key={term}
                    className="flex items-center gap-4 rounded-full border border-line py-6 pl-12 pr-8"
                  >
                    <button
                      type="button"
                      onClick={() => setQuery(term)}
                      className="text-body-sm cursor-pointer border-none bg-transparent text-primary"
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTerm(term)}
                      aria-label={`${term} 삭제`}
                      className="flex h-16 w-16 cursor-pointer items-center justify-center border-none bg-transparent text-secondary"
                    >
                      <X size={12} strokeWidth={1.5} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SearchOverlay
