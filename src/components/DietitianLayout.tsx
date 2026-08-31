import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom'
import DietitianTopbar from './DietitianTopbar'
import dietitianApi, { type DietitianProfile } from '../api/dietitian'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { dietitianRegistrationFeeApi } from '../api/payment'
import { useToast } from '../context/ToastContext'
import { loadRazorpay } from '../utils/loadRazorpay'

export type DietitianOutletContext = {
  online: boolean
  toggleOnline: () => void
  profile: DietitianProfile | null
  profileLoading: boolean
  setLayoutProfile: (p: DietitianProfile) => void
}

const NAV_ITEMS: { icon: string; label: string; route?: string; badge?: number }[] = [
  { icon: 'fa-solid fa-table-columns',   label: 'Dashboard',             route: '/dietitian-dashboard' },
  { icon: 'fa-solid fa-calendar-check',  label: 'Appointments',          route: '/dietitian-appointments' },
  { icon: 'fa-solid fa-hospital-user',   label: 'Clinic Patients',       route: '/dietitian-clinic-patients' },
  { icon: 'fa-solid fa-users',           label: 'My Clients',            route: '/dietitian-my-clients' },
  { icon: 'fa-solid fa-bowl-food',       label: 'Diet Plans',            route: '/dietitian-diet-plans' },
  { icon: 'fa-solid fa-pen-to-square',  label: 'Manual Diet Plans',     route: '/dietitian-diet-plans/manual' },
  // { icon: 'fa-solid fa-comments',        label: 'Chat',                  route: '/dietitian-chat' },
  { icon: 'fa-solid fa-bell',            label: 'Follow Ups',            route: '/dietitian-follow-ups' },
  // { icon: 'fa-solid fa-chart-line',      label: 'Reports',               route: '/dietitian-reports' },
  { icon: 'fa-solid fa-sack-dollar',     label: 'Earnings',              route: '/dietitian-earnings' },
  { icon: 'fa-solid fa-wallet',          label: 'Wallet',                route: '/dietitian-wallet' },
  { icon: 'fa-solid fa-star',            label: 'Reviews',               route: '/dietitian-reviews' },
  { icon: 'fa-solid fa-user',            label: 'Profile',               route: '/dietitian-profile' },
  // { icon: 'fa-solid fa-gear',            label: 'Settings',              route: '/dietitian-settings' },
]

