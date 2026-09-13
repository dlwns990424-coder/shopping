import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  size?: number
  onChange?: (value: number) => void
}

// onChange가 있으면 클릭으로 별점을 고르는 입력용, 없으면 평균 별점 표시용.
function StarRating({ value, size = 16, onChange }: StarRatingProps) {
  return (
    <span className="inline-flex items-center gap-2 text-star">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(value)
        if (!onChange) {
          return <Star key={i} size={size} strokeWidth={1.5} fill={filled ? 'currentColor' : 'none'} />
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            aria-label={`별점 ${i + 1}점`}
            className="cursor-pointer border-none bg-transparent p-0 text-star active:scale-90"
          >
            <Star size={size} strokeWidth={1.5} fill={filled ? 'currentColor' : 'none'} />
          </button>
        )
      })}
    </span>
  )
}

export default StarRating
