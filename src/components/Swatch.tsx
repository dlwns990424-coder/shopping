interface SwatchProps {
  color: string
  selected?: boolean
  onClick?: () => void
  label?: string
}

function Swatch({ color, selected, onClick, label }: SwatchProps) {
  return (
    <button
      type="button"
      className={`h-32 w-32 cursor-pointer rounded-full border border-line p-0 transition-shadow ${
        selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''
      }`}
      style={{ backgroundColor: color }}
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
    />
  )
}

export default Swatch
