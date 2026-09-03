import { Link } from 'react-router-dom'
import './ProductCard.css'

function ProductCard({ id, name, price, image, showInfo = false }) {
  return (
    <Link to={`/products/${id}`} className="product-card">
      <div
        className="product-card__image"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      >
        {!showInfo && (
          <div className="product-card__hover-info">
            <p className="product-card__name text-body">{name}</p>
            <p className="product-card__price text-price">{price}</p>
          </div>
        )}
      </div>
      {showInfo && (
        <div className="product-card__static-info">
          <p className="product-card__name text-body">{name}</p>
          <p className="product-card__price text-price">{price}</p>
        </div>
      )}
    </Link>
  )
}

export default ProductCard
