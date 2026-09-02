import { Link } from 'react-router-dom'
import './ProductCard.css'

function ProductCard({ id, name, price, image }) {
  return (
    <Link to={`/products/${id}`} className="product-card">
      <div
        className="product-card__image"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      >
        <div className="product-card__hover-info">
          <p className="product-card__name text-body">{name}</p>
          <p className="product-card__price text-price">{price}</p>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
