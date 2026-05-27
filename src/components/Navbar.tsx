import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthModal from './AuthModal'

type NavbarProps = {
  onOpenForm: () => void
  formMode?: boolean
}

const Navbar = ({ onOpenForm, formMode }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { pathname } = useLocation()
  // when not on home page, prefix with / so React Router navigates to home + hash
  const s = (hash: string) => pathname === '/' ? hash : `/${hash}`

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Show hero bg only on homepage while at the very top
  const isHeroTop = pathname === '/' && !scrolled

  if (formMode) {
    return (
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <img src="/logo.png" alt="MeriDiet" className="navbar-logo-img" />
            {/* <span className="navbar-tagline">Personalized &nbsp;·&nbsp; Indian &nbsp;·&nbsp; Yours</span> */}
          </Link>
          <div className="navbar-form-info">
            <span className="navbar-form-secure">🔒 100% Secure &amp; Confidential</span>
            <span className="navbar-form-divider" />
            <span className="navbar-form-help">
              Need Help?&nbsp;&nbsp;💬 <strong>+91 960 960 6009</strong>
            </span>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className={`navbar${isHeroTop ? ' navbar--hero' : ''}${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <img src="/logo.png" alt="MeriDiet" className="navbar-logo-img" />
            {/* <span className="navbar-tagline">Personalized &nbsp;·&nbsp; Indian &nbsp;·&nbsp; Yours</span> */}
          </Link>

          <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <li><Link to={s('#how-it-works')}>How It Works</Link></li>
            <li><Link to={s('#plans')}>Plans</Link></li>
            <li><Link to={s('#sample-diet')}>Sample Diet</Link></li>
            <li><Link to={s('#pricing')}>Pricing</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>

          <div className="navbar-actions">
            <button className="btn-primary navbar-cta" onClick={onOpenForm}>
              Get My Diet Plan
            </button>
            <button className="navbar-login" onClick={() => setAuthOpen(true)}>
              Login / Sign Up
            </button>
          </div>

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

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  )
}

export default Navbar
