import { Link } from 'react-router-dom'

interface CategoryCardProps {
  to: string
  label: string
  image?: string | null
}

function CategoryCard({ to, label, image }: CategoryCardProps) {
  return (
    <Link to={to} className="block text-inherit no-underline">
      <div
        className="mb-16 aspect-[3/2] rounded-sm bg-surface-muted bg-contain bg-center bg-no-repeat"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      />
      <p className="text-h3 mb-4 text-primary">{label}</p>
      <span className="text-body-sm text-secondary">더 보기</span>
    </Link>
  )
}

export default CategoryCard
