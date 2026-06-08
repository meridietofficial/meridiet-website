import { useState } from 'react'

type FollowUpStatus   = 'due' | 'upcoming' | 'completed' | 'missed'
type FollowUpPriority = 'high' | 'medium' | 'low'
type FollowUpType     = 'Weight Check' | 'Diet Review' | 'Blood Report' | 'Progress Review' | 'Medication Check' | 'General Check-in'

interface FollowUp {
  id: number
  clientName: string
  initials: string
  goal: string
  type: FollowUpType
  dueDate: string
  dueDay: string
  status: FollowUpStatus
  priority: FollowUpPriority
  note: string
  lastContact: string
  phone: string
  reminder: string
}

const TODAY     = 'Jun 7, 2026'
const TOMORROW  = 'Jun 8, 2026'

const ALL_FOLLOWUPS: FollowUp[] = [
  {
    id: 1,
    clientName: 'Vikram Singh',
    initials: 'VS',
    goal: 'Weight Loss',
    type: 'Blood Report',
    dueDate: TODAY,
    dueDay: 'Today',
    status: 'due',
    priority: 'high',
    note: "Vikram's morning blood sugar was 108 — need to review if within target range and adjust the plan accordingly.",
    lastContact: 'Jun 5, 2026',
    phone: '+91 43210 98765',
    reminder: '9:00 AM',
  },
  {
    id: 2,
    clientName: 'Sneha Iyer',
    initials: 'SI',
    goal: 'PCOS Management',
    type: 'Progress Review',
    dueDate: TODAY,
    dueDay: 'Today',
    status: 'due',
    priority: 'medium',
    note: 'Check on cycle regularity improvement and bloating reduction. Ask about energy levels and spearmint tea compliance.',
    lastContact: 'Jun 6, 2026',
    phone: '+91 76543 21098',
    reminder: '2:00 PM',
  },
  {
    id: 3,
    clientName: 'Anjali Singh',
    initials: 'AS',
    goal: 'Weight Loss',
    type: 'Diet Review',
    dueDate: TOMORROW,
    dueDay: 'Tomorrow',
    status: 'upcoming',
    priority: 'medium',
    note: 'Anjali to share thyroid report PDF. Update plan based on TSH reading of 5.2. Review goitrogen restrictions.',
    lastContact: 'Jun 5, 2026',
    phone: '+91 91234 56789',
    reminder: '10:00 AM',
  },
  {
    id: 4,
    clientName: 'Rohan Mehta',
    initials: 'RM',
    goal: 'Muscle Gain',
    type: 'Weight Check',
    dueDate: 'Jun 10, 2026',
    dueDay: 'Jun 10',
    status: 'upcoming',
    priority: 'low',
    note: 'Weekly weight log review. Target 76 kg by Week 5. Confirm post-workout protein timing compliance.',
    lastContact: 'Jun 6, 2026',
    phone: '+91 65432 10987',
    reminder: '11:00 AM',
  },
  {
    id: 5,
    clientName: 'Vikram Singh',
    initials: 'VS',
    goal: 'Weight Loss',
    type: 'Weight Check',
    dueDate: 'Jun 12, 2026',
    dueDay: 'Jun 12',
    status: 'upcoming',
    priority: 'high',
    note: 'Bi-weekly weight check. Expected 1–1.5 kg loss from start. Also check blood pressure readings.',
    lastContact: 'Jun 5, 2026',
    phone: '+91 43210 98765',
    reminder: '10:00 AM',
  },
  {
    id: 6,
    clientName: 'Rohan Mehta',
    initials: 'RM',
    goal: 'Muscle Gain',
    type: 'Diet Review',
    dueDate: 'Jun 5, 2026',
    dueDay: 'Jun 5',
    status: 'completed',
    priority: 'medium',
    note: 'Reviewed Week 4 plan. Increased protein to 200g/day. Cheat meal approved for Sunday. Client very motivated.',
    lastContact: 'Jun 5, 2026',
    phone: '+91 65432 10987',
    reminder: '11:30 AM',
  },
  {
    id: 7,
    clientName: 'Sneha Iyer',
    initials: 'SI',
    goal: 'PCOS Management',
    type: 'General Check-in',
    dueDate: 'Jun 4, 2026',
    dueDay: 'Jun 4',
    status: 'completed',
    priority: 'low',
    note: 'Confirmed dairy reintroduction plan. Low-fat curd and buttermilk approved. Full cream still restricted.',
    lastContact: 'Jun 4, 2026',
    phone: '+91 76543 21098',
    reminder: '9:00 AM',
  },
  {
    id: 8,
    clientName: 'Priya Sharma',
    initials: 'PS',
    goal: 'Diabetes Management',
    type: 'Medication Check',
    dueDate: 'Jun 3, 2026',
    dueDay: 'Jun 3',
    status: 'missed',
    priority: 'high',
    note: 'Follow up on metformin dosage and HbA1c re-test. Client did not respond to last two messages. Try calling.',
    lastContact: 'Apr 20, 2026',
    phone: '+91 87654 32100',
    reminder: '9:00 AM',
  },
  {
    id: 9,
    clientName: 'Anjali Singh',
    initials: 'AS',
    goal: 'Weight Loss',
    type: 'Weight Check',
    dueDate: 'Jun 2, 2026',
    dueDay: 'Jun 2',
    status: 'missed',
    priority: 'medium',
    note: 'Weekly weigh-in was skipped. Client mentioned travel. Rescheduled to Jun 8 review.',
    lastContact: 'Jun 5, 2026',
    phone: '+91 91234 56789',
    reminder: '10:00 AM',
  },
]

