import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthModal from './AuthModal'
import { useAuth } from '../context/AuthContext'

type NavbarProps = {
  onOpenForm: () => void
  onCloseForm?: () => void
  formMode?: boolean
}

const Navbar = ({ onOpenForm, onCloseForm, formMode }: NavbarProps) => {
  const { user, clearAuth } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const s = (hash: string) => pathname === '/' ? hash : `/${hash}`

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isHeroTop = pathname === '/' && !scrolled

  const initials = user
    ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : ''

  if (formMode) {
    return (
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo" onClick={onCloseForm}>
            <img src="/logo.png" alt="MeriDiet" className="navbar-logo-img" />
          </Link>

          <div className="navbar-form-info">
            <span className="navbar-form-secure">🔒 100% Secure &amp; Confidential</span>
            <span className="navbar-form-divider" />
            <span className="navbar-form-help">
              Need Help?&nbsp;&nbsp;💬 <strong>+91 960 960 6009</strong>
            </span>
          </div>

          {user && (
            <div className="navbar-user" ref={dropdownRef}>
              <button className="navbar-avatar" onClick={() => setDropdownOpen(p => !p)}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.full_name} />
                  : <span>{initials}</span>
                }
              </button>
              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-name">{user.full_name}</div>
                  <div className="navbar-dropdown-email">{user.email}</div>
                  <hr className="navbar-dropdown-divider" />
                  <button
                    className="navbar-dropdown-logout"
                    onClick={() => { clearAuth(); setDropdownOpen(false) }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
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

            {user ? (
              <div className="navbar-user" ref={dropdownRef}>
                <button className="navbar-avatar" onClick={() => setDropdownOpen(p => !p)}>
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.full_name} />
                    : <span>{initials}</span>
                  }
                </button>
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-name">{user.full_name}</div>
                    <div className="navbar-dropdown-email">{user.email}</div>
                    <hr className="navbar-dropdown-divider" />
                    <button
                      className="navbar-dropdown-logout"
                      onClick={() => { clearAuth(); setDropdownOpen(false) }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="navbar-login" onClick={() => setAuthOpen(true)}>
                Login / Sign Up
              </button>
            )}
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
