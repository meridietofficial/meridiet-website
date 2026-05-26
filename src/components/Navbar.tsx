import { useEffect, useState } from 'react'

type NavbarProps = {
  onOpenForm: () => void
  formMode?: boolean
}

const Navbar = ({ onOpenForm, formMode }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (formMode) {
    return (
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar-inner">
          <a href="./" className="navbar-logo">
            <img src="/logo.png" alt="MeriDiet" className="navbar-logo-img" />
            <span className="navbar-tagline">Personalized &nbsp;·&nbsp; Indian &nbsp;·&nbsp; Yours</span>
          </a>

          <div className="navbar-form-info">
            <span className="navbar-form-secure">🔒 100% Secure &amp; Confidential</span>
            <span className="navbar-form-divider" />
            <span className="navbar-form-help">
              Need Help?&nbsp;&nbsp;💬 <strong>+91 98765 43210</strong>
            </span>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar-inner">
        <a href="#" className="navbar-logo">
          <img src="/logo.png" alt="MeriDiet" className="navbar-logo-img" />
          <span className="navbar-tagline">Personalized &nbsp;·&nbsp; Indian &nbsp;·&nbsp; Yours</span>
        </a>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li>
            <a href="#how-it-works">How It Works</a>
          </li>
          <li>
            <a href="#plans">Plans</a>
          </li>
          <li>
            <a href="#sample-diet">Sample Diet</a>
          </li>
          <li>
            <a href="#pricing">Pricing</a>
          </li>
          <li>
            <a href="#about">About Us</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>

        <button className="btn-primary navbar-cta" onClick={onOpenForm}>
          Get My Diet Plan
        </button>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
