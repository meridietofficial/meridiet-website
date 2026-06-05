import { useState } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import DietitianTopbar from './DietitianTopbar'

/** Shared state the layout hands down to pages (e.g. the online toggle, which
 *  the dashboard also surfaces in its availability card). */
export type DietitianOutletContext = {
  online: boolean
  setOnline: React.Dispatch<React.SetStateAction<boolean>>
}

const NAV_ITEMS: { icon: string; label: string; route?: string; badge?: number }[] = [
  { icon: 'fa-solid fa-table-columns',   label: 'Dashboard',             route: '/dietitian-dashboard' },
  { icon: 'fa-solid fa-clipboard-list',  label: 'Consultation Requests', badge: 2 },
  { icon: 'fa-solid fa-users',           label: 'My Clients'            },
  { icon: 'fa-solid fa-calendar-check',  label: 'Appointments'          },
  { icon: 'fa-solid fa-bowl-food',       label: 'Diet Plans'            },
  { icon: 'fa-solid fa-comments',        label: 'Chat'                  },
  { icon: 'fa-solid fa-bell',            label: 'Follow Ups'            },
  { icon: 'fa-solid fa-chart-line',      label: 'Reports'               },
  { icon: 'fa-solid fa-sack-dollar',     label: 'Earnings'              },
  { icon: 'fa-solid fa-wallet',          label: 'Wallet'                },
  { icon: 'fa-solid fa-star',            label: 'Reviews'               },
  { icon: 'fa-solid fa-user',            label: 'Profile',               route: '/dietitian-profile' },
  { icon: 'fa-solid fa-gear',            label: 'Settings'              },
]

/**
 * Persistent shell for the dietitian module. The sidebar + top bar live here
 * and stay mounted while only the inner page swaps via <Outlet>, so navigating
 * between Dashboard and Profile no longer remounts (and flashes) the chrome.
 */
export default function DietitianLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [online, setOnline] = useState(true)

  // Highlight the nav item that owns the current route.
  const routedActive = NAV_ITEMS.find(i => i.route === pathname)?.label ?? 'Dashboard'
  const [activeNav, setActiveNav] = useState(routedActive)

  const handleNavClick = (item: typeof NAV_ITEMS[number]) => {
    setActiveNav(item.label)
    if (item.route && item.route !== pathname) navigate(item.route)
  }

  return (
    <div className="dd-root">
      {/* ── Sidebar ── */}
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
                {!!item.badge && item.badge > 0 && <span className="dd-nav-badge">{item.badge}</span>}
              </button>
            ))}
          </nav>

          <div className="dd-refer-card">
            <p className="dd-refer-title">Refer &amp; Earn</p>
            <p className="dd-refer-desc">Invite fellow dietitians and earn exciting rewards.</p>
            <button className="dd-refer-btn">Refer Now →</button>
          </div>

          <button className="dd-help-link"><i className="fa-regular fa-circle-question" /> Need Help?</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dd-main">
        <DietitianTopbar online={online} onToggleOnline={() => setOnline(p => !p)} />
        <Outlet context={{ online, setOnline } satisfies DietitianOutletContext} />
      </div>
    </div>
  )
}
