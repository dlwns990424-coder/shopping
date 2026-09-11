import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { formatPrice } from '../utils/formatPrice'

interface ProductCardProps {
  id: string
  name: string
  price: number
  salePrice?: number | null
  image?: string | null
  hoverImage?: string | null
}

function ProductCard({ id, name, price, salePrice, image, hoverImage }: ProductCardProps) {
  const { isWishlisted, toggle } = useWishlist()
  const wishlisted = isWishlisted(id)

  const handleToggleWishlist = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(id)
  }

  return (
    <Link to={`/products/${id}`} className="group block text-inherit no-underline">
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
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? '찜 해제' : '찜하기'}
          aria-pressed={wishlisted}
          className="absolute right-8 top-8 flex h-32 w-32 items-center justify-center border-none bg-transparent p-0 text-primary opacity-100 transition-opacity active:scale-90 lg:right-12 lg:top-12 lg:h-40 lg:w-40 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
        >
          <span className="flex h-24 w-24 items-center justify-center drop-shadow-[0_0_2px_rgba(255,255,255,0.9)] lg:h-40 lg:w-40">
            <Heart
              size={16}
              strokeWidth={1.5}
              color={wishlisted ? '#dc2626' : '#1a1a1a'}
              fill={wishlisted ? '#dc2626' : 'none'}
            />
          </span>
        </button>
      </div>
      <div className="mt-12 flex flex-col gap-4">
        <p className="text-body text-primary">{name}</p>
        {salePrice != null ? (
          <p className="flex items-center gap-8">
            <span className="text-caption text-disabled line-through">{formatPrice(price)}</span>
            <span className="text-sm font-semibold text-point">{formatPrice(salePrice)}</span>
          </p>
        ) : (
          <p className="text-sm font-semibold text-primary">{formatPrice(price)}</p>
        )}
      </div>
    </Link>
  )
}

export default ProductCard
