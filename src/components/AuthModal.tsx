import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Eye, EyeOff, Mail, Lock, User, Phone, ChevronDown, Check } from 'lucide-react'
import authApi from '../api/auth'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

type Tab = 'login' | 'signup'

type Props = {
  onClose: () => void
  initialTab?: Tab
}

const PHONE_CODES = [
  { code: '+91',  iso: 'in', name: 'India' },
  { code: '+1',   iso: 'us', name: 'USA / Canada' },
  { code: '+44',  iso: 'gb', name: 'United Kingdom' },
  { code: '+61',  iso: 'au', name: 'Australia' },
  { code: '+971', iso: 'ae', name: 'UAE' },
  { code: '+65',  iso: 'sg', name: 'Singapore' },
  { code: '+60',  iso: 'my', name: 'Malaysia' },
  { code: '+92',  iso: 'pk', name: 'Pakistan' },
  { code: '+880', iso: 'bd', name: 'Bangladesh' },
  { code: '+94',  iso: 'lk', name: 'Sri Lanka' },
]

const AuthModal = ({ onClose, initialTab = 'login' }: Props) => {
  const { saveAuth } = useAuth()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhoneCode, setSignupPhoneCode] = useState('+91')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login({ email_phone: loginEmail, password: loginPassword })
      saveAuth(res.data.user, res.data.token)
      showToast('Welcome back! You are now logged in.', 'success')
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupEmail && !signupPhone) {
      showToast('Please enter your email address or phone number.', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.register({
        full_name: signupName,
        ...(signupEmail ? { email: signupEmail } : {}),
        ...(signupPhone ? { phone_code: signupPhoneCode, phone_number: signupPhone } : {}),
        password: signupPassword,
        role: 'user',
      })
      saveAuth(res.data.user, res.data.token)
      showToast('Account created successfully! Welcome to MeriDiet.', 'success')
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Registration failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const selectedCountry = PHONE_CODES.find(c => c.code === signupPhoneCode) ?? PHONE_CODES[0]
  const [codeOpen, setCodeOpen] = useState(false)
  const codeRef = useRef<HTMLDivElement>(null)

  const closeCode = useCallback(() => setCodeOpen(false), [])

  useEffect(() => {
    if (!codeOpen) return
    const handler = (e: MouseEvent) => {
      if (codeRef.current && !codeRef.current.contains(e.target as Node)) closeCode()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [codeOpen, closeCode])

  return (
    <div className="auth-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="auth-modal">

        <button className="auth-close" onClick={onClose} aria-label="Close">
          <X size={20} strokeWidth={2} />
        </button>

        <div className="auth-logo">
          <img src="/logo.png" alt="MeriDiet" />
        </div>

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
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <Mail size={16} className="auth-field-icon" />
              <input
                type="text"
                placeholder="Email or phone number"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <Lock size={16} className="auth-field-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
              <button type="button" className="auth-eye" onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="auth-forgot">
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login to MeriDiet'}
            </button>

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
          <form className="auth-form" onSubmit={handleSignup}>

            <div className="auth-field">
              <User size={16} className="auth-field-icon" />
              <input
                type="text"
                placeholder="Full name"
                required
                autoComplete="name"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <Mail size={16} className="auth-field-icon" />
              <input
                type="email"
                placeholder="Email address"
                autoComplete="email"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
              />
            </div>

            <div className="auth-or-row">
              <span />
              <p>or</p>
              <span />
            </div>

            {/* Phone with code picker */}
            <div className="auth-phone-wrap">
              <div
                className={`auth-phone-picker${codeOpen ? ' open' : ''}`}
                ref={codeRef}
                onClick={() => setCodeOpen(p => !p)}
              >
                <img
                  src={`https://flagcdn.com/w20/${selectedCountry.iso}.png`}
                  alt={selectedCountry.name}
                  className="auth-phone-flag"
                  width={20}
                  height={15}
                />
                <span className="auth-phone-code-num">{selectedCountry.code}</span>
                <ChevronDown size={11} className={`auth-phone-chevron${codeOpen ? ' rotated' : ''}`} />

                {codeOpen && (
                  <div className="auth-code-dropdown">
                    {PHONE_CODES.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        className={`auth-code-option${c.code === signupPhoneCode ? ' selected' : ''}`}
                        onClick={e => { e.stopPropagation(); setSignupPhoneCode(c.code); setCodeOpen(false) }}
                      >
                        <img src={`https://flagcdn.com/w20/${c.iso}.png`} alt={c.name} width={20} height={15} />
                        <span className="auth-code-option-name">{c.name}</span>
                        <span className="auth-code-option-code">{c.code}</span>
                        {c.code === signupPhoneCode && <Check size={13} className="auth-code-check" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="auth-phone-sep" />
              <div className="auth-phone-input">
                <Phone size={15} className="auth-phone-icon" />
                <input
                  type="tel"
                  placeholder="Phone number"
                  autoComplete="tel"
                  value={signupPhone}
                  onChange={e => setSignupPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <Lock size={16} className="auth-field-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Create password"
                required
                autoComplete="new-password"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
              />
              <button type="button" className="auth-eye" onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Free Account'}
            </button>

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
