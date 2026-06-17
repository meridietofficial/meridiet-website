import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import appointmentApi, { DietitianAppointment, DietitianSession, AppointmentSlot, AppointmentReviews, CreateFollowUpBody, FollowUpAppointment } from '../api/appointment'
import { useVideoCall } from '../context/VideoCallContext'

const STATUS_META: Record<string, { label: string; color: string }> = {
  confirmed:  { label: 'Upcoming',  color: 'blue'   },
  completed:  { label: 'Completed', color: 'green'  },
  cancelled:  { label: 'Cancelled', color: 'red'    },
  pending:    { label: 'Pending',   color: 'orange' },
  missed:     { label: 'Missed',    color: 'red'    },
}

const SESSION_TYPE_META: Record<string, { label: string; icon: string }> = {
  video_call: { label: 'Video Call', icon: 'fa-solid fa-video'        },
  in_person:  { label: 'In-Person',  icon: 'fa-solid fa-location-dot' },
  chat:       { label: 'Chat',       icon: 'fa-solid fa-comment'      },
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatSlot(slot: string) {
  const [h, m] = slot.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDateShort(dateStr: string) {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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
    const h = Math.floor(cur / 60)
    const m = cur % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    cur += 30
  }
  return slots
}

type LocationState = {
  session?: DietitianSession
  dateLabel?: string
  fromTab?: string
}

export default function DietitianAppointmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { startCall } = useVideoCall()

  const locationState = (location.state ?? {}) as LocationState
  const session   = locationState.session
  const dateLabel = locationState.dateLabel
  const fromTab   = locationState.fromTab ?? 'upcoming'

  const [appt, setAppt] = useState<DietitianAppointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | ''>('')

  const [notes, setNotes] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [rescheduleOpen, setRescheduleOpen]     = useState(false)
  const [rescheduleDate, setRescheduleDate]     = useState('')
  const [rescheduleSlot, setRescheduleSlot]     = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [rescheduling, setRescheduling]         = useState(false)
  const [rescheduleError, setRescheduleError]   = useState<string | null>(null)
  const [availableSlots, setAvailableSlots]     = useState<AppointmentSlot[]>([])
  const [bookedSlots, setBookedSlots]           = useState<AppointmentSlot[]>([])
  const [slotsLoading, setSlotsLoading]         = useState(false)
  const [customTimeMode, setCustomTimeMode]     = useState(false)

  const [markingComplete, setMarkingComplete]   = useState(false)
  const [completeError, setCompleteError]       = useState<string | null>(null)

  const [reviewModalOpen, setReviewModalOpen]   = useState(false)
  const [reviewRating, setReviewRating]         = useState(0)
  const [reviewHover, setReviewHover]           = useState(0)
  const [reviewText, setReviewText]             = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError]           = useState<string | null>(null)
  const [reviews, setReviews]                   = useState<AppointmentReviews | null>(null)

  const [followUpOpen, setFollowUpOpen]           = useState(false)
  const [followUps, setFollowUps]                 = useState<FollowUpAppointment[]>([])
  const [followUpsLoading, setFollowUpsLoading]   = useState(false)
  const [fuDate, setFuDate]                       = useState('')
  const [fuSlot, setFuSlot]                       = useState('')
  const [fuDuration, setFuDuration]               = useState('')
  const [fuFee, setFuFee]                         = useState('')
  const [fuSessionType, setFuSessionType]         = useState<'video_call' | 'in_person' | ''>('')
  const [fuNotes, setFuNotes]                     = useState('')
  const [fuSubmitting, setFuSubmitting]           = useState(false)
  const [fuError, setFuError]                     = useState<string | null>(null)
  const [fuSlots, setFuSlots]                     = useState<AppointmentSlot[]>([])
  const [fuBookedSlots, setFuBookedSlots]         = useState<AppointmentSlot[]>([])
  const [fuSlotsLoading, setFuSlotsLoading]       = useState(false)
  const [fuCustomTime, setFuCustomTime]           = useState(false)
  const [fuShowOverrides, setFuShowOverrides]     = useState(false)

  useEffect(() => {
    if (!appt || appt.status !== 'completed') return
    appointmentApi.getReviews(appt.id)
      .then(data => setReviews(data))
      .catch(() => {})
  }, [appt?.id, appt?.status])

  async function handleSubmitReview() {
    if (!appt || reviewRating === 0) return
    setReviewSubmitting(true)
    setReviewError(null)
    try {
      await appointmentApi.submitReview(appt.id, { rating: reviewRating, review: reviewText })
      const updated = await appointmentApi.getReviews(appt.id)
      setReviews(updated)
      setReviewModalOpen(false)
    } catch (e: any) {
      setReviewError(e.message ?? 'Failed to submit review. Please try again.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  function openReviewModal() {
    setReviewRating(reviews?.reviews?.dietitian?.rating ?? 0)
    setReviewText(reviews?.reviews?.dietitian?.review ?? '')
    setReviewError(null)
    setReviewModalOpen(true)
  }

  async function handleMarkComplete() {
    if (!appt || markingComplete) return
    setMarkingComplete(true)
    setCompleteError(null)
    try {
      await appointmentApi.updateAppointmentStatus(appt.id, 'completed')
      setAppt(prev => prev ? { ...prev, status: 'completed' } : prev)
    } catch (e: any) {
      setCompleteError(e.message ?? 'Failed to mark as completed. Please try again.')
    } finally {
      setMarkingComplete(false)
    }
  }

  function openReschedule() {
    setRescheduleDate(new Date().toLocaleDateString('en-CA'))
    setRescheduleSlot('')
    setRescheduleReason('')
    setRescheduleError(null)
    setCustomTimeMode(false)
    setRescheduleOpen(true)
  }

  useEffect(() => {
    if (!rescheduleOpen || !appt) return
    setSlotsLoading(true)
    setAvailableSlots([])
    setBookedSlots([])
    appointmentApi.getRescheduleSlots(appt.id)
      .then(data => {
        setAvailableSlots(data.available_slots)
        setBookedSlots(data.booked_slots)
      })
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
  }, [rescheduleOpen, appt?.id])

  async function handleReschedule() {
    if (!appt) return
    setRescheduling(true)
    setRescheduleError(null)
    try {
      await appointmentApi.rescheduleAppointment(appt.id, {
        appointment_date: rescheduleDate,
        slot: rescheduleSlot,
        reason: rescheduleReason || undefined,
      })
      setRescheduleOpen(false)
      navigate('/dietitian-appointments', { state: { returnTab: fromTab } })
    } catch (e: any) {
      setRescheduleError(e.message ?? 'Failed to reschedule. Please try again.')
    } finally {
      setRescheduling(false)
    }
  }

  function openFollowUp() {
    setFuDate(new Date().toLocaleDateString('en-CA'))
    setFuSlot('')
    setFuDuration(String(session?.duration ?? ''))
    setFuFee(String(appt?.fee ?? '').replace(/\.00$/, ''))
    setFuSessionType((session?.session_type as 'video_call' | 'in_person' | '') ?? '')
    setFuNotes('')
    setFuError(null)
    setFuCustomTime(false)
    setFuShowOverrides(false)
    setFollowUpOpen(true)
  }

  async function handleScheduleFollowUp() {
    if (!appt) return
    setFuSubmitting(true)
    setFuError(null)
    try {
      const body: CreateFollowUpBody = {
        appointment_date: fuDate,
        slot: fuSlot,
        ...(fuDuration    ? { duration: Number(fuDuration) }          : {}),
        ...(fuFee         ? { fee: Number(fuFee) }                    : {}),
        ...(fuSessionType ? { session_type: fuSessionType }           : {}),
        ...(fuNotes       ? { notes: fuNotes }                        : {}),
      }
      const created = await appointmentApi.scheduleFollowUp(appt.id, body)
      setFollowUps(prev => [...prev, created])
      setFollowUpOpen(false)
    } catch (e: any) {
      setFuError(e.message ?? 'Failed to schedule follow-up. Please try again.')
    } finally {
      setFuSubmitting(false)
    }
  }

  function getUpcomingDatesFrom(slots: AppointmentSlot[]) {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const date = d.toLocaleDateString('en-CA')
      return {
        date,
        dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        hasSlots: (slots.find(s => s.date === date)?.slots?.length ?? 0) > 0,
      }
    })
  }

  function handleNotesChange(val: string) {
    setNotes(val)
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      appointmentApi.saveDietitianNotes(Number(id), val)
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('error'))
    }, 700)
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    appointmentApi.getById(Number(id))
      .then(data => {
        setAppt(data)
        setNotes(data.dietitian_notes ?? '')
      })
      .catch(err => setError(err?.message ?? 'Failed to load appointment'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!appt || !['confirmed', 'completed'].includes(appt.status)) return
    setFollowUpsLoading(true)
    appointmentApi.getFollowUps(appt.id)
      .then(data => setFollowUps(data))
      .catch(() => {})
      .finally(() => setFollowUpsLoading(false))
  }, [appt?.id, appt?.status])

  useEffect(() => {
    if (!followUpOpen || !appt) return
    setFuSlotsLoading(true)
    setFuSlots([])
    setFuBookedSlots([])
    appointmentApi.getRescheduleSlots(appt.id)
      .then(data => {
        setFuSlots(data.available_slots)
        setFuBookedSlots(data.booked_slots)
      })
      .catch(() => {})
      .finally(() => setFuSlotsLoading(false))
  }, [followUpOpen, appt?.id])

  if (loading) {
    return (
      <div className="apd-root">
        <div className="apd-state-box">
          <span className="apd-state-icon">⏳</span>
          <p className="apd-state-text">Loading client details…</p>
        </div>
      </div>
    )
  }

  if (error || !appt) {
    return (
      <div className="apd-root">
        <div className="apd-state-box">
          <span className="apd-state-icon">⚠️</span>
          <p className="apd-state-text">{error ?? 'Appointment not found'}</p>
          <button className="apd-back-btn" onClick={() => navigate('/dietitian-appointments', { state: { returnTab: fromTab } })}>
            <i className="fa-solid fa-arrow-left" /> Back to Appointments
          </button>
        </div>
      </div>
    )
  }

  const meta = STATUS_META[appt.status] ?? { label: appt.status, color: 'blue' }
  const sessionTypeMeta = session?.session_type
    ? (SESSION_TYPE_META[session.session_type] ?? { label: session.session_type, icon: 'fa-solid fa-calendar' })
    : null

  const clientName = session?.client?.name ?? appt.name
  const clientInitials = session?.client?.initials ?? getInitials(appt.name)
  const clientAvatar = appt?.avatar_url ?? session?.client?.avatar_url ?? null

  return (
    <div className="apd-root">

      {/* Top nav */}
      <div className="apd-topbar">
        <button className="apd-back-btn" onClick={() => navigate('/dietitian-appointments', { state: { returnTab: fromTab } })}>
          <i className="fa-solid fa-arrow-left" /> Back to Appointments
        </button>
        <span className={`ap-status ap-status--${meta.color} apd-status-badge`}>{meta.label}</span>
      </div>

      {/* Hero */}
      <div className="apd-hero">
        <div className="apd-hero-avatar">
          {clientAvatar
            ? <img src={clientAvatar} alt={clientName} />
            : clientInitials}
        </div>
        <div className="apd-hero-info">
          <h1 className="apd-hero-name">{clientName}</h1>
          {(dateLabel || appt.appointment_date) && (
            <p className="apd-hero-date">
              <i className="fa-regular fa-calendar" />
              {dateLabel ? `${dateLabel} · ` : ''}{formatDate(appt.appointment_date)}
              {session?.time ? ` · ${session.time}` : appt.slot ? ` · ${formatSlot(appt.slot)}` : ''}
            </p>
          )}
          <div className="apd-hero-contacts">
            {session?.session_number && (
              <span className="apd-contact-chip">
                <i className="fa-solid fa-hashtag" /> Session {session.session_number}
              </span>
            )}
          </div>
        </div>
        <div className="apd-hero-actions">
          {appt.status === 'confirmed' && (
            <>
              <button
                className="apd-hero-btn apd-hero-btn--primary"
                onClick={() => startCall(appt.id, clientName)}
              >
                <i className="fa-solid fa-video" /> Join Call
              </button>
              <button
                className="apd-hero-btn"
                onClick={() => navigate(`/dietitian-diet-plans/new?appointment_id=${appt.id}`)}
              >
                <i className="fa-solid fa-bowl-food" /> Diet Plan
              </button>
              {!appt.follow_up && (
                <button className="apd-hero-btn" onClick={openFollowUp}>
                  <i className="fa-solid fa-calendar-plus" /> Follow-up
                </button>
              )}
              <button
                className="apd-hero-btn apd-hero-btn--green"
                onClick={handleMarkComplete}
                disabled={markingComplete}
              >
                <i className="fa-solid fa-circle-check" />
                {markingComplete ? 'Marking…' : 'Mark Complete'}
              </button>
            </>
          )}
          {appt.status === 'missed' && (
            <button
              className="apd-hero-btn apd-hero-btn--primary"
              onClick={openReschedule}
            >
              <i className="fa-solid fa-rotate-right" /> Reschedule
            </button>
          )}
          {(appt.status === 'completed' || appt.status === 'cancelled') && (
            <>
              <button
                className="apd-hero-btn"
                onClick={() => navigate(`/dietitian-diet-plans/new?appointment_id=${appt.id}`)}
              >
                <i className="fa-solid fa-bowl-food" /> Create Diet Plan
              </button>
              {appt.status === 'completed' && !appt.follow_up && (
                <button className="apd-hero-btn apd-hero-btn--primary" onClick={openFollowUp}>
                  <i className="fa-solid fa-calendar-plus" /> Schedule Follow-up
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="apd-body">

        {/* Left column */}
        <div className="apd-left">

          {/* Appointment details */}
          <div className="apd-section">
            <p className="apd-section-title">
              <i className="fa-regular fa-calendar-days" /> Appointment Details
            </p>
            <div className="apd-info-grid">
              <div className="apd-info-field">
                <span className="apd-info-label">Date</span>
                <span className="apd-info-val">{formatDate(appt.appointment_date)}</span>
              </div>
              <div className="apd-info-field">
                <span className="apd-info-label">Time</span>
                <span className="apd-info-val">
                  {session?.time ?? formatSlot(appt.slot)}
                </span>
              </div>
              {session?.duration && (
                <div className="apd-info-field">
                  <span className="apd-info-label">Duration</span>
                  <span className="apd-info-val">{session.duration} min</span>
                </div>
              )}
              {sessionTypeMeta && (
                <div className="apd-info-field">
                  <span className="apd-info-label">Session Type</span>
                  <span className="apd-info-val">
                    <i className={sessionTypeMeta.icon} style={{ marginRight: 5 }} />
                    {sessionTypeMeta.label}
                  </span>
                </div>
              )}
              <div className="apd-info-field">
                <span className="apd-info-label">Status</span>
                <span className={`apd-status-badge-val apd-status-badge-val--${meta.color}`}>{meta.label}</span>
              </div>
              <div className="apd-info-field">
                <span className="apd-info-label">Payment</span>
                <span className="apd-info-val" style={{ textTransform: 'capitalize' }}>{appt.payment_status}</span>
              </div>
              <div className="apd-info-field">
                <span className="apd-info-label">Fee</span>
                <span className="apd-info-val">₹{Number(appt.fee).toLocaleString('en-IN')} {appt.currency}</span>
              </div>
              {appt.follow_up && (
                <div className="apd-info-field" style={{ gridColumn: '1 / -1' }}>
                  <span className="apd-info-label">Follow-up</span>
                  <span className="apd-info-val apd-fu-inline">
                    <i className="fa-solid fa-calendar-plus" />
                    {formatDateShort(appt.follow_up.date)} · {formatSlot(appt.follow_up.slot)}
                    <span className={`ap-status ap-status--${STATUS_META[appt.follow_up.status]?.color ?? 'blue'}`} style={{ marginLeft: 6 }}>
                      {STATUS_META[appt.follow_up.status]?.label ?? appt.follow_up.status}
                    </span>
                  </span>
                </div>
              )}
              {session?.session_number && (
                <div className="apd-info-field">
                  <span className="apd-info-label">Session #</span>
                  <span className="apd-info-val">{session.session_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Client's booking note */}
          {appt.notes && (
            <div className="apd-section">
              <p className="apd-section-title">
                <i className="fa-solid fa-quote-left" /> Client's Booking Note
              </p>
              <p className="apd-booking-note">{appt.notes}</p>
            </div>
          )}

          {/* Quick actions */}
          <div className="apd-section">
            <p className="apd-section-title">
              <i className="fa-solid fa-bolt" /> Quick Actions
            </p>
            <div className="apd-actions-list">
              {appt.status === 'confirmed' && (
                <>
                  <button
                    className="apd-action-row apd-action-row--primary"
                    onClick={() => startCall(appt.id, clientName)}
                  >
                    <span className="apd-action-icon"><i className="fa-solid fa-video" /></span>
                    <span className="apd-action-label">Join Video Call</span>
                    <i className="fa-solid fa-chevron-right apd-action-arrow" />
                  </button>
                  <button
                    className="apd-action-row"
                    onClick={() => navigate(`/dietitian-diet-plans/new?appointment_id=${appt.id}`)}
                  >
                    <span className="apd-action-icon"><i className="fa-solid fa-bowl-food" /></span>
                    <span className="apd-action-label">Create Diet Plan</span>
                    <i className="fa-solid fa-chevron-right apd-action-arrow" />
                  </button>
                  {/* <button className="apd-action-row">
                    <span className="apd-action-icon"><i className="fa-solid fa-paper-plane" /></span>
                    <span className="apd-action-label">Send Message</span>
                    <i className="fa-solid fa-chevron-right apd-action-arrow" />
                  </button> */}
                  <button
                    className="apd-action-row"
                    onClick={openReschedule}
                  >
                    <span className="apd-action-icon"><i className="fa-solid fa-rotate-right" /></span>
                    <span className="apd-action-label">Reschedule Session</span>
                    <i className="fa-solid fa-chevron-right apd-action-arrow" />
                  </button>
                  {!appt.follow_up && (
                    <button className="apd-action-row" onClick={openFollowUp}>
                      <span className="apd-action-icon"><i className="fa-solid fa-calendar-plus" /></span>
                      <span className="apd-action-label">Schedule Follow-up</span>
                      <i className="fa-solid fa-chevron-right apd-action-arrow" />
                    </button>
                  )}
                  <button
                    className="apd-action-row apd-action-row--green"
                    onClick={handleMarkComplete}
                    disabled={markingComplete}
                  >
                    <span className="apd-action-icon"><i className="fa-solid fa-circle-check" /></span>
                    <span className="apd-action-label">{markingComplete ? 'Marking as Completed…' : 'Mark as Completed'}</span>
                    <i className="fa-solid fa-chevron-right apd-action-arrow" />
                  </button>
                  {completeError && (
                    <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0 8px' }}>{completeError}</p>
                  )}
                </>
              )}
              {(appt.status === 'completed' || appt.status === 'cancelled') && (
                <>
                  <button
                    className="apd-action-row"
                    onClick={() => navigate(`/dietitian-diet-plans/new?appointment_id=${appt.id}`)}
                  >
                    <span className="apd-action-icon"><i className="fa-solid fa-bowl-food" /></span>
                    <span className="apd-action-label">Create Diet Plan</span>
                    <i className="fa-solid fa-chevron-right apd-action-arrow" />
                  </button>
                  <button className="apd-action-row apd-action-row--primary">
                    <span className="apd-action-icon"><i className="fa-solid fa-rotate-right" /></span>
                    <span className="apd-action-label">Rebook Session</span>
                    <i className="fa-solid fa-chevron-right apd-action-arrow" />
                  </button>
                  {appt.status === 'completed' && !appt.follow_up && (
                    <button className="apd-action-row" onClick={openFollowUp}>
                      <span className="apd-action-icon"><i className="fa-solid fa-calendar-plus" /></span>
                      <span className="apd-action-label">Schedule Follow-up</span>
                      <i className="fa-solid fa-chevron-right apd-action-arrow" />
                    </button>
                  )}
                  {appt.status === 'completed' && !reviews?.dietitian_review_done && (
                    <button
                      className="apd-action-row"
                      onClick={openReviewModal}
                    >
                      <span className="apd-action-icon"><i className="fa-solid fa-star" /></span>
                      <span className="apd-action-label">Rate This Session</span>
                      <i className="fa-solid fa-chevron-right apd-action-arrow" />
                    </button>
                  )}
                </>
              )}
              {appt.status === 'missed' && (
                <>
                  <button
                    className="apd-action-row apd-action-row--primary"
                    onClick={openReschedule}
                  >
                    <span className="apd-action-icon"><i className="fa-solid fa-rotate-right" /></span>
                    <span className="apd-action-label">Reschedule Session</span>
                    <i className="fa-solid fa-chevron-right apd-action-arrow" />
                  </button>
                  {/* <button className="apd-action-row">
                    <span className="apd-action-icon"><i className="fa-solid fa-paper-plane" /></span>
                    <span className="apd-action-label">Send Message</span>
                    <i className="fa-solid fa-chevron-right apd-action-arrow" />
                  </button> */}
                </>
              )}
              {appt.status === 'pending' && (
                <button
                  className="apd-action-row"
                  onClick={() => navigate(`/dietitian-diet-plans/new?appointment_id=${appt.id}`)}
                >
                  <span className="apd-action-icon"><i className="fa-solid fa-bowl-food" /></span>
                  <span className="apd-action-label">Prepare Diet Plan</span>
                  <i className="fa-solid fa-chevron-right apd-action-arrow" />
                </button>
              )}
            </div>
          </div>

          {/* Follow-up Sessions */}
          {(appt.status === 'confirmed' || appt.status === 'completed') && (
            <div className="apd-section">
              <div className="apd-fu-section-header">
                <p className="apd-section-title" style={{ marginBottom: 0 }}>
                  <i className="fa-solid fa-calendar-plus" /> Follow-up Sessions
                  {appt.follow_up && (
                    <span className={`ap-status ap-status--${STATUS_META[appt.follow_up.status]?.color ?? 'blue'}`} style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                      {STATUS_META[appt.follow_up.status]?.label ?? appt.follow_up.status}
                    </span>
                  )}
                </p>
                {!appt.follow_up && (
                  <button className="apd-fu-add-btn" onClick={openFollowUp}>
                    <i className="fa-solid fa-plus" /> Schedule
                  </button>
                )}
              </div>
              {followUpsLoading ? (
                <p className="apd-fu-loading"><i className="fa-solid fa-circle-notch fa-spin" /> Loading…</p>
              ) : followUps.length === 0 ? (
                <p className="apd-fu-empty">No follow-up sessions scheduled yet</p>
              ) : (
                followUps.map(fu => {
                  const fuMeta     = STATUS_META[fu.status] ?? { label: fu.status, color: 'blue' }
                  const fuTypeMeta = SESSION_TYPE_META[fu.session_type] ?? null
                  return (
                    <div key={fu.id} className="apd-fu-card">
                      <div className={`apd-fu-accent apd-fu-accent--${fuMeta.color}`} />
                      <div className="apd-fu-body">
                        <div className="apd-fu-top">
                          <span className="apd-fu-date">
                            <i className="fa-regular fa-calendar" /> {formatDate(fu.appointment_date)} · {formatSlot(fu.slot)}
                          </span>
                          <span className={`ap-status ap-status--${fuMeta.color}`}>{fuMeta.label}</span>
                        </div>
                        <div className="apd-fu-meta">
                          {fuTypeMeta && <span><i className={fuTypeMeta.icon} /> {fuTypeMeta.label}</span>}
                          <span><i className="fa-solid fa-indian-rupee-sign" /> {Number(fu.fee).toLocaleString('en-IN')}</span>
                          {fu.duration > 0 && <span><i className="fa-regular fa-clock" /> {fu.duration} min</span>}
                        </div>
                        {fu.notes && <p className="apd-fu-notes">{fu.notes}</p>}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Reviews — only for completed */}
          {appt.status === 'completed' && reviews && (
            <div className="apd-section">
              <p className="apd-section-title">
                <i className="fa-solid fa-star" /> Ratings & Reviews
              </p>

              {/* Client's review */}
              <div className="apd-review-card">
                <div className="apd-review-card-header">
                  <span className="apd-review-who">
                    <i className="fa-solid fa-user" /> Client Review
                  </span>
                  {reviews.user_review_done && reviews.reviews.user ? (
                    <div className="apd-review-stars">
                      {[1,2,3,4,5].map(s => (
                        <i key={s} className={`fa-solid fa-star${s <= reviews.reviews.user!.rating ? ' apd-star--filled' : ' apd-star--empty'}`} />
                      ))}
                    </div>
                  ) : (
                    <span className="apd-review-pending">Not reviewed yet</span>
                  )}
                </div>
                {reviews.user_review_done && reviews.reviews.user?.review && (
                  <p className="apd-review-text">"{reviews.reviews.user.review}"</p>
                )}
              </div>

              {/* Dietitian's own review */}
              <div className="apd-review-card" style={{ marginTop: 10 }}>
                <div className="apd-review-card-header">
                  <span className="apd-review-who">
                    <i className="fa-solid fa-user-doctor" /> Your Review
                  </span>
                  {reviews.dietitian_review_done && reviews.reviews.dietitian ? (
                    <div className="apd-review-stars">
                      {[1,2,3,4,5].map(s => (
                        <i key={s} className={`fa-solid fa-star${s <= reviews.reviews.dietitian!.rating ? ' apd-star--filled' : ' apd-star--empty'}`} />
                      ))}
                    </div>
                  ) : (
                    <button className="apd-review-add-btn" onClick={openReviewModal}>
                      <i className="fa-solid fa-plus" /> Add your review
                    </button>
                  )}
                </div>
                {reviews.dietitian_review_done && reviews.reviews.dietitian?.review && (
                  <p className="apd-review-text">"{reviews.reviews.dietitian.review}"</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right column — scratchpad */}
        <div className="apd-right">
          <div className="apd-section apd-scratchpad-section">
            <div className="apd-scratchpad-header">
              <p className="apd-section-title" style={{ marginBottom: 0 }}>
                <i className="fa-solid fa-pen-to-square" /> My Notes
              </p>
              <span className="apd-notes-private-tag">
                <i className="fa-solid fa-lock" /> Only you can see this
              </span>
            </div>
            <p className="apd-scratchpad-hint">
              Use this as your digital notepad — symptoms, diet history, food preferences, clinical observations, follow-up reminders, anything.
            </p>
            <textarea
              className="apd-scratchpad"
              placeholder={`Notes for ${clientName}…\n\nE.g.:\n- Prefers vegetarian meals\n- Reports low energy in mornings\n- Follow up on iron levels next session\n- Allergic to peanuts`}
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
            />
            <p className="apd-save-status">
              {saveStatus === 'saving' && <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</>}
              {saveStatus === 'saved'  && <><i className="fa-solid fa-check" style={{ color: 'var(--green)' }} /> Saved to your account</>}
              {saveStatus === 'error'  && <><i className="fa-solid fa-triangle-exclamation" style={{ color: '#dc2626' }} /> Failed to save — check your connection</>}
              {saveStatus === ''       && notes && <><i className="fa-solid fa-cloud" style={{ color: 'var(--green)' }} /> Saved to your account</>}
              {saveStatus === ''       && !notes && <><i className="fa-regular fa-keyboard" /> Start typing to save notes</>}
            </p>
          </div>
        </div>

      </div>

      {/* ── Review Modal ── */}
      {reviewModalOpen && appt && (
        <div className="cr-modal-overlay" onClick={() => setReviewModalOpen(false)}>
          <div className="cr-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="cr-modal-header">
              <h3 className="cr-modal-title"><i className="fa-solid fa-star" /> Rate This Session</h3>
              <button className="cr-detail-close" onClick={() => setReviewModalOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="cr-modal-client">
              <div className="cr-avatar">
                {clientAvatar
                  ? <img src={clientAvatar} alt={clientName} />
                  : clientInitials}
              </div>
              <div>
                <p className="cr-modal-client-name">{clientName}</p>
                <p className="cr-modal-client-orig">{formatDate(appt.appointment_date)}</p>
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
              <button className="cr-btn-detail" onClick={() => setReviewModalOpen(false)}>Cancel</button>
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

      {/* ── Follow-up Modal ── */}
      {followUpOpen && appt && (
        <div className="cr-modal-overlay" onClick={() => setFollowUpOpen(false)}>
          <div className="cr-modal" onClick={e => e.stopPropagation()}>
            <div className="cr-modal-header">
              <h3 className="cr-modal-title"><i className="fa-solid fa-calendar-plus" /> Schedule Follow-up</h3>
              <button className="cr-detail-close" onClick={() => setFollowUpOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Client info */}
            <div className="cr-modal-client">
              <div className="cr-avatar">
                {clientAvatar
                  ? <img src={clientAvatar} alt={clientName} />
                  : clientInitials}
              </div>
              <div>
                <p className="cr-modal-client-name">{clientName}</p>
                <p className="cr-modal-client-orig">
                  Parent: {formatDateShort(appt.appointment_date)} · {formatSlot(appt.slot)}
                </p>
              </div>
            </div>

            {/* Date chips */}
            <div className="cr-rsc-section">
              <span className="cr-modal-label" style={{ marginBottom: 8, display: 'block' }}>Select Date</span>
              <div className="cr-rsc-date-row">
                {getUpcomingDatesFrom(fuSlots).map(d => (
                  <button
                    key={d.date}
                    className={[
                      'cr-rsc-date-chip',
                      fuDate === d.date ? 'cr-rsc-date-chip--active' : '',
                      !d.hasSlots      ? 'cr-rsc-date-chip--empty'  : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => {
                      setFuCustomTime(false)
                      setFuDate(d.date)
                      setFuSlot('')
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
                      setFuCustomTime(false)
                      setFuDate(e.target.value)
                      setFuSlot('')
                    }}
                  />
                </label>
              </div>
              {fuDate && !getUpcomingDatesFrom(fuSlots).find(d => d.date === fuDate) && (
                <div className="cr-rsc-custom-date-pill">
                  <i className="fa-regular fa-calendar-check" />
                  {formatDateShort(fuDate)}
                </div>
              )}
            </div>

            {/* Slot picker */}
            {fuDate && (
              <div className="cr-rsc-section">
                {fuSlotsLoading ? (
                  <p className="cr-rsc-loading">
                    <i className="fa-solid fa-circle-notch fa-spin" /> Loading available slots…
                  </p>
                ) : (() => {
                  const rawRanges = fuSlots.find(s => s.date === fuDate)?.slots ?? []
                  const available = rawRanges.flatMap(r => r.includes('-') ? expandSlotRange(r) : [r])
                  const booked    = fuBookedSlots.find(s => s.date === fuDate)?.slots ?? []
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
                              const isPast     = isPastSlot(fuDate, slot)
                              const isDisabled = isBooked || isPast
                              const isSelected = !fuCustomTime && fuSlot === slot
                              return (
                                <button
                                  key={slot}
                                  disabled={isDisabled}
                                  className={[
                                    'cr-rsc-slot',
                                    isBooked            ? 'cr-rsc-slot--booked' : '',
                                    isPast && !isBooked ? 'cr-rsc-slot--past'   : '',
                                    isSelected          ? 'cr-rsc-slot--active' : '',
                                  ].filter(Boolean).join(' ')}
                                  onClick={() => {
                                    setFuCustomTime(false)
                                    setFuSlot(slot)
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
                      {allSlots.length === 0 && !fuCustomTime && (
                        <p className="cr-rsc-no-slots">
                          <i className="fa-regular fa-calendar-xmark" /> No scheduled slots for this date — use custom time below
                        </p>
                      )}
                      <div className={`cr-rsc-custom-row${fuCustomTime ? ' cr-rsc-custom-row--open' : ''}`}>
                        <button
                          className={`cr-rsc-custom-toggle${fuCustomTime ? ' cr-rsc-custom-toggle--active' : ''}`}
                          onClick={() => {
                            const next = !fuCustomTime
                            setFuCustomTime(next)
                            if (next) setFuSlot('')
                          }}
                        >
                          <i className={`fa-solid ${fuCustomTime ? 'fa-xmark' : 'fa-clock'}`} />
                          {fuCustomTime ? 'Cancel custom time' : 'Book at a different time'}
                        </button>
                        {fuCustomTime && (
                          <input
                            type="time"
                            className="cr-modal-input cr-rsc-time-input"
                            value={fuSlot}
                            onChange={e => setFuSlot(e.target.value)}
                            autoFocus
                          />
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            )}

            {/* Optional overrides */}
            <div className="apd-fu-overrides">
              <button
                className={`apd-fu-overrides-toggle${fuShowOverrides ? ' apd-fu-overrides-toggle--open' : ''}`}
                type="button"
                onClick={() => setFuShowOverrides(p => !p)}
              >
                <i className={`fa-solid fa-chevron-${fuShowOverrides ? 'up' : 'down'}`} />
                {fuShowOverrides ? 'Hide' : 'Customize'} session defaults
              </button>
              {fuShowOverrides && (
                <div className="apd-fu-override-grid">
                  <div>
                    <label className="cr-modal-label" style={{ display: 'block', marginBottom: 6 }}>Session Type</label>
                    <div className="apd-fu-session-btns">
                      {(['video_call', 'in_person'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          className={`apd-fu-session-btn${fuSessionType === t ? ' apd-fu-session-btn--active' : ''}`}
                          onClick={() => setFuSessionType(prev => prev === t ? '' : t)}
                        >
                          <i className={SESSION_TYPE_META[t].icon} /> {SESSION_TYPE_META[t].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="cr-modal-fields" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
                    <div className="cr-modal-field">
                      <label className="cr-modal-label">Duration (min)</label>
                      <input
                        type="number"
                        className="cr-modal-input"
                        min={15}
                        step={15}
                        placeholder={String(session?.duration ?? 30)}
                        value={fuDuration}
                        onChange={e => setFuDuration(e.target.value)}
                      />
                    </div>
                    <div className="cr-modal-field">
                      <label className="cr-modal-label">Fee (₹)</label>
                      <input
                        type="number"
                        className="cr-modal-input"
                        min={0}
                        placeholder={String(appt.fee).replace(/\.00$/, '')}
                        value={fuFee}
                        onChange={e => setFuFee(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="cr-modal-label" style={{ display: 'block', marginBottom: 6 }}>
                Notes{' '}
                <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                type="text"
                className="cr-modal-input"
                placeholder="e.g. Review blood report, check weight progress…"
                value={fuNotes}
                onChange={e => setFuNotes(e.target.value)}
              />
            </div>

            {fuError && (
              <p className="cr-modal-error">
                <i className="fa-solid fa-triangle-exclamation" /> {fuError}
              </p>
            )}

            <div className="cr-modal-actions">
              <button className="cr-btn-detail" onClick={() => setFollowUpOpen(false)}>Cancel</button>
              <button
                className="cr-btn-reschedule"
                disabled={fuSubmitting || !fuDate || !fuSlot}
                onClick={handleScheduleFollowUp}
                style={{ padding: '9px 20px', fontSize: 13 }}
              >
                {fuSubmitting
                  ? <><i className="fa-solid fa-circle-notch fa-spin" /> Scheduling…</>
                  : <><i className="fa-solid fa-calendar-plus" /> Confirm Follow-up</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reschedule Modal ── */}
      {rescheduleOpen && appt && (
        <div className="cr-modal-overlay" onClick={() => setRescheduleOpen(false)}>
          <div className="cr-modal" onClick={e => e.stopPropagation()}>
            <div className="cr-modal-header">
              <h3 className="cr-modal-title"><i className="fa-solid fa-rotate-right" /> Reschedule Session</h3>
              <button className="cr-detail-close" onClick={() => setRescheduleOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Client info */}
            <div className="cr-modal-client">
              <div className="cr-avatar cr-avatar--missed">
                {clientAvatar
                  ? <img src={clientAvatar} alt={clientName} />
                  : clientInitials}
              </div>
              <div>
                <p className="cr-modal-client-name">{clientName}</p>
                <p className="cr-modal-client-orig">
                  Original: {formatDateShort(appt.appointment_date)} · {formatSlot(appt.slot)}
                </p>
              </div>
            </div>

            {/* Date chips */}
            <div className="cr-rsc-section">
              <span className="cr-modal-label" style={{ marginBottom: 8, display: 'block' }}>Select Date</span>
              <div className="cr-rsc-date-row">
                {getUpcomingDatesFrom(availableSlots).map(d => (
                  <button
                    key={d.date}
                    className={[
                      'cr-rsc-date-chip',
                      rescheduleDate === d.date ? 'cr-rsc-date-chip--active' : '',
                      !d.hasSlots ? 'cr-rsc-date-chip--empty' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => {
                      setCustomTimeMode(false)
                      setRescheduleDate(d.date)
                      setRescheduleSlot('')
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
                      setRescheduleDate(e.target.value)
                      setRescheduleSlot('')
                    }}
                  />
                </label>
              </div>
              {rescheduleDate && !getUpcomingDatesFrom(availableSlots).find(d => d.date === rescheduleDate) && (
                <div className="cr-rsc-custom-date-pill">
                  <i className="fa-regular fa-calendar-check" />
                  {formatDateShort(rescheduleDate)}
                </div>
              )}
            </div>

            {/* Slot picker */}
            {rescheduleDate && (
              <div className="cr-rsc-section">
                {slotsLoading ? (
                  <p className="cr-rsc-loading">
                    <i className="fa-solid fa-circle-notch fa-spin" /> Loading available slots…
                  </p>
                ) : (() => {
                  const rawRanges = availableSlots.find(s => s.date === rescheduleDate)?.slots ?? []
                  const available = rawRanges.flatMap(r => r.includes('-') ? expandSlotRange(r) : [r])
                  const booked    = bookedSlots.find(s => s.date === rescheduleDate)?.slots ?? []
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
                              const isPast     = isPastSlot(rescheduleDate, slot)
                              const isDisabled = isBooked || isPast
                              const isSelected = !customTimeMode && rescheduleSlot === slot
                              return (
                                <button
                                  key={slot}
                                  disabled={isDisabled}
                                  className={[
                                    'cr-rsc-slot',
                                    isBooked            ? 'cr-rsc-slot--booked' : '',
                                    isPast && !isBooked ? 'cr-rsc-slot--past'   : '',
                                    isSelected          ? 'cr-rsc-slot--active' : '',
                                  ].filter(Boolean).join(' ')}
                                  onClick={() => {
                                    setCustomTimeMode(false)
                                    setRescheduleSlot(slot)
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
                            if (next) setRescheduleSlot('')
                          }}
                        >
                          <i className={`fa-solid ${customTimeMode ? 'fa-xmark' : 'fa-clock'}`} />
                          {customTimeMode ? 'Cancel custom time' : 'Book at a different time'}
                        </button>
                        {customTimeMode && (
                          <input
                            type="time"
                            className="cr-modal-input cr-rsc-time-input"
                            value={rescheduleSlot}
                            onChange={e => setRescheduleSlot(e.target.value)}
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
                value={rescheduleReason}
                onChange={e => setRescheduleReason(e.target.value)}
              />
            </div>

            {rescheduleError && (
              <p className="cr-modal-error">
                <i className="fa-solid fa-triangle-exclamation" /> {rescheduleError}
              </p>
            )}

            <div className="cr-modal-actions">
              <button className="cr-btn-detail" onClick={() => setRescheduleOpen(false)}>Cancel</button>
              <button
                className="cr-btn-reschedule"
                disabled={rescheduling || !rescheduleDate || !rescheduleSlot}
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
