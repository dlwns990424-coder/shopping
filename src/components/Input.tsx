import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

function Input({ label, error, id, className = '', type, ...rest }: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={`flex flex-col gap-8 ${className}`.trim()}>
      {label && (
        <label className="text-caption text-secondary" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`text-sm w-full py-12 px-16 border rounded-sm bg-surface text-primary outline-none transition-colors placeholder:text-disabled focus:border-primary disabled:bg-surface-muted disabled:text-disabled disabled:cursor-default ${
            isPassword ? 'pr-44' : ''
          } ${error ? 'border-danger' : 'border-line'}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
            className="absolute right-12 top-1/2 flex h-24 w-24 -translate-y-1/2 items-center justify-center border-none bg-transparent p-0 text-secondary"
          >
            {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
          </button>
        )}
      </div>
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  )
}

export default Input
