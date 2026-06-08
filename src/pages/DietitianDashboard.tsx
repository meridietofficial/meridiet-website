import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import dietitianApi, { type DietitianProfile } from '../api/dietitian'
import appointmentApi, { type DietitianAppointment, type DashboardStats } from '../api/appointment'
import { useVideoCall } from '../context/VideoCallContext'
import ProfileSetupModal, { type SetupItem } from '../components/ProfileSetupModal'
import { type DietitianOutletContext } from '../components/DietitianLayout'

const SETUP_SKIPPED_KEY = 'meri_diet_dietitian_setup_skipped'

function buildSetupItems(p: DietitianProfile): SetupItem[] {
  const filled = (v: unknown) => typeof v === 'string' ? v.trim().length > 0 : !!v
  return [
    { label: 'Weekly Availability', icon: 'fa-solid fa-calendar-days', done: !!p.availability && Object.keys(p.availability).length > 0 },
    { label: 'Profile Photo',       icon: 'fa-solid fa-image',         done: filled(p.documents?.profile_photo) || filled(p.avatar_url) },
    { label: 'About / Bio',         icon: 'fa-solid fa-pen',           done: filled(p.bio) },
    { label: 'Languages',           icon: 'fa-solid fa-language',      done: (p.languages?.length ?? 0) > 0 },
  ]
}

function buildStrengthItems(p: DietitianProfile) {
  return [
    { label: 'Basic Information', done: !!(p.full_name && (p.phone_number || p.city)) },
    { label: 'Profile Picture',   done: !!(p.documents?.profile_photo || p.avatar_url) },
    { label: 'Qualifications',    done: (p.degrees?.length ?? 0) > 0 },
    { label: 'Specializations',   done: (p.specialization?.length ?? 0) > 0 },
    // { label: 'Intro Video',       done: false },
  ]
}

