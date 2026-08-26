import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Props = {
  online: boolean
  onToggleOnline: () => void
  onMenuClick: () => void
  trialDaysLeft?: number | null
  onPayNow?: () => void
}

export default function DietitianTopbar({ online, onToggleOnline, onMenuClick, trialDaysLeft, onPayNow }: Props) {
  const { user, clearAuth } = useAuth()
  const navigate = useNavigate()

  const firstName = user?.full_name?.split(' ')[0] ?? 'Doctor'
  const initials = user?.full_name
    ? user.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'D'
  const handleLogout = () => { clearAuth(); navigate('/') }

  return (
    <header className="dd-topbar">
      <div className="dd-topbar-left">
        <button className="dd-hamburger" onClick={onMenuClick} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <div className="dd-topbar-welcome">
          <p className="dd-welcome">Welcome back,</p>
          <h1 className="dd-welcome-name">{firstName} 👋</h1>
        </div>
      </div>
      {trialDaysLeft !== null && trialDaysLeft !== undefined && (
        <button
          className={`dd-trial-badge${trialDaysLeft <= 3 ? ' dd-trial-badge--urgent' : ''}`}
          onClick={onPayNow}
          title="Complete your registration"
        >
          <i className="fa-solid fa-gift" />
          <span className="dd-trial-badge-text">
            {trialDaysLeft === 7 ? '7-Day Free Trial' : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left`}
          </span>
          <span className="dd-trial-badge-sub">Free Trial</span>
        </button>
      )}
      <div className="dd-topbar-right">
        <div className="dd-online-toggle">
          <span className={`dd-online-dot${online ? ' dd-online-dot--on' : ''}`} />
          <span className="dd-online-label">{online ? 'You are Online' : 'You are Offline'}</span>
          <button
            className={`dd-toggle${online ? ' dd-toggle--on' : ''}`}
            onClick={onToggleOnline}
            aria-label="Toggle online status"
          >
            <span className="dd-toggle-knob" />
          </button>
        </div>
        <button className="dd-notif-btn">
          🔔
          <span className="dd-notif-badge">2</span>
        </button>
        <div className="dd-user-chip">
          <div className="dd-user-avatar">{initials}</div>
          <span className="dd-user-name">{user?.full_name ?? 'Dietitian'}</span>
          <span className="dd-user-chevron">▾</span>
          <div className="dd-user-dropdown">
            <Link to="/dietitian-profile" className="dd-dropdown-item">My Profile</Link>
            <button className="dd-dropdown-item" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </header>
  )
}
