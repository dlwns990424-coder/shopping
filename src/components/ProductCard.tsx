import { Link } from 'react-router-dom'

interface ProductCardProps {
  id: string
  name: string
  price: string
  image?: string | null
  showInfo?: boolean
}

function ProductCard({ id, name, price, image, showInfo = false }: ProductCardProps) {
  return (
    <Link to={`/products/${id}`} className="group block text-inherit no-underline">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-surface-muted bg-contain bg-center bg-no-repeat"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      >
        {!showInfo && (
          <div className="absolute inset-x-16 bottom-16 translate-y-6 rounded-sm bg-surface/92 p-12 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            <p className="text-body text-primary">{name}</p>
            <p className="text-price text-primary">{price}</p>
          </div>
        )}
      </div>
      {showInfo && (
        <div className="mt-12 flex flex-col gap-4">
          <p className="text-body text-primary">{name}</p>
          <p className="text-price text-primary">{price}</p>
        </div>
      )}
    </Link>
  )
}

export default ProductCard
