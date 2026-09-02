import './SizeSelector.css'

function SizeSelector({ size, selected, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`size-selector ${selected ? 'size-selector--selected' : ''}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {size}
    </button>
  )
}

export default SizeSelector
