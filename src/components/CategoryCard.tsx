import { Link } from 'react-router-dom'

interface CategoryCardProps {
  to: string
  label: string
  image?: string | null
  imageFit?: 'contain' | 'cover'
}

function CategoryCard({ to, label, image, imageFit = 'contain' }: CategoryCardProps) {
  return (
    <Link to={to} className="group block text-inherit no-underline">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-surface-muted transition-transform active:scale-[0.98] lg:active:scale-100">
        <div
          className={`absolute inset-0 bg-center bg-no-repeat ${imageFit === 'cover' ? 'bg-cover' : 'bg-contain'}`}
          style={image ? { backgroundImage: `url(${image})` } : undefined}
        />
      </div>
      <p className="mt-8 text-center text-[13px] font-medium text-primary transition-colors duration-300 md:mt-12 md:text-[15px] lg:group-hover:text-secondary">
        {label}
      </p>
    </Link>
  )
}

export default CategoryCard
