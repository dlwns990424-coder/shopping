import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import Swatch from '../components/Swatch'
import SizeSelector from '../components/SizeSelector'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import { products } from '../mock/products'
import { colorOptions, sizeOptions, productDescription } from '../mock/productDetail'
import { addRecentlyViewed } from '../utils/recentlyViewed'

function ProductDetail() {
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId)
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].id)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

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

  const selectedColorLabel = colorOptions.find((color) => color.id === selectedColor)?.label

  return (
    <div>
      <div className="grid grid-cols-1 gap-64 px-24 pt-32 lg:grid-cols-[1fr_456px] lg:px-80 lg:pt-48">
        <div className="flex flex-col gap-4">
          <div
            className="aspect-[4/5] bg-surface-muted bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${product.image})` }}
          />
          <div
            className="aspect-[4/5] bg-surface-muted bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${product.image})` }}
          />
          <div
            className="aspect-[4/5] bg-surface-muted bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${product.image})` }}
          />
        </div>

        <div className="static flex flex-col gap-32 self-start lg:sticky lg:top-96">
          <div className="flex items-start justify-between gap-16">
            <div>
              <h1 className="text-h2 mb-8">{product.name}</h1>
              <p className="text-price">{product.price}</p>
            </div>
            <button
              type="button"
              className="flex h-40 w-40 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-line bg-transparent text-primary"
              aria-label="위시리스트 추가"
            >
              <Heart size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex flex-col gap-12">
            <p className="text-body-lg">컬러: {selectedColorLabel}</p>
            <div className="flex flex-wrap gap-8">
              {colorOptions.map((color) => (
                <Swatch
                  key={color.id}
                  color={color.color}
                  label={color.label}
                  selected={selectedColor === color.id}
                  onClick={() => setSelectedColor(color.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-12">
            <p className="text-body-lg">사이즈</p>
            <div className="flex flex-wrap gap-8">
              {sizeOptions.map((size) => (
                <SizeSelector
                  key={size}
                  size={size}
                  selected={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-12">
            <p className="text-h3">제품 정보</p>
            <p className="text-body-sm whitespace-pre-line leading-[1.6] text-secondary">
              {productDescription}
            </p>
          </div>

          <div className="flex flex-col gap-12">
            <Button variant="secondary" size="large" className="w-full">
              장바구니 담기
            </Button>
            <Button variant="primary" size="large" className="w-full">
              바로 구매
            </Button>
          </div>
        </div>
      </div>

      <section className="page-section">
        <div className="page-section__header">
          <h2 className="text-h2">함께 보면 좋은 상품</h2>
        </div>
        <div className="product-grid">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProductDetail
