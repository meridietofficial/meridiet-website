import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import appointmentApi, {
  DietitianSession,
  DietitianSessionGroup,
  DietitianSessionsSummary,
  AppointmentSlot,
  DietPlanRef,
} from '../api/appointment'
import { useVideoCall } from '../context/VideoCallContext'

type Tab = 'upcoming' | 'missed' | 'completed' | 'cancelled'

const STATUS_META: Record<string, { label: string; color: string }> = {
  confirmed:  { label: 'Upcoming',  color: 'blue'   },
  completed:  { label: 'Completed', color: 'green'  },
  cancelled:  { label: 'Cancelled', color: 'red'    },
  pending:    { label: 'Pending',   color: 'orange' },
  missed:     { label: 'Missed',    color: 'red'    },
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'upcoming',  label: 'Upcoming',  icon: 'fa-solid fa-calendar-check'       },
  { key: 'missed',    label: 'Missed',    icon: 'fa-solid fa-triangle-exclamation'  },
  { key: 'completed', label: 'Completed', icon: 'fa-solid fa-circle-check'          },
  { key: 'cancelled', label: 'Cancelled', icon: 'fa-solid fa-circle-xmark'          },
]

const SESSION_TYPE_META: Record<string, { label: string; icon: string }> = {
  video_call: { label: 'Video Call', icon: 'fa-solid fa-video'        },
  in_person:  { label: 'In-Person',  icon: 'fa-solid fa-location-dot' },
  chat:       { label: 'Chat',       icon: 'fa-solid fa-comment'      },
}

const DIET_PLAN_META: Record<string, { label: string; icon: string; pill: string }> = {
  draft:      { label: 'Draft',       icon: 'fa-solid fa-pen-to-square',  pill: 'ap-meta-pill--dp-draft'      },
  generating: { label: 'Generating…', icon: 'fa-solid fa-circle-notch',   pill: 'ap-meta-pill--dp-generating' },
  completed:  { label: 'Ready',       icon: 'fa-solid fa-circle-check',   pill: 'ap-meta-pill--dp-completed'  },
  sent:       { label: 'Plan Sent',   icon: 'fa-solid fa-paper-plane',    pill: 'ap-meta-pill--dp-sent'       },
  failed:     { label: 'Plan Failed', icon: 'fa-solid fa-circle-xmark',   pill: 'ap-meta-pill--dp-failed'     },
  archived:   { label: 'Archived',    icon: 'fa-solid fa-box-archive',    pill: 'ap-meta-pill--dp-archived'   },
}

