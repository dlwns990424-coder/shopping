import './Checkbox.css'

function Checkbox({ label, checked, onChange, id, className = '', ...rest }) {
  return (
    <label className={`checkbox ${className}`.trim()} htmlFor={id}>
      <input type="checkbox" id={id} checked={checked} onChange={onChange} {...rest} />
      <span className="checkbox__box" aria-hidden="true" />
      {label && <span className="checkbox__label text-body">{label}</span>}
    </label>
  )
}

export default Checkbox
