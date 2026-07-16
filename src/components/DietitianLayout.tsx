import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom'
import DietitianTopbar from './DietitianTopbar'
import dietitianApi, { type DietitianProfile } from '../api/dietitian'
import { ApiError } from '../api/client'
import { useConsultationCount } from '../context/ConsultationCountContext'
import { useAuth } from '../context/AuthContext'

export type DietitianOutletContext = {
  online: boolean
  toggleOnline: () => void
  profile: DietitianProfile | null
  profileLoading: boolean
  setLayoutProfile: (p: DietitianProfile) => void
}

const NAV_ITEMS: { icon: string; label: string; route?: string; badge?: number }[] = [
  { icon: 'fa-solid fa-table-columns',   label: 'Dashboard',             route: '/dietitian-dashboard' },
  { icon: 'fa-solid fa-clipboard-list',  label: 'Consultation Requests', route: '/dietitian-consultation-requests' },
  { icon: 'fa-solid fa-calendar-check',  label: 'Appointments',          route: '/dietitian-appointments' },
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
  const { pathname, search } = useLocation()
  const [online, setOnline] = useState(false)
  const toggling = useRef(false)
  const [onlineError, setOnlineError] = useState<string | null>(null)
  const [profile, setProfile] = useState<DietitianProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Fetch profile once for the whole layout — child pages reuse this via outlet context
  useEffect(() => {
    let active = true
    dietitianApi.getProfile()
      .then(p => {
        if (!active) return
        setOnline(p.is_online === 1)
        setProfile(p)
      })
      .catch(() => {})
      .finally(() => { if (active) setProfileLoading(false) })
    return () => { active = false }
  }, [])

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
  // Special case: ?manual=1 on a diet plan detail page → highlight Manual Diet Plans
  const isManualDetailRoute = search.includes('manual=1') && pathname.startsWith('/dietitian-diet-plans/')
  const activeNav = isManualDetailRoute
    ? 'Manual Diet Plans'
    : NAV_ITEMS
        .filter(i => i.route && (pathname === i.route || pathname.startsWith(i.route + '/')))
        .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))[0]?.label ?? 'Dashboard'
  const { pendingCount } = useConsultationCount()

  const handleNavClick = (item: typeof NAV_ITEMS[number]) => {
    if (item.route && item.route !== pathname) navigate(item.route)
  }

  // Parse "Cannot go online. Please fix the following:\n• item1\n• item2"
  const errorLines = onlineError ? onlineError.split('\n').filter(Boolean) : []
  const errorTitle = errorLines[0] ?? ''
  const errorBullets = errorLines.slice(1).map(l => l.replace(/^[•\-]\s*/, '').trim()).filter(Boolean)

  if (!token || !user || user.role !== 'dietitian') {
    return <Navigate to="/" replace />
  }

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

      {/* Sidebar */}
      <aside className="dd-sidebar">
        <div className="dd-sidebar-logo">
          <Link to="/dietitian-dashboard">
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
                {item.label === 'Consultation Requests' && pendingCount > 0 && (
                  <span className="dd-nav-badge">{pendingCount}</span>
                )}
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
        <DietitianTopbar online={online} onToggleOnline={toggleOnline} />
        <Outlet context={{ online, toggleOnline, profile, profileLoading, setLayoutProfile: setProfile } satisfies DietitianOutletContext} />
      </div>
    </div>
  )
}
