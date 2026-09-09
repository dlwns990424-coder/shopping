import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Checkbox from '../components/Checkbox'
import Toast from '../components/Toast'
import WishlistCard from '../components/WishlistCard'
import { useProducts } from '../context/ProductsContext'
import { useWishlist } from '../context/WishlistContext'

function Wishlist() {
  const { ids, removeMany } = useWishlist()
  const { products } = useProducts()
  const items = products.filter((product) => ids.includes(product.id))

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  const allSelected = items.length > 0 && selectedIds.length === items.length

  const notify = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

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
  }

  return (
    <div className="page-section">
      <Helmet>
        <title>NOVERA | 위시리스트</title>
      </Helmet>
      <h1 className="text-h1 mb-24">찜한 상품</h1>
      {items.length === 0 ? (
        <p className="text-body-sm text-secondary">아직 찜한 상품이 없습니다.</p>
      ) : (
        <>
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
                    className="text-body-sm cursor-pointer border-none bg-transparent text-secondary disabled:cursor-not-allowed disabled:text-disabled"
                    onClick={handleRemoveSelected}
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

          <div className="product-grid gap-y-32 lg:grid-cols-6">
            {items.map((product) => (
              <WishlistCard
                key={product.id}
                product={product}
                selectionMode={selectionMode}
                selected={selectedIds.includes(product.id)}
                onToggleSelect={() => toggleOne(product.id)}
                onAdded={() => notify(`${product.name}이(가) 장바구니에 담겼습니다.`)}
              />
            ))}
          </div>
        </>
      )}

      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}

export default Wishlist
