import './Button.css'

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  as: Component = 'button',
  className = '',
  ...rest
}) {
  return (
    <Component
      className={`btn btn--${variant} btn--${size} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default Button
