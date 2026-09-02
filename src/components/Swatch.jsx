import './Swatch.css'

function Swatch({ color, selected, onClick, label }) {
  return (
    <button
      type="button"
      className={`swatch ${selected ? 'swatch--selected' : ''}`.trim()}
      style={{ backgroundColor: color }}
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
    />
  )
}

export default Swatch
