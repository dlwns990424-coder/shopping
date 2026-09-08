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
        className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-surface-muted bg-contain bg-center bg-no-repeat"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      >
        {hoverImage && (
          <div
            className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100"
            style={{ backgroundImage: `url(${hoverImage})` }}
          />
        )}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? '찜 해제' : '찜하기'}
          aria-pressed={wishlisted}
          className="absolute right-12 top-12 flex h-32 w-32 items-center justify-center rounded-full bg-surface/92 text-primary opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
        >
          <Heart size={16} strokeWidth={1.5} fill={wishlisted ? 'currentColor' : 'none'} />
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