type Tab = 'all' | 'due' | 'upcoming' | 'completed' | 'missed'

const STATUS_META: Record<FollowUpStatus, { label: string; color: string }> = {
  due:       { label: 'Due Today', color: 'red'    },
  upcoming:  { label: 'Upcoming',  color: 'blue'   },
  completed: { label: 'Completed', color: 'green'  },
  missed:    { label: 'Missed',    color: 'orange' },
}

const PRIORITY_META: Record<FollowUpPriority, { label: string; color: string }> = {
  high:   { label: 'High',   color: 'red'    },
  medium: { label: 'Medium', color: 'orange' },
  low:    { label: 'Low',    color: 'gray'   },
}

const TYPE_ICON: Record<FollowUpType, string> = {
  'Weight Check':     'fa-solid fa-weight-scale',
  'Diet Review':      'fa-solid fa-bowl-food',
  'Blood Report':     'fa-solid fa-droplet',
  'Progress Review':  'fa-solid fa-chart-line',
  'Medication Check': 'fa-solid fa-pills',
  'General Check-in': 'fa-solid fa-comments',
}

export default function DietitianFollowUps() {
  const [followups, setFollowups] = useState(ALL_FOLLOWUPS)
  const [tab, setTab]             = useState<Tab>('all')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<FollowUp | null>(null)

  const counts = {
    all:       followups.length,
    due:       followups.filter(f => f.status === 'due').length,
    upcoming:  followups.filter(f => f.status === 'upcoming').length,
    completed: followups.filter(f => f.status === 'completed').length,
    missed:    followups.filter(f => f.status === 'missed').length,
  }

  const filtered = followups.filter(f => {
    const matchesTab = tab === 'all' || f.status === tab
    const q = search.toLowerCase()
    const matchesSearch = !q || f.clientName.toLowerCase().includes(q) || f.type.toLowerCase().includes(q) || f.goal.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  const markDone = (id: number) => {
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'completed' } : f))
    setSelected(s => s?.id === id ? { ...s, status: 'completed' } : s)
  }

  const markMissed = (id: number) => {
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'missed' } : f))
    setSelected(s => s?.id === id ? { ...s, status: 'missed' } : s)
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
              <span className="fu-hstat-val">{counts.due}</span>
              <span className="fu-hstat-label">Due Today</span>
            </div>
            <div className="fu-hstat fu-hstat--blue">
              <span className="fu-hstat-val">{counts.upcoming}</span>
              <span className="fu-hstat-label">Upcoming</span>
            </div>
            <div className="fu-hstat fu-hstat--orange">
              <span className="fu-hstat-val">{counts.missed}</span>
              <span className="fu-hstat-label">Missed</span>
            </div>
            <div className="fu-hstat fu-hstat--green">
              <span className="fu-hstat-val">{counts.completed}</span>
              <span className="fu-hstat-label">Done</span>
            </div>
          </div>
          <button className="fu-add-btn">
            <i className="fa-solid fa-plus" /> Add Follow Up
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="fu-toolbar">
        <div className="fu-tabs">
          {(['all', 'due', 'upcoming', 'completed', 'missed'] as Tab[]).map(t => (
            <button
              key={t}
              className={`fu-tab${tab === t ? ' fu-tab--active' : ''}`}
              onClick={() => setTab(t)}
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
          {filtered.length === 0 && (
            <div className="fu-empty">
              <span className="fu-empty-icon">🔔</span>
              <p className="fu-empty-text">No follow-ups found</p>
            </div>
          )}

          {filtered.map(f => {
            const sm = STATUS_META[f.status]
            const pm = PRIORITY_META[f.priority]
            return (
              <div
                key={f.id}
                className={`fu-card${selected?.id === f.id ? ' fu-card--selected' : ''}${f.status === 'due' ? ' fu-card--due' : ''}`}
                onClick={() => setSelected(f.id === selected?.id ? null : f)}
              >
                {/* Left accent */}
                <div className={`fu-card-accent fu-accent--${sm.color}`} />

                <div className="fu-card-body">
                  {/* Top row */}
                  <div className="fu-card-top">
                    <div className="fu-avatar">{f.initials}</div>
                    <div className="fu-card-info">
                      <div className="fu-name-row">
                        <span className="fu-name">{f.clientName}</span>
                        <span className={`fu-priority fu-priority--${pm.color}`}>
                          <i className="fa-solid fa-circle-dot" /> {pm.label}
                        </span>
                        <span className={`fu-status fu-status--${sm.color}`}>{sm.label}</span>
                      </div>
                      <div className="fu-meta-row">
                        <span className="fu-meta-pill">
                          <i className={TYPE_ICON[f.type]} /> {f.type}
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
          })}
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
              <div className="fu-avatar fu-avatar--lg">{selected.initials}</div>
              <div>
                <p className="fu-detail-name">{selected.clientName}</p>
                <p className="fu-detail-goal">{selected.goal}</p>
                <div className="fu-detail-badges">
                  <span className={`fu-status fu-status--${STATUS_META[selected.status].color}`}>
                    {STATUS_META[selected.status].label}
                  </span>
                  <span className={`fu-priority fu-priority--${PRIORITY_META[selected.priority].color}`}>
                    <i className="fa-solid fa-circle-dot" /> {PRIORITY_META[selected.priority].label} Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Type + schedule */}
            <div className="fu-detail-section">
              <p className="fu-detail-section-title">Follow Up Info</p>
              <div className="fu-detail-type-chip">
                <i className={TYPE_ICON[selected.type]} /> {selected.type}
              </div>
              <div className="fu-detail-grid">
                <div className="fu-detail-field">
                  <span className="fu-detail-label">Due Date</span>
                  <span className="fu-detail-val">{selected.dueDate}</span>
                </div>
                <div className="fu-detail-field">
                  <span className="fu-detail-label">Reminder Time</span>
                  <span className="fu-detail-val">{selected.reminder}</span>
                </div>
                <div className="fu-detail-field">
                  <span className="fu-detail-label">Last Contact</span>
                  <span className="fu-detail-val">{selected.lastContact}</span>
                </div>
                <div className="fu-detail-field">
                  <span className="fu-detail-label">Phone</span>
                  <span className="fu-detail-val">{selected.phone}</span>
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
