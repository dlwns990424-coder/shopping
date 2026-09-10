interface SizeSelectorProps {
  size: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

function SizeSelector({ size, selected, disabled, onClick }: SizeSelectorProps) {
  return (
    <button
      type="button"
      className={`h-41 min-w-44 cursor-pointer rounded-sm border px-12 text-[13px] transition-colors enabled:active:scale-95 disabled:cursor-default disabled:border-line disabled:text-disabled disabled:line-through ${
        selected
          ? 'border-primary bg-primary text-surface'
          : 'border-line bg-surface text-primary enabled:hover:border-primary'
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {size}
    </button>
  )
}

export default SizeSelector
