import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import ProductPrice from './ProductPrice'

interface ProductCardProps {
  id: string
  name: string
  price: number
  salePrice?: number | null
  image?: string | null
  hoverImage?: string | null
  wishlistButtonAtEdge?: boolean
}

function ProductCard({
  id,
  name,
  price,
  salePrice,
  image,
  hoverImage,
  wishlistButtonAtEdge = false,
}: ProductCardProps) {
  const { isWishlisted, toggle } = useWishlist()
  const wishlisted = isWishlisted(id)
  const discountPercent = salePrice != null && price > 0 ? Math.round((1 - salePrice / price) * 100) : null

  const handleToggleWishlist = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(id)
  }

  return (
    <div className="group block">
      <div className="relative">
        <Link
          to={`/products/${id}`}
          aria-label={`${name} 상품 상세보기`}
          className="block text-inherit no-underline"
        >
          <div
            className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-surface-muted bg-cover bg-center bg-no-repeat"
            style={image ? { backgroundImage: `url(${image})` } : undefined}
          >
            {hoverImage && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 lg:group-hover:opacity-100"
                style={{ backgroundImage: `url(${hoverImage})` }}
              />
            )}
            {discountPercent != null && discountPercent > 0 && (
              <span className="absolute left-8 top-8 rounded-full bg-point px-8 py-4 text-caption font-semibold text-surface lg:left-12 lg:top-12">
                -{discountPercent}%
              </span>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? '찜 해제' : '찜하기'}
          aria-pressed={wishlisted}
          className={`absolute flex border-none bg-transparent p-0 text-primary active:scale-90 ${
            wishlistButtonAtEdge
              ? 'right-0 top-0 h-40 w-40 items-start justify-end'
              : 'right-8 top-8 h-32 w-32 items-center justify-center lg:right-12 lg:top-12 lg:h-40 lg:w-40'
          }`}
        >
          <Heart
            size={20}
            strokeWidth={1}
            color={wishlisted ? '#dc2626' : '#1a1a1a'}
            fill={wishlisted ? '#dc2626' : 'none'}
            className={wishlistButtonAtEdge ? 'mr-4 mt-4' : undefined}
          />
        </button>
      </div>
      <Link to={`/products/${id}`} className="mt-12 flex flex-col gap-4 text-inherit no-underline">
        <p className="text-body text-primary">{name}</p>
        <ProductPrice price={price} salePrice={salePrice} reserveCardHeight />
      </Link>
    </div>
  )
}

export default ProductCard
