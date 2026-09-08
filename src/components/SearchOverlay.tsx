import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { formatPrice } from '../utils/formatPrice'

const PREVIEW_LIMIT = 6

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { products } = useProducts()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!open) return null

  const trimmedQuery = query.trim()
  const matches = trimmedQuery
    ? products.filter((product) => product.name.includes(trimmedQuery))
    : []
  const preview = matches.slice(0, PREVIEW_LIMIT)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <>
      <div className="fixed inset-0 top-64 z-modal bg-black/40" onClick={onClose} />
      <div className="fixed inset-x-0 top-64 z-modal max-h-[calc(100vh-64px)] overflow-y-auto border-b border-line bg-surface shadow-lg">
        <div className="mx-auto max-w-640 px-24 py-24 md:px-32 lg:px-40">
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
                onKeyDown={handleKeyDown}
                placeholder="상품명을 검색해보세요"
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
                    onClick={onClose}
                    className="flex items-center gap-12 rounded-sm p-8 text-inherit no-underline transition-colors hover:bg-surface-muted"
                  >
                    <div
                      className="h-56 w-56 shrink-0 rounded-sm bg-surface-muted bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                    <div className="flex flex-col gap-2">
                      <p className="text-body text-primary">
                        {product.name}
                        <span className="text-caption ml-8 text-secondary">
                          {product.gender === 'men' ? 'MEN' : 'WOMEN'}
                        </span>
                      </p>
                      <p className="text-body-sm font-semibold text-primary">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                ))}
                <Link
                  to={`/men?category=all&q=${encodeURIComponent(trimmedQuery)}`}
                  onClick={onClose}
                  className="text-body-sm mt-8 text-secondary underline underline-offset-2 hover:text-primary"
                >
                  전체 {matches.length}개 결과 보기
                </Link>
              </div>
            ) : (
              <p className="text-body-sm mt-16 text-secondary">검색 결과가 없습니다.</p>
            )
          )}
        </div>
      </div>
    </>
  )
}

export default SearchOverlay
