import { Link } from 'react-router-dom'

interface CategoryCardProps {
  to: string
  label: string
  image?: string | null
  imageFit?: 'contain' | 'cover'
}

function CategoryCard({ to, label, image, imageFit = 'contain' }: CategoryCardProps) {
  return (
    <Link to={to} className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-surface-muted text-inherit no-underline transition-transform active:scale-[0.98]">
      <div
        className={`absolute inset-0 bg-center bg-no-repeat ${imageFit === 'cover' ? 'bg-cover' : 'bg-contain'}`}
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
      <p className="absolute bottom-16 left-16 text-base font-medium text-surface underline [text-underline-offset:6px] transition-colors duration-300 lg:bottom-20 lg:left-20 lg:group-hover:text-surface/70">
        {label}
      </p>
    </Link>
  )
}

export default CategoryCard
