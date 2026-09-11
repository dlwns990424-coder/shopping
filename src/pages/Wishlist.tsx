import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Heart } from 'lucide-react'
import Button from '../components/Button'
import Checkbox from '../components/Checkbox'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import WishlistCard from '../components/WishlistCard'
import { useProducts } from '../context/ProductsContext'
import { useWishlist } from '../context/WishlistContext'
import { subjectJosa } from '../utils/josa'

function Wishlist() {
  const navigate = useNavigate()
  const { ids, removeMany } = useWishlist()
  const { products } = useProducts()
  const items = products.filter((product) => ids.includes(product.id))

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmingRemoveSelected, setConfirmingRemoveSelected] = useState(false)
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
    setConfirmingRemoveSelected(false)
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-560 flex-col items-center justify-center gap-16 px-20 py-64 text-center">
        <Helmet>
          <title>NOVERA | 위시리스트</title>
        </Helmet>
        <Heart size={48} strokeWidth={1.2} className="text-disabled" />
        <p className="text-h3">아직 찜한 상품이 없습니다</p>
        <p className="text-body text-secondary">마음에 드는 상품을 위시리스트에 담아보세요</p>
        <Button variant="primary" size="large" onClick={() => navigate('/')}>
          쇼핑하러 가기
        </Button>
      </div>
    )
  }

  return (
    <div className="page-section">
      <Helmet>
        <title>NOVERA | 위시리스트</title>
      </Helmet>
      <h1 className="text-h1 mb-24">찜한 상품</h1>
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

      <div className="product-grid gap-y-32 lg:grid-cols-6">
        {items.map((product) => (
          <WishlistCard
            key={product.id}
            product={product}
            selectionMode={selectionMode}
            selected={selectedIds.includes(product.id)}
            onToggleSelect={() => toggleOne(product.id)}
            onAdded={() => notify(`${product.name}${subjectJosa(product.name)} 장바구니에 담겼습니다.`)}
          />
        ))}
      </div>

      {confirmingRemoveSelected && (
        <ConfirmModal
          message={`선택한 ${selectedIds.length}개 상품을 찜 목록에서 삭제할까요?`}
          confirmLabel="삭제"
          cancelLabel="취소"
          onConfirm={handleRemoveSelected}
          onCancel={() => setConfirmingRemoveSelected(false)}
        />
      )}

      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}

export default Wishlist