export default function DietitianLayout() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { pathname, search } = useLocation()
  const [online, setOnline] = useState(false)
  const toggling = useRef(false)
  const [onlineError, setOnlineError] = useState<string | null>(null)
  const [profile, setProfile] = useState<DietitianProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* Subscription gate */
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Fetch profile once for the whole layout — child pages reuse this via outlet context
  useEffect(() => {
    let active = true
    dietitianApi.getProfile()
      .then(p => {
        if (!active) return
        setOnline(p.is_online === 1)
        setProfile(p)
        const status = p.subscription_status
        setSubscriptionStatus(status)
        if (status === 'expired') setPaymentPopupOpen(true)
      })
      .catch(() => {})
      .finally(() => { if (active) setProfileLoading(false) })
    return () => { active = false }
  }, [])

  /* Listen for 403 access-blocked events from any API call */
  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as CustomEvent<{ errorCode: string }>
      if (evt.detail.errorCode === 'REGISTRATION_FEE_REQUIRED') {
        setSubscriptionStatus('expired')
        setPaymentPopupOpen(true)
      } else if (evt.detail.errorCode === 'PENDING_APPROVAL') {
        setSubscriptionStatus('pending_approval')
      }
    }
    window.addEventListener('dietitian-access-blocked', handler)
    return () => window.removeEventListener('dietitian-access-blocked', handler)
  }, [])

  async function handlePayRegistrationFee() {
    setPaymentLoading(true)
    try {
      const orderRes = await dietitianRegistrationFeeApi.createOrder()
      const { order_id, amount, currency, key_id } = orderRes.data
      setPaymentLoading(false)

      await loadRazorpay()
      let paymentSucceeded = false
      const rzp = new window.Razorpay({
        key:      key_id,
        order_id,
        amount:   amount * 100,
        currency,
        name:        'MeriDiet',
        description: 'Dietitian Registration Fee',
        prefill: { name: profile?.full_name ?? '', email: profile?.email ?? '' },
        theme: { color: '#16a34a' },
        handler: async (rzpRes: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          paymentSucceeded = true
          try {
            await dietitianRegistrationFeeApi.verify({
              razorpay_order_id:   rzpRes.razorpay_order_id,
              razorpay_payment_id: rzpRes.razorpay_payment_id,
              razorpay_signature:  rzpRes.razorpay_signature,
            })
            setPaymentPopupOpen(false)
            setSubscriptionStatus('active')
            // Reload profile to get updated status
            const updated = await dietitianApi.getProfile()
            setProfile(updated)
            setSubscriptionStatus(updated.subscription_status)
            showToast('Payment successful! You now have full access.', 'success')
          } catch {
            showToast('Payment received but verification failed. Please contact support.', 'error')
          }
        },
        modal: {
          ondismiss: async () => {
            if (paymentSucceeded) return
            try { await dietitianRegistrationFeeApi.failed(order_id) } catch { /* silent */ }
          },
        },
      })
      rzp.open()
    } catch (err) {
      setPaymentLoading(false)
      const msg = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      showToast(msg, 'error')
    }
  }

  async function toggleOnline() {
    if (toggling.current) return
    toggling.current = true
    const next = !online
    setOnline(next)
    try {
      const confirmed = await dietitianApi.setOnlineStatus(next)
      setOnline(confirmed)
    } catch (err) {
      setOnline(!next)
      const msg = err instanceof ApiError ? err.message : 'Failed to update status. Please try again.'
      setOnlineError(msg)
    } finally {
      toggling.current = false
    }
  }

  // Pick the nav item whose route is the longest prefix of pathname (most specific wins)
  // Special cases: ?manual=1 → Manual Diet Plans; ?from=clinic → Clinic Patients
  const isManualDetailRoute = search.includes('manual=1') && pathname.startsWith('/dietitian-diet-plans/')
  const isClinicDetailRoute = search.includes('from=clinic') && pathname.startsWith('/dietitian-appointments/')
  const activeNav = isManualDetailRoute
    ? 'Manual Diet Plans'
    : isClinicDetailRoute
      ? 'Clinic Patients'
      : NAV_ITEMS
        .filter(i => i.route && (pathname === i.route || pathname.startsWith(i.route + '/')))
        .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))[0]?.label ?? 'Dashboard'
  const handleNavClick = (item: typeof NAV_ITEMS[number]) => {
    if (item.route && item.route !== pathname) navigate(item.route)
    setSidebarOpen(false)
  }

  // Parse "Cannot go online. Please fix the following:\n• item1\n• item2"
  const errorLines = onlineError ? onlineError.split('\n').filter(Boolean) : []
  const errorTitle = errorLines[0] ?? ''
  const errorBullets = errorLines.slice(1).map(l => l.replace(/^[•\-]\s*/, '').trim()).filter(Boolean)

  if (!token || !user || user.role !== 'dietitian') {
    return <Navigate to="/" replace />
  }

  const trialDaysLeft = (() => {
    if (!profile?.trial_ends_at) return null
    const diff = new Date(profile.trial_ends_at).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })()

  return (
    <div className="dd-root">

      {/* Online status error modal */}
      {onlineError && (
        <div className="dd-online-err-backdrop" onClick={() => setOnlineError(null)}>
          <div className="dd-online-err-modal" onClick={e => e.stopPropagation()}>
            <div className="dd-online-err-icon">⚠️</div>
            <h3 className="dd-online-err-title">Cannot Go Online</h3>
            {errorTitle && <p className="dd-online-err-desc">{errorTitle.replace(/^cannot go online[^:]*:\s*/i, '')}</p>}
            {errorBullets.length > 0 && (
              <ul className="dd-online-err-list">
                {errorBullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
            <div className="dd-online-err-actions">
              <button
                className="dd-online-err-fix-btn"
                onClick={() => { setOnlineError(null); navigate('/dietitian-profile') }}
              >
                Fix in Profile →
              </button>
              <button className="dd-online-err-dismiss" onClick={() => setOnlineError(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="dd-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`dd-sidebar${sidebarOpen ? ' dd-sidebar--open' : ''}`}>
        <div className="dd-sidebar-logo">
          <button className="dd-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">✕</button>
          <Link to="/dietitian-dashboard" onClick={() => setSidebarOpen(false)}>
            <img src="/logo-header.png" alt="MeriDiet" className="dd-logo-img" />
          </Link>
          <p className="dd-logo-sub">Dietitian Dashboard</p>
        </div>

        <div className="dd-sidebar-scroll">
          <nav className="dd-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.label}
                className={`dd-nav-item${activeNav === item.label ? ' dd-nav-item--active' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                <span className="dd-nav-icon"><i className={item.icon} /></span>
                <span className="dd-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* <div className="dd-refer-card">
            <p className="dd-refer-title">Refer &amp; Earn</p>
            <p className="dd-refer-desc">Invite fellow dietitians and earn exciting rewards.</p>
            <button className="dd-refer-btn">Refer Now &rarr;</button>
          </div> */}

          <button className="dd-help-link"><i className="fa-regular fa-circle-question" /> Need Help?</button>
        </div>
      </aside>

      {/* Main */}
      <div className="dd-main">
        <DietitianTopbar
          online={online}
          onToggleOnline={toggleOnline}
          onMenuClick={() => setSidebarOpen(true)}
          trialDaysLeft={subscriptionStatus === 'trial' ? trialDaysLeft : null}
          onPayNow={() => setPaymentPopupOpen(true)}
        />

        {/* Trial countdown banner */}
        {subscriptionStatus === 'trial' && trialDaysLeft !== null && (
          <div className="dd-trial-banner">
            <i className="fa-solid fa-clock" />
            <span>
              {trialDaysLeft > 0
                ? <>Your free trial ends in <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</strong>. Complete your registration to keep full access.</>
                : <>Your free trial has ended. Please complete your registration to continue.</>}
            </span>
            <button className="dd-trial-pay-btn" onClick={() => setPaymentPopupOpen(true)}>
              Pay Now →
            </button>
          </div>
        )}

        {/* Pending approval gate */}
        {subscriptionStatus === 'pending_approval' && (
          <div className="dd-sub-gate">
            <div className="dd-sub-gate-icon"><i className="fa-solid fa-hourglass-half" /></div>
            <h2 className="dd-sub-gate-title">Profile Under Review</h2>
            <p className="dd-sub-gate-desc">
              Your registration has been submitted. Our team is reviewing your documents and will notify you once your profile is approved (usually within 24–48 hours).
            </p>
            <div className="dd-sub-gate-info">
              <i className="fa-regular fa-envelope" style={{ color: '#16a34a' }} />
              You'll receive an email at <strong>{profile?.email ?? user.email}</strong> once approved.
            </div>
            <button className="dd-sub-gate-link" onClick={() => navigate('/dietitian-profile')}>
              View My Profile →
            </button>
          </div>
        )}

        {/* Normal portal content */}
        {subscriptionStatus !== 'pending_approval' && (
          <Outlet context={{ online, toggleOnline, profile, profileLoading, setLayoutProfile: setProfile } satisfies DietitianOutletContext} />
        )}
      </div>

      {/* Registration fee payment popup (expired / end-of-trial) */}
      {paymentPopupOpen && (
        <div className="dd-pay-backdrop">
          <div className="dd-pay-modal">
            {subscriptionStatus === 'trial' && (
              <button
                className="dd-pay-close"
                onClick={() => setPaymentPopupOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            )}
            {/* Header */}
            <div className="dd-pay-header">
              <div className="dd-pay-icon"><i className="fa-solid fa-rocket" /></div>
              <h2 className="dd-pay-title">Complete Your Registration</h2>
              <p className="dd-pay-subtitle">
                {subscriptionStatus === 'trial'
                  ? 'Unlock permanent access & start earning more'
                  : 'Restore full access to your dashboard'}
              </p>
            </div>

            {/* Price */}
            <div className="dd-pay-price-section">
              <div className="dd-pay-price-box">
                <div className="dd-pay-old-price-large">₹2,499</div>
                <div className="dd-pay-price-now">
                  <span className="dd-pay-currency">₹</span><span className="dd-pay-amount">999</span>
                </div>
                <div className="dd-pay-savings">Save 60% — limited time offer</div>
              </div>
            </div>

            {/* Bonus Credits */}
            <div className="dd-pay-bonus">
              <div className="dd-pay-bonus-icon">🎁</div>
              <div className="dd-pay-bonus-text">
                <strong>Bonus: ₹500 AI Diet Plan Credits</strong>
                <p>Use instantly to generate AI diet plans for your clients</p>
              </div>
            </div>

            {/* Features */}
            <div className="dd-pay-features">
              <div className="dd-pay-feature">
                <i className="fa-solid fa-check-circle" />
                <span><strong>Full Portal Access</strong> — Lifetime permanent access</span>
              </div>
              <div className="dd-pay-feature">
                <i className="fa-solid fa-check-circle" />
                <span><strong>Online Consultations</strong> — Video calls &amp; appointments</span>
              </div>
              <div className="dd-pay-feature">
                <i className="fa-solid fa-check-circle" />
                <span><strong>Client Management</strong> — Diet plans &amp; follow-ups</span>
              </div>
              <div className="dd-pay-feature">
                <i className="fa-solid fa-check-circle" />
                <span><strong>Verified Badge</strong> — Boost client trust</span>
              </div>
            </div>

            {/* CTA */}
            <button
              className="dd-pay-btn"
              onClick={handlePayRegistrationFee}
              disabled={paymentLoading}
            >
              {paymentLoading ? '⏳ Processing Payment...' : '💳 Pay ₹999 Now'}
            </button>

            {/* Trust */}
            <div className="dd-pay-trust">
              <div className="dd-pay-trust-item">
                <i className="fa-solid fa-shield-halved" />
                <span>Secure Payment</span>
              </div>
              <div className="dd-pay-trust-sep" />
              <div className="dd-pay-trust-item">
                <i className="fa-solid fa-check" />
                <span>Instant Activation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
