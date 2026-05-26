import { useEffect, useRef, useState } from 'react'
import { X, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'

type Tab = 'login' | 'signup'

type Props = {
  onClose: () => void
  initialTab?: Tab
}

const AuthModal = ({ onClose, initialTab = 'login' }: Props) => {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [showPass, setShowPass] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div className="auth-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="auth-modal">

        {/* close */}
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <X size={20} strokeWidth={2} />
        </button>

        {/* logo */}
        <div className="auth-logo">
          <img src="/logo.png" alt="MeriDiet" />
        </div>

        {/* tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'login' ? ' auth-tab--active' : ''}`}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab${tab === 'signup' ? ' auth-tab--active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* ── LOGIN ── */}
        {tab === 'login' && (
          <form className="auth-form" onSubmit={e => e.preventDefault()}>
            <div className="auth-field">
              <Mail size={16} className="auth-field-icon" />
              <input type="email" placeholder="Email address" required autoComplete="email" />
            </div>

            <div className="auth-field">
              <Lock size={16} className="auth-field-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
              <button type="button" className="auth-eye" onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="auth-forgot">
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="btn-primary auth-submit">Login to MeriDiet</button>

            <div className="auth-divider"><span>or continue with</span></div>

            <button type="button" className="auth-google">
              <i className="fa-brands fa-google" />
              Continue with Google
            </button>

            <p className="auth-switch">
              Don't have an account?{' '}
              <button type="button" onClick={() => setTab('signup')}>Sign up free</button>
            </p>
          </form>
        )}

        {/* ── SIGN UP ── */}
        {tab === 'signup' && (
          <form className="auth-form" onSubmit={e => e.preventDefault()}>
            <div className="auth-field">
              <User size={16} className="auth-field-icon" />
              <input type="text" placeholder="Full name" required autoComplete="name" />
            </div>

            <div className="auth-field">
              <Mail size={16} className="auth-field-icon" />
              <input type="email" placeholder="Email address" required autoComplete="email" />
            </div>

            <div className="auth-field">
              <Phone size={16} className="auth-field-icon" />
              <input type="tel" placeholder="WhatsApp number" required autoComplete="tel" />
            </div>

            <div className="auth-field">
              <Lock size={16} className="auth-field-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Create password"
                required
                autoComplete="new-password"
              />
              <button type="button" className="auth-eye" onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" className="btn-primary auth-submit">Create Free Account</button>

            <div className="auth-divider"><span>or continue with</span></div>

            <button type="button" className="auth-google">
              <i className="fa-brands fa-google" />
              Continue with Google
            </button>

            <p className="auth-terms">
              By signing up you agree to our{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

            <p className="auth-switch">
              Already have an account?{' '}
              <button type="button" onClick={() => setTab('login')}>Login</button>
            </p>
          </form>
        )}

      </div>
    </div>
  )
}

export default AuthModal
