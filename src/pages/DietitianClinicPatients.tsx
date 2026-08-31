import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom'
import appointmentApi, {
  DietitianSession,
  DietitianSessionGroup,
  DietitianSessionsSummary,
  AppointmentSlot,
  CreateOfflineAppointmentBody,
} from '../api/appointment'
import { type DietitianOutletContext } from '../components/DietitianLayout'
import SEO from '../components/SEO'

type Tab = 'upcoming' | 'completed' | 'missed' | 'cancelled'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'upcoming',  label: 'Upcoming',  icon: 'fa-solid fa-calendar-check'      },
  { key: 'missed',    label: 'Missed',    icon: 'fa-solid fa-triangle-exclamation' },
  { key: 'completed', label: 'Completed', icon: 'fa-solid fa-circle-check'         },
  { key: 'cancelled', label: 'Cancelled', icon: 'fa-solid fa-circle-xmark'         },
]

const STATUS_META: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Upcoming',  color: 'blue'   },
  completed: { label: 'Completed', color: 'green'  },
  cancelled: { label: 'Cancelled', color: 'red'    },
  missed:    { label: 'Missed',    color: 'red'    },
}

const SESSION_TYPE_META: Record<string, { label: string; icon: string }> = {
  video_call: { label: 'Video Call', icon: 'fa-solid fa-video'        },
  in_person:  { label: 'In-Person',  icon: 'fa-solid fa-location-dot' },
  chat:       { label: 'Chat',       icon: 'fa-solid fa-comment'      },
}

