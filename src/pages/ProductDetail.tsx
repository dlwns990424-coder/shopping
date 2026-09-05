import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import SizeSelector from '../components/SizeSelector'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import Toast from '../components/Toast'
import { products } from '../mock/products'
import { sizeOptions } from '../mock/productDetail'
import { addRecentlyViewed } from '../utils/recentlyViewed'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'

function parsePrice(formatted: string) {
  return Number(formatted.replace(/[^0-9]/g, ''))
}

function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isWishlisted, toggle } = useWishlist()
  const { user } = useAuth()
  const { openLoginModal } = useAuthModal()
  const product = products.find((item) => item.id === productId)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (product) addRecentlyViewed(product.id)
  }, [product])

  if (!product) {
    return (
      <div className="page-section">
        <p className="text-body-lg">상품을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const relatedProducts = products
    .filter((item) => item.id !== product.id && item.gender === product.gender)
    .slice(0, 4)

  const handleSelectSize = (size: string) => {
    setSelectedSize(size)
    setSizeError(false)
  }

  const handleAddToCart = () => {
    if (!user) {
      openLoginModal()
      return
    }
    if (!selectedSize) {
      setSizeError(true)
      return
    }
    addItem(product, selectedSize)
    setShowToast(true)
  }

  const handleBuyNow = () => {
    if (!user) {
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
            name: product.name,
            option: `${product.color.label} · ${selectedSize}`,
            price: parsePrice(product.price),
            quantity: 1,
            image: product.image,
          },
        ],
      },
    })
  }

  return (
    <div className="pb-112 lg:pb-0">
      <div className="grid grid-cols-1 gap-64 px-24 pt-32 lg:grid-cols-[1fr_456px] lg:px-80 lg:pt-48">
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="aspect-[4/5] bg-surface-muted bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${product.image})` }}
            />
          ))}
        </div>

        <div className="static flex flex-col gap-32 self-start lg:sticky lg:top-96">
          <div className="flex items-start justify-between gap-16">
            <div>
              <h1 className="text-h3 font-bold mb-8">{product.name}</h1>
              <p className="text-price font-medium">{product.price}</p>
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
              {sizeOptions.map((size) => (
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

          <div className="flex flex-col gap-12">
            <p className="text-h3">제품 정보</p>
            <p className="text-body-sm whitespace-pre-line leading-[1.6] text-secondary">
              {product.description}
            </p>
          </div>

          <div className="hidden flex-col gap-12 lg:flex">
            <Button variant="secondary" size="large" className="w-full" onClick={handleAddToCart}>
              장바구니 담기
            </Button>
            <Button variant="primary" size="large" className="w-full" onClick={handleBuyNow}>
              바로 구매
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-fixed-bar flex gap-8 border-t border-line bg-surface px-24 pb-[calc(12px+env(safe-area-inset-bottom))] pt-12 lg:hidden">
        <Button variant="secondary" size="large" className="flex-1" onClick={handleAddToCart}>
          장바구니 담기
        </Button>
        <Button variant="primary" size="large" className="flex-1" onClick={handleBuyNow}>
          바로 구매
        </Button>
      </div>

      <section className="page-section">
        <div className="page-section__header">
          <h2 className="text-h3 font-bold">함께 보면 좋은 상품</h2>
        </div>
        <div className="product-grid">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
      </section>

      <Toast message="장바구니에 담았습니다." show={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}

export default ProductDetail
