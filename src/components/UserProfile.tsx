import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, Camera, ChevronDown, Check, Calendar, ShieldCheck, FileText, Wallet, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import userApi from '../api/user'
import appointmentApi, { type MyAppointment } from '../api/appointment'
import dietFormApi, { type MyDietChart } from '../api/dietForm'
import walletApi, { type WalletTransaction } from '../api/wallet'
import dietPlanApi, { type SubscriptionStatus } from '../api/dietPlan'
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

type Tab = 'profile' | 'security' | 'appointments' | 'dietcharts' | 'wallet' | 'subscription'

const NAV_ITEMS: { id: Tab; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: 'appointments', label: 'My Appointments',  sub: 'Booking history',           icon: <Calendar size={18} /> },
  { id: 'dietcharts',   label: 'My Diet Charts',   sub: 'Your submitted diet plans', icon: <FileText size={18} /> },
  { id: 'subscription', label: 'My Subscription',  sub: '3-month plan progress',     icon: <RefreshCw size={18} /> },
  { id: 'wallet',       label: 'My Wallet',        sub: 'Balance & transactions',    icon: <Wallet size={18} /> },
  { id: 'profile',      label: 'Personal Details', sub: 'Name, email & phone',       icon: <User size={18} /> },
  { id: 'security',     label: 'Security',         sub: 'Password & account safety', icon: <ShieldCheck size={18} /> },
]

function fmtSlotTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const UserProfile = () => {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const rawTab = searchParams.get('tab') as Tab | null
  const activeTab: Tab = rawTab && ['profile', 'security', 'appointments', 'dietcharts', 'wallet', 'subscription'].includes(rawTab) ? rawTab : 'appointments'

  const setActiveTab = (tab: Tab) => setSearchParams({ tab }, { replace: true })

  useEffect(() => {
    if (!user) navigate('/', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    let active = true
    userApi.getProfile()
      .then(res => {
        if (!active) return
        const p = res.data
        setName(p.full_name)
        setEmail(p.email)
        setPhoneCode(p.phone_code ?? '+91')
        setPhone(p.phone_number ?? '')
        setAvatarPreview(p.avatar_url ?? null)
        updateUser(p)
      })
      .catch(() => {})
      .finally(() => { if (active) setProfileFetching(false) })
    return () => { active = false }
  }, [])

  const [name, setName] = useState(user?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phoneCode, setPhoneCode] = useState(user?.phone_code ?? '+91')
  const [phone, setPhone] = useState(user?.phone_number ?? '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileFetching, setProfileFetching] = useState(true)

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

  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const [dietCharts, setDietCharts] = useState<MyDietChart[]>([])
  const [dietChartsLoading, setDietChartsLoading] = useState(false)
  const [dietChartsTotal, setDietChartsTotal] = useState(0)

  // Wallet tab state — seed from cached auth so the chip shows immediately
  const [walletBalance, setWalletBalance] = useState<number | null>(user?.wallet_balance ?? null)
  const [walletBalanceLoading, setWalletBalanceLoading] = useState(false)
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>([])
  const [walletTxsLoading, setWalletTxsLoading] = useState(false)
  const [walletTxTotal, setWalletTxTotal] = useState(0)
  const [walletTxPage, setWalletTxPage] = useState(1)
  const [walletTxFilter, setWalletTxFilter] = useState<'all' | 'credit' | 'debit'>('all')

  // Subscription tab state
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null)
  const [subLoading, setSubLoading] = useState(false)
  const [redeemConfirm, setRedeemConfirm] = useState(false)
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemSuccess, setRedeemSuccess] = useState(false)
  const [lastFormData, setLastFormData] = useState<Record<string, unknown> | null>(null)

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

  useEffect(() => {
    let active = true
    setDietChartsLoading(true)
    dietFormApi.myAll()
      .then(res => {
        if (!active) return
        setDietCharts(res.data.forms)
        setDietChartsTotal(res.data.total)
      })
      .catch(() => {})
      .finally(() => { if (active) setDietChartsLoading(false) })
    return () => { active = false }
  }, [])

  // Fetch wallet balance + transactions when wallet tab is active
  useEffect(() => {
    if (activeTab !== 'wallet') return
    let active = true
    setWalletBalanceLoading(true)
    walletApi.balance()
      .then(res => {
        if (!active) return
        setWalletBalance(res.data.wallet_balance)
        updateUser({ ...user!, wallet_balance: res.data.wallet_balance })
      })
      .catch(() => {})
      .finally(() => { if (active) setWalletBalanceLoading(false) })
    return () => { active = false }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'wallet') return
    let active = true
    setWalletTxsLoading(true)
    walletApi.transactions(walletTxPage)
      .then(res => {
        if (!active) return
        setWalletTxs(res.data.transactions)
        setWalletTxTotal(res.data.total)
      })
      .catch(() => {})
      .finally(() => { if (active) setWalletTxsLoading(false) })
    return () => { active = false }
  }, [activeTab, walletTxPage])

  // Fetch subscription status and wallet balance when subscription tab is active
  useEffect(() => {
    if (activeTab !== 'subscription') return
    let active = true
    setSubLoading(true)
    Promise.all([
      dietPlanApi.subscriptionStatus(),
      walletApi.balance(),
      dietFormApi.myAll(),
    ])
      .then(([subRes, balRes, formsRes]) => {
        if (!active) return
        setSubStatus(subRes.data)
        setWalletBalance(balRes.data.wallet_balance)
        updateUser({ ...user!, wallet_balance: balRes.data.wallet_balance })
        if (formsRes.data.forms.length > 0) setLastFormData(formsRes.data.forms[0] as Record<string, unknown>)
      })
      .catch(() => {})
      .finally(() => { if (active) setSubLoading(false) })
    return () => { active = false }
  }, [activeTab])

  const handleRedeemMonth = async () => {
    if (!lastFormData) return
    setRedeemLoading(true)
    try {
      await dietPlanApi.redeemMonth(lastFormData)
      setRedeemSuccess(true)
      setRedeemConfirm(false)
      // Refresh subscription status and balance
      const [subRes, balRes] = await Promise.all([
        dietPlanApi.subscriptionStatus(),
        walletApi.balance(),
      ])
      setSubStatus(subRes.data)
      setWalletBalance(balRes.data.wallet_balance)
      updateUser({ ...user!, wallet_balance: balRes.data.wallet_balance })
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to redeem month. Please try again.', 'error')
    } finally {
      setRedeemLoading(false)
    }
  }

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
        updateUser(avatarRes.data)
        setAvatarFile(null)
      }
      const res = await userApi.updateProfile({ full_name: name, email, phone_code: phoneCode, phone_number: phone })
      updateUser(res.data)
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

  const handleSubmitReview = async (apptId: number) => {
    if (reviewRating === 0) return
    setReviewLoading(true)
    try {
      await appointmentApi.submitReview(apptId, { rating: reviewRating, review: reviewText })
      setAppointments(prev => prev.map(a =>
        a.id === apptId ? { ...a, user_rating: reviewRating, user_review: reviewText || null } : a
      ))
      setReviewingId(null)
      setReviewRating(0)
      setHoverRating(0)
      setReviewText('')
      showToast('Review submitted successfully!', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to submit review. Please try again.', 'error')
    } finally {
      setReviewLoading(false)
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

                {profileFetching ? (
                  <div className="appt-skeleton-list">
                    {[1, 2, 3].map(n => <div key={n} className="appt-skeleton-row"><div className="appt-sk appt-sk-name" style={{ height: 40, borderRadius: 8 }} /></div>)}
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* ── Tab: My Diet Charts ── */}
            {activeTab === 'dietcharts' && (
              <div className="up-panel">
                <div className="up-panel-header">
                  <div className="up-panel-icon up-panel-icon--appointments"><FileText size={20} /></div>
                  <div>
                    <h2 className="up-panel-title">My Diet Charts</h2>
                    <p className="up-panel-sub">Your submitted personalized diet plan requests</p>
                  </div>
                </div>

                {dietChartsLoading ? (
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
                ) : dietCharts.length === 0 ? (
                  <div className="appt-empty">
                    <span className="appt-empty-icon">🥗</span>
                    <p className="appt-empty-text">No diet plans yet. <Link to="/form">Get your first plan →</Link></p>
                  </div>
                ) : (
                  <div className="appt-list">
                    {dietCharts.map(chart => {
                      const planLabel = chart.plan_type === 1 ? '1 Week' : chart.plan_type === 2 ? '1 Month' : chart.plan_type === 3 ? '3 Months' : `Plan ${chart.plan_type}`
                      const dateStr = chart.created_at
                        ? new Date(chart.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'
                      const goals = Array.isArray(chart.goals) ? chart.goals.map((g: string) => g.replace(/_/g, ' ')).join(', ') : '—'
                      const isPaid = chart.plan_generated || chart.plan_status !== null
                        || ['paid', 'completed', 'success', 'captured'].includes(String(chart.payment_status ?? ''))
                      const { plan_generated, plan_status, plan_pdf_url } = chart
                      return (
                        <div key={chart.id} className="appt-card">
                          <div className="appt-card-left">
                            <div className="appt-avatar" style={{ background: '#1E8E3E' }}>
                              <FileText size={20} color="#fff" />
                            </div>
                            <div className="appt-info">
                              <p className="appt-name">{chart.full_name}</p>
                              <p className="appt-location">{[chart.city, chart.state].filter(Boolean).join(', ')}</p>
                              <div className="appt-meta-row">
                                <span className="appt-meta-item">📅 {dateStr}</span>
                                <span className="appt-meta-item">🗓 {planLabel}</span>
                                {goals !== '—' && <span className="appt-meta-item">🎯 {goals}</span>}
                              </div>

                              {/* Plan status row */}
                              {plan_generated && plan_pdf_url ? (
                                <a
                                  href={plan_pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="dc-download-btn"
                                >
                                  <i className="fa-solid fa-download" /> Download PDF
                                </a>
                              ) : plan_status === 'generating' ? (
                                <span className="dc-status dc-status--generating">
                                  <span className="dc-spinner" /> Plan is being prepared…
                                </span>
                              ) : plan_status === 'failed' ? (
                                <span className="dc-status dc-status--failed">
                                  ⚠ Something went wrong. Please contact support.
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="appt-card-right">
                            <span className={`appt-badge ${isPaid ? 'appt-badge--confirmed' : 'appt-badge--pending'}`}>
                              {isPaid ? 'Paid' : 'Pending'}
                            </span>
                            {plan_generated ? (
                              <span className="appt-paid-label">✓ Plan Generated</span>
                            ) : plan_status === 'generating' ? (
                              <span className="appt-paid-label" style={{ color: '#92400e' }}>⏳ Generating…</span>
                            ) : plan_status === 'failed' ? (
                              <span className="appt-paid-label" style={{ color: '#dc2626' }}>✗ Plan Failed</span>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {!dietChartsLoading && dietChartsTotal > 0 && (
                  <p className="appt-page-info" style={{ marginTop: '1rem', textAlign: 'center' }}>
                    Showing {dietCharts.length} of {dietChartsTotal} plan{dietChartsTotal !== 1 ? 's' : ''}
                  </p>
                )}
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
                        const endMins = sh * 60 + sm + (appt.duration ?? 30)
                        const endStr = `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`
                        const slotLabel = `${fmtSlotTime(appt.slot)} – ${fmtSlotTime(endStr)}`
                        const feeNum = Number(appt.fee)

                        const statusCls = appt.status === 'confirmed' ? 'appt-badge--confirmed'
                          : appt.status === 'cancelled' ? 'appt-badge--cancelled'
                          : appt.status === 'completed' ? 'appt-badge--completed'
                          : 'appt-badge--pending'

                        return (
                          <div key={appt.id} className="appt-card">

                            {/* ── Header: avatar + name vs badge ── */}
                            <div className="appt-card-top">
                              <div className="appt-card-left">
                                <div className="appt-avatar">
                                  {dt.avatar_url
                                    ? <img src={dt.avatar_url} alt={dt.full_name} />
                                    : <span>{dtInitials}</span>
                                  }
                                </div>
                                <div className="appt-info">
                                  <p className="appt-name">
                                    {dt.full_name}
                                    {appt.is_follow_up === 1 && (
                                      <span className="appt-followup-badge">
                                        {appt.follow_up_type === 'free' ? 'Free Follow-up' : 'Follow-up'}
                                      </span>
                                    )}
                                  </p>
                                  <p className="appt-location">{[dt.city, dt.state].filter(Boolean).join(', ')}</p>
                                </div>
                              </div>
                              <div className="appt-card-badges">
                                <span className={`appt-badge ${statusCls}`}>{appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}</span>
                                {appt.payment_status === 'paid' && <span className="appt-paid-label">✓ Paid</span>}
                              </div>
                            </div>

                            {/* ── Meta chips ── */}
                            <div className="appt-meta-row">
                              <span className="appt-meta-item">📅 {dateStr}</span>
                              <span className="appt-meta-item">⏱ {slotLabel}</span>
                              <span className="appt-meta-item">💰 ₹{feeNum.toLocaleString('en-IN')}</span>
                            </div>

                            {/* ── Action buttons ── */}
                            {(appt.diet_plan?.pdf_url || appt.status === 'confirmed') && (
                              <div className="appt-actions-row">
                                {appt.diet_plan?.pdf_url && (
                                  <a href={appt.diet_plan.pdf_url} target="_blank" rel="noopener noreferrer" className="appt-plan-btn">
                                    <i className="fa-solid fa-download" /> View Diet Plan
                                  </a>
                                )}
                                {appt.status === 'confirmed' && (
                                  <button className="appt-join-btn" onClick={() => startCall(appt.id, appt.dietitian.full_name)}>
                                    <i className="fa-solid fa-video" /> Join Call
                                  </button>
                                )}
                              </div>
                            )}

                            {/* ── Ratings ── */}
                            {appt.status === 'completed' && (
                              <div className="appt-ratings-block">
                                {appt.user_rating !== null ? (
                                  <div className="appt-rating-done appt-rating-done--with-review">
                                    <div className="appt-stars-display">
                                      {[1,2,3,4,5].map(s => (
                                        <span key={s} className={`appt-star${s <= appt.user_rating! ? ' appt-star--filled' : ''}`}>★</span>
                                      ))}
                                    </div>
                                    <span className="appt-rating-label">Your rating</span>
                                    {appt.user_review && (
                                      <p className="appt-review-text">"{appt.user_review}"</p>
                                    )}
                                  </div>
                                ) : reviewingId === appt.id ? (
                                  <div className="appt-review-form">
                                    <p className="appt-review-prompt">How was your session?</p>
                                    <div className="appt-stars-row">
                                      {[1,2,3,4,5].map(s => (
                                        <button key={s} type="button"
                                          className={`appt-star-btn${(hoverRating || reviewRating) >= s ? ' appt-star-btn--active' : ''}`}
                                          onMouseEnter={() => setHoverRating(s)}
                                          onMouseLeave={() => setHoverRating(0)}
                                          onClick={() => setReviewRating(s)}
                                        >★</button>
                                      ))}
                                    </div>
                                    <textarea className="appt-review-textarea"
                                      placeholder="Write a review (optional)"
                                      value={reviewText}
                                      onChange={e => setReviewText(e.target.value)}
                                      rows={2}
                                    />
                                    <div className="appt-review-actions">
                                      <button className="appt-review-submit"
                                        onClick={() => handleSubmitReview(appt.id)}
                                        disabled={reviewRating === 0 || reviewLoading}
                                      >
                                        {reviewLoading ? 'Submitting…' : 'Submit Review'}
                                      </button>
                                      <button className="appt-review-cancel"
                                        onClick={() => { setReviewingId(null); setReviewRating(0); setHoverRating(0); setReviewText('') }}
                                        disabled={reviewLoading}
                                      >Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <button className="appt-rate-btn"
                                    onClick={() => { setReviewingId(appt.id); setReviewRating(0); setHoverRating(0); setReviewText('') }}
                                  >★ Rate this session</button>
                                )}

                                {appt.dietitian_rating !== null && (
                                  <div className="appt-rating-done appt-rating-done--dietitian appt-rating-done--with-review">
                                    <div className="appt-stars-display">
                                      {[1,2,3,4,5].map(s => (
                                        <span key={s} className={`appt-star${s <= appt.dietitian_rating! ? ' appt-star--filled' : ''}`}>★</span>
                                      ))}
                                    </div>
                                    <span className="appt-rating-label">Dietitian's rating for you</span>
                                    {appt.dietitian_review && (
                                      <p className="appt-review-text appt-review-text--dietitian">"{appt.dietitian_review}"</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

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

            {/* ── Tab: My Wallet ── */}
            {activeTab === 'wallet' && (
              <div className="up-panel">
                <div className="up-panel-header">
                  <div className="up-panel-icon" style={{ background: '#e8f5e9', color: '#1E8E3E' }}><Wallet size={20} /></div>
                  <div>
                    <h2 className="up-panel-title">My Wallet</h2>
                    <p className="up-panel-sub">Your cashback rewards and transaction history</p>
                  </div>
                </div>

                {/* Balance card */}
                <div className="uw-balance-card">
                  <div className="uw-balance-left">
                    <p className="uw-balance-label">Available Balance</p>
                    {walletBalanceLoading
                      ? <div className="uw-balance-skeleton" />
                      : <p className="uw-balance-amount">₹{(walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    }
                  </div>
                  <div className="uw-balance-icon"><Wallet size={28} /></div>
                </div>

                {/* Transactions */}
                <div className="uw-section-title">Transactions</div>

                {/* Filter tabs */}
                <div className="uw-filter-tabs">
                  {(['all', 'credit', 'debit'] as const).map(f => (
                    <button
                      key={f}
                      className={`uw-filter-tab${walletTxFilter === f ? ' uw-filter-tab--active' : ''}`}
                      onClick={() => { setWalletTxFilter(f); setWalletTxPage(1) }}
                    >
                      {f === 'all' ? 'All' : f === 'credit' ? 'Credits' : 'Debits'}
                    </button>
                  ))}
                </div>

                {walletTxsLoading ? (
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
                ) : walletTxs.length === 0 ? (
                  <div className="appt-empty">
                    <span className="appt-empty-icon">💳</span>
                    <p className="appt-empty-text">No transactions yet.</p>
                  </div>
                ) : (
                  <div className="uw-tx-list">
                    {walletTxs
                      .filter(tx => walletTxFilter === 'all' || tx.type === walletTxFilter)
                      .map(tx => {
                        const isCredit = tx.type === 'credit'
                        const dateStr = new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        const sourceIcon = tx.source === 'reward' ? '🎁' : tx.source === 'subscription' ? '📦' : '🛒'
                        return (
                          <div key={tx.id} className="uw-tx-row">
                            <div className={`uw-tx-icon ${isCredit ? 'uw-tx-icon--green' : 'uw-tx-icon--red'}`}>
                              <span>{sourceIcon}</span>
                            </div>
                            <div className="uw-tx-info">
                              <p className="uw-tx-desc">{tx.description}</p>
                              <p className="uw-tx-meta">{dateStr} · Bal: ₹{tx.balance_after.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className={`uw-tx-amount ${isCredit ? 'uw-tx-amount--green' : 'uw-tx-amount--red'}`}>
                              {isCredit ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                )}

                {walletTxTotal > 10 && (
                  <div className="appt-pagination" style={{ marginTop: '16px' }}>
                    <button className="appt-page-btn" disabled={walletTxPage <= 1} onClick={() => setWalletTxPage(p => p - 1)}>← Prev</button>
                    <span className="appt-page-info">Page {walletTxPage} · {walletTxTotal} total</span>
                    <button className="appt-page-btn" disabled={walletTxPage * 10 >= walletTxTotal} onClick={() => setWalletTxPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: My Subscription ── */}
            {activeTab === 'subscription' && (
              <div className="up-panel">
                <div className="up-panel-header">
                  <div className="up-panel-icon" style={{ background: '#ede9fe', color: '#5b21b6' }}><RefreshCw size={20} /></div>
                  <div>
                    <h2 className="up-panel-title">My Subscription</h2>
                    <p className="up-panel-sub">Manage your 3-month diet plan progress</p>
                  </div>
                </div>

                {subLoading ? (
                  <div className="appt-skeleton-list">
                    {[1, 2].map(n => (
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
                ) : !subStatus?.has_subscription ? (
                  <div className="appt-empty">
                    <span className="appt-empty-icon">📋</span>
                    <p className="appt-empty-text">
                      No active 3-month subscription found.{' '}
                      <Link to="/form">Get a 3-Month Plan →</Link>
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Plan progress */}
                    <div className="usub-progress-card">
                      <p className="usub-plan-label">3-Month Diet Plan</p>
                      <div className="usub-months-row">
                        {Array.from({ length: subStatus.months_total }, (_, i) => {
                          const done = i < subStatus.months_generated
                          return (
                            <div key={i} className={`usub-month-bubble ${done ? 'usub-month-bubble--done' : 'usub-month-bubble--pending'}`}>
                              <span className="usub-month-num">Month {i + 1}</span>
                              <span className="usub-month-status">{done ? '✓ Done' : 'Available'}</span>
                            </div>
                          )
                        })}
                      </div>
                      <p className="usub-progress-note">
                        {subStatus.months_generated} of {subStatus.months_total} month{subStatus.months_total !== 1 ? 's' : ''} generated
                        · {subStatus.months_remaining} remaining
                      </p>
                    </div>

                    {/* Wallet info */}
                    <div className="usub-wallet-row">
                      <div className="usub-wallet-item">
                        <span className="usub-wallet-label">Wallet Balance</span>
                        <span className="usub-wallet-val">₹{(walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="usub-wallet-sep" />
                      <div className="usub-wallet-item">
                        <span className="usub-wallet-label">Cost per Month</span>
                        <span className="usub-wallet-val">₹{subStatus.per_month_amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {subStatus.months_remaining > 0 && (
                      <>
                        {redeemSuccess ? (
                          <div className="usub-success-banner">
                            <span>✓</span>
                            <div>
                              <p className="usub-success-title">Month {subStatus.months_generated} diet plan is being generated!</p>
                              <p className="usub-success-sub">You'll receive your plan by email shortly.</p>
                            </div>
                          </div>
                        ) : (walletBalance ?? 0) >= subStatus.per_month_amount ? (
                          <>
                            {!redeemConfirm ? (
                              <button
                                className="btn-primary usub-generate-btn"
                                onClick={() => setRedeemConfirm(true)}
                              >
                                Generate Month {subStatus.months_generated + 1} Diet Chart
                              </button>
                            ) : (
                              <div className="usub-confirm-box">
                                <p className="usub-confirm-title">Confirm Generation</p>
                                <p className="usub-confirm-body">
                                  ₹{subStatus.per_month_amount.toLocaleString('en-IN')} will be deducted from your wallet to generate
                                  Month {subStatus.months_generated + 1} of your 3-month plan using your saved preferences.
                                </p>
                                {lastFormData && (
                                  <div className="usub-prefill-preview">
                                    <span>Using preferences for: <strong>{String(lastFormData.full_name ?? '')}</strong></span>
                                    {lastFormData.city ? <span> · {String(lastFormData.city)}, {String(lastFormData.state ?? '')}</span> : null}
                                  </div>
                                )}
                                <p className="usub-confirm-edit-note">
                                  Want to update your preferences first?{' '}
                                  <Link to="/form" onClick={() => setRedeemConfirm(false)}>Edit preferences →</Link>
                                </p>
                                <div className="usub-confirm-actions">
                                  <button
                                    className="btn-primary usub-confirm-btn"
                                    onClick={handleRedeemMonth}
                                    disabled={redeemLoading}
                                  >
                                    {redeemLoading ? 'Processing…' : 'Confirm & Generate'}
                                  </button>
                                  <button
                                    className="usub-cancel-btn"
                                    onClick={() => setRedeemConfirm(false)}
                                    disabled={redeemLoading}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="usub-insufficient-banner">
                            <span className="usub-insufficient-icon">⚠</span>
                            <div>
                              <p className="usub-insufficient-title">Insufficient wallet balance</p>
                              <p className="usub-insufficient-sub">
                                You need ₹{subStatus.per_month_amount.toLocaleString('en-IN')} but have ₹{(walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.{' '}
                                <Link to="/form">Purchase a new plan →</Link>
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {subStatus.months_remaining === 0 && (
                      <div className="appt-empty" style={{ paddingTop: '16px' }}>
                        <span className="appt-empty-icon">🎉</span>
                        <p className="appt-empty-text">All 3 months have been generated! <Link to="/form">Start a new plan →</Link></p>
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
