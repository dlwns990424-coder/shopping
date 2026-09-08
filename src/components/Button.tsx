import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'text'
type ButtonSize = 'large' | 'medium' | 'small'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  as?: ElementType
  className?: string
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-surface border-primary enabled:hover:bg-point enabled:hover:border-point',
  secondary: 'bg-transparent text-primary border-primary enabled:hover:bg-surface-muted',
  text: 'bg-transparent text-primary border-transparent enabled:hover:text-point',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  large: 'py-14 text-base',
  medium: 'py-10 text-sm',
  small: 'py-7 text-[13px]',
}

const SIZE_PADDING_X: Record<ButtonSize, string> = {
  large: 'px-24',
  medium: 'px-20',
  small: 'px-16',
}

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  as: Component = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  const paddingX = variant === 'text' ? 'px-4' : SIZE_PADDING_X[size]

  return (
    <Component
      className={`inline-flex items-center justify-center rounded-sm border cursor-pointer transition-colors no-underline enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${paddingX} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default Button
