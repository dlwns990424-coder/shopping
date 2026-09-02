import { Link } from 'react-router-dom'
import './CategoryCard.css'

function CategoryCard({ to, label, image }) {
  return (
    <Link to={to} className="category-card">
      <div
        className="category-card__image"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      />
      <p className="category-card__label text-h3">{label}</p>
      <span className="category-card__more text-body-sm">더 보기</span>
    </Link>
  )
}

export default CategoryCard