function formatSlot(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function localDateLabel(dateStr: string): string {
  const today    = new Date().toLocaleDateString('en-CA')
  const tomorrow = new Date(Date.now() + 864e5).toLocaleDateString('en-CA')
  if (dateStr === today)    return 'Today'
  if (dateStr === tomorrow) return 'Tomorrow'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

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
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`)
    cur += 30
  }
  return slots
}

type RescheduleState = {
  session: DietitianSession
  originalDate: string
  date: string
  slot: string
  reason: string
}

const VALID_TABS: Tab[] = ['upcoming', 'missed', 'completed', 'cancelled']

export default function DietitianClinicPatients() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profile } = useOutletContext<DietitianOutletContext>()

  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get('tab') as Tab | null
    return t && VALID_TABS.includes(t) ? t : 'upcoming'
  })
  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [summary, setSummary]           = useState<DietitianSessionsSummary>({
    all: 0, upcoming: 0, completed: 0, cancelled: 0, pending: 0, missed: 0,
  })
  const [groups, setGroups]             = useState<DietitianSessionGroup[]>([])

  /* ── Reschedule ── */
  const [reschedule, setReschedule]           = useState<RescheduleState | null>(null)
  const [rescheduling, setRescheduling]       = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots]   = useState<AppointmentSlot[]>([])
  const [bookedSlots, setBookedSlots]         = useState<AppointmentSlot[]>([])
  const [slotsLoading, setSlotsLoading]       = useState(false)
  const [customTimeMode, setCustomTimeMode]   = useState(false)

  /* ── Collect payment ── */
  const [collectPayOpen, setCollectPayOpen]         = useState<number | null>(null)
  const [collectPayMethod, setCollectPayMethod]     = useState<'cash' | 'upi' | 'card' | 'other' | ''>('')
  const [collectingPay, setCollectingPay]           = useState(false)

  /* ── Diet plan ── */
  const [dpSentLoading, setDpSentLoading]     = useState<Set<number>>(new Set())
  const [dpUploadLoading, setDpUploadLoading] = useState<Set<number>>(new Set())
  const [dpRemoveLoading, setDpRemoveLoading] = useState<Set<number>>(new Set())

  /* ── Add appointment modal ── */
  const [addOpen, setAddOpen]               = useState(false)
  const [addSubmitting, setAddSubmitting]   = useState(false)
  const [addError, setAddError]             = useState<string | null>(null)
  const [addSlots, setAddSlots]             = useState<AppointmentSlot[]>([])
  const [addSlotsLoading, setAddSlotsLoading] = useState(false)
  const [addCustomTime, setAddCustomTime]   = useState(false)
  const [addForm, setAddForm] = useState({
    name: '', phone: '', email: '',
    date: new Date().toLocaleDateString('en-CA'),
    slot: '', duration: '30', sessionType: 'in_person',
    fee: '0', paymentMethod: '', paymentCollected: false, notes: '',
  })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let aborted = false
    setLoading(true)
    setError(null)
    appointmentApi.getDietitianSessions({ tab, search: debouncedSearch || undefined, source: 'dietitian' })
      .then(res => {
        if (aborted) return
        setSummary(res.data.summary)
        setGroups(res.data.grouped)
      })
      .catch(err => { if (!aborted) setError(err?.message ?? 'Failed to load') })
      .finally(() => { if (!aborted) setLoading(false) })
    return () => { aborted = true }
  }, [tab, debouncedSearch])

  useEffect(() => {
    if (!reschedule) return
    setSlotsLoading(true)
    setAvailableSlots([]); setBookedSlots([])
    appointmentApi.getRescheduleSlots(reschedule.session.id)
      .then(d => { setAvailableSlots(d.available_slots); setBookedSlots(d.booked_slots) })
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
  }, [reschedule?.session.id])

  useEffect(() => {
    if (!addOpen || !profile) return
    setAddSlotsLoading(true)
    appointmentApi.getSlots(profile.id, 14)
      .then(s => setAddSlots(s))
      .catch(() => {})
      .finally(() => setAddSlotsLoading(false))
  }, [addOpen, profile?.id])

  const counts = {
    upcoming:  summary.upcoming,
    missed:    summary.missed ?? 0,
    completed: summary.completed,
    cancelled: summary.cancelled,
  }

  function updateSession(id: number, patch: Partial<DietitianSession>) {
    setGroups(prev => prev.map(g => ({ ...g, sessions: g.sessions.map(s => s.id === id ? { ...s, ...patch } : s) })))
  }

  async function handleDpSentToggle(s: DietitianSession) {
    const next = !(s.diet_plan_sent ?? false)
    setDpSentLoading(prev => new Set(prev).add(s.id))
    updateSession(s.id, { diet_plan_sent: next })
    try {
      await appointmentApi.setDietPlanSent(s.id, next)
    } catch {
      updateSession(s.id, { diet_plan_sent: !next })
    } finally {
      setDpSentLoading(prev => { const n = new Set(prev); n.delete(s.id); return n })
    }
  }

  async function handleDpFileUpload(id: number, file: File) {
    setDpUploadLoading(prev => new Set(prev).add(id))
    try {
      const { url } = await appointmentApi.uploadDietPlanFile(id, file)
      updateSession(id, { diet_plan_file_url: url })
    } catch { } finally {
      setDpUploadLoading(prev => { const n = new Set(prev); n.delete(id); return n })
    }
  }

  async function handleDpFileRemove(id: number) {
    setDpRemoveLoading(prev => new Set(prev).add(id))
    try {
      await appointmentApi.removeDietPlanFile(id)
      updateSession(id, { diet_plan_file_url: null })
    } catch { } finally {
      setDpRemoveLoading(prev => { const n = new Set(prev); n.delete(id); return n })
    }
  }

  async function handleCollectPay(id: number) {
    if (!collectPayMethod || collectingPay) return
    setCollectingPay(true)
    try {
      await appointmentApi.markPaid(id, collectPayMethod as 'cash' | 'upi' | 'card' | 'other')
      updateSession(id, { payment_status: 'paid', payment_method: collectPayMethod as any })
      setCollectPayOpen(null)
      setCollectPayMethod('')
    } catch { } finally {
      setCollectingPay(false)
    }
  }

  function openReschedule(s: DietitianSession, groupDate: string) {
    setReschedule({ session: s, originalDate: groupDate, date: new Date().toLocaleDateString('en-CA'), slot: '', reason: '' })
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
      setGroups(prev =>
        prev.map(g => ({ ...g, sessions: g.sessions.filter(s => s.id !== reschedule.session.id) }))
            .filter(g => g.sessions.length > 0)
      )
      setReschedule(null)
    } catch (e: any) {
      setRescheduleError(e.message ?? 'Failed to reschedule.')
    } finally {
      setRescheduling(false)
    }
  }

  function openAdd() {
    setAddForm({
      name: '', phone: '', email: '',
      date: new Date().toLocaleDateString('en-CA'),
      slot: '', duration: '30', sessionType: 'in_person',
      fee: '0', paymentMethod: '', paymentCollected: false, notes: '',
    })
    setAddError(null)
    setAddCustomTime(false)
    setAddOpen(true)
  }

  async function handleAddAppointment() {
    if (!addForm.name.trim()) { setAddError('Patient name is required.'); return }
    if (!addForm.slot)        { setAddError('Please select an appointment time.'); return }
    setAddSubmitting(true)
    setAddError(null)
    try {
      const body: CreateOfflineAppointmentBody = {
        name: addForm.name.trim(),
        appointment_date: addForm.date,
        slot: addForm.slot,
        ...(addForm.phone        ? { phone: addForm.phone }                                             : {}),
        ...(addForm.email        ? { email: addForm.email }                                             : {}),
        ...(addForm.duration     ? { duration: Number(addForm.duration) }                               : {}),
        ...(addForm.sessionType  ? { session_type: addForm.sessionType as 'in_person' | 'video_call' }  : {}),
        fee: Number(addForm.fee) || 0,
        ...(addForm.paymentMethod ? { payment_method: addForm.paymentMethod as 'cash' | 'upi' | 'card' | 'other' } : {}),
        payment_collected: addForm.paymentCollected,
        ...(addForm.notes ? { notes: addForm.notes } : {}),
      }
      await appointmentApi.createOfflineAppointment(body)
      setAddOpen(false)
      setLoading(true)
      appointmentApi.getDietitianSessions({ tab, search: debouncedSearch || undefined, source: 'dietitian' })
        .then(res => { setSummary(res.data.summary); setGroups(res.data.grouped) })
        .catch(() => {})
        .finally(() => setLoading(false))
    } catch (e: any) {
      setAddError(e.message ?? 'Failed to add appointment. Please try again.')
    } finally {
      setAddSubmitting(false)
    }
  }

  function getUpcomingDates(slots: AppointmentSlot[]) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i)
      const date = d.toLocaleDateString('en-CA')
      return {
        date,
        dayLabel:  i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        hasSlots:  (slots.find(s => s.date === date)?.slots?.length ?? 0) > 0,
      }
    })
  }

  function openSession(s: DietitianSession, dateLabel: string) {
    navigate(`/dietitian-appointments/${s.id}?from=clinic`, {
      state: { session: s, dateLabel, fromTab: tab, fromPage: 'clinic' },
    })
  }

  return (
    <div className="ap-root">
      <SEO noIndex={true} title="Clinic Patients" description="Clinic patients — private dietitian area." />

      {/* ── Header ── */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Clinic Patients</h1>
          <p className="ap-subtitle">Walk-in and offline appointments managed by you</p>
        </div>
        <div className="ap-header-right">
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
          <button className="ap-add-offline-btn" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> Add Appointment
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="ap-toolbar">
        <div className="ap-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`ap-tab ap-tab--${t.key}${tab === t.key ? ' ap-tab--active' : ''}`}
              onClick={() => { setTab(t.key); setSearchParams({ tab: t.key }, { replace: true }) }}
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
            placeholder="Search patient name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="ap-content">
        <div className="ap-timeline">

          {loading && (
            <div className="ap-empty">
              <span className="ap-empty-icon">⏳</span>
              <p className="ap-empty-text">Loading clinic patients…</p>
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
              <span className="ap-empty-icon">🏥</span>
              <p className="ap-empty-text">No clinic appointments found</p>
              <button className="ap-add-offline-btn" style={{ marginTop: 12 }} onClick={openAdd}>
                <i className="fa-solid fa-plus" /> Add Appointment
              </button>
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
                  <span className="ap-group-count">{group.count} patient{group.count !== 1 ? 's' : ''}</span>
                </div>

                <div className="ap-group-cards">
                  {group.sessions.map(s => {
                    const meta     = STATUS_META[s.status]     ?? { label: s.status,      color: 'blue' }
                    const typeMeta = SESSION_TYPE_META[s.session_type] ?? { label: s.session_type, icon: 'fa-solid fa-calendar' }
                    const isPaid   = s.payment_status === 'paid'
                    const fee      = s.fee != null ? Number(s.fee) : null

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
                                <span className="ap-source-badge ap-source-badge--offline">Offline</span>
                              </div>
                              <div className="ap-meta-row">
                                <span className="ap-meta-pill">
                                  <i className={typeMeta.icon} /> {typeMeta.label}
                                </span>
                                {fee != null && (
                                  <span className="ap-meta-pill">
                                    <i className="fa-solid fa-indian-rupee-sign" /> {fee.toLocaleString('en-IN')}
                                  </span>
                                )}
                                {isPaid ? (
                                  <span className="ap-meta-pill ap-payment-pill ap-payment-pill--paid">
                                    <i className="fa-solid fa-circle-check" /> Paid
                                    {s.payment_method && ` · ${s.payment_method.charAt(0).toUpperCase() + s.payment_method.slice(1)}`}
                                  </span>
                                ) : (
                                  <span className="ap-meta-pill ap-payment-pill ap-payment-pill--unpaid">
                                    <i className="fa-regular fa-clock" /> Unpaid
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
                                {s.diet_plan_sent && (
                                  <span className="ap-meta-pill ap-meta-pill--dp-sent">
                                    <i className="fa-solid fa-paper-plane" /> Plan Sent
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="ap-card-actions" onClick={e => e.stopPropagation()}>
                              {/* Collect payment */}
                              {!isPaid && (
                                <div className="ap-collect-pay-wrap">
                                  <button
                                    className="ap-collect-pay-btn"
                                    onClick={() => {
                                      if (collectPayOpen === s.id) { setCollectPayOpen(null); setCollectPayMethod('') }
                                      else { setCollectPayOpen(s.id); setCollectPayMethod('') }
                                    }}
                                  >
                                    <i className="fa-solid fa-indian-rupee-sign" /> Collect
                                  </button>
                                  {collectPayOpen === s.id && (
                                    <div className="ap-pay-dropdown">
                                      <p style={{ fontSize: 11, color: '#6b7280', padding: '6px 10px 4px', margin: 0 }}>Payment method</p>
                                      {(['cash', 'upi', 'card', 'other'] as const).map(m => (
                                        <button
                                          key={m}
                                          className={collectPayMethod === m ? 'ap-pay-dropdown-item--active' : ''}
                                          onClick={() => setCollectPayMethod(prev => prev === m ? '' : m)}
                                        >
                                          {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                      ))}
                                      {collectPayMethod && (
                                        <button
                                          className="ap-pay-confirm-item"
                                          disabled={collectingPay}
                                          onClick={() => handleCollectPay(s.id)}
                                        >
                                          {collectingPay ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : 'Confirm Paid'}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Reschedule for missed */}
                              {s.status === 'missed' && (
                                <button
                                  className="cr-btn-reschedule"
                                  onClick={e => { e.stopPropagation(); openReschedule(s, group.date) }}
                                >
                                  <i className="fa-solid fa-rotate-right" /> Reschedule
                                </button>
                              )}

                              <button
                                className="ap-btn-outline ap-btn-outline--view"
                                onClick={() => openSession(s, dateLabel)}
                              >
                                <i className="fa-solid fa-arrow-right" /> View
                              </button>
                            </div>
                          </div>

                          {/* Diet plan sent + file row */}
                          <div className="ap-dp-tracking" onClick={e => e.stopPropagation()}>
                            <label className="ap-dp-sent-row">
                              <input
                                type="checkbox"
                                checked={s.diet_plan_sent ?? false}
                                onChange={() => handleDpSentToggle(s)}
                                disabled={dpSentLoading.has(s.id)}
                              />
                              <span>Diet plan sent</span>
                              {dpSentLoading.has(s.id) && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }} />}
                            </label>
                            <div className="ap-dp-file-row">
                              {s.diet_plan_file_url ? (
                                <>
                                  <a href={s.diet_plan_file_url} target="_blank" rel="noopener noreferrer" className="ap-dp-view-link">
                                    <i className="fa-solid fa-file" /> File
                                  </a>
                                  <button
                                    className="ap-dp-remove-btn"
                                    onClick={() => handleDpFileRemove(s.id)}
                                    disabled={dpRemoveLoading.has(s.id)}
                                  >
                                    {dpRemoveLoading.has(s.id) ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Remove'}
                                  </button>
                                </>
                              ) : (
                                <label className="ap-dp-upload-btn">
                                  <i className="fa-solid fa-upload" />
                                  {dpUploadLoading.has(s.id) ? ' Uploading…' : ' Upload'}
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    style={{ display: 'none' }}
                                    disabled={dpUploadLoading.has(s.id)}
                                    onChange={e => { if (e.target.files?.[0]) handleDpFileUpload(s.id, e.target.files[0]) }}
                                  />
                                </label>
                              )}
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

            <div className="cr-rsc-section">
              <span className="cr-modal-label" style={{ marginBottom: 8, display: 'block' }}>Select Date</span>
              <div className="cr-rsc-date-row">
                {getUpcomingDates(availableSlots).map(d => (
                  <button key={d.date}
                    className={['cr-rsc-date-chip', reschedule.date === d.date ? 'cr-rsc-date-chip--active' : '', !d.hasSlots ? 'cr-rsc-date-chip--empty' : ''].filter(Boolean).join(' ')}
                    onClick={() => { setCustomTimeMode(false); setReschedule(r => r ? { ...r, date: d.date, slot: '' } : r) }}
                  >
                    <span className="cr-rsc-chip-day">{d.dayLabel}</span>
                    <span className="cr-rsc-chip-date">{d.dateLabel}</span>
                    {d.hasSlots && <span className="cr-rsc-chip-dot" />}
                  </button>
                ))}
                <label className="cr-rsc-date-chip cr-rsc-date-chip--more">
                  <i className="fa-regular fa-calendar" />
                  <span className="cr-rsc-chip-day">Other</span>
                  <input type="date" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                    min={new Date().toLocaleDateString('en-CA')}
                    onChange={e => { if (!e.target.value) return; setCustomTimeMode(false); setReschedule(r => r ? { ...r, date: e.target.value, slot: '' } : r) }} />
                </label>
              </div>
            </div>

            {reschedule.date && (
              <div className="cr-rsc-section">
                {slotsLoading ? (
                  <p className="cr-rsc-loading"><i className="fa-solid fa-circle-notch fa-spin" /> Loading available slots…</p>
                ) : (() => {
                  const rawRanges = availableSlots.find(sl => sl.date === reschedule.date)?.slots ?? []
                  const available = rawRanges.flatMap(r => r.includes('-') ? expandSlotRange(r) : [r])
                  const booked    = bookedSlots.find(sl => sl.date === reschedule.date)?.slots ?? []
                  const allSlots  = [...new Set([...available, ...booked])].sort()
                  return (
                    <>
                      {allSlots.length > 0 && (
                        <div className="cr-rsc-slots-grid">
                          {allSlots.map(slot => {
                            const isBooked   = booked.includes(slot)
                            const isPast     = isPastSlot(reschedule.date, slot)
                            const isSelected = !customTimeMode && reschedule.slot === slot
                            return (
                              <button key={slot} disabled={isBooked || isPast}
                                className={['cr-rsc-slot', isBooked ? 'cr-rsc-slot--booked' : '', isPast && !isBooked ? 'cr-rsc-slot--past' : '', isSelected ? 'cr-rsc-slot--active' : ''].filter(Boolean).join(' ')}
                                onClick={() => { setCustomTimeMode(false); setReschedule(r => r ? { ...r, slot } : r) }}
                              >
                                {isBooked && <i className="fa-solid fa-lock" />}
                                {formatSlot(slot)}
                              </button>
                            )
                          })}
                        </div>
                      )}
                      {allSlots.length === 0 && !customTimeMode && (
                        <p className="cr-rsc-no-slots"><i className="fa-regular fa-calendar-xmark" /> No slots for this date — use custom time</p>
                      )}
                      <div className={`cr-rsc-custom-row${customTimeMode ? ' cr-rsc-custom-row--open' : ''}`}>
                        <button
                          className={`cr-rsc-custom-toggle${customTimeMode ? ' cr-rsc-custom-toggle--active' : ''}`}
                          onClick={() => { const n = !customTimeMode; setCustomTimeMode(n); if (n) setReschedule(r => r ? { ...r, slot: '' } : r) }}
                        >
                          <i className={`fa-solid ${customTimeMode ? 'fa-xmark' : 'fa-clock'}`} />
                          {customTimeMode ? 'Cancel custom time' : 'Book at a different time'}
                        </button>
                        {customTimeMode && (
                          <input type="time" className="cr-modal-input cr-rsc-time-input"
                            value={reschedule.slot}
                            onChange={e => setReschedule(r => r ? { ...r, slot: e.target.value } : r)}
                            autoFocus />
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            )}

            <div>
              <label className="cr-modal-label" style={{ display: 'block', marginBottom: 6 }}>
                Reason <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input type="text" className="cr-modal-input"
                placeholder="e.g. Patient was travelling…"
                value={reschedule.reason}
                onChange={e => setReschedule(r => r ? { ...r, reason: e.target.value } : r)} />
            </div>

            {rescheduleError && (
              <p className="cr-modal-error"><i className="fa-solid fa-triangle-exclamation" /> {rescheduleError}</p>
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
                  : <><i className="fa-solid fa-rotate-right" /> Confirm Reschedule</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Appointment Modal ── */}
      {addOpen && (
        <div className="cr-modal-overlay" onClick={() => setAddOpen(false)}>
          <div className="cr-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="cr-modal-header">
              <h3 className="cr-modal-title">
                <i className="fa-solid fa-calendar-plus" /> Add Clinic Appointment
              </h3>
              <button className="cr-detail-close" onClick={() => setAddOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="offline-form-grid">
              <div className="offline-field offline-field--full">
                <label>Patient Name *</label>
                <input className="cr-modal-input" placeholder="Full name" value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="offline-field">
                <label>Phone</label>
                <input className="cr-modal-input" type="tel" placeholder="+91…" value={addForm.phone}
                  onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="offline-field">
                <label>Email</label>
                <input className="cr-modal-input" type="email" placeholder="patient@email.com" value={addForm.email}
                  onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>

            <div className="cr-rsc-section">
              <span className="cr-modal-label" style={{ marginBottom: 8, display: 'block' }}>Appointment Date *</span>
              <div className="cr-rsc-date-row">
                {getUpcomingDates(addSlots).map(d => (
                  <button key={d.date}
                    className={['cr-rsc-date-chip', addForm.date === d.date ? 'cr-rsc-date-chip--active' : '', !d.hasSlots ? 'cr-rsc-date-chip--empty' : ''].filter(Boolean).join(' ')}
                    onClick={() => { setAddCustomTime(false); setAddForm(f => ({ ...f, date: d.date, slot: '' })) }}
                  >
                    <span className="cr-rsc-chip-day">{d.dayLabel}</span>
                    <span className="cr-rsc-chip-date">{d.dateLabel}</span>
                    {d.hasSlots && <span className="cr-rsc-chip-dot" />}
                  </button>
                ))}
                <label className="cr-rsc-date-chip cr-rsc-date-chip--more">
                  <i className="fa-regular fa-calendar" />
                  <span className="cr-rsc-chip-day">Other</span>
                  <input type="date" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                    min={new Date().toLocaleDateString('en-CA')}
                    onChange={e => { if (!e.target.value) return; setAddCustomTime(false); setAddForm(f => ({ ...f, date: e.target.value, slot: '' })) }} />
                </label>
              </div>
            </div>

            {addForm.date && (
              <div className="cr-rsc-section">
                {addSlotsLoading ? (
                  <p className="cr-rsc-loading"><i className="fa-solid fa-circle-notch fa-spin" /> Loading slots…</p>
                ) : (() => {
                  const rawRanges = addSlots.find(sl => sl.date === addForm.date)?.slots ?? []
                  const available = rawRanges.flatMap(r => r.includes('-') ? expandSlotRange(r) : [r])
                  return (
                    <>
                      {available.length > 0 && !addCustomTime && (
                        <>
                          <span className="cr-modal-label" style={{ display: 'block', marginBottom: 8 }}>Select Time *</span>
                          <div className="cr-rsc-slots-grid">
                            {available.map(slot => {
                              const past = isPastSlot(addForm.date, slot)
                              return (
                                <button key={slot} disabled={past}
                                  className={['cr-rsc-slot', past ? 'cr-rsc-slot--past' : '', !addCustomTime && addForm.slot === slot ? 'cr-rsc-slot--active' : ''].filter(Boolean).join(' ')}
                                  onClick={() => { setAddCustomTime(false); setAddForm(f => ({ ...f, slot })) }}
                                >
                                  {formatSlot(slot)}
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}
                      {available.length === 0 && !addCustomTime && (
                        <p className="cr-rsc-no-slots"><i className="fa-regular fa-calendar-xmark" /> No slots — use custom time</p>
                      )}
                      <div className={`cr-rsc-custom-row${addCustomTime ? ' cr-rsc-custom-row--open' : ''}`}>
                        <button
                          className={`cr-rsc-custom-toggle${addCustomTime ? ' cr-rsc-custom-toggle--active' : ''}`}
                          onClick={() => { const n = !addCustomTime; setAddCustomTime(n); if (n) setAddForm(f => ({ ...f, slot: '' })) }}
                        >
                          <i className={`fa-solid ${addCustomTime ? 'fa-xmark' : 'fa-clock'}`} />
                          {addCustomTime ? 'Cancel custom time' : 'Enter time manually'}
                        </button>
                        {addCustomTime && (
                          <input type="time" className="cr-modal-input cr-rsc-time-input"
                            value={addForm.slot}
                            onChange={e => setAddForm(f => ({ ...f, slot: e.target.value }))}
                            autoFocus />
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            )}

            <div className="offline-form-grid" style={{ marginTop: 8 }}>
              <div className="offline-field">
                <label>Session Type</label>
                <div className="cr-modal-input" style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#374151', background: '#f9fafb', cursor: 'default' }}>
                  <i className="fa-solid fa-location-dot" style={{ color: '#6366f1' }} /> In-Person
                </div>
              </div>
              <div className="offline-field">
                <label>Duration (mins)</label>
                <select className="cr-modal-input" value={addForm.duration}
                  onChange={e => setAddForm(f => ({ ...f, duration: e.target.value }))}>
                  {['15','30','45','60','90'].map(v => <option key={v} value={v}>{v} min</option>)}
                </select>
              </div>
              <div className="offline-field">
                <label>Fee (₹)</label>
                <input className="cr-modal-input" type="number" min="0" value={addForm.fee}
                  onChange={e => setAddForm(f => ({ ...f, fee: e.target.value }))} />
              </div>
              <div className="offline-field">
                <label>Payment Method</label>
                <select className="cr-modal-input" value={addForm.paymentMethod}
                  onChange={e => setAddForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                  <option value="">Not specified</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="offline-field offline-field--full">
                <label className="offline-pay-collected-row" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={addForm.paymentCollected}
                    onChange={e => setAddForm(f => ({ ...f, paymentCollected: e.target.checked }))} />
                  Payment already collected
                </label>
              </div>
              <div className="offline-field offline-field--full">
                <label>Notes</label>
                <textarea className="cr-modal-input" rows={2} style={{ resize: 'vertical' }}
                  placeholder="Any notes about this appointment…"
                  value={addForm.notes}
                  onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            {addError && (
              <p className="cr-modal-error"><i className="fa-solid fa-triangle-exclamation" /> {addError}</p>
            )}

            <div className="cr-modal-actions">
              <button className="cr-btn-detail" onClick={() => setAddOpen(false)}>Cancel</button>
              <button
                className="cr-btn-reschedule"
                disabled={addSubmitting}
                onClick={handleAddAppointment}
                style={{ padding: '9px 20px', fontSize: 13 }}
              >
                {addSubmitting
                  ? <><i className="fa-solid fa-circle-notch fa-spin" /> Adding…</>
                  : <><i className="fa-solid fa-calendar-plus" /> Add Appointment</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
