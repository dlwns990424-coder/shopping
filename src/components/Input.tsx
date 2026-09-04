import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

function Input({ label, error, id, className = '', ...rest }: InputProps) {
  return (
    <div className={`flex flex-col gap-8 ${className}`.trim()}>
      {label && (
        <label className="text-caption text-secondary" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`text-sm py-12 px-16 border rounded-sm bg-surface text-primary outline-none transition-colors placeholder:text-disabled focus:border-primary disabled:bg-surface-muted disabled:text-disabled disabled:cursor-not-allowed ${
          error ? 'border-point' : 'border-line'
        }`}
        {...rest}
      />
      {error && <p className="text-caption text-point">{error}</p>}
    </div>
  )
}

export default Input
