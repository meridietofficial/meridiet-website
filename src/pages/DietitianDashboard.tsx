import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import dietitianApi, { type DietitianProfile } from '../api/dietitian'
import ProfileSetupModal, { type SetupItem } from '../components/ProfileSetupModal'
import { type DietitianOutletContext } from '../components/DietitianLayout'

const SETUP_SKIPPED_KEY = 'meri_diet_dietitian_setup_skipped'

/* Build the onboarding checklist from the real profile. Availability is the
 * headline item — it's what makes a dietitian show up as available to clients. */
function buildSetupItems(p: DietitianProfile): SetupItem[] {
  const filled = (v: unknown) => typeof v === 'string' ? v.trim().length > 0 : !!v
  return [
    { label: 'Weekly Availability', icon: 'fa-solid fa-calendar-days',  done: !!p.availability && Object.keys(p.availability).length > 0 },
    { label: 'Profile Photo',       icon: 'fa-solid fa-image',          done: filled(p.documents?.profile_photo) || filled(p.avatar_url) },
    { label: 'About / Bio',         icon: 'fa-solid fa-pen',            done: filled(p.bio) },
    { label: 'Languages',           icon: 'fa-solid fa-language',       done: (p.languages?.length ?? 0) > 0 },
  ]
}

const NOTIFICATIONS = [
  { icon: '👤', text: 'New consultation request from Priya Verma', time: '2 mins ago', dot: 'green' },
  { icon: '📅', text: 'Appointment confirmed with Rohan Mehta',    time: 'Today, 10:30 AM', dot: 'blue' },
  { icon: '💬', text: 'New message from Anjali Singh',             time: 'Today, 9:15 AM', dot: '' },
  { icon: '⭐', text: 'You received a 5-star review from Mehak S.', time: 'Yesterday, 8:45 PM', dot: '' },
]

const APPOINTMENTS = [
  { name: 'Rohan Mehta',  plan: 'Weight Loss Plan', day: 'Today',    time: '11:30 AM', initials: 'RM' },
  { name: 'Sneha Iyer',   plan: 'PCOS Diet Plan',   day: 'Today',    time: '04:00 PM', initials: 'SI' },
  { name: 'Vikram Singh', plan: 'Muscle Gain Diet',  day: 'Tomorrow', time: '10:30 AM', initials: 'VS' },
]

const REQUESTS = [
  {
    name: 'Priya Verma',
    goal: 'Weight Management',
    desc: 'Looking for personalized diet plan for weight loss',
    age: 28, gender: 'Female',
    time: '2 mins ago',
    initials: 'PV',
  },
  {
    name: 'Amit Kumar',
    goal: 'Diabetes Management',
    desc: 'Type 2 diabetes diet plan and lifestyle guidance',
    age: 45, gender: 'Male',
    time: '15 mins ago',
    initials: 'AK',
  },
]

const QUICK_ACTIONS = [
  { icon: '📄', label: 'Create Diet Plan' },
  { icon: '👤', label: 'Add Client' },
  { icon: '📨', label: 'Send Follow-up' },
  { icon: '📝', label: 'Add Note' },
  { icon: '📊', label: 'Earnings Report' },
  { icon: '❓', label: 'Help Center' },
]

const SLOTS = [
  { time: '09:00 AM – 01:00 PM', status: 'available' },
  { time: '03:00 PM – 07:00 PM', status: 'available' },
  { time: '07:00 PM – 09:00 PM', status: 'unavailable' },
]

const PROFILE_STRENGTH = [
  { label: 'Basic Information', done: true },
  { label: 'Profile Picture',   done: true },
  { label: 'Qualifications',    done: true },
  { label: 'Specializations',   done: true },
  { label: 'Intro Video',       done: false },
]

