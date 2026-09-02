import './HeroPillButton.css'

function HeroPillButton({ children, className = '', ...rest }) {
  return (
    <button className={`hero-pill-button ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}

export default HeroPillButton
