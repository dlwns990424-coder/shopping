import { Link } from 'react-router-dom'

interface CategoryCardProps {
  to: string
  label: string
  image?: string | null
}

function CategoryCard({ to, label, image }: CategoryCardProps) {
  return (
    <Link to={to} className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-surface-muted text-inherit no-underline lg:aspect-[3/2]">
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      />
      <p className="absolute bottom-16 left-16 text-base font-semibold text-primary underline transition-colors group-hover:text-point">
        {label}
      </p>
    </Link>
  )
}

export default CategoryCard