const STRENGTH_PLACEHOLDER = [
  { label: 'Basic Information', done: false },
  { label: 'Profile Picture',   done: false },
  { label: 'Qualifications',    done: false },
  { label: 'Specializations',   done: false },
  // { label: 'Intro Video',       done: false },
]

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function dateLabel(dateStr: string): string {
  const today    = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  if (dateStr === today)    return 'Today'
  if (dateStr === tomorrow) return 'Tomorrow'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function fmtSlot(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12    = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function incrementHour(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function groupSlots(slots: string[]): string[] {
  if (!slots.length) return []
  const sorted = [...slots].sort()
  const ranges: string[] = []
  let start = sorted[0]
  let prev  = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    const prevH = parseInt(prev.split(':')[0])
    const currH = parseInt(sorted[i].split(':')[0])
    if (currH === prevH + 1) {
      prev = sorted[i]
    } else {
      ranges.push(`${fmtSlot(start)} – ${fmtSlot(incrementHour(prev))}`)
      start = sorted[i]
      prev  = sorted[i]
    }
  }
  ranges.push(`${fmtSlot(start)} – ${fmtSlot(incrementHour(prev))}`)
  return ranges
}

export default function DietitianDashboard() {
  const navigate              = useNavigate()
  const { online, toggleOnline } = useOutletContext<DietitianOutletContext>()
  const { startCall }         = useVideoCall()

  const [setupItems, setSetupItems] = useState<SetupItem[] | null>(null)
  const [profile, setProfile]       = useState<DietitianProfile | null>(null)
  const [stats, setStats]           = useState<DashboardStats | null>(null)
  const [upcoming, setUpcoming]     = useState<DietitianAppointment[]>([])
  const [pending, setPending]       = useState<DietitianAppointment[]>([])
  const [loading, setLoading]       = useState(true)
  const [actionId, setActionId]     = useState<number | null>(null)

  useEffect(() => {
    let active = true

    async function fetchDashboard() {
      try {
        const [profileData, statsData, pendingRes, confirmedRes] = await Promise.all([
          dietitianApi.getProfile(),
          appointmentApi.getDashboardStats(),
          appointmentApi.getDietitianAppointments({ status: 'pending',   limit: 5  }),
          appointmentApi.getDietitianAppointments({ status: 'confirmed', limit: 20 }),
        ])
        if (!active) return

        setProfile(profileData)
        setStats(statsData)

        if (!sessionStorage.getItem(SETUP_SKIPPED_KEY)) {
          const items = buildSetupItems(profileData)
          if (!items[0].done) setSetupItems(items)
        }

        setPending(pendingRes.data)

        const todayStr = new Date().toISOString().slice(0, 10)
        const upcomingFiltered = confirmedRes.data
          .filter(a => a.appointment_date >= todayStr)
          .sort((a, b) =>
            a.appointment_date.localeCompare(b.appointment_date) ||
            a.slot.localeCompare(b.slot)
          )
        setUpcoming(upcomingFiltered)
      } catch {
        // silent
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchDashboard()
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

  async function handleAccept(id: number) {
    setActionId(id)
    try {
      await appointmentApi.updateAppointmentStatus(id, 'confirmed')
      setPending(prev => prev.filter(r => r.id !== id))
      setStats(prev => prev ? {
        ...prev,
        pending_requests: { count: Math.max(0, prev.pending_requests.count - 1) },
      } : prev)
    } catch {
      // silent
    } finally {
      setActionId(null)
    }
  }

  const nextTime      = stats?.upcoming_appointments.next_slot ?? null
  const todayDay      = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todaySlots    = profile?.availability?.[todayDay] ?? []
  const slotRanges    = groupSlots(todaySlots)
  const strengthItems = profile ? buildStrengthItems(profile) : null
  const strengthPct   = strengthItems
    ? Math.round((strengthItems.filter(i => i.done).length / strengthItems.length) * 100)
    : 0

  return (
    <>
      {setupItems && (
        <ProfileSetupModal
          items={setupItems}
          onComplete={handleSetupComplete}
          onSkip={handleSetupSkip}
        />
      )}

      {/* Stats row */}
      <div className="dd-stats">
        <div className="dd-stat-card dd-stat-card--green">
          <div className="dd-stat-card-icon dd-stat-icon--green">&#128197;</div>
          <div>
            <p className="dd-stat-card-label">Today's Consultations</p>
            <p className="dd-stat-card-val">{loading ? '—' : (stats?.today_consultations.count ?? 0)}</p>
            {!loading && stats?.today_consultations.change_percent ? (
              <p className={`dd-stat-card-sub${stats.today_consultations.change_direction === 'up' ? ' dd-sub--up' : ''}`}>
                {stats.today_consultations.change_direction === 'up' ? '↗' : '↘'} {stats.today_consultations.change_percent}% from yesterday
              </p>
            ) : <p className="dd-stat-card-sub">&nbsp;</p>}
          </div>
        </div>

        <div className="dd-stat-card dd-stat-card--orange">
          <div className="dd-stat-card-icon dd-stat-icon--orange">&#128203;</div>
          <div>
            <p className="dd-stat-card-label">Pending Requests</p>
            <p className="dd-stat-card-val">{loading ? '—' : (stats?.pending_requests.count ?? 0)}</p>
            <p
              className="dd-stat-card-link"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/dietitian-consultation-requests')}
            >View all requests &rarr;</p>
          </div>
        </div>

        <div className="dd-stat-card dd-stat-card--blue">
          <div className="dd-stat-card-icon dd-stat-icon--blue">&#128467;</div>
          <div>
            <p className="dd-stat-card-label">Upcoming Appointments</p>
            <p className="dd-stat-card-val">{loading ? '—' : (stats?.upcoming_appointments.count ?? 0)}</p>
            <p className="dd-stat-card-sub">{nextTime ? `Next: ${nextTime}` : ' '}</p>
          </div>
        </div>

        <div className="dd-stat-card dd-stat-card--purple">
          <div className="dd-stat-card-icon dd-stat-icon--purple">&#128176;</div>
          <div>
            <p className="dd-stat-card-label">Total Earnings (This Month)</p>
            <p className="dd-stat-card-val">
              {loading ? '—' : stats ? `₹${stats.monthly_earnings.amount.toLocaleString('en-IN')}` : '—'}
            </p>
            {!loading && stats?.monthly_earnings.change_percent ? (
              <p className={`dd-stat-card-sub${stats.monthly_earnings.change_direction === 'up' ? ' dd-sub--up' : ''}`}>
                {stats.monthly_earnings.change_direction === 'up' ? '↗' : '↘'} {stats.monthly_earnings.change_percent}% from last month
              </p>
            ) : <p className="dd-stat-card-sub">&nbsp;</p>}
          </div>
        </div>
      </div>

      {/* 3-column body */}
      <div className="dd-body">

        {/* Left column */}
        <div className="dd-col">
          <div className="dd-card">
            <div className="dd-card-header">
              <h2 className="dd-card-title">Upcoming Appointments</h2>
              <button className="dd-card-link" onClick={() => navigate('/dietitian-appointments')}>View Calendar</button>
            </div>
            <div className="dd-appt-list">
              {loading ? (
                <p style={{ color: '#9ca3af', padding: '12px 0', fontSize: 14 }}>Loading&hellip;</p>
              ) : upcoming.length === 0 ? (
                <p style={{ color: '#9ca3af', padding: '12px 0', fontSize: 14 }}>No upcoming appointments.</p>
              ) : (
                upcoming.slice(0, 3).map(a => (
                  <div key={a.id} className="dd-appt-item">
                    <div className="dd-appt-avatar">{getInitials(a.name)}</div>
                    <div className="dd-appt-info">
                      <p className="dd-appt-name">{a.name}</p>
                      <p className="dd-appt-plan">{a.notes ?? 'General Consultation'}</p>
                    </div>
                    <div className="dd-appt-time">
                      <p className="dd-appt-day">{dateLabel(a.appointment_date)}</p>
                      <p className="dd-appt-hour">{fmtSlot(a.slot)}</p>
                    </div>
                    <button className="dd-video-btn" onClick={() => startCall(a.id, a.name)}>
                      &#128249; Video Call
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle column */}
        <div className="dd-col">
          <div className="dd-card">
            <div className="dd-card-header">
              <h2 className="dd-card-title">Consultation Requests</h2>
              <button className="dd-card-link" onClick={() => navigate('/dietitian-consultation-requests')}>View All</button>
            </div>
            <div className="dd-req-list">
              {loading ? (
                <p style={{ color: '#9ca3af', padding: '12px 0', fontSize: 14 }}>Loading&hellip;</p>
              ) : pending.length === 0 ? (
                <p style={{ color: '#9ca3af', padding: '12px 0', fontSize: 14 }}>No pending requests.</p>
              ) : (
                pending.slice(0, 2).map(r => (
                  <div key={r.id} className="dd-req-item">
                    <div className="dd-req-top">
                      <div className="dd-req-avatar">{getInitials(r.name)}</div>
                      <div className="dd-req-info">
                        <div className="dd-req-name-row">
                          <p className="dd-req-name">{r.name}</p>
                          <span className="dd-req-new">NEW</span>
                          <span className="dd-req-time">{relativeTime(r.created_at)}</span>
                        </div>
                        <p className="dd-req-goal">General Consultation</p>
                        <p className="dd-req-desc">{r.notes ?? 'No additional notes provided.'}</p>
                      </div>
                    </div>
                    <div className="dd-req-meta">
                      <span>&#128197; {new Date(r.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span>&#128336; {fmtSlot(r.slot)}</span>
                      <div className="dd-req-actions">
                        <button
                          className="dd-req-view"
                          onClick={() => navigate('/dietitian-consultation-requests')}
                        >View Details</button>
                        <button
                          className="dd-req-accept"
                          disabled={actionId === r.id}
                          onClick={() => handleAccept(r.id)}
                        >{actionId === r.id ? '…' : 'Accept'}</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="dd-col">

          {/* My Availability */}
          <div className="dd-card">
            <div className="dd-card-header">
              <h2 className="dd-card-title">My Availability</h2>
              <button
                className="dd-card-link"
                onClick={() => navigate('/dietitian-profile', { state: { tab: 'Preferences' } })}
              >Edit</button>
            </div>
            <div className="dd-avail-online">
              <div className="dd-avail-online-row">
                <div>
                  <p className="dd-avail-online-label">{online ? 'You are Online' : 'You are Offline'}</p>
                  <p className="dd-avail-online-sub">Clients can see you and book consultations</p>
                </div>
                <button
                  className={`dd-toggle${online ? ' dd-toggle--on' : ''}`}
                  onClick={toggleOnline}
                >
                  <span className="dd-toggle-knob" />
                </button>
              </div>
            </div>
            <p className="dd-avail-day-label">Today's Availability ({todayDay})</p>
            <div className="dd-slot-list">
              {loading ? (
                <p style={{ color: '#9ca3af', padding: '8px 0', fontSize: 14 }}>Loading&hellip;</p>
              ) : slotRanges.length === 0 ? (
                <div className="dd-slot-row dd-slot-row--unavailable">
                  <span className="dd-slot-time">Not set for today</span>
                  <span className="dd-slot-status">Unavailable</span>
                </div>
              ) : (
                slotRanges.map(range => (
                  <div key={range} className="dd-slot-row dd-slot-row--available">
                    <span className="dd-slot-time">{range}</span>
                    <span className="dd-slot-status">Available</span>
                  </div>
                ))
              )}
            </div>
            <button
              className="dd-manage-avail-btn"
              onClick={() => navigate('/dietitian-profile', { state: { tab: 'Preferences' } })}
            >&#128197; Manage Availability</button>
          </div>

          {/* Profile Strength */}
          <div className="dd-card">
            <div className="dd-card-header">
              <h2 className="dd-card-title">Profile Strength</h2>
              <span className="dd-strength-pct">
                {loading || !strengthItems ? '…' : `${strengthPct}% Complete`}
              </span>
            </div>
            <div className="dd-strength-bar-wrap">
              <div className="dd-strength-bar" style={{ width: loading ? '0%' : `${strengthPct}%` }} />
            </div>
            <div className="dd-strength-list">
              {(strengthItems ?? STRENGTH_PLACEHOLDER).map(item => (
                <div key={item.label} className="dd-strength-item">
                  <span className={`dd-strength-check${item.done ? ' dd-strength-check--done' : ''}`}>
                    {item.done ? '✓' : '○'}
                  </span>
                  <span className="dd-strength-label">{item.label}</span>
                  {!item.done && (
                    <button
                      className="dd-add-now-btn"
                      onClick={() => navigate('/dietitian-profile')}
                    >Add Now</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      <div className="dd-banner">
        <span className="dd-banner-icon">&#128737;&#65039;</span>
        <div>
          <p className="dd-banner-title">Your Practice. Our Technology. Better Health for All.</p>
          <p className="dd-banner-sub">We take care of the platform, so you can focus on what you do best &ndash; transforming lives.</p>
        </div>
      </div>
    </>
  )
}
