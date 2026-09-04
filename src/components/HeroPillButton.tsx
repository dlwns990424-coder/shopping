import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface HeroPillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

function HeroPillButton({ children, className = '', ...rest }: HeroPillButtonProps) {
  return (
    <button
      className={`cursor-pointer rounded-full border border-surface bg-transparent px-24 py-13 text-sm font-medium text-surface transition-colors hover:bg-surface hover:text-primary ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  )
}

export default HeroPillButton
