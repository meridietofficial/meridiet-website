import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, Camera, ChevronDown, Check, Calendar, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import userApi from '../api/user'
import appointmentApi, { type MyAppointment } from '../api/appointment'
import { ApiError } from '../api/client'
import { useVideoCall } from '../context/VideoCallContext'

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

type Tab = 'profile' | 'security' | 'appointments'

const NAV_ITEMS: { id: Tab; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: 'profile',      label: 'Personal Details',    sub: 'Name, email & phone',        icon: <User size={18} /> },
  { id: 'security',     label: 'Security',             sub: 'Password & account safety',  icon: <ShieldCheck size={18} /> },
  { id: 'appointments', label: 'My Appointments',      sub: 'Booking history',            icon: <Calendar size={18} /> },
]

function fmtSlotTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const UserProfile = () => {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('profile')

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

  const [appointments, setAppointments] = useState<MyAppointment[]>([])
  const [apptLoading, setApptLoading] = useState(true)
  const [apptPage, setApptPage] = useState(1)
  const [apptTotalPages, setApptTotalPages] = useState(1)
  const { startCall } = useVideoCall()

  useEffect(() => {
    let active = true
    setApptLoading(true)
    appointmentApi.myAppointments(apptPage)
      .then(res => {
        if (!active) return
        setAppointments(res.data)
        setApptTotalPages(res.meta.totalPages)
      })
      .catch(() => {})
      .finally(() => { if (active) setApptLoading(false) })
    return () => { active = false }
  }, [apptPage])

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
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be smaller than 5 MB.', 'error'); return }
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
      const res = await userApi.updateProfile({ full_name: name, email, phone_code: phoneCode, phone_number: phone })
      updateUser(res.data.user)
      showToast('Profile updated successfully!', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to update profile. Please try again.', 'error')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { showToast('New passwords do not match.', 'error'); return }
    if (newPass.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return }
    setPassLoading(true)
    try {
      await userApi.changePassword({ current_password: currentPass, new_password: newPass })
      showToast('Password changed successfully!', 'success')
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to change password. Please try again.', 'error')
    } finally {
      setPassLoading(false)
    }
  }

  if (!user) return null

  const initials = user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const avatarColor = AVATAR_COLORS[user.id % AVATAR_COLORS.length]
  const selectedCountry = PHONE_CODES.find(c => c.code === phoneCode) ?? PHONE_CODES[0]
  const roleLabel = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'

  return (
    <div className="up-page">

      {/* Hero */}
      <div className="up-hero">
        <div className="container">
          <nav className="profile-breadcrumb">
            <Link to="/">Home</Link>
            <span className="profile-breadcrumb-sep">/</span>
            <span>My Account</span>
          </nav>
          <h1 className="up-hero-title">My Account</h1>
          <p className="up-hero-sub">Manage your profile, security and appointments</p>
        </div>
      </div>

      <div className="container">
        <div className="up-layout">

          {/* ── Left sidebar ── */}
          <aside className="up-sidebar">

            {/* Avatar */}
            <div className="up-avatar-wrap">
              <div
                className="up-avatar"
                style={{ '--up-avatar-color': avatarColor } as React.CSSProperties}
                onClick={() => fileInputRef.current?.click()}
                title="Click to change photo"
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt={user.full_name} className="up-avatar-img" />
                  : <span className="up-avatar-initials">{initials}</span>
                }
                <div className="up-avatar-overlay"><Camera size={16} /></div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange} style={{ display: 'none' }} />
              {avatarFile && <p className="up-avatar-hint">{avatarFile.name}</p>}
            </div>

            {/* User info */}
            <div className="up-sidebar-info">
              <p className="up-sidebar-name">{user.full_name}</p>
              <p className="up-sidebar-email">{user.email}</p>
              <span className="up-sidebar-role">{roleLabel}</span>
            </div>

            <div className="up-sidebar-divider" />

            {/* Nav */}
            <nav className="up-nav">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  className={`up-nav-item${activeTab === item.id ? ' up-nav-item--active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="up-nav-icon">{item.icon}</span>
                  <span className="up-nav-text">
                    <span className="up-nav-label">{item.label}</span>
                    <span className="up-nav-sub">{item.sub}</span>
                  </span>
                  {activeTab === item.id && <span className="up-nav-dot" />}
                </button>
              ))}
            </nav>

            <div className="up-sidebar-divider" />

            {/* Quick stats */}
            <div className="up-sidebar-meta">
              <div className="up-meta-row">
                <span className="up-meta-label">User ID</span>
                <span className="up-meta-val">#{user.id}</span>
              </div>
              {user.phone_number && (
                <div className="up-meta-row">
                  <span className="up-meta-label">Phone</span>
                  <span className="up-meta-val">{user.phone_code} {user.phone_number}</span>
                </div>
              )}
              <div className="up-meta-row">
                <span className="up-meta-label">Appointments</span>
                <span className="up-meta-val">{apptLoading ? '…' : appointments.length > 0 ? apptTotalPages > 1 ? '10+' : String(appointments.length) : '0'}</span>
              </div>
            </div>

          </aside>

          {/* ── Content panel ── */}
          <div className="up-content">

            {/* ── Tab: Personal Details ── */}
            {activeTab === 'profile' && (
              <div className="up-panel">
                <div className="up-panel-header">
                  <div className="up-panel-icon up-panel-icon--profile"><User size={20} /></div>
                  <div>
                    <h2 className="up-panel-title">Personal Details</h2>
                    <p className="up-panel-sub">Update your name, email address, and phone number</p>
                  </div>
                </div>

                <form className="profile-form" onSubmit={handleSaveProfile}>
                  <div className="profile-form-row">
                    <div className="profile-form-group">
                      <label className="profile-label">Full Name</label>
                      <div className="profile-input-wrap">
                        <User size={15} className="profile-input-icon" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-label">Email Address</label>
                      <div className="profile-input-wrap">
                        <Mail size={15} className="profile-input-icon" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                      </div>
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">Phone Number</label>
                    <div className="auth-phone-wrap">
                      <div className={`auth-phone-picker${codeOpen ? ' open' : ''}`} ref={codeRef} onClick={() => setCodeOpen(p => !p)}>
                        <img src={`https://flagcdn.com/w20/${selectedCountry.iso}.png`} alt={selectedCountry.name} className="auth-phone-flag" width={20} height={15} />
                        <span className="auth-phone-code-num">{selectedCountry.code}</span>
                        <ChevronDown size={11} className={`auth-phone-chevron${codeOpen ? ' rotated' : ''}`} />
                        {codeOpen && (
                          <div className="auth-code-dropdown">
                            {PHONE_CODES.map(c => (
                              <button key={c.code} type="button"
                                className={`auth-code-option${c.code === phoneCode ? ' selected' : ''}`}
                                onClick={ev => { ev.stopPropagation(); setPhoneCode(c.code); setCodeOpen(false) }}>
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
                        <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="profile-form-actions">
                    <button type="submit" className="btn-primary profile-save-btn" disabled={profileLoading}>
                      {profileLoading ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Tab: Security ── */}
            {activeTab === 'security' && (
              <div className="up-panel">
                <div className="up-panel-header">
                  <div className="up-panel-icon up-panel-icon--security"><ShieldCheck size={20} /></div>
                  <div>
                    <h2 className="up-panel-title">Security</h2>
                    <p className="up-panel-sub">Keep your account safe with a strong password</p>
                  </div>
                </div>

                <form className="profile-form" onSubmit={handleChangePassword}>
                  <div className="profile-form-group">
                    <label className="profile-label">Current Password</label>
                    <div className="profile-input-wrap">
                      <Lock size={15} className="profile-input-icon" />
                      <input type={showCurrentPass ? 'text' : 'password'} value={currentPass}
                        onChange={e => setCurrentPass(e.target.value)} placeholder="Enter your current password" required />
                      <button type="button" className="profile-eye-btn" onClick={() => setShowCurrentPass(p => !p)}>
                        {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="profile-form-row">
                    <div className="profile-form-group">
                      <label className="profile-label">New Password</label>
                      <div className="profile-input-wrap">
                        <Lock size={15} className="profile-input-icon" />
                        <input type={showNewPass ? 'text' : 'password'} value={newPass}
                          onChange={e => setNewPass(e.target.value)} placeholder="Min. 8 characters" required />
                        <button type="button" className="profile-eye-btn" onClick={() => setShowNewPass(p => !p)}>
                          {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-label">Confirm New Password</label>
                      <div className="profile-input-wrap">
                        <Lock size={15} className="profile-input-icon" />
                        <input type={showConfirmPass ? 'text' : 'password'} value={confirmPass}
                          onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat new password" required />
                        <button type="button" className="profile-eye-btn" onClick={() => setShowConfirmPass(p => !p)}>
                          {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="profile-form-actions">
                    <button type="submit" className="btn-primary profile-save-btn" disabled={passLoading}>
                      {passLoading ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Tab: Appointments ── */}
            {activeTab === 'appointments' && (
              <div className="up-panel">
                <div className="up-panel-header">
                  <div className="up-panel-icon up-panel-icon--appointments"><Calendar size={20} /></div>
                  <div>
                    <h2 className="up-panel-title">My Appointments</h2>
                    <p className="up-panel-sub">Your past and upcoming consultations</p>
                  </div>
                </div>

                {apptLoading ? (
                  <div className="appt-skeleton-list">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="appt-skeleton-row">
                        <div className="appt-sk appt-sk-avatar" />
                        <div className="appt-sk-lines">
                          <div className="appt-sk appt-sk-name" />
                          <div className="appt-sk appt-sk-sub" />
                        </div>
                        <div className="appt-sk appt-sk-badge" />
                      </div>
                    ))}
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="appt-empty">
                    <span className="appt-empty-icon">📅</span>
                    <p className="appt-empty-text">No appointments yet. <Link to="/consult-dietitian">Book your first consultation →</Link></p>
                  </div>
                ) : (
                  <>
                    <div className="appt-list">
                      {appointments.map(appt => {
                        const dt = appt.dietitian
                        const dtInitials = dt.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                        const dateStr = new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        const [sh, sm] = appt.slot.split(':').map(Number)
                        const endMins = sh * 60 + sm + 30
                        const endStr = `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`
                        const slotLabel = `${fmtSlotTime(appt.slot)} – ${fmtSlotTime(endStr)}`
                        const feeNum = Number(appt.fee)

                        const statusCls = appt.status === 'confirmed' ? 'appt-badge--confirmed'
                          : appt.status === 'cancelled' ? 'appt-badge--cancelled'
                          : appt.status === 'completed' ? 'appt-badge--completed'
                          : 'appt-badge--pending'

                        return (
                          <div key={appt.id} className="appt-card">
                            <div className="appt-card-left">
                              <div className="appt-avatar">
                                {dt.avatar_url
                                  ? <img src={dt.avatar_url} alt={dt.full_name} />
                                  : <span>{dtInitials}</span>
                                }
                              </div>
                              <div className="appt-info">
                                <p className="appt-name">{dt.full_name}</p>
                                <p className="appt-location">{[dt.city, dt.state].filter(Boolean).join(', ')}</p>
                                <div className="appt-meta-row">
                                  <span className="appt-meta-item">📅 {dateStr}</span>
                                  <span className="appt-meta-item">⏱ {slotLabel}</span>
                                  <span className="appt-meta-item">💰 ₹{feeNum.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="appt-card-right">
                              <span className={`appt-badge ${statusCls}`}>{appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}</span>
                              {appt.payment_status === 'paid' && <span className="appt-paid-label">✓ Paid</span>}
                              {appt.status === 'confirmed' && (
                                <button
                                  className="appt-join-btn"
                                  onClick={() => startCall(appt.id, appt.dietitian.full_name)}
                                >
                                  <i className="fa-solid fa-video" /> Join Call
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {apptTotalPages > 1 && (
                      <div className="appt-pagination">
                        <button className="appt-page-btn" disabled={apptPage <= 1} onClick={() => setApptPage(p => p - 1)}>← Prev</button>
                        <span className="appt-page-info">Page {apptPage} of {apptTotalPages}</span>
                        <button className="appt-page-btn" disabled={apptPage >= apptTotalPages} onClick={() => setApptPage(p => p + 1)}>Next →</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  )
}

export default UserProfile
