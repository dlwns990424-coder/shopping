import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
}

function Checkbox({ label, id, className = '', ...rest }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-8 cursor-pointer ${className}`.trim()} htmlFor={id}>
      <input type="checkbox" id={id} className="peer sr-only" {...rest} />
      <span
        className="relative w-20 h-20 shrink-0 border border-line rounded-sm bg-surface transition-colors peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:outline-2 peer-focus-visible:outline-point peer-focus-visible:outline-offset-2 after:content-[''] after:hidden peer-checked:after:block after:absolute after:left-6 after:top-2 after:w-5 after:h-10 after:border-0 after:border-r-2 after:border-b-2 after:border-solid after:border-surface after:rotate-45"
        aria-hidden="true"
      />
      {label && <span className="text-body">{label}</span>}
    </label>
  )
}

export default Checkbox
