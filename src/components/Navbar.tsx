import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import AuthModal from './AuthModal'
import { useAuth } from '../context/AuthContext'

type NavbarProps = {
  onOpenForm: () => void
}

const Navbar = ({ onOpenForm }: NavbarProps) => {
  const { user, clearAuth } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { pathname, hash, search } = useLocation()
  const navigate = useNavigate()

  const formMode = pathname === '/form' || pathname === '/join-as-dietitian'
  const s = (hash: string) => pathname === '/' ? hash : `/${hash}`

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Open the login modal when redirected with ?login=1 (e.g. after a password
  // reset), then strip the param so it doesn't reopen on refresh/back.
  useEffect(() => {
    if (new URLSearchParams(search).get('login') === '1' && !user) {
      setAuthOpen(true)
      navigate(pathname, { replace: true })
    }
  }, [search, user, pathname, navigate])

  const isHeroTop = pathname === '/' && !scrolled

  const initials = user
    ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : ''

  if (formMode) {
    return (
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <img src="/logo-header.png" alt="MeriDiet" className="navbar-logo-img" />
          </Link>

          <div className="navbar-form-info">
            <span className="navbar-form-secure">🔒 100% Secure &amp; Confidential</span>
            <span className="navbar-form-divider" />
            <span className="navbar-form-help">
              Need Help?&nbsp;&nbsp;💬 <strong>+91 960 960 6009</strong>
            </span>
          </div>

          {user && (
            <>
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
                    <span className={`navbar-role-badge${user.role === 'dietitian' ? ' navbar-role-badge--dietitian' : ''}`}>
                      {user.role === 'dietitian' ? '🩺 Dietitian' : '👤 User'}
                    </span>
                    <hr className="navbar-dropdown-divider" />
                    <Link
                      to={user.role === 'dietitian' ? '/dietitian-dashboard' : '/profile'}
                      className="navbar-dropdown-profile"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {user.role === 'dietitian' ? 'My Dashboard' : 'My Profile'}
                    </Link>
                    <button
                      className="navbar-dropdown-logout"
                      onClick={() => { clearAuth(); setDropdownOpen(false) }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              {user.wallet_balance !== undefined && (
                <div className="navbar-wallet-chip">
                  <svg className="navbar-wallet-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#f4c430" stroke="#d4a017" strokeWidth="1.5"/><circle cx="12" cy="12" r="7.5" fill="none" stroke="#d4a017" strokeWidth="0.8" strokeDasharray="2 1"/><text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#8B6914">₹</text></svg>
                  <span>₹ {Number(user.wallet_balance).toLocaleString('en-IN')}</span>
                </div>
              )}
            </>
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
            <img src="/logo-header.png" alt="MeriDiet" className="navbar-logo-img" />
          </Link>

          <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <li><Link to={s('#how-it-works')} className={hash === '#how-it-works' ? 'active' : ''} onClick={() => setMenuOpen(false)}>How It Works</Link></li>
            <li><NavLink to="/consult-dietitian" onClick={() => setMenuOpen(false)}>Consult Dietitian</NavLink></li>
            <li><NavLink to="/for-dietitians" onClick={() => setMenuOpen(false)}>For Dietitians</NavLink></li>
            <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>About Us</NavLink></li>
            <li><NavLink to="/faq" onClick={() => setMenuOpen(false)}>FAQ</NavLink></li>
            <li><NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact Us</NavLink></li>
            <li className="navbar-mobile-actions">
              <button className="btn-primary navbar-cta" onClick={() => { setMenuOpen(false); onOpenForm() }}>
                Get My Diet Plan
              </button>
              {user ? (
                <button className="navbar-login" onClick={() => { setMenuOpen(false); setDropdownOpen(p => !p) }}>
                  {initials} · My Profile
                </button>
              ) : (
                <button className="navbar-login" onClick={() => { setMenuOpen(false); setAuthOpen(true) }}>
                  Login / Sign Up
                </button>
              )}
            </li>
          </ul>

          <div className="navbar-actions">
            <button className="btn-primary navbar-cta" onClick={onOpenForm}>
              Get My Diet Plan
            </button>

            {user ? (
              <div className="navbar-user" ref={dropdownRef}>
                <button className="navbar-user-chip" onClick={() => setDropdownOpen(p => !p)}>
                  <span className="navbar-chip-avatar">
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt={user.full_name} />
                      : <span>{initials}</span>
                    }
                  </span>
                  <span className="navbar-chip-text">
                    <span className="navbar-chip-name">{user.full_name}</span>
                    <span className={`navbar-chip-role${user.role === 'dietitian' ? ' navbar-chip-role--dietitian' : ''}`}>
                      {user.role === 'dietitian' ? 'Dietitian' : 'User'}
                    </span>
                  </span>
                  <svg className="navbar-chip-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-name">{user.full_name}</div>
                    <div className="navbar-dropdown-email">{user.email}</div>
                    <span className={`navbar-role-badge${user.role === 'dietitian' ? ' navbar-role-badge--dietitian' : ''}`}>
                      {user.role === 'dietitian' ? '🩺 Dietitian' : '👤 User'}
                    </span>
                    <hr className="navbar-dropdown-divider" />
                    <Link
                      to={user.role === 'dietitian' ? '/dietitian-dashboard' : '/profile'}
                      className="navbar-dropdown-profile"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {user.role === 'dietitian' ? 'My Dashboard' : 'My Profile'}
                    </Link>
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
            {user?.wallet_balance !== undefined && (
              <div className="navbar-wallet-chip">
                <svg className="navbar-wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" stroke="none"/><path d="M22 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2"/></svg>
                <span>₹ {Number(user.wallet_balance).toLocaleString('en-IN')}</span>
              </div>
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

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          initialUserType={pathname === '/for-dietitians' ? 'dietitian' : 'user'}
        />
      )}
    </>
  )
}

export default Navbar
