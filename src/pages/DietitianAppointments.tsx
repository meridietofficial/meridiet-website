import { useState, useEffect } from 'react'
import appointmentApi, {
  DietitianSession,
  DietitianSessionGroup,
  DietitianSessionsSummary,
} from '../api/appointment'
import { useVideoCall } from '../context/VideoCallContext'

type Tab = 'all' | 'upcoming' | 'completed' | 'cancelled'

const STATUS_META: Record<string, { label: string; color: string }> = {
  confirmed:  { label: 'Upcoming',  color: 'blue'   },
  completed:  { label: 'Completed', color: 'green'  },
  cancelled:  { label: 'Cancelled', color: 'red'    },
  pending:    { label: 'Pending',   color: 'orange' },
}

const SESSION_TYPE_META: Record<string, { label: string; icon: string }> = {
  video_call: { label: 'Video Call', icon: 'fa-solid fa-video'        },
  in_person:  { label: 'In-Person',  icon: 'fa-solid fa-location-dot' },
  chat:       { label: 'Chat',       icon: 'fa-solid fa-comment'      },
}

type SelectedSession = DietitianSession & { dateLabel: string }

export default function DietitianAppointments() {
  const [tab, setTab]       = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selected, setSelected] = useState<SelectedSession | null>(null)

  const { startCall } = useVideoCall()

  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [summary, setSummary] = useState<DietitianSessionsSummary>({
    all: 0, upcoming: 0, completed: 0, cancelled: 0, pending: 0,
  })
  const [groups, setGroups] = useState<DietitianSessionGroup[]>([])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let aborted = false
    setLoading(true)
    setError(null)
    appointmentApi.getDietitianSessions({
      tab,
      search: debouncedSearch || undefined,
    }).then(res => {
      if (aborted) return
      setSummary(res.data.summary)
      setGroups(res.data.grouped)
    }).catch(err => {
      if (aborted) return
      setError(err?.message ?? 'Failed to load appointments')
    }).finally(() => {
      if (!aborted) setLoading(false)
    })
    return () => { aborted = true }
  }, [tab, debouncedSearch])

  const counts = {
    all:       summary.all,
    upcoming:  summary.upcoming,
    completed: summary.completed,
    cancelled: summary.cancelled,
  }

  function selectSession(s: DietitianSession, label: string) {
    setSelected(prev => (prev?.id === s.id ? null : { ...s, dateLabel: label }))
  }

  return (
    <div className="ap-root">

      {/* ── Header ── */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Appointments</h1>
          <p className="ap-subtitle">Manage your scheduled sessions and track attendance</p>
        </div>
        <div className="ap-header-stats">
          <div className="ap-hstat ap-hstat--blue">
            <span className="ap-hstat-val">{counts.upcoming}</span>
            <span className="ap-hstat-label">Upcoming</span>
          </div>
          <div className="ap-hstat ap-hstat--green">
            <span className="ap-hstat-val">{counts.completed}</span>
            <span className="ap-hstat-label">Completed</span>
          </div>
          <div className="ap-hstat ap-hstat--red">
            <span className="ap-hstat-val">{counts.cancelled}</span>
            <span className="ap-hstat-label">Cancelled</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="ap-toolbar">
        <div className="ap-tabs">
          {(['all', 'upcoming', 'completed', 'cancelled'] as Tab[]).map(t => (
            <button
              key={t}
              className={`ap-tab${tab === t ? ' ap-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="ap-tab-count">{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="ap-search-wrap">
          <i className="fa-solid fa-magnifying-glass ap-search-icon" />
          <input
            className="ap-search"
            placeholder="Search client…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className={`ap-content${selected ? ' ap-content--split' : ''}`}>

        {/* Timeline */}
        <div className="ap-timeline">
          {loading && (
            <div className="ap-empty">
              <span className="ap-empty-icon">⏳</span>
              <p className="ap-empty-text">Loading appointments…</p>
            </div>
          )}

          {!loading && error && (
            <div className="ap-empty">
              <span className="ap-empty-icon">⚠️</span>
              <p className="ap-empty-text">{error}</p>
            </div>
          )}

          {!loading && !error && groups.length === 0 && (
            <div className="ap-empty">
              <span className="ap-empty-icon">📅</span>
              <p className="ap-empty-text">No appointments found</p>
            </div>
          )}

          {!loading && !error && groups.map(group => (
            <div key={group.date} className="ap-group">
              <div className="ap-group-label">
                <span className="ap-group-day">{group.label}</span>
                {(group.label === 'Today' || group.label === 'Tomorrow') && (
                  <span className={`ap-group-badge ${group.label === 'Today' ? 'ap-group-badge--today' : 'ap-group-badge--tomorrow'}`}>
                    {group.label}
                  </span>
                )}
                <span className="ap-group-count">{group.count} session{group.count !== 1 ? 's' : ''}</span>
              </div>

              <div className="ap-group-cards">
                {group.sessions.map(s => {
                  const meta     = STATUS_META[s.status]     ?? { label: s.status,      color: 'blue'            }
                  const typeMeta = SESSION_TYPE_META[s.session_type] ?? { label: s.session_type, icon: 'fa-solid fa-calendar' }
                  const isSelected = selected?.id === s.id

                  return (
                    <div
                      key={s.id}
                      className={`ap-card${isSelected ? ' ap-card--selected' : ''}`}
                      onClick={() => selectSession(s, group.label)}
                    >
                      <div className={`ap-card-timebar ap-timebar--${meta.color}`}>
                        <span className="ap-card-time">{s.time}</span>
                        <span className="ap-card-dur">{s.duration} min</span>
                      </div>

                      <div className="ap-card-body">
                        <div className="ap-card-top-row">
                          <div className="ap-avatar">
                            {s.client.avatar_url
                              ? <img src={s.client.avatar_url} alt={s.client.name} />
                              : s.client.initials}
                          </div>
                          <div className="ap-card-info">
                            <div className="ap-name-row">
                              <span className="ap-name">{s.client.name}</span>
                              <span className={`ap-status ap-status--${meta.color}`}>{meta.label}</span>
                            </div>
                            <div className="ap-meta-row">
                              <span className="ap-meta-pill">
                                <i className={typeMeta.icon} /> {typeMeta.label}
                              </span>
                              <span className="ap-meta-pill">
                                <i className="fa-solid fa-hashtag" /> Session {s.session_number}
                              </span>
                            </div>
                          </div>
                          <div className="ap-card-actions">
                            {s.status === 'confirmed' && (
                              <>
                                <button
                                  className="ap-btn-primary"
                                  onClick={e => { e.stopPropagation(); startCall(s.id, s.client.name) }}
                                >
                                  <i className="fa-solid fa-video" /> Join
                                </button>
                                <button
                                  className="ap-btn-outline"
                                  onClick={e => { e.stopPropagation(); selectSession(s, group.label) }}
                                >
                                  Details
                                </button>
                              </>
                            )}
                            {s.status !== 'confirmed' && (
                              <button
                                className="ap-btn-outline"
                                onClick={e => { e.stopPropagation(); selectSession(s, group.label) }}
                              >
                                Details
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (() => {
          const meta     = STATUS_META[selected.status]          ?? { label: selected.status,      color: 'blue'            }
          const typeMeta = SESSION_TYPE_META[selected.session_type] ?? { label: selected.session_type, icon: 'fa-solid fa-calendar' }
          return (
            <div className="ap-detail">
              <div className="ap-detail-header">
                <h2 className="ap-detail-title">Appointment Details</h2>
                <button className="ap-detail-close" onClick={() => setSelected(null)}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <div className="ap-detail-hero">
                <div className="ap-avatar ap-avatar--lg">
                  {selected.client.avatar_url
                    ? <img src={selected.client.avatar_url} alt={selected.client.name} />
                    : selected.client.initials}
                </div>
                <div>
                  <p className="ap-detail-name">{selected.client.name}</p>
                  <span className={`ap-status ap-status--${meta.color}`}>{meta.label}</span>
                </div>
              </div>

              <div className="ap-detail-section">
                <p className="ap-detail-section-title">Schedule</p>
                <div className="ap-detail-grid">
                  <div className="ap-detail-field">
                    <span className="ap-detail-label">Date</span>
                    <span className="ap-detail-val">{selected.dateLabel}</span>
                  </div>
                  <div className="ap-detail-field">
                    <span className="ap-detail-label">Time</span>
                    <span className="ap-detail-val">{selected.time}</span>
                  </div>
                  <div className="ap-detail-field">
                    <span className="ap-detail-label">Duration</span>
                    <span className="ap-detail-val">{selected.duration} min</span>
                  </div>
                  <div className="ap-detail-field">
                    <span className="ap-detail-label">Type</span>
                    <span className="ap-detail-val">
                      <i className={typeMeta.icon} style={{ marginRight: 4, color: 'var(--green)' }} />
                      {typeMeta.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ap-detail-section">
                <p className="ap-detail-section-title">Session Info</p>
                <div className="ap-detail-grid">
                  <div className="ap-detail-field">
                    <span className="ap-detail-label">Session #</span>
                    <span className="ap-detail-val">{selected.session_number}</span>
                  </div>
                  <div className="ap-detail-field">
                    <span className="ap-detail-label">Payment</span>
                    <span className="ap-detail-val" style={{ textTransform: 'capitalize' }}>
                      {selected.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {selected.notes && (
                <div className="ap-detail-section">
                  <p className="ap-detail-section-title">Session Notes</p>
                  <p className="ap-detail-notes">{selected.notes}</p>
                </div>
              )}

              <div className="ap-detail-btns">
                {selected.status === 'confirmed' && (
                  <>
                    <button
                      className="ap-btn-primary ap-btn-primary--full"
                      onClick={() => startCall(selected.id, selected.client.name)}
                    >
                      <i className="fa-solid fa-video" /> Join Video Call
                    </button>
                    <button className="ap-btn-outline ap-btn-outline--full">
                      <i className="fa-solid fa-paper-plane" /> Send Message
                    </button>
                    <button className="ap-btn-cancel ap-btn-cancel--full">
                      <i className="fa-solid fa-xmark" /> Cancel Appointment
                    </button>
                  </>
                )}
                {selected.status === 'completed' && (
                  <>
                    <button className="ap-btn-primary ap-btn-primary--full">
                      <i className="fa-solid fa-rotate-right" /> Rebook Session
                    </button>
                    <button className="ap-btn-outline ap-btn-outline--full">
                      <i className="fa-solid fa-bowl-food" /> View Diet Plan
                    </button>
                  </>
                )}
                {selected.status === 'cancelled' && (
                  <button className="ap-btn-primary ap-btn-primary--full">
                    <i className="fa-solid fa-rotate-right" /> Rebook Session
                  </button>
                )}
              </div>
            </div>
          )
        })()}
      </div>

    </div>
  )
}
