import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface CategoryCardProps {
  to: string
  label: string
  image?: string | null
}

function CategoryCard({ to, label, image }: CategoryCardProps) {
  return (
    <Link to={to} className="group block text-inherit no-underline">
      <div
        className="mb-16 aspect-[3/4] rounded-sm bg-surface-muted bg-contain bg-center bg-no-repeat lg:aspect-[3/2]"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      />
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-primary transition-colors group-hover:text-point">{label}</p>
        <ArrowRight size={18} strokeWidth={1.5} className="text-primary transition-colors group-hover:text-point" />
      </div>
    </Link>
  )
}

export default CategoryCard
