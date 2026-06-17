import { useState, useEffect, useRef } from 'react'
import followUpsApi, { FollowUpItem, FollowUpSummary } from '../api/followups'

type FollowUpStatus = 'due' | 'upcoming' | 'completed' | 'missed'

interface FollowUp {
  id: number
  parentAppointmentId: number
  clientName: string
  initials: string
  avatarUrl: string | null
  goal: string
  type: string
  dueDate: string
  dueDay: string
  status: FollowUpStatus
  note: string
  reminder: string
}

type Tab = 'all' | 'due' | 'upcoming' | 'completed' | 'missed'

const TAB_PARAM: Record<Tab, string> = {
  all:       'all',
  due:       'due_today',
  upcoming:  'upcoming',
  completed: 'completed',
  missed:    'missed',
}

const STATUS_META: Record<FollowUpStatus, { label: string; color: string }> = {
  due:       { label: 'Due Today', color: 'red'    },
  upcoming:  { label: 'Upcoming',  color: 'blue'   },
  completed: { label: 'Completed', color: 'green'  },
  missed:    { label: 'Missed',    color: 'orange' },
}

const TYPE_ICON: Record<string, string> = {
  'Weight Check':     'fa-solid fa-weight-scale',
  'Diet Review':      'fa-solid fa-bowl-food',
  'Blood Report':     'fa-solid fa-droplet',
  'Progress Review':  'fa-solid fa-chart-line',
  'Medication Check': 'fa-solid fa-pills',
  'General Check-in': 'fa-solid fa-comments',
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getDueDay(dateStr: string): string {
  const today    = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const todayStr    = today.toLocaleDateString('en-CA')
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA')
  if (dateStr === todayStr)    return 'Today'
  if (dateStr === tomorrowStr) return 'Tomorrow'
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function mapItem(fu: FollowUpItem): FollowUp {
  return {
    id:                  fu.id,
    parentAppointmentId: fu.parent_appointment_id,
    clientName:          fu.client_name,
    initials:            getInitials(fu.client_name),
    avatarUrl:           fu.client_avatar,
    goal:                fu.goal,
    type:                fu.follow_up_type,
    dueDate:             fu.appointment_date,
    dueDay:              getDueDay(fu.appointment_date),
    status:              (fu.display_status === 'due_today' ? 'due' : fu.display_status) as FollowUpStatus,
    note:                fu.notes,
    reminder:            formatTime(fu.slot),
  }
}

export default function DietitianFollowUps() {
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [summary, setSummary]     = useState<FollowUpSummary>({ due_today: 0, upcoming: 0, completed: 0, missed: 0 })
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<Tab>('all')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<FollowUp | null>(null)
  const searchTimer               = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    const delay = search ? 400 : 0
    searchTimer.current = setTimeout(() => {
      setLoading(true)
      followUpsApi.getList({ tab: TAB_PARAM[tab], search: search || undefined, page: 1, limit: 50 })
        .then(res => {
          setSummary(res.data.summary)
          setFollowups(res.data.follow_ups.map(mapItem))
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, delay)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [tab, search])

  const counts = {
    all:       summary.due_today + summary.upcoming + summary.completed + summary.missed,
    due:       summary.due_today,
    upcoming:  summary.upcoming,
    completed: summary.completed,
    missed:    summary.missed,
  }

  function markDone(id: number) {
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'completed' as FollowUpStatus } : f))
    setSelected(s => s?.id === id ? { ...s, status: 'completed' as FollowUpStatus } : s)
  }

  function markMissed(id: number) {
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'missed' as FollowUpStatus } : f))
    setSelected(s => s?.id === id ? { ...s, status: 'missed' as FollowUpStatus } : s)
  }

  return (
    <div className="fu-root">

      {/* ── Header ── */}
      <div className="fu-header">
        <div>
          <h1 className="fu-title">Follow Ups</h1>
          <p className="fu-subtitle">Track and manage client follow-ups to ensure consistent progress</p>
        </div>
        <div className="fu-header-right">
          <div className="fu-header-stats">
            <div className="fu-hstat fu-hstat--red">
              <span className="fu-hstat-val">{summary.due_today}</span>
              <span className="fu-hstat-label">Due Today</span>
            </div>
            <div className="fu-hstat fu-hstat--blue">
              <span className="fu-hstat-val">{summary.upcoming}</span>
              <span className="fu-hstat-label">Upcoming</span>
            </div>
            <div className="fu-hstat fu-hstat--orange">
              <span className="fu-hstat-val">{summary.missed}</span>
              <span className="fu-hstat-label">Missed</span>
            </div>
            <div className="fu-hstat fu-hstat--green">
              <span className="fu-hstat-val">{summary.completed}</span>
              <span className="fu-hstat-label">Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="fu-toolbar">
        <div className="fu-tabs">
          {(['all', 'due', 'upcoming', 'completed', 'missed'] as Tab[]).map(t => (
            <button
              key={t}
              className={`fu-tab${tab === t ? ' fu-tab--active' : ''}`}
              onClick={() => { setTab(t); setSelected(null) }}
            >
              {t === 'due' ? 'Due Today' : t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="fu-tab-count">{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="fu-search-wrap">
          <i className="fa-solid fa-magnifying-glass fu-search-icon" />
          <input
            className="fu-search"
            placeholder="Search client or type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className={`fu-content${selected ? ' fu-content--split' : ''}`}>

        {/* List */}
        <div className="fu-list">
          {loading ? (
            <div className="fu-empty">
              <span className="fu-empty-icon"><i className="fa-solid fa-circle-notch fa-spin" /></span>
              <p className="fu-empty-text">Loading follow-ups…</p>
            </div>
          ) : followups.length === 0 ? (
            <div className="fu-empty">
              <span className="fu-empty-icon">🔔</span>
              <p className="fu-empty-text">No follow-ups found</p>
            </div>
          ) : (
            followups.map(f => {
              const sm = STATUS_META[f.status]
              return (
                <div
                  key={f.id}
                  className={`fu-card${selected?.id === f.id ? ' fu-card--selected' : ''}${f.status === 'due' ? ' fu-card--due' : ''}`}
                  onClick={() => setSelected(f.id === selected?.id ? null : f)}
                >
                  <div className={`fu-card-accent fu-accent--${sm.color}`} />

                  <div className="fu-card-body">
                    <div className="fu-card-top">
                      <div className="fu-avatar">
                        {f.avatarUrl
                          ? <img src={f.avatarUrl} alt={f.clientName} />
                          : f.initials}
                      </div>
                      <div className="fu-card-info">
                        <div className="fu-name-row">
                          <span className="fu-name">{f.clientName}</span>
                          <span className={`fu-status fu-status--${sm.color}`}>{sm.label}</span>
                        </div>
                        <div className="fu-meta-row">
                          <span className="fu-meta-pill">
                            <i className={TYPE_ICON[f.type] ?? 'fa-solid fa-bell'} /> {f.type}
                          </span>
                          <span className="fu-meta-pill">
                            <i className="fa-solid fa-bullseye" /> {f.goal}
                          </span>
                          <span className="fu-meta-pill">
                            <i className="fa-regular fa-calendar" /> {f.dueDay === 'Today' || f.dueDay === 'Tomorrow' ? f.dueDay : f.dueDate}
                          </span>
                          <span className="fu-meta-pill">
                            <i className="fa-regular fa-clock" /> {f.reminder}
                          </span>
                        </div>
                        <p className="fu-note">{f.note}</p>
                      </div>
                      <div className="fu-card-actions" onClick={e => e.stopPropagation()}>
                        {(f.status === 'due' || f.status === 'upcoming' || f.status === 'missed') && (
                          <button className="fu-btn-done" onClick={() => markDone(f.id)}>
                            <i className="fa-solid fa-check" /> Done
                          </button>
                        )}
                        <button className="fu-btn-msg">
                          <i className="fa-solid fa-comment" />
                        </button>
                        <button className="fu-btn-msg" onClick={() => setSelected(f.id === selected?.id ? null : f)}>
                          <i className="fa-solid fa-chevron-right" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="fu-detail">
            <div className="fu-detail-header">
              <h2 className="fu-detail-title">Follow Up Details</h2>
              <button className="fu-detail-close" onClick={() => setSelected(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Client hero */}
            <div className="fu-detail-hero">
              <div className="fu-avatar fu-avatar--lg">
                {selected.avatarUrl
                  ? <img src={selected.avatarUrl} alt={selected.clientName} />
                  : selected.initials}
              </div>
              <div>
                <p className="fu-detail-name">{selected.clientName}</p>
                <p className="fu-detail-goal">{selected.goal}</p>
                <div className="fu-detail-badges">
                  <span className={`fu-status fu-status--${STATUS_META[selected.status].color}`}>
                    {STATUS_META[selected.status].label}
                  </span>
                </div>
              </div>
            </div>

            {/* Type + schedule */}
            <div className="fu-detail-section">
              <p className="fu-detail-section-title">Follow Up Info</p>
              <div className="fu-detail-type-chip">
                <i className={TYPE_ICON[selected.type] ?? 'fa-solid fa-bell'} /> {selected.type}
              </div>
              <div className="fu-detail-grid">
                <div className="fu-detail-field">
                  <span className="fu-detail-label">Due Date</span>
                  <span className="fu-detail-val">{selected.dueDay}</span>
                </div>
                <div className="fu-detail-field">
                  <span className="fu-detail-label">Reminder Time</span>
                  <span className="fu-detail-val">{selected.reminder}</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="fu-detail-section">
              <p className="fu-detail-section-title">Notes</p>
              <p className="fu-detail-notes">{selected.note}</p>
            </div>

            {/* Actions */}
            <div className="fu-detail-btns">
              {(selected.status === 'due' || selected.status === 'upcoming' || selected.status === 'missed') && (
                <button className="fu-btn-primary" onClick={() => markDone(selected.id)}>
                  <i className="fa-solid fa-check" /> Mark as Done
                </button>
              )}
              <button className="fu-btn-outline">
                <i className="fa-solid fa-comment" /> Send Message
              </button>
              <button className="fu-btn-outline">
                <i className="fa-solid fa-rotate-right" /> Reschedule
              </button>
              {selected.status !== 'missed' && selected.status !== 'completed' && (
                <button className="fu-btn-danger" onClick={() => markMissed(selected.id)}>
                  <i className="fa-solid fa-xmark" /> Mark as Missed
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
