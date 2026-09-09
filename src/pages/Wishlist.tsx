import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Checkbox from '../components/Checkbox'
import Toast from '../components/Toast'
import WishlistCard from '../components/WishlistCard'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { useWishlist } from '../context/WishlistContext'

function Wishlist() {
  const { ids, removeMany } = useWishlist()
  const { products } = useProducts()
  const { addItem } = useCart()
  const items = products.filter((product) => ids.includes(product.id))

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sizeById, setSizeById] = useState<Record<string, string>>({})
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  const allSelected = items.length > 0 && selectedIds.length === items.length

  const notify = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
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

  const handleAddSelectedToCart = () => {
    const selectedItems = items.filter((item) => selectedIds.includes(item.id))
    const withSize = selectedItems.filter((item) => sizeById[item.id])
    const withoutSizeCount = selectedItems.length - withSize.length

    withSize.forEach((item) => addItem(item, sizeById[item.id]))

    if (withSize.length === 0) {
      notify('사이즈를 먼저 선택해주세요.')
      return
    }
    notify(
      withoutSizeCount === 0
        ? `${withSize.length}개를 장바구니에 담았습니다.`
        : `${withSize.length}개 담김, 사이즈 미선택 ${withoutSizeCount}개는 건너뛰었습니다.`,
    )
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
            <Checkbox
              checked={allSelected}
              onChange={toggleAll}
              label={`전체선택 (${selectedIds.length}/${items.length})`}
            />
            <div className="flex items-center gap-16">
              <button
                type="button"
                className="text-body-sm cursor-pointer border-none bg-transparent text-secondary disabled:cursor-not-allowed disabled:text-disabled"
                onClick={handleAddSelectedToCart}
                disabled={selectedIds.length === 0}
              >
                선택 장바구니 담기
              </button>
              <button
                type="button"
                className="text-body-sm cursor-pointer border-none bg-transparent text-secondary disabled:cursor-not-allowed disabled:text-disabled"
                onClick={handleRemoveSelected}
                disabled={selectedIds.length === 0}
              >
                선택삭제
              </button>
            </div>
          </div>

          <div className="product-grid gap-y-32 lg:grid-cols-6">
            {items.map((product) => (
              <WishlistCard
                key={product.id}
                product={product}
                selected={selectedIds.includes(product.id)}
                onToggleSelect={() => toggleOne(product.id)}
                size={sizeById[product.id] ?? ''}
                onSizeChange={(size) => setSizeById((prev) => ({ ...prev, [product.id]: size }))}
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
