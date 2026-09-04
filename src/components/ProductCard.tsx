import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'

interface ProductCardProps {
  id: string
  name: string
  price: string
  image?: string | null
  showInfo?: boolean
}

function ProductCard({ id, name, price, image, showInfo = false }: ProductCardProps) {
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
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? '찜 해제' : '찜하기'}
          aria-pressed={wishlisted}
          className="absolute right-12 top-12 flex h-32 w-32 items-center justify-center rounded-full bg-surface/92 text-primary opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
        >
          <Heart size={16} strokeWidth={1.5} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {!showInfo && (
          <div className="hidden lg:block absolute inset-x-16 bottom-16 rounded-sm bg-surface/92 p-12 transition-all lg:translate-y-6 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">
            <p className="text-body text-primary">{name}</p>
            <p className="text-sm font-semibold text-primary">{price}</p>
          </div>
        )}
      </div>
      <div className={`mt-12 flex flex-col gap-4 ${showInfo ? '' : 'lg:hidden'}`}>
        <p className="text-body text-primary">{name}</p>
        <p className="text-sm font-semibold text-primary">{price}</p>
      </div>
    </Link>
  )
}

export default ProductCard
