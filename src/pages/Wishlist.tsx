import { Helmet } from 'react-helmet-async'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { useWishlist } from '../context/WishlistContext'

function Wishlist() {
  const { ids } = useWishlist()
  const { products } = useProducts()
  const items = products.filter((product) => ids.includes(product.id))

  return (
    <div className="page-section">
      <Helmet>
        <title>T&amp;L | 위시리스트</title>
      </Helmet>
      <h1 className="text-h1 mb-24">찜한 상품</h1>
      {items.length === 0 ? (
        <p className="text-body-sm text-secondary">아직 찜한 상품이 없습니다.</p>
      ) : (
        <div className="product-grid gap-y-32 lg:grid-cols-6">
          {items.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist
