import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { X, Eye, EyeOff, Mail, Lock, User, Phone, ChevronDown, Check, Stethoscope, ArrowLeft } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import authApi from '../api/auth'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

function GoogleBtn({ onSuccess, onError }: {
  onSuccess: (tokenResponse: { access_token: string }) => void
  onError: () => void
}) {
  const handleGoogleLogin = useGoogleLogin({ onSuccess, onError })
  return (
    <button type="button" className="auth-google" onClick={() => handleGoogleLogin()}>
      <i className="fa-brands fa-google" />
      Continue with Google
    </button>
  )
}

type Tab = 'login' | 'signup' | 'forgot' | 'verify'
export type UserType = 'user' | 'dietitian'

type Props = {
  onClose: () => void
  initialTab?: Tab
  initialUserType?: UserType
  prefillName?: string
  prefillEmail?: string
  prefillPhone?: string
  onAuthSuccess?: () => void
  formGateMode?: boolean
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

const AuthModal = ({ onClose, initialTab = 'login', initialUserType = 'user', prefillName = '', prefillEmail = '', prefillPhone = '', onAuthSuccess, formGateMode = false }: Props) => {
  const { saveAuth } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [userType, setUserType] = useState<UserType>(initialUserType)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  // Signup
  const [signupName, setSignupName] = useState(prefillName)
  const [signupEmail, setSignupEmail] = useState(prefillEmail)
  const [signupPhoneCode, setSignupPhoneCode] = useState('+91')
  const [signupPhone, setSignupPhone] = useState(prefillPhone)
  const [signupPassword, setSignupPassword] = useState('')

  // OTP verify (signup phone verification)
  const [otpDigits, setOtpDigits] = useState(['', '', '', ''])
  const [otpTimer, setOtpTimer] = useState(0)
  const [pendingSignupData, setPendingSignupData] = useState<Record<string, unknown> | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (otpTimer <= 0) return
    const id = window.setInterval(() => setOtpTimer(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [otpTimer])

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
      const res = await authApi.login({ email_phone: loginEmail, password: loginPassword, role: userType })
      saveAuth(res.data.user, res.data.token)
      showToast('Welcome back! You are now logged in.', 'success')
      onAuthSuccess?.()
      onClose()
      if (res.data.user.role === 'dietitian') {
        navigate('/dietitian-dashboard')
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.forgotPassword({ email: forgotEmail })
      setForgotSent(true)
      showToast(res.message || 'If an account exists, a reset link has been sent.', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not send reset link. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const goToForgot = () => {
    setForgotEmail(loginEmail)
    setForgotSent(false)
    setTab('forgot')
  }

  const backToLogin = () => {
    setForgotSent(false)
    setTab('login')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupPhone) {
      showToast('Phone number is required to create an account.', 'error')
      return
    }

    const signupBody: Record<string, unknown> = {
      full_name: signupName,
      ...(signupEmail ? { email: signupEmail } : {}),
      ...(signupPhone ? { phone_code: signupPhoneCode, phone_number: signupPhone } : {}),
      password: signupPassword,
      role: 'user',
    }

    // Phone provided — verify it via OTP before registering
    if (signupPhone) {
      setLoading(true)
      try {
        await authApi.sendOtp({ phone_code: signupPhoneCode, phone_number: signupPhone })
        setPendingSignupData(signupBody)
        setOtpDigits(['', '', '', ''])
        setOtpTimer(60)
        setTab('verify')
        showToast('OTP sent to your phone number.', 'success')
        setTimeout(() => otpRefs.current[0]?.focus(), 100)
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Failed to send OTP. Please try again.', 'error')
      } finally {
        setLoading(false)
      }
      return
    }

    // No phone — register directly with email
    setLoading(true)
    try {
      const res = await authApi.register(signupBody)
      saveAuth(res.data.user, res.data.token)
      showToast('Account created successfully! Welcome to MeriDiet.', 'success')
      onAuthSuccess?.()
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Registration failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('')
    if (otp.length < 4) {
      showToast('Please enter the complete 4-digit OTP.', 'error')
      return
    }
    if (!pendingSignupData) return
    setLoading(true)
    try {
      const phoneCode = pendingSignupData.phone_code as string
      const phoneNumber = pendingSignupData.phone_number as string
      await authApi.verifyOtp({ phone_code: phoneCode, phone_number: phoneNumber, otp })
      const res = await authApi.register(pendingSignupData)
      saveAuth(res.data.user, res.data.token)
      showToast('Account created successfully! Welcome to MeriDiet.', 'success')
      onAuthSuccess?.()
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Invalid OTP. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!pendingSignupData) return
    setLoading(true)
    try {
      const phoneCode = pendingSignupData.phone_code as string
      const phoneNumber = pendingSignupData.phone_number as string
      await authApi.resendOtp({ phone_code: phoneCode, phone_number: phoneNumber })
      setOtpTimer(60)
      setOtpDigits(['', '', '', ''])
      showToast('OTP resent to your phone number.', 'success')
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to resend OTP. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/g, '')
    const newDigits = [...otpDigits]
    newDigits[index] = val.slice(-1)
    setOtpDigits(newDigits)
    if (val && index < 3) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (!pasted) return
    const newDigits = ['', '', '', '']
    pasted.split('').forEach((ch, i) => { newDigits[i] = ch })
    setOtpDigits(newDigits)
    const nextFocus = Math.min(pasted.length, 3)
    otpRefs.current[nextFocus]?.focus()
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

  const goToDietitianSignup = () => {
    onClose()
    navigate('/join-as-dietitian')
  }

  const handleGoogleSuccess = async (tokenResponse: { access_token: string }) => {
    setLoading(true)
    try {
      const gInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      }).then(r => r.json())

      const res = await authApi.googleLogin({
        google_id:  gInfo.sub,
        email:      gInfo.email,
        full_name:  gInfo.name,
        avatar_url: gInfo.picture ?? '',
        user_type:  userType,
      })
      saveAuth(res.data.user, res.data.token)
      showToast('Logged in with Google!', 'success')
      onAuthSuccess?.()
      onClose()
      if (res.data.user.role === 'dietitian') navigate('/dietitian-dashboard')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Google login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }
  const handleGoogleError = () => showToast('Google sign-in was cancelled or failed.', 'error')

  const otpPhone = pendingSignupData?.phone_number as string | undefined
  const otpPhoneCode = pendingSignupData?.phone_code as string | undefined

  return createPortal(
    <div className="auth-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="auth-modal">

        <button className="auth-close" onClick={onClose} aria-label="Close">
          <X size={20} strokeWidth={2} />
        </button>

        {formGateMode ? (
          <div className="auth-gate-banner">
            <div className="auth-gate-top">
              <span className="auth-gate-icon">🔐</span>
              <div>
                <h3 className="auth-gate-title">One last step — create your free account</h3>
                <p className="auth-gate-sub">Registration is required to generate your personalized diet chart</p>
              </div>
            </div>
            <ul className="auth-gate-perks">
              <li><span>✓</span> Your data saved — edit anytime, no refilling</li>
              <li><span>✓</span> Track your nutrition journey over time</li>
              <li><span>✓</span> Get your plan delivered right to your account</li>
              <li><span>✓</span> Future orders filled instantly from your profile</li>
            </ul>
          </div>
        ) : (
          <div className="auth-logo">
            <img src="/logo-header.png" alt="MeriDiet" />
          </div>
        )}

        {/* ── User / Dietitian slider ── */}
        {tab !== 'forgot' && tab !== 'verify' && !formGateMode && (
          <div className="auth-type-toggle">
            <button
              className={`auth-type-btn${userType === 'user' ? ' auth-type-btn--active' : ''}`}
              onClick={() => { setUserType('user'); setTab('login') }}
            >
              <User size={14} />
              User
            </button>
            <button
              className={`auth-type-btn${userType === 'dietitian' ? ' auth-type-btn--active' : ''}`}
              onClick={() => { setUserType('dietitian'); setTab('login') }}
            >
              <Stethoscope size={14} />
              Dietitian
            </button>
          </div>
        )}

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
              <button type="button" onClick={goToForgot}>Forgot password?</button>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login to MeriDiet'}
            </button>

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="auth-divider"><span>or continue with</span></div>
                <GoogleBtn onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
              </>
            )}

            <p className="auth-switch">
              {userType === 'user' ? (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setTab('signup')}>Sign up free</button>
                </>
              ) : (
                <>
                  Not registered yet?{' '}
                  <button type="button" onClick={goToDietitianSignup}>Register as Dietitian</button>
                </>
              )}
            </p>
          </form>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {tab === 'forgot' && (
          forgotSent ? (
            <div className="auth-form auth-forgot-done">
              <div className="auth-forgot-icon"><Mail size={26} /></div>
              <h3 className="auth-forgot-title">Check your email</h3>
              <p className="auth-forgot-text">
                If an account exists for <strong>{forgotEmail}</strong>, we've sent a link to
                reset your password. The link expires in 1 hour.
              </p>
              <p className="auth-forgot-hint">Didn't get it? Check spam, or try again in a minute.</p>
              <button type="button" className="btn-primary auth-submit" onClick={backToLogin}>
                Back to Login
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleForgot}>
              <h3 className="auth-forgot-title">Forgot your password?</h3>
              <p className="auth-forgot-text">
                Enter the email linked to your account and we'll send you a link to reset it.
              </p>

              <div className="auth-field">
                <Mail size={16} className="auth-field-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  autoComplete="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>

              <p className="auth-switch">
                Remember it?{' '}
                <button type="button" onClick={backToLogin}>Back to Login</button>
              </p>
            </form>
          )
        )}

        {/* ── SIGN UP ── */}
        {tab === 'signup' && userType === 'user' && (
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

            <div className="auth-or-row">
              <span />
              <p>or</p>
              <span />
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
              {loading
                ? (signupPhone ? 'Sending OTP…' : 'Creating account…')
                : 'Create Free Account'}
            </button>

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="auth-divider"><span>or continue with</span></div>
                <GoogleBtn onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
              </>
            )}

            <p className="auth-terms">
              By signing up you agree to our{' '}
              <a href="/terms-conditions" target="_blank" rel="noopener noreferrer">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </p>

            <p className="auth-switch">
              Already have an account?{' '}
              <button type="button" onClick={() => setTab('login')}>Login</button>
            </p>
          </form>
        )}

        {/* ── PHONE OTP VERIFICATION (signup step) ── */}
        {tab === 'verify' && (
          <div className="auth-form">
            <button
              type="button"
              className="auth-otp-back"
              onClick={() => { setPendingSignupData(null); setTab('signup') }}
            >
              <ArrowLeft size={15} />
              Back
            </button>

            <div className="auth-otp-header">
              <div className="auth-otp-icon-wrap">
                <Phone size={26} strokeWidth={1.5} />
              </div>
              <h3 className="auth-otp-title">Verify your number</h3>
              <p className="auth-otp-subtitle">
                Enter the 4-digit code sent to{' '}
                <strong>{otpPhoneCode} {otpPhone}</strong>
              </p>
            </div>

            <div className="auth-otp-digits">
              {[0, 1, 2, 3].map(i => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  className={`auth-otp-digit${otpDigits[i] ? ' filled' : ''}`}
                  value={otpDigits[i]}
                  onChange={e => handleOtpChange(e, i)}
                  onKeyDown={e => handleOtpKeyDown(e, i)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                />
              ))}
            </div>

            <button
              type="button"
              className="btn-primary auth-submit"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? 'Verifying…' : 'Verify & Create Account'}
            </button>

            <div className="auth-otp-resend">
              {otpTimer > 0 ? (
                <span className="auth-otp-timer">Resend OTP in <strong>{otpTimer}s</strong></span>
              ) : (
                <>
                  <span>Didn't receive it?</span>
                  <button type="button" onClick={handleResendOtp} disabled={loading}>
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  )
}

export default AuthModal
