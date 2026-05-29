import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, Camera, ChevronDown, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import userApi from '../api/user'
import { ApiError } from '../api/client'

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

const AVATAR_COLORS = ['#1E8E3E', '#166C31', '#f4842c', '#0077b6', '#7b2d8b', '#c0392b']

const UserProfile = () => {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/', { replace: true })
  }, [user, navigate])

  const [name, setName] = useState(user?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phoneCode, setPhoneCode] = useState(user?.phone_code ?? '+91')
  const [phone, setPhone] = useState(user?.phone_number ?? '')
  const [profileLoading, setProfileLoading] = useState(false)

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [passLoading, setPassLoading] = useState(false)

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5 MB.', 'error')
      return
    }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      if (avatarFile) {
        const fd = new FormData()
        fd.append('avatar', avatarFile)
        const avatarRes = await userApi.updateAvatar(fd)
        updateUser(avatarRes.data.user)
        setAvatarFile(null)
      }
      const res = await userApi.updateProfile({
        full_name: name,
        email,
        phone_code: phoneCode,
        phone_number: phone,
      })
      updateUser(res.data.user)
      showToast('Profile updated successfully!', 'success')
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to update profile. Please try again.',
        'error'
      )
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) {
      showToast('New passwords do not match.', 'error')
      return
    }
    if (newPass.length < 8) {
      showToast('Password must be at least 8 characters.', 'error')
      return
    }
    setPassLoading(true)
    try {
      await userApi.changePassword({ current_password: currentPass, new_password: newPass })
      showToast('Password changed successfully!', 'success')
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to change password. Please try again.',
        'error'
      )
    } finally {
      setPassLoading(false)
    }
  }

  if (!user) return null

  const initials = user.full_name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const avatarColor = AVATAR_COLORS[user.id % AVATAR_COLORS.length]
  const selectedCountry = PHONE_CODES.find(c => c.code === phoneCode) ?? PHONE_CODES[0]

  const roleLabel = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Member'

  return (
    <div className="profile-page">

      {/* ── Hero Banner ── */}
      <div className="profile-hero">
        <div className="container">
          <nav className="profile-breadcrumb">
            <Link to="/">Home</Link>
            <span className="profile-breadcrumb-sep">/</span>
            <span>My Profile</span>
          </nav>
          <h1 className="profile-hero-title">Profile Settings</h1>
          <p className="profile-hero-sub">Manage your personal details and account preferences</p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container">
        <div className="profile-layout">

          {/* ── Sidebar ── */}
          <aside className="profile-sidebar">

            <div className="profile-avatar-section">
              <div
                className="profile-avatar-ring"
                style={{ '--avatar-color': avatarColor } as React.CSSProperties}
                onClick={() => fileInputRef.current?.click()}
                title="Click to change profile photo"
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt={user.full_name} className="profile-avatar-img" />
                  : <span className="profile-avatar-initials">{initials}</span>
                }
                <div className="profile-avatar-overlay">
                  <Camera size={20} strokeWidth={2} />
                  <span>Change Photo</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <p className="profile-avatar-hint">
                {avatarFile ? avatarFile.name : 'Click avatar to change photo'}
              </p>
            </div>

            <div className="profile-sidebar-info">
              <p className="profile-sidebar-name">{user.full_name}</p>
              <p className="profile-sidebar-email">{user.email}</p>
              <span className="profile-sidebar-role">{roleLabel}</span>
            </div>

            <div className="profile-sidebar-meta">
              <div className="profile-sidebar-meta-row">
                <span className="profile-sidebar-meta-label">User ID</span>
                <span className="profile-sidebar-meta-val">#{user.id}</span>
              </div>
              {user.phone_number && (
                <div className="profile-sidebar-meta-row">
                  <span className="profile-sidebar-meta-label">Phone</span>
                  <span className="profile-sidebar-meta-val">{user.phone_code} {user.phone_number}</span>
                </div>
              )}
            </div>

          </aside>

          {/* ── Form panels ── */}
          <div className="profile-main">

            {/* Personal Details */}
            <section className="profile-section">
              <div className="profile-section-header">
                <div className="profile-section-icon">
                  <User size={18} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="profile-section-title">Personal Details</h2>
                  <p className="profile-section-sub">Update your name, email address, and phone number</p>
                </div>
              </div>

              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="profile-form-row">
                  <div className="profile-form-group">
                    <label className="profile-label">Full Name</label>
                    <div className="profile-input-wrap">
                      <User size={15} className="profile-input-icon" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">Email Address</label>
                    <div className="profile-input-wrap">
                      <Mail size={15} className="profile-input-icon" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-form-group">
                  <label className="profile-label">Phone Number</label>
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
                              className={`auth-code-option${c.code === phoneCode ? ' selected' : ''}`}
                              onClick={ev => { ev.stopPropagation(); setPhoneCode(c.code); setCodeOpen(false) }}
                            >
                              <img src={`https://flagcdn.com/w20/${c.iso}.png`} alt={c.name} width={20} height={15} />
                              <span className="auth-code-option-name">{c.name}</span>
                              <span className="auth-code-option-code">{c.code}</span>
                              {c.code === phoneCode && <Check size={13} className="auth-code-check" />}
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
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button
                    type="submit"
                    className="btn-primary profile-save-btn"
                    disabled={profileLoading}
                  >
                    {profileLoading ? 'Saving…' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </section>

            {/* Change Password */}
            <section className="profile-section">
              <div className="profile-section-header">
                <div className="profile-section-icon profile-section-icon--security">
                  <Lock size={18} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="profile-section-title">Change Password</h2>
                  <p className="profile-section-sub">Keep your account secure with a strong password</p>
                </div>
              </div>

              <form className="profile-form" onSubmit={handleChangePassword}>
                <div className="profile-form-group">
                  <label className="profile-label">Current Password</label>
                  <div className="profile-input-wrap">
                    <Lock size={15} className="profile-input-icon" />
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPass}
                      onChange={e => setCurrentPass(e.target.value)}
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      className="profile-eye-btn"
                      onClick={() => setShowCurrentPass(p => !p)}
                    >
                      {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="profile-form-row">
                  <div className="profile-form-group">
                    <label className="profile-label">New Password</label>
                    <div className="profile-input-wrap">
                      <Lock size={15} className="profile-input-icon" />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        placeholder="Min. 8 characters"
                        required
                      />
                      <button
                        type="button"
                        className="profile-eye-btn"
                        onClick={() => setShowNewPass(p => !p)}
                      >
                        {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">Confirm New Password</label>
                    <div className="profile-input-wrap">
                      <Lock size={15} className="profile-input-icon" />
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={confirmPass}
                        onChange={e => setConfirmPass(e.target.value)}
                        placeholder="Repeat new password"
                        required
                      />
                      <button
                        type="button"
                        className="profile-eye-btn"
                        onClick={() => setShowConfirmPass(p => !p)}
                      >
                        {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button
                    type="submit"
                    className="btn-primary profile-save-btn"
                    disabled={passLoading}
                  >
                    {passLoading ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </section>

          </div>
        </div>
      </div>

    </div>
  )
}

export default UserProfile
