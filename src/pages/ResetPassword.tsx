import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'
import authApi from '../api/auth'
import { ApiError } from '../api/client'
import { useToast } from '../context/ToastContext'
import SEO from '../components/SEO'

const MIN_LENGTH = 6

// Mirror the strength meter used elsewhere in the app.
function calcStrength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['', '#e53935', '#f4842c', '#FBC02D', '#1E8E3E']

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const strength = calcStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < MIN_LENGTH) {
      showToast(`Password must be at least ${MIN_LENGTH} characters.`, 'error'); return
    }
    if (password !== confirm) {
      showToast('Passwords do not match.', 'error'); return
    }
    setLoading(true)
    try {
      const res = await authApi.resetPassword({ token, password, confirm_password: confirm })
      setDone(true)
      showToast(res.message || 'Password reset successfully.', 'success')
      // Send them to login after a short beat so they can read the success state.
      setTimeout(() => navigate('/?login=1', { replace: true }), 1800)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reset password. The link may have expired.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="rp-page">
      <SEO noIndex={true} title="Reset Password" description="Reset your MeriDiet account password." />
      <div className="rp-card">
        <div className="rp-logo">
          <img src="/logo.png" alt="MeriDiet" />
        </div>

        {/* No token in the URL → the link is malformed/expired */}
        {!token ? (
          <div className="rp-invalid">
            <h1 className="rp-title">Invalid or expired link</h1>
            <p className="rp-text">
              This password-reset link is missing or no longer valid. Please request a new one.
            </p>
            <Link to="/?login=1" className="btn-primary rp-submit">Back to Login</Link>
          </div>
        ) : done ? (
          <div className="rp-success">
            <div className="rp-success-icon"><CheckCircle2 size={30} /></div>
            <h1 className="rp-title">Password updated</h1>
            <p className="rp-text">
              Your password has been changed. Redirecting you to login…
            </p>
            <Link to="/?login=1" className="btn-primary rp-submit">Go to Login</Link>
          </div>
        ) : (
          <form className="rp-form" onSubmit={handleSubmit}>
            <h1 className="rp-title">Set a new password</h1>
            <p className="rp-text">Choose a strong password you don’t use elsewhere.</p>

            <div className="auth-field">
              <Lock size={16} className="auth-field-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="New password"
                required
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" className="auth-eye" onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {password && (
              <div className="rp-strength">
                {[1, 2, 3, 4].map(n => (
                  <span
                    key={n}
                    className="rp-strength-seg"
                    style={{ background: n <= strength ? STRENGTH_COLOR[strength] : '#e8f0eb' }}
                  />
                ))}
                <span className="rp-strength-txt" style={{ color: STRENGTH_COLOR[strength] }}>
                  {STRENGTH_LABEL[strength]}
                </span>
              </div>
            )}

            <div className="auth-field">
              <Lock size={16} className="auth-field-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
              <button type="button" className="auth-eye" onClick={() => setShowConfirm(p => !p)}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {confirm && confirm !== password && (
              <p className="rp-mismatch">Passwords don’t match.</p>
            )}

            <p className="rp-rules">Use at least {MIN_LENGTH} characters.</p>

            <button type="submit" className="btn-primary rp-submit" disabled={loading}>
              {loading ? 'Updating…' : 'Reset Password'}
            </button>

            <p className="rp-back">
              <Link to="/?login=1">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
