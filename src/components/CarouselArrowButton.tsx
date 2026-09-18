import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselArrowButtonProps {
  direction: 'previous' | 'next'
  label: string
  disabled: boolean
  onClick: () => void
  placement?: 'inside' | 'outside'
}

function CarouselArrowButton({
  direction,
  label,
  disabled,
  onClick,
  placement = 'inside',
}: CarouselArrowButtonProps) {
  const isPrevious = direction === 'previous'
  const positionClass =
    placement === 'outside'
      ? isPrevious
        ? 'left-[-56px]'
        : 'right-[-56px]'
      : isPrevious
        ? 'left-12'
        : 'right-12'
  const hoverClass = isPrevious ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
  const Icon = isPrevious ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`group pointer-events-auto absolute top-1/2 z-10 hidden h-44 w-44 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-surface/55 p-0 text-primary opacity-50 shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-[opacity,background-color,border-color,box-shadow,transform] duration-200 hover:border-primary/70 hover:bg-surface/90 hover:opacity-100 hover:shadow-[0_4px_16px_rgba(0,0,0,0.14)] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:-translate-y-1/2 active:scale-90 disabled:pointer-events-none disabled:opacity-0 lg:flex ${positionClass}`}
    >
      <Icon
        size={20}
        strokeWidth={1.5}
        aria-hidden="true"
        className={`transition-transform duration-200 ${hoverClass}`}
      />
    </button>
  )
}

export default CarouselArrowButton