function formatSlot(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Returns true if the slot time has already passed today (local time)
function isPastSlot(date: string, slot: string): boolean {
  if (date !== new Date().toLocaleDateString('en-CA')) return false
  const now = new Date()
  const [h, m] = slot.split(':').map(Number)
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes()
}

function expandSlotRange(range: string): string[] {
  const [start, end] = range.split('-')
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const slots: string[] = []
  let cur = sh * 60 + sm
  const endMin = eh * 60 + em
  while (cur < endMin) {
    const h = Math.floor(cur / 60)
    const m = cur % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    cur += 30
  }
  return slots
}

type ApRescheduleState = {
  session: DietitianSession
  originalDate: string
  date: string
  slot: string
  reason: string
}

// Compute Today / Tomorrow label using the browser's local timezone,
// so it's correct regardless of where the dietitian is located.
function localDateLabel(dateStr: string): string {
  const localToday    = new Date().toLocaleDateString('en-CA')          // "YYYY-MM-DD" local
  const localTomorrow = new Date(Date.now() + 864e5).toLocaleDateString('en-CA')
  if (dateStr === localToday)    return 'Today'
  if (dateStr === localTomorrow) return 'Tomorrow'
  // Parse as local midnight to avoid UTC-shift on display
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

const VALID_TABS: Tab[] = ['upcoming', 'missed', 'completed', 'cancelled']

export default function DietitianAppointments() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [tab, setTab] = useState<Tab>(() => {
    const urlTab = searchParams.get('tab') as Tab | null
    if (urlTab && VALID_TABS.includes(urlTab)) return urlTab
    const s = (location.state as { returnTab?: Tab } | null)
    return s?.returnTab ?? 'upcoming'
  })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const { startCall } = useVideoCall()

  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [summary, setSummary] = useState<DietitianSessionsSummary>({
    all: 0, upcoming: 0, completed: 0, cancelled: 0, pending: 0, missed: 0,
  })
  const [groups, setGroups] = useState<DietitianSessionGroup[]>([])

  const [reschedule, setReschedule]           = useState<ApRescheduleState | null>(null)
  const [rescheduling, setRescheduling]       = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots]   = useState<AppointmentSlot[]>([])
  const [bookedSlots, setBookedSlots]         = useState<AppointmentSlot[]>([])
  const [slotsLoading, setSlotsLoading]       = useState(false)
  const [customTimeMode, setCustomTimeMode]   = useState(false)

  const [reviewSession, setReviewSession]     = useState<DietitianSession | null>(null)
  const [reviewRating, setReviewRating]       = useState(0)
  const [reviewHover, setReviewHover]         = useState(0)
  const [reviewText, setReviewText]           = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError]         = useState<string | null>(null)

  function openReview(s: DietitianSession) {
    setReviewSession(s)
    setReviewRating(0)
    setReviewHover(0)
    setReviewText('')
    setReviewError(null)
  }

  async function handleSubmitReview() {
    if (!reviewSession || reviewRating === 0) return
    setReviewSubmitting(true)
    setReviewError(null)
    try {
      await appointmentApi.submitReview(reviewSession.id, { rating: reviewRating, review: reviewText })
      setGroups(prev => prev.map(g => ({
        ...g,
        sessions: g.sessions.map(s =>
          s.id === reviewSession.id
            ? { ...s, dietitian_review_done: true, dietitian_rating: reviewRating, dietitian_review: reviewText }
            : s
        ),
      })))
      setReviewSession(null)
    } catch (e: any) {
      setReviewError(e.message ?? 'Failed to submit review. Please try again.')
    } finally {
      setReviewSubmitting(false)
    }
  }

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
      source: 'platform',
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
    upcoming:  summary.upcoming,
    missed:    summary.missed ?? 0,
    completed: summary.completed,
    cancelled: summary.cancelled,
  }

  // Fetch reschedule slots when modal opens
  useEffect(() => {
    if (!reschedule) return
    setSlotsLoading(true)
    setAvailableSlots([])
    setBookedSlots([])
    appointmentApi.getRescheduleSlots(reschedule.session.id)
      .then(data => {
        setAvailableSlots(data.available_slots)
        setBookedSlots(data.booked_slots)
      })
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
  }, [reschedule?.session.id])

  function openReschedule(s: DietitianSession, groupDate: string) {
    const today = new Date().toLocaleDateString('en-CA')
    setReschedule({ session: s, originalDate: groupDate, date: today, slot: '', reason: '' })
    setRescheduleError(null)
    setCustomTimeMode(false)
  }

  async function handleReschedule() {
    if (!reschedule) return
    setRescheduling(true)
    setRescheduleError(null)
    try {
      await appointmentApi.rescheduleAppointment(reschedule.session.id, {
        appointment_date: reschedule.date,
        slot: reschedule.slot,
        reason: reschedule.reason || undefined,
      })
      // Remove rescheduled session from the missed list
      setGroups(prev =>
        prev
          .map(g => ({
            ...g,
            sessions: g.sessions.filter(s => s.id !== reschedule.session.id),
            count: g.sessions.filter(s => s.id !== reschedule.session.id).length,
          }))
          .filter(g => g.sessions.length > 0)
      )
      setReschedule(null)
    } catch (e: any) {
      setRescheduleError(e.message ?? 'Failed to reschedule. Please try again.')
    } finally {
      setRescheduling(false)
    }
  }

  function getUpcomingDates() {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const date = d.toLocaleDateString('en-CA')
      return {
        date,
        dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        hasSlots: (availableSlots.find(s => s.date === date)?.slots?.length ?? 0) > 0,
      }
    })
  }

  function openSession(s: DietitianSession, label: string) {
    navigate(`/dietitian-appointments/${s.id}`, { state: { session: s, dateLabel: label, fromTab: tab } })
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
          <div className="ap-hstat ap-hstat--orange">
            <span className="ap-hstat-val">{counts.missed}</span>
            <span className="ap-hstat-label">Missed</span>
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
          {TABS.map(t => (
            <button
              key={t.key}
              className={`ap-tab ap-tab--${t.key}${tab === t.key ? ' ap-tab--active' : ''}`}
              onClick={() => {
                setTab(t.key)
                setSearchParams({ tab: t.key }, { replace: true })
              }}
            >
              <i className={t.icon} />
              {t.label}
              {counts[t.key] > 0 && (
                <span className={`ap-tab-count${t.key === 'missed' && counts.missed > 0 ? ' ap-tab-count--alert' : ''}`}>
                  {counts[t.key]}
                </span>
              )}
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
      <div className="ap-content">

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

          {!loading && !error && groups.map(group => {
            const dateLabel = localDateLabel(group.date)
            return (
            <div key={group.date} className="ap-group">
              <div className="ap-group-label">
                <span className="ap-group-day">{dateLabel}</span>
                {(dateLabel === 'Today' || dateLabel === 'Tomorrow') && (
                  <span className={`ap-group-badge ${dateLabel === 'Today' ? 'ap-group-badge--today' : 'ap-group-badge--tomorrow'}`}>
                    {dateLabel}
                  </span>
                )}
                <span className="ap-group-count">{group.count} session{group.count !== 1 ? 's' : ''}</span>
              </div>

              <div className="ap-group-cards">
                {group.sessions.map(s => {
                  const meta     = STATUS_META[s.status]     ?? { label: s.status,      color: 'blue'            }
                  const typeMeta = SESSION_TYPE_META[s.session_type] ?? { label: s.session_type, icon: 'fa-solid fa-calendar' }

                  return (
                    <div
                      key={s.id}
                      className="ap-card ap-card--clickable"
                      onClick={() => openSession(s, dateLabel)}
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
                              {s.appointment_source === 'dietitian' && (
                                <span className="ap-source-badge ap-source-badge--offline">Offline</span>
                              )}
                              {s.appointment_source === 'platform' && (
                                <span className="ap-source-badge ap-source-badge--online">Online</span>
                              )}
                            </div>
                            <div className="ap-meta-row">
                              <span className="ap-meta-pill">
                                <i className={typeMeta.icon} /> {typeMeta.label}
                              </span>
                              {s.appointment_source === 'dietitian' && s.payment_method && (
                                <span className="ap-meta-pill ap-payment-pill">
                                  <i className="fa-solid fa-indian-rupee-sign" />
                                  {s.payment_method.charAt(0).toUpperCase() + s.payment_method.slice(1)}
                                </span>
                              )}
                              {s.is_follow_up
                                ? <span className="ap-meta-pill ap-meta-pill--followup">
                                    <i className="fa-solid fa-calendar-plus" /> Follow-up
                                  </span>
                                : <span className="ap-meta-pill">
                                    <i className="fa-solid fa-hashtag" /> Session {s.session_number}
                                  </span>
                              }
                              {/* Diet plan status pill */}
                              {s.diet_plan
                                ? (() => {
                                    const dp = DIET_PLAN_META[s.diet_plan.status] ?? { label: s.diet_plan.status, icon: 'fa-solid fa-circle', pill: '' }
                                    return (
                                      <span className={`ap-meta-pill ${dp.pill}`}>
                                        <i className={`${dp.icon}${s.diet_plan.status === 'generating' ? ' fa-spin' : ''}`} />
                                        {dp.label}
                                      </span>
                                    )
                                  })()
                                : (s.status === 'completed' || s.status === 'confirmed') && (
                                    <span className="ap-meta-pill ap-meta-pill--no-plan">
                                      <i className="fa-solid fa-bowl-food" /> No Diet Plan
                                    </span>
                                  )
                              }
                              {s.status === 'completed' && (
                                s.dietitian_review_done
                                  ? <span className="ap-meta-pill ap-meta-pill--review">
                                      <i className="fa-solid fa-star" /> Rated
                                    </span>
                                  : <span className="ap-meta-pill ap-meta-pill--no-review">
                                      <i className="fa-regular fa-star" /> Not Rated
                                    </span>
                              )}
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
                                {/* For upcoming: create plan if none, or edit if draft */}
                                {(!s.diet_plan || s.diet_plan.status === 'draft') && (
                                  <button
                                    className="ap-btn-outline"
                                    onClick={e => {
                                      e.stopPropagation()
                                      const returnTo = `/dietitian-appointments?tab=${tab}`
                                      navigate(
                                        s.diet_plan
                                          ? `/dietitian-diet-plans/${s.diet_plan.id}`
                                          : `/dietitian-diet-plans/new?appointment_id=${s.id}`,
                                        { state: { returnTo, appointmentId: s.id } }
                                      )
                                    }}
                                  >
                                    <i className="fa-solid fa-bowl-food" />
                                    {s.diet_plan ? 'Edit Draft' : 'Diet Plan'}
                                  </button>
                                )}
                              </>
                            )}
                            {s.status === 'missed' && (
                              <button
                                className="cr-btn-reschedule"
                                onClick={e => { e.stopPropagation(); openReschedule(s, group.date) }}
                              >
                                <i className="fa-solid fa-rotate-right" /> Reschedule
                              </button>
                            )}
                            {/* Diet plan actions for completed sessions */}
                            {(() => {
                              const returnTo = `/dietitian-appointments?tab=${tab}`
                              const planState = { returnTo, appointmentId: s.id }
                              return (
                                <>
                                  {s.status === 'completed' && !s.diet_plan && (
                                    <button
                                      className="ap-btn-outline ap-btn-outline--plan"
                                      onClick={e => {
                                        e.stopPropagation()
                                        navigate(`/dietitian-diet-plans/new?appointment_id=${s.id}`, { state: planState })
                                      }}
                                    >
                                      <i className="fa-solid fa-bowl-food" /> Create Plan
                                    </button>
                                  )}
                                  {s.status === 'completed' && s.diet_plan?.status === 'draft' && (
                                    <button
                                      className="ap-btn-outline ap-btn-outline--plan"
                                      onClick={e => {
                                        e.stopPropagation()
                                        navigate(`/dietitian-diet-plans/${s.diet_plan!.id}`, { state: planState })
                                      }}
                                    >
                                      <i className="fa-solid fa-pen-to-square" /> Edit Draft
                                    </button>
                                  )}
                                  {s.status === 'completed' && s.diet_plan?.status === 'completed' && (
                                    <button
                                      className="ap-btn-outline ap-btn-outline--plan-done"
                                      onClick={e => {
                                        e.stopPropagation()
                                        navigate(`/dietitian-diet-plans/${s.diet_plan!.id}`, { state: planState })
                                      }}
                                    >
                                      <i className="fa-solid fa-circle-check" /> View Plan
                                    </button>
                                  )}
                                  {s.status === 'completed' && s.diet_plan?.status === 'failed' && (
                                    <button
                                      className="ap-btn-outline ap-btn-outline--plan-retry"
                                      onClick={e => {
                                        e.stopPropagation()
                                        navigate(`/dietitian-diet-plans/${s.diet_plan!.id}`, { state: planState })
                                      }}
                                    >
                                      <i className="fa-solid fa-rotate-right" /> Retry Plan
                                    </button>
                                  )}
                                </>
                              )
                            })()}
                            {s.status === 'completed' && !s.dietitian_review_done && (
                              <button
                                className="ap-btn-outline ap-btn-outline--rate"
                                onClick={e => { e.stopPropagation(); openReview(s) }}
                              >
                                <i className="fa-solid fa-star" /> Rate
                              </button>
                            )}
                            <button
                              className="ap-btn-outline ap-btn-outline--view"
                              onClick={e => { e.stopPropagation(); openSession(s, dateLabel) }}
                            >
                              <i className="fa-solid fa-arrow-right" /> View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
          })}
        </div>

      </div>

      {/* ── Reschedule Modal ── */}
      {reschedule && (
        <div className="cr-modal-overlay" onClick={() => setReschedule(null)}>
          <div className="cr-modal" onClick={e => e.stopPropagation()}>
            <div className="cr-modal-header">
              <h3 className="cr-modal-title"><i className="fa-solid fa-rotate-right" /> Reschedule Session</h3>
              <button className="cr-detail-close" onClick={() => setReschedule(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Client info */}
            <div className="cr-modal-client">
              <div className="cr-avatar cr-avatar--missed">
                {reschedule.session.client.avatar_url
                  ? <img src={reschedule.session.client.avatar_url} alt={reschedule.session.client.name} />
                  : reschedule.session.client.initials}
              </div>
              <div>
                <p className="cr-modal-client-name">{reschedule.session.client.name}</p>
                <p className="cr-modal-client-orig">
                  Original: {formatDate(reschedule.originalDate)} · {formatSlot(reschedule.session.slot)}
                </p>
              </div>
            </div>

            {/* Date chips */}
            <div className="cr-rsc-section">
              <span className="cr-modal-label" style={{ marginBottom: 8, display: 'block' }}>Select Date</span>
              <div className="cr-rsc-date-row">
                {getUpcomingDates().map(d => (
                  <button
                    key={d.date}
                    className={[
                      'cr-rsc-date-chip',
                      reschedule.date === d.date ? 'cr-rsc-date-chip--active' : '',
                      !d.hasSlots ? 'cr-rsc-date-chip--empty' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => {
                      setCustomTimeMode(false)
                      setReschedule(r => r ? { ...r, date: d.date, slot: '' } : r)
                    }}
                  >
                    <span className="cr-rsc-chip-day">{d.dayLabel}</span>
                    <span className="cr-rsc-chip-date">{d.dateLabel}</span>
                    {d.hasSlots && <span className="cr-rsc-chip-dot" />}
                  </button>
                ))}
                <label className="cr-rsc-date-chip cr-rsc-date-chip--more" title="Pick another date">
                  <i className="fa-regular fa-calendar" />
                  <span className="cr-rsc-chip-day">Other</span>
                  <input
                    type="date"
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                    min={new Date().toLocaleDateString('en-CA')}
                    onChange={e => {
                      if (!e.target.value) return
                      setCustomTimeMode(false)
                      setReschedule(r => r ? { ...r, date: e.target.value, slot: '' } : r)
                    }}
                  />
                </label>
              </div>
              {reschedule.date && !getUpcomingDates().find(d => d.date === reschedule.date) && (
                <div className="cr-rsc-custom-date-pill">
                  <i className="fa-regular fa-calendar-check" />
                  {formatDate(reschedule.date)}
                </div>
              )}
            </div>

            {/* Slot picker */}
            {reschedule.date && (
              <div className="cr-rsc-section">
                {slotsLoading ? (
                  <p className="cr-rsc-loading">
                    <i className="fa-solid fa-circle-notch fa-spin" /> Loading available slots…
                  </p>
                ) : (() => {
                  const rawRanges = availableSlots.find(s => s.date === reschedule.date)?.slots ?? []
                  const available = rawRanges.flatMap(r => r.includes('-') ? expandSlotRange(r) : [r])
                  const booked    = bookedSlots.find(s => s.date === reschedule.date)?.slots ?? []
                  const allSlots  = [...new Set([...available, ...booked])].sort()
                  return (
                    <>
                      {allSlots.length > 0 && (
                        <>
                          <div className="cr-rsc-slots-header">
                            <span className="cr-modal-label">Select Time</span>
                            <div className="cr-rsc-legend">
                              <span className="cr-rsc-legend-item">
                                <span className="cr-rsc-legend-dot cr-rsc-legend-dot--avail" /> Available
                              </span>
                              <span className="cr-rsc-legend-item">
                                <span className="cr-rsc-legend-dot cr-rsc-legend-dot--booked" /> Booked
                              </span>
                            </div>
                          </div>
                          <div className="cr-rsc-slots-grid">
                            {allSlots.map(slot => {
                              const isBooked   = booked.includes(slot)
                              const isPast     = isPastSlot(reschedule.date, slot)
                              const isDisabled = isBooked || isPast
                              const isSelected = !customTimeMode && reschedule.slot === slot
                              return (
                                <button
                                  key={slot}
                                  disabled={isDisabled}
                                  className={[
                                    'cr-rsc-slot',
                                    isBooked             ? 'cr-rsc-slot--booked' : '',
                                    isPast && !isBooked  ? 'cr-rsc-slot--past'   : '',
                                    isSelected           ? 'cr-rsc-slot--active' : '',
                                  ].filter(Boolean).join(' ')}
                                  onClick={() => {
                                    setCustomTimeMode(false)
                                    setReschedule(r => r ? { ...r, slot } : r)
                                  }}
                                >
                                  {isBooked && <i className="fa-solid fa-lock" />}
                                  {formatSlot(slot)}
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}
                      {allSlots.length === 0 && !customTimeMode && (
                        <p className="cr-rsc-no-slots">
                          <i className="fa-regular fa-calendar-xmark" /> No scheduled slots for this date — use custom time below
                        </p>
                      )}
                      <div className={`cr-rsc-custom-row${customTimeMode ? ' cr-rsc-custom-row--open' : ''}`}>
                        <button
                          className={`cr-rsc-custom-toggle${customTimeMode ? ' cr-rsc-custom-toggle--active' : ''}`}
                          onClick={() => {
                            const next = !customTimeMode
                            setCustomTimeMode(next)
                            if (next) setReschedule(r => r ? { ...r, slot: '' } : r)
                          }}
                        >
                          <i className={`fa-solid ${customTimeMode ? 'fa-xmark' : 'fa-clock'}`} />
                          {customTimeMode ? 'Cancel custom time' : 'Book at a different time'}
                        </button>
                        {customTimeMode && (
                          <input
                            type="time"
                            className="cr-modal-input cr-rsc-time-input"
                            value={reschedule.slot}
                            onChange={e => setReschedule(r => r ? { ...r, slot: e.target.value } : r)}
                            autoFocus
                          />
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="cr-modal-label" style={{ display: 'block', marginBottom: 6 }}>
                Reason{' '}
                <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                type="text"
                className="cr-modal-input"
                placeholder="e.g. Dietitian was unwell, client was travelling…"
                value={reschedule.reason}
                onChange={e => setReschedule(r => r ? { ...r, reason: e.target.value } : r)}
              />
            </div>

            {rescheduleError && (
              <p className="cr-modal-error">
                <i className="fa-solid fa-triangle-exclamation" /> {rescheduleError}
              </p>
            )}

            <div className="cr-modal-actions">
              <button className="cr-btn-detail" onClick={() => setReschedule(null)}>Cancel</button>
              <button
                className="cr-btn-reschedule"
                disabled={rescheduling || !reschedule.date || !reschedule.slot}
                onClick={handleReschedule}
                style={{ padding: '9px 20px', fontSize: 13 }}
              >
                {rescheduling
                  ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</>
                  : <><i className="fa-solid fa-rotate-right" /> Confirm Reschedule</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewSession && (
        <div className="cr-modal-overlay" onClick={() => setReviewSession(null)}>
          <div className="cr-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="cr-modal-header">
              <h3 className="cr-modal-title"><i className="fa-solid fa-star" /> Rate This Session</h3>
              <button className="cr-detail-close" onClick={() => setReviewSession(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="cr-modal-client">
              <div className="cr-avatar">
                {reviewSession.client.avatar_url
                  ? <img src={reviewSession.client.avatar_url} alt={reviewSession.client.name} />
                  : reviewSession.client.initials}
              </div>
              <div>
                <p className="cr-modal-client-name">{reviewSession.client.name}</p>
                <p className="cr-modal-client-orig">Session {reviewSession.session_number} · {reviewSession.time}</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0 8px' }}>
              <p className="cr-modal-label" style={{ marginBottom: 12 }}>How was this session?</p>
              <div className="apd-review-star-picker">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    className={`apd-star-btn${s <= (reviewHover || reviewRating) ? ' apd-star-btn--active' : ''}`}
                    onMouseEnter={() => setReviewHover(s)}
                    onMouseLeave={() => setReviewHover(0)}
                    onClick={() => setReviewRating(s)}
                    type="button"
                  >
                    <i className="fa-solid fa-star" />
                  </button>
                ))}
              </div>
              <p className="apd-star-label">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewHover || reviewRating] ?? ''}
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="cr-modal-label" style={{ display: 'block', marginBottom: 6 }}>
                Write a review{' '}
                <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                className="cr-modal-input"
                rows={3}
                style={{ resize: 'vertical', minHeight: 72 }}
                placeholder="Share your thoughts about this session…"
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              />
            </div>

            {reviewError && (
              <p className="cr-modal-error">
                <i className="fa-solid fa-triangle-exclamation" /> {reviewError}
              </p>
            )}

            <div className="cr-modal-actions">
              <button className="cr-btn-detail" onClick={() => setReviewSession(null)}>Cancel</button>
              <button
                className="cr-btn-reschedule"
                disabled={reviewSubmitting || reviewRating === 0}
                onClick={handleSubmitReview}
                style={{ padding: '9px 20px', fontSize: 13 }}
              >
                {reviewSubmitting
                  ? <><i className="fa-solid fa-circle-notch fa-spin" /> Submitting…</>
                  : <><i className="fa-solid fa-star" /> Submit Review</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
