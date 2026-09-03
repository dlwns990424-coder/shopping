import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import Swatch from '../components/Swatch'
import SizeSelector from '../components/SizeSelector'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import { products } from '../mock/products'
import { colorOptions, sizeOptions, productDescription } from '../mock/productDetail'
import './ProductDetail.css'

function ProductDetail() {
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId)
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].id)
  const [selectedSize, setSelectedSize] = useState(null)

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
    <div className="product-detail">
      <div className="product-detail__layout">
        <div className="product-detail__images">
          <div className="product-detail__image" />
          <div className="product-detail__image" />
          <div className="product-detail__image" />
        </div>

        <div className="product-detail__info">
          <div className="product-detail__header">
            <div>
              <h1 className="text-h2">{product.name}</h1>
              <p className="text-price">{product.price}</p>
            </div>
            <button type="button" className="product-detail__wishlist" aria-label="위시리스트 추가">
              <Heart size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="product-detail__section">
            <p className="text-body-lg">컬러: {selectedColorLabel}</p>
            <div className="product-detail__swatches">
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

          <div className="product-detail__section">
            <p className="text-body-lg">사이즈</p>
            <div className="product-detail__sizes">
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

          <div className="product-detail__section">
            <p className="text-h3">제품 정보</p>
            <p className="text-body-sm product-detail__description">{productDescription}</p>
          </div>

          <div className="product-detail__actions">
            <Button variant="secondary" size="large">장바구니 담기</Button>
            <Button variant="primary" size="large">바로 구매</Button>
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
