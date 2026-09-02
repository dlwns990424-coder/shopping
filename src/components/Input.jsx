import './Input.css'

function Input({ label, error, id, className = '', ...rest }) {
  return (
    <div className={`input-field ${className}`.trim()}>
      {label && (
        <label className="input-field__label text-caption" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-field__control ${error ? 'input-field__control--error' : ''}`.trim()}
        {...rest}
      />
      {error && <p className="input-field__error text-caption">{error}</p>}
    </div>
  )
}

export default Input
