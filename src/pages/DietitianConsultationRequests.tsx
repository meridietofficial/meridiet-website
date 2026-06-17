import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import appointmentApi, { DietitianAppointment, RescheduleHistory, AppointmentSlot } from '../api/appointment'
import { useConsultationCount } from '../context/ConsultationCountContext'

type Tab = 'pending' | 'missed' | 'accepted' | 'rejected'

const STATUS_LABEL: Record<DietitianAppointment['status'], string> = {
  pending:   'Pending',
  confirmed: 'Accepted',
  cancelled: 'Rejected',
  completed: 'Completed',
  missed:    'Missed',
}

function statusCssClass(status: DietitianAppointment['status']): string {
  if (status === 'confirmed') return 'accepted'
  if (status === 'cancelled') return 'rejected'
  return status
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatSlot(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

// Expands a range like "09:00-18:00" into ["09:00","09:30","10:00",...,"17:30"]
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

type RescheduleState = {
  appt: DietitianAppointment
  date: string
  slot: string
  reason: string
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'pending',  label: 'Pending',  icon: 'fa-solid fa-hourglass-half'       },
  { key: 'missed',   label: 'Missed',   icon: 'fa-solid fa-triangle-exclamation' },
  { key: 'accepted', label: 'Accepted', icon: 'fa-solid fa-circle-check'         },
  { key: 'rejected', label: 'Rejected', icon: 'fa-solid fa-circle-xmark'         },
]

export default function DietitianConsultationRequests() {
  const navigate = useNavigate()
  const { setPendingCount } = useConsultationCount()
  const [tab, setTab]                   = useState<Tab>('pending')
  const [search, setSearch]             = useState('')
  const [selected, setSelected]         = useState<DietitianAppointment | null>(null)
  const [appointments, setAppointments] = useState<DietitianAppointment[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [updating, setUpdating]         = useState<number | null>(null)

  const [reschedule, setReschedule]     = useState<RescheduleState | null>(null)
  const [rescheduling, setRescheduling] = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)

  const [history, setHistory]           = useState<RescheduleHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([])
  const [bookedSlots, setBookedSlots]       = useState<AppointmentSlot[]>([])
  const [slotsLoading, setSlotsLoading]     = useState(false)
  const [customTimeMode, setCustomTimeMode] = useState(false)

  useEffect(() => { fetchAll() }, [])

  // Fetch available + booked slots when reschedule modal opens
  useEffect(() => {
    if (!reschedule) return
    setSlotsLoading(true)
    setAvailableSlots([])
    setBookedSlots([])
    appointmentApi.getRescheduleSlots(reschedule.appt.id)
      .then(data => {
        setAvailableSlots(data.available_slots)
        setBookedSlots(data.booked_slots)
      })
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
  }, [reschedule?.appt.id])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await appointmentApi.getDietitianAppointments({ limit: 100 })
      setAppointments(data)
      setPendingCount(data.filter(r => r.status === 'pending').length)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: number, status: 'confirmed' | 'cancelled') {
    setUpdating(id)
    try {
      await appointmentApi.updateAppointmentStatus(id, status)
      setAppointments(prev => {
        const updated = prev.map(r => r.id === id ? { ...r, status } : r)
        setPendingCount(updated.filter(r => r.status === 'pending').length)
        return updated
      })
      setSelected(s => s?.id === id ? { ...s, status } : s)
    } catch {
      // silent
    } finally {
      setUpdating(null)
    }
  }

  async function handleReschedule() {
    if (!reschedule) return
    setRescheduling(true)
    setRescheduleError(null)
    try {
      await appointmentApi.rescheduleAppointment(reschedule.appt.id, {
        appointment_date: reschedule.date,
        slot: reschedule.slot,
        reason: reschedule.reason || undefined,
      })
      const updated: Partial<DietitianAppointment> = {
        status: 'confirmed',
        appointment_date: reschedule.date,
        slot: reschedule.slot,
      }
      setAppointments(prev => prev.map(r => r.id === reschedule.appt.id ? { ...r, ...updated } : r))
      setSelected(s => s?.id === reschedule.appt.id ? { ...s, ...updated } as DietitianAppointment : s)
      setReschedule(null)
      // refresh history if this appointment is open in detail panel
      if (selected?.id === reschedule.appt.id) {
        fetchHistory(reschedule.appt.id)
      }
    } catch (e: any) {
      setRescheduleError(e.message ?? 'Failed to reschedule. Please try again.')
    } finally {
      setRescheduling(false)
    }
  }

  async function fetchHistory(id: number) {
    setHistoryLoading(true)
    try {
      const data = await appointmentApi.getRescheduleHistory(id)
      setHistory(data)
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  function openDetail(r: DietitianAppointment) {
    setSelected(prev => prev?.id === r.id ? null : r)
    setHistory([])
    if (r.status === 'missed') {
      fetchHistory(r.id)
    }
  }

  function openReschedule(appt: DietitianAppointment) {
    const today = new Date().toISOString().split('T')[0]
    setReschedule({ appt, date: today, slot: '', reason: '' })
    setRescheduleError(null)
    setCustomTimeMode(false)
  }

  function getUpcomingDates() {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const date = d.toISOString().split('T')[0]
      return {
        date,
        dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        hasSlots: (availableSlots.find(s => s.date === date)?.slots?.length ?? 0) > 0,
      }
    })
  }

  const counts = {
    pending:  appointments.filter(r => r.status === 'pending').length,
    missed:   appointments.filter(r => r.status === 'missed').length,
    accepted: appointments.filter(r => r.status === 'confirmed').length,
    rejected: appointments.filter(r => r.status === 'cancelled').length,
  }

  const filtered = appointments.filter(r => {
    const matchesTab =
      (tab === 'pending'  && r.status === 'pending')   ||
      (tab === 'missed'   && r.status === 'missed')     ||
      (tab === 'accepted' && r.status === 'confirmed')  ||
      (tab === 'rejected' && r.status === 'cancelled')
    const q = search.toLowerCase()
    const matchesSearch = !q || r.name.toLowerCase().includes(q) || (r.notes ?? '').toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  return (
    <div className="cr-root">

      {/* ── Page Header ── */}
      <div className="cr-header">
        <div>
          <h1 className="cr-title">Consultation Requests</h1>
          <p className="cr-subtitle">Review incoming requests and reschedule any missed sessions</p>
        </div>
        <div className="cr-header-stats">
          <div className="cr-hstat cr-hstat--orange">
            <span className="cr-hstat-val">{counts.pending}</span>
            <span className="cr-hstat-label">Pending</span>
          </div>
          <div className="cr-hstat" style={{ borderColor: '#fcc8c8', background: '#fff4f4' }}>
            <span className="cr-hstat-val" style={{ color: '#dc2626' }}>{counts.missed}</span>
            <span className="cr-hstat-label">Missed</span>
          </div>
          <div className="cr-hstat cr-hstat--green">
            <span className="cr-hstat-val">{counts.accepted}</span>
            <span className="cr-hstat-label">Accepted</span>
          </div>
          <div className="cr-hstat cr-hstat--red">
            <span className="cr-hstat-val">{counts.rejected}</span>
            <span className="cr-hstat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="cr-toolbar">
        <div className="cr-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`cr-tab cr-tab--${t.key}${tab === t.key ? ' cr-tab--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <i className={t.icon} />
              {t.label}
              {counts[t.key] > 0 && (
                <span className={`cr-tab-count${t.key === 'missed' && counts.missed > 0 ? ' cr-tab-count--alert' : ''}`}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="cr-search-wrap">
          <i className="fa-solid fa-magnifying-glass cr-search-icon" />
          <input
            className="cr-search"
            placeholder="Search by name or notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Missed warning banner */}
      {tab === 'missed' && counts.missed > 0 && (
        <div className="cr-missed-banner">
          <i className="fa-solid fa-triangle-exclamation" />
          <span>You have <strong>{counts.missed} missed session{counts.missed > 1 ? 's' : ''}</strong> — reach out to reschedule so clients aren't left waiting.</span>
        </div>
      )}

      {/* Nudge on Pending tab if there are missed sessions */}
      {tab === 'pending' && counts.missed > 0 && (
        <div className="cr-missed-nudge" onClick={() => setTab('missed')}>
          <i className="fa-solid fa-triangle-exclamation" />
          <span>{counts.missed} missed session{counts.missed > 1 ? 's' : ''} need rescheduling</span>
          <span className="cr-nudge-arrow">View →</span>
        </div>
      )}

      {/* ── Content ── */}
      <div className={`cr-content${selected ? ' cr-content--split' : ''}`}>

        {/* Request List */}
        <div className="cr-list">
          {loading && (
            <div className="cr-empty">
              <span className="cr-empty-icon">⏳</span>
              <p className="cr-empty-text">Loading…</p>
            </div>
          )}

          {!loading && error && (
            <div className="cr-empty">
              <span className="cr-empty-icon">⚠️</span>
              <p className="cr-empty-text">{error}</p>
              <button className="cr-btn-detail" style={{ marginTop: 8 }} onClick={fetchAll}>Retry</button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="cr-empty">
              <span className="cr-empty-icon">{tab === 'missed' ? '✅' : '📋'}</span>
              <p className="cr-empty-text">
                {tab === 'missed' ? 'No missed sessions — great job!' : 'No requests found'}
              </p>
            </div>
          )}

          {!loading && !error && filtered.map(r => (
            <div
              key={r.id}
              className={`cr-card${selected?.id === r.id ? ' cr-card--selected' : ''}${r.status === 'missed' ? ' cr-card--missed' : ''}`}
              onClick={() => openDetail(r)}
            >
              <div className="cr-card-top">
                <div className={`cr-avatar${r.status === 'missed' ? ' cr-avatar--missed' : ''}`}>
                  {r.avatar_url ? <img src={r.avatar_url} alt={r.name} /> : getInitials(r.name)}
                </div>
                <div className="cr-card-info">
                  <div className="cr-name-row">
                    <span className="cr-name">{r.name}</span>
                    {r.status === 'pending' && <span className="cr-badge cr-badge--new">NEW</span>}
                    {r.status === 'missed'  && (
                      <span className="cr-badge cr-badge--missed">
                        <i className="fa-solid fa-triangle-exclamation" /> Missed
                      </span>
                    )}
                    {r.status !== 'pending' && r.status !== 'missed' && (
                      <span className={`cr-status cr-status--${statusCssClass(r.status)}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    )}
                    <span className="cr-time">{relativeTime(r.created_at)}</span>
                  </div>
                  <p className="cr-goal">
                    <i className="fa-regular fa-calendar" /> {formatDate(r.appointment_date)} · {formatSlot(r.slot)}
                    {r.status === 'missed' && (
                      <span className="cr-missed-ago"> · {relativeTime(r.appointment_date)}</span>
                    )}
                  </p>
                  {r.notes && <p className="cr-desc">{r.notes}</p>}
                </div>
              </div>
              <div className="cr-card-meta">
                <span className="cr-meta-pill">
                  <i className="fa-solid fa-indian-rupee-sign" /> {Number(r.fee).toLocaleString('en-IN')} {r.currency}
                </span>
                <span className="cr-meta-pill">
                  <i className="fa-solid fa-credit-card" /> {r.payment_status}
                </span>
                <div className="cr-card-actions">
                  {r.status === 'pending' && (
                    <>
                      <button
                        className="cr-btn-accept"
                        disabled={updating === r.id}
                        onClick={e => { e.stopPropagation(); updateStatus(r.id, 'confirmed') }}
                      >
                        <i className="fa-solid fa-check" /> Accept
                      </button>
                      <button
                        className="cr-btn-reject"
                        disabled={updating === r.id}
                        onClick={e => { e.stopPropagation(); updateStatus(r.id, 'cancelled') }}
                      >
                        <i className="fa-solid fa-xmark" /> Reject
                      </button>
                    </>
                  )}
                  {r.status === 'missed' && (
                    <button
                      className="cr-btn-reschedule"
                      onClick={e => { e.stopPropagation(); openReschedule(r) }}
                    >
                      <i className="fa-solid fa-rotate-right" /> Reschedule
                    </button>
                  )}
                  <button
                    className="cr-btn-detail"
                    onClick={e => { e.stopPropagation(); openDetail(r) }}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="cr-detail">
            <div className="cr-detail-header">
              <h2 className="cr-detail-title">
                {selected.status === 'missed' ? 'Missed Session' : 'Request Details'}
              </h2>
              <button className="cr-detail-close" onClick={() => setSelected(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="cr-detail-avatar-row">
              <div className={`cr-detail-avatar${selected.status === 'missed' ? ' cr-avatar--missed' : ''}`}>
                {selected.avatar_url ? <img src={selected.avatar_url} alt={selected.name} /> : getInitials(selected.name)}
              </div>
              <div>
                <p className="cr-detail-name">{selected.name}</p>
                {selected.status === 'missed'
                  ? <span className="cr-badge cr-badge--missed"><i className="fa-solid fa-triangle-exclamation" /> Missed</span>
                  : <span className={`cr-status cr-status--${statusCssClass(selected.status)}`}>{STATUS_LABEL[selected.status]}</span>
                }
              </div>
            </div>

            {selected.status === 'missed' && (
              <div className="cr-missed-detail-banner">
                <i className="fa-solid fa-circle-exclamation" />
                <p>
                  Session was on <strong>{formatDate(selected.appointment_date)} at {formatSlot(selected.slot)}</strong>.
                  The client may be waiting — reschedule as soon as possible.
                </p>
              </div>
            )}


            <div className="cr-detail-section">
              <p className="cr-detail-section-title">Appointment Details</p>
              <div className="cr-detail-grid">
                <div className="cr-detail-field">
                  <span className="cr-detail-label">Date</span>
                  <span className="cr-detail-val">{formatDate(selected.appointment_date)}</span>
                </div>
                <div className="cr-detail-field">
                  <span className="cr-detail-label">Time</span>
                  <span className="cr-detail-val">{formatSlot(selected.slot)}</span>
                </div>
                <div className="cr-detail-field">
                  <span className="cr-detail-label">Fee</span>
                  <span className="cr-detail-val">₹{Number(selected.fee).toLocaleString('en-IN')} {selected.currency}</span>
                </div>
                <div className="cr-detail-field">
                  <span className="cr-detail-label">Payment</span>
                  <span className="cr-detail-val" style={{ textTransform: 'capitalize' }}>{selected.payment_status}</span>
                </div>
              </div>
            </div>

            {selected.notes && (
              <div className="cr-detail-section">
                <p className="cr-detail-section-title">Client Note</p>
                <p className="cr-detail-desc">{selected.notes}</p>
              </div>
            )}

            <div className="cr-detail-section">
              <p className="cr-detail-section-title">Requested</p>
              <p className="cr-detail-desc">{relativeTime(selected.created_at)}</p>
            </div>

            {/* Reschedule history */}
            {selected.status === 'missed' && (
              <div className="cr-detail-section">
                <p className="cr-detail-section-title">Reschedule History</p>
                {historyLoading && <p className="cr-detail-desc">Loading…</p>}
                {!historyLoading && history.length === 0 && (
                  <p className="cr-detail-desc" style={{ color: '#aaa' }}>No reschedules yet</p>
                )}
                {!historyLoading && history.map(h => (
                  <div key={h.id} className="cr-history-row">
                    <div className="cr-history-from">
                      <span>{formatDate(h.previous_date)}</span>
                      <span>{formatSlot(h.previous_slot)}</span>
                    </div>
                    <i className="fa-solid fa-arrow-right cr-history-arrow" />
                    <div className="cr-history-to">
                      <span>{formatDate(h.new_date)}</span>
                      <span>{formatSlot(h.new_slot)}</span>
                    </div>
                    {h.reason && <p className="cr-history-reason">"{h.reason}"</p>}
                    <p className="cr-history-meta">by {h.rescheduled_by_name} · {relativeTime(h.created_at)}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="cr-detail-btns">
              {selected.status === 'pending' && (
                <>
                  <button
                    className="cr-btn-accept cr-btn-accept--full"
                    disabled={updating === selected.id}
                    onClick={() => updateStatus(selected.id, 'confirmed')}
                  >
                    <i className="fa-solid fa-check" /> Accept Request
                  </button>
                  <button
                    className="cr-btn-reject cr-btn-reject--full"
                    disabled={updating === selected.id}
                    onClick={() => updateStatus(selected.id, 'cancelled')}
                  >
                    <i className="fa-solid fa-xmark" /> Reject Request
                  </button>
                </>
              )}
              {selected.status === 'missed' && (
                <button
                  className="cr-btn-reschedule cr-btn-reschedule--full"
                  onClick={() => openReschedule(selected)}
                >
                  <i className="fa-solid fa-rotate-right" /> Reschedule Session
                </button>
              )}
              {selected.status === 'confirmed' && (
                <button
                  className="cr-btn-goto-appointments"
                  onClick={() => navigate('/dietitian-appointments')}
                >
                  <span className="cr-goto-left">
                    <i className="fa-solid fa-calendar-check" />
                    <span>
                      <span className="cr-goto-title">Go to Appointments</span>
                      <span className="cr-goto-sub">Join the call or view session details there</span>
                    </span>
                  </span>
                  <i className="fa-solid fa-arrow-right cr-goto-arrow" />
                </button>
              )}
            </div>
          </div>
        )}
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

            <div className="cr-modal-client">
              <div className="cr-avatar cr-avatar--missed">
                {reschedule.appt.avatar_url ? <img src={reschedule.appt.avatar_url} alt={reschedule.appt.name} /> : getInitials(reschedule.appt.name)}
              </div>
              <div>
                <p className="cr-modal-client-name">{reschedule.appt.name}</p>
                <p className="cr-modal-client-orig">
                  Original: {formatDate(reschedule.appt.appointment_date)} · {formatSlot(reschedule.appt.slot)}
                </p>
              </div>
            </div>

            {/* ── Date chips ── */}
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
                {/* "Other date" — native date picker hidden under a chip */}
                <label className="cr-rsc-date-chip cr-rsc-date-chip--more" title="Pick another date">
                  <i className="fa-regular fa-calendar" />
                  <span className="cr-rsc-chip-day">Other</span>
                  <input
                    type="date"
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => {
                      if (!e.target.value) return
                      setCustomTimeMode(false)
                      setReschedule(r => r ? { ...r, date: e.target.value, slot: '' } : r)
                    }}
                  />
                </label>
              </div>
              {/* Show custom date as pill when outside 7-day window */}
              {reschedule.date && !getUpcomingDates().find(d => d.date === reschedule.date) && (
                <div className="cr-rsc-custom-date-pill">
                  <i className="fa-regular fa-calendar-check" />
                  {formatDate(reschedule.date)}
                </div>
              )}
            </div>

            {/* ── Slot picker ── */}
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

                      {/* Custom time toggle */}
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

            {/* ── Reason ── */}
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
              <p className="cr-modal-error"><i className="fa-solid fa-triangle-exclamation" /> {rescheduleError}</p>
            )}

            <div className="cr-modal-actions">
              <button className="cr-btn-detail" onClick={() => setReschedule(null)}>
                Cancel
              </button>
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

    </div>
  )
}