export default function DietitianDashboard() {
  const navigate = useNavigate()
  const { online, setOnline } = useOutletContext<DietitianOutletContext>()

  // ── Profile-completion onboarding prompt ──
  const [setupItems, setSetupItems] = useState<SetupItem[] | null>(null)

  useEffect(() => {
    // Already dismissed this session → never bother fetching/showing again.
    if (sessionStorage.getItem(SETUP_SKIPPED_KEY)) return
    let active = true
    dietitianApi.getProfile()
      .then(p => {
        if (!active) return
        const items = buildSetupItems(p)
        // Only prompt when availability (the key detail) is still missing.
        const availabilityDone = items[0].done
        if (!availabilityDone) setSetupItems(items)
      })
      .catch(() => { /* silent — onboarding prompt is best-effort */ })
    return () => { active = false }
  }, [])

  const handleSetupComplete = () => {
    setSetupItems(null)
    navigate('/dietitian-profile', { state: { tab: 'Preferences' } })
  }
  const handleSetupSkip = () => {
    sessionStorage.setItem(SETUP_SKIPPED_KEY, '1')
    setSetupItems(null)
  }

  return (
    <>
      {setupItems && (
        <ProfileSetupModal
          items={setupItems}
          onComplete={handleSetupComplete}
          onSkip={handleSetupSkip}
        />
      )}

        {/* ── Stats row ── */}
        <div className="dd-stats">
          <div className="dd-stat-card dd-stat-card--green">
            <div className="dd-stat-card-icon dd-stat-icon--green">📅</div>
            <div>
              <p className="dd-stat-card-label">Today's Consultations</p>
              <p className="dd-stat-card-val">5</p>
              <p className="dd-stat-card-sub dd-sub--up">↗ 25% from yesterday</p>
            </div>
          </div>
          <div className="dd-stat-card dd-stat-card--orange">
            <div className="dd-stat-card-icon dd-stat-icon--orange">📋</div>
            <div>
              <p className="dd-stat-card-label">Pending Requests</p>
              <p className="dd-stat-card-val">2</p>
              <p className="dd-stat-card-link">View all requests →</p>
            </div>
          </div>
          <div className="dd-stat-card dd-stat-card--blue">
            <div className="dd-stat-card-icon dd-stat-icon--blue">🗓</div>
            <div>
              <p className="dd-stat-card-label">Upcoming Appointments</p>
              <p className="dd-stat-card-val">3</p>
              <p className="dd-stat-card-sub">Next: 11:30 AM</p>
            </div>
          </div>
          <div className="dd-stat-card dd-stat-card--purple">
            <div className="dd-stat-card-icon dd-stat-icon--purple">💰</div>
            <div>
              <p className="dd-stat-card-label">Total Earnings (This Month)</p>
              <p className="dd-stat-card-val">₹28,450</p>
              <p className="dd-stat-card-sub dd-sub--up">↗ 18% from last month</p>
            </div>
          </div>
        </div>

        {/* ── 3-column body ── */}
        <div className="dd-body">

          {/* Left column */}
          <div className="dd-col">

            {/* Notifications */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h2 className="dd-card-title">Notifications</h2>
                <button className="dd-card-link">View All</button>
              </div>
              <div className="dd-notif-list">
                {NOTIFICATIONS.map((n, i) => (
                  <div key={i} className="dd-notif-item">
                    <span className="dd-notif-icon">{n.icon}</span>
                    <div className="dd-notif-text">
                      <p className="dd-notif-msg">{n.text}</p>
                      <p className="dd-notif-time">{n.time}</p>
                    </div>
                    {n.dot && <span className={`dd-notif-dot dd-dot--${n.dot}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h2 className="dd-card-title">Upcoming Appointments</h2>
                <button className="dd-card-link">View Calendar</button>
              </div>
              <div className="dd-appt-list">
                {APPOINTMENTS.map((a, i) => (
                  <div key={i} className="dd-appt-item">
                    <div className="dd-appt-avatar">{a.initials}</div>
                    <div className="dd-appt-info">
                      <p className="dd-appt-name">{a.name}</p>
                      <p className="dd-appt-plan">{a.plan}</p>
                    </div>
                    <div className="dd-appt-time">
                      <p className="dd-appt-day">{a.day}</p>
                      <p className="dd-appt-hour">{a.time}</p>
                    </div>
                    <button className="dd-video-btn">📹 Video Call</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle column */}
          <div className="dd-col">

            {/* Consultation Requests */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h2 className="dd-card-title">Consultation Requests</h2>
                <button className="dd-card-link">View All</button>
              </div>
              <div className="dd-req-list">
                {REQUESTS.map((r, i) => (
                  <div key={i} className="dd-req-item">
                    <div className="dd-req-top">
                      <div className="dd-req-avatar">{r.initials}</div>
                      <div className="dd-req-info">
                        <div className="dd-req-name-row">
                          <p className="dd-req-name">{r.name}</p>
                          <span className="dd-req-new">NEW</span>
                          <span className="dd-req-time">{r.time}</span>
                        </div>
                        <p className="dd-req-goal">{r.goal}</p>
                        <p className="dd-req-desc">{r.desc}</p>
                      </div>
                    </div>
                    <div className="dd-req-meta">
                      <span>👤 {r.age} yrs</span>
                      <span>{r.gender === 'Female' ? '♀' : '♂'} {r.gender}</span>
                      <div className="dd-req-actions">
                        <button className="dd-req-view">View Details</button>
                        <button className="dd-req-accept">Accept</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dd-card">
              <h2 className="dd-card-title" style={{ marginBottom: 14 }}>Quick Actions</h2>
              <div className="dd-quick-grid">
                {QUICK_ACTIONS.map(q => (
                  <button key={q.label} className="dd-quick-item">
                    <span className="dd-quick-icon">{q.icon}</span>
                    <span className="dd-quick-label">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="dd-col">

            {/* My Availability */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h2 className="dd-card-title">My Availability</h2>
                <button className="dd-card-link">Edit</button>
              </div>
              <div className="dd-avail-online">
                <div className="dd-avail-online-row">
                  <div>
                    <p className="dd-avail-online-label">{online ? 'You are Online' : 'You are Offline'}</p>
                    <p className="dd-avail-online-sub">Clients can see you and book consultations</p>
                  </div>
                  <button
                    className={`dd-toggle${online ? ' dd-toggle--on' : ''}`}
                    onClick={() => setOnline(p => !p)}
                  >
                    <span className="dd-toggle-knob" />
                  </button>
                </div>
              </div>
              <p className="dd-avail-day-label">Today's Availability</p>
              <div className="dd-slot-list">
                {SLOTS.map(s => (
                  <div key={s.time} className={`dd-slot-row dd-slot-row--${s.status}`}>
                    <span className="dd-slot-time">{s.time}</span>
                    <span className="dd-slot-status">{s.status === 'available' ? 'Available' : 'Unavailable'}</span>
                  </div>
                ))}
              </div>
              <button className="dd-manage-avail-btn">📅 Manage Availability</button>
            </div>

            {/* Profile Strength */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h2 className="dd-card-title">Profile Strength</h2>
                <span className="dd-strength-pct">80% Complete</span>
              </div>
              <div className="dd-strength-bar-wrap">
                <div className="dd-strength-bar" style={{ width: '80%' }} />
              </div>
              <div className="dd-strength-list">
                {PROFILE_STRENGTH.map(item => (
                  <div key={item.label} className="dd-strength-item">
                    <span className={`dd-strength-check${item.done ? ' dd-strength-check--done' : ''}`}>
                      {item.done ? '✓' : '○'}
                    </span>
                    <span className="dd-strength-label">{item.label}</span>
                    {!item.done && <button className="dd-add-now-btn">Add Now</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom banner ── */}
        <div className="dd-banner">
          <span className="dd-banner-icon">🛡️</span>
          <div>
            <p className="dd-banner-title">Your Practice. Our Technology. Better Health for All.</p>
            <p className="dd-banner-sub">We take care of the platform, so you can focus on what you do best – transforming lives.</p>
          </div>
        </div>

    </>
  )
}
