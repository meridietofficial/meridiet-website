import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dietitianApi from '../api/dietitian'
import type { DietitianCard } from '../api/dietitian'
import appointmentApi from '../api/appointment'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`
}

function toMins(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function expandSlots(ranges: string[]): { start: string; end: string }[] {
  const SLOT_STEP = 30
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (mins: number) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`
  const out: { start: string; end: string }[] = []
  for (const r of ranges) {
    const [s, e] = r.split('-')
    if (!s || !e) continue
    let cur = toMins(s)
    const end = toMins(e)
    while (cur + SLOT_STEP <= end) {
      out.push({ start: fmt(cur), end: fmt(cur + SLOT_STEP) })
      cur += SLOT_STEP
    }
  }
  return out
}


function getTodayISO() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

// A slot is past if its start time has already passed today (or the date is in the past)
function isSlotPast(slotStart: string, dateISO: string): boolean {
  const today = getTodayISO()
  if (dateISO < today) return true
  if (dateISO > today) return false
  const nowM = new Date().getHours() * 60 + new Date().getMinutes()
  return toMins(slotStart) < nowM
}

const Skeleton = () => (
  <main className="dp-page">
    <div className="container">
      <div className="dp-sk-back" />
      <div className="dp-layout">
        <div className="dp-left">
          <div className="dp-profile-card dp-sk-card">
            <div className="dp-sk dp-sk-avatar" />
            <div className="dp-sk-info">
              <div className="dp-sk dp-sk-line dp-sk-line--xl" />
              <div className="dp-sk dp-sk-line dp-sk-line--lg" />
              <div className="dp-sk dp-sk-line dp-sk-line--md" />
            </div>
          </div>
          {['About', 'Specializations', 'Languages'].map(s => (
            <div key={s} className="dp-section">
              <div className="dp-sk dp-sk-line dp-sk-line--sm" style={{ marginBottom: 12 }} />
              <div className="dp-sk dp-sk-line dp-sk-line--xl" />
              <div className="dp-sk dp-sk-line dp-sk-line--lg" style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
        <aside className="dp-right">
          <div className="dp-booking-card">
            <div className="dp-sk dp-sk-line dp-sk-line--md" style={{ marginBottom: 12 }} />
            <div className="dp-sk dp-sk-line dp-sk-line--xl" />
            <div className="dp-sk dp-sk-btn" style={{ marginTop: 24 }} />
          </div>
        </aside>
      </div>
    </div>
  </main>
)

const FALLBACK_FEE = 2499

export default function DietitianProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [d, setD] = useState<DietitianCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [fee, setFee] = useState(FALLBACK_FEE)

  const [showAuthGate, setShowAuthGate] = useState(false)
  const [pendingBook, setPendingBook] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingDone, setBookingDone] = useState(false)
  const [confirmedLabel, setConfirmedLabel] = useState('')

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return }
    dietitianApi.getDietitianById(Number(id))
      .then(data => { setD(data); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  useEffect(() => {
    dietitianApi.getConsultationFee()
      .then(amount => { if (amount > 0) setFee(amount) })
      .catch(() => {})
  }, [])

  const handleBook = async (currentD: DietitianCard, date: typeof currentD.available_dates[0], slot: string) => {
    if (!user) { setShowAuthGate(true); return }
    setSubmitting(true)
    setBookingError('')
    const consultFee = (currentD.appointment_fee != null && currentD.appointment_fee > 0) ? currentD.appointment_fee : fee
    try {
      const expanded = expandSlots(date.slots)
      const slotObj = expanded.find(s => s.start === slot)
      const order = await appointmentApi.createOrder({
        dietitian_id: currentD.id,
        appointment_date: date.date,
        slot,
        name: user.full_name ?? '',
        email: user.email || undefined,
        phone: user.phone_number || undefined,
        fee: consultFee,
      })
      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount * 100,
        currency: order.currency ?? 'INR',
        order_id: order.order_id,
        name: 'MeriDiet',
        description: `Consultation with ${currentD.full_name}`,
        image: '/logo.png',
        prefill: { name: user.full_name ?? '', email: user.email ?? '', contact: user.phone_number ?? '' },
        theme: { color: '#006B28' },
        handler: async (rzpRes) => {
          try {
            const result = await appointmentApi.verify({
              razorpay_order_id: rzpRes.razorpay_order_id,
              razorpay_payment_id: rzpRes.razorpay_payment_id,
              razorpay_signature: rzpRes.razorpay_signature,
            })
            const slotDisplay = slotObj
              ? `${fmtTime(result.slot)} – ${fmtTime(slotObj.end)}`
              : fmtTime(result.slot)
            setConfirmedLabel(`${shortDateStr(result.appointment_date)} · ${slotDisplay}`)
            setBookingDone(true)
          } catch {
            setBookingError('Payment received but confirmation failed. Please contact support.')
          } finally {
            setSubmitting(false)
          }
        },
        modal: {
          ondismiss: async () => {
            try { await appointmentApi.failed(order.order_id) } catch {}
            setBookingError('Payment cancelled — your slot is still available, try again anytime.')
            setSubmitting(false)
          },
        },
      })
      rzp.open()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? ''
      setBookingError(
        msg.toLowerCase().includes('already booked')
          ? 'This slot was just taken. Please pick another time.'
          : 'Failed to initiate payment. Please try again.'
      )
      setSubmitting(false)
    }
  }

  // After login completes, auto-trigger booking
  useEffect(() => {
    if (pendingBook && user && d) {
      const date = d.available_dates[selectedDate]
      if (date && selectedSlot) {
        setPendingBook(false)
        handleBook(d, date, selectedSlot)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingBook])

  if (loading) return <Skeleton />

  if (notFound || !d) {
    return (
      <main className="dp-page">
        <div className="container dp-not-found">
          <p>Dietitian not found.</p>
          <button className="dp-back-btn" onClick={() => navigate('/consult-dietitian')}>← Back to Dietitians</button>
        </div>
      </main>
    )
  }

  const isVerified = d.is_verified === true || d.is_verified === 1
  const availDates = d.available_dates ?? []
  const currentDate = availDates[selectedDate]
  const slots = expandSlots(currentDate?.slots ?? [])
  const selectedSlotObj = slots.find(s => s.start === selectedSlot)

  function parseDateParts(iso: string) {
    // Always parse from the date portion (YYYY-MM-DD) to avoid timezone shifts
    const datePart = iso.slice(0, 10)
    const [y, m, d] = datePart.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    return { day: dt.getDate(), month: dt.toLocaleDateString('en-IN', { month: 'short' }) }
  }
  function shortDateStr(iso: string) {
    const { day, month } = parseDateParts(iso)
    return `${day} ${month}`
  }

  return (
    <>
    {bookingDone && (
      <div className="cm-backdrop">
        <div className="cm-dialog cm-dialog--success" role="dialog" aria-modal="true">
          <div className="cm-success">
            <div className="cm-success-check">✓</div>
            <h3 className="cm-success-title">Appointment Confirmed!</h3>
            <p className="cm-success-text">
              Your consultation with <strong>{d.full_name}</strong>
              {confirmedLabel ? <> for <strong>{confirmedLabel}</strong></> : ''} is confirmed.
              You'll receive a confirmation shortly.
            </p>
            <button className="cm-primary-btn" onClick={() => { setBookingDone(false); setSelectedSlot(null) }}>Done</button>
          </div>
        </div>
      </div>
    )}
    <main className="dp-page">
      <div className="container">

        <button className="dp-back-btn" onClick={() => navigate('/consult-dietitian')}>
          ← Back to Dietitians
        </button>

        <div className="dp-layout">

          {/* ── Left column ── */}
          <div className="dp-left">

            {/* Profile header card */}
            <div className="dp-profile-card">
              <div className="dp-avatar">
                {d.avatar_url
                  ? <img src={d.avatar_url} alt={d.full_name} />
                  : <span className="dp-initials">{getInitials(d.full_name)}</span>
                }
              </div>
              <div className="dp-header-info">
                <div className="dp-name-row">
                  <h1 className="dp-name">
                    {d.full_name}
                    {isVerified && <span className="dp-verified">✓</span>}
                  </h1>
                  <span className={`cd-avail-badge ${d.availability === 'online' ? 'ds-avail--online' : 'ds-avail--offline'}`}>
                    {d.availability === 'online' ? 'Available Online' : 'Available Offline'}
                  </span>
                </div>
                <p className="dp-title">{d.title}</p>
                <div className="dp-rating-row">
                  <span className="dp-stars">
                    {'★'.repeat(Math.round(d.rating))}{'☆'.repeat(5 - Math.round(d.rating))}
                  </span>
                  <span className="dp-rating-num">{d.rating > 0 ? d.rating.toFixed(1) : '—'}</span>
                  {d.reviews > 0 && <span className="dp-rating-count">({d.reviews} reviews)</span>}
                </div>
                <div className="dp-quick-stats">
                  <div className="dp-stat">
                    <span className="dp-stat-icon">⏱</span>
                    <div>
                      <p className="dp-stat-val">{d.experience ?? '—'}</p>
                      <p className="dp-stat-label">Experience</p>
                    </div>
                  </div>
                  <div className="dp-stat-divider" />
                  <div className="dp-stat">
                    <span className="dp-stat-icon">📍</span>
                    <div>
                      <p className="dp-stat-val">{d.city ?? d.location?.split(',')[0] ?? '—'}</p>
                      <p className="dp-stat-label">{d.state ?? 'Location'}</p>
                    </div>
                  </div>
                  {d.gender && (
                    <>
                      <div className="dp-stat-divider" />
                      <div className="dp-stat">
                        <span className="dp-stat-icon">👤</span>
                        <div>
                          <p className="dp-stat-val">{d.gender}</p>
                          <p className="dp-stat-label">Gender</p>
                        </div>
                      </div>
                    </>
                  )}
                  {(d.consultations ?? 0) > 0 && (
                    <>
                      <div className="dp-stat-divider" />
                      <div className="dp-stat">
                        <span className="dp-stat-icon">🩺</span>
                        <div>
                          <p className="dp-stat-val">{d.consultations}+</p>
                          <p className="dp-stat-label">Consultations</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            {d.about && (
              <div className="dp-section">
                <h2 className="dp-section-title">About</h2>
                <p className="dp-about-text">{d.about}</p>
              </div>
            )}

            {/* Specializations */}
            {d.specialization?.length > 0 && (
              <div className="dp-section">
                <h2 className="dp-section-title">Specializations</h2>
                <div className="dp-tags">
                  {d.specialization.map(s => (
                    <span key={s} className="cd-tag dp-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {(d.services?.length ?? 0) > 0 && (
              <div className="dp-section">
                <h2 className="dp-section-title">Services Offered</h2>
                <div className="dp-services">
                  {d.services!.map(s => (
                    <div key={s} className="dp-service-item">
                      <span className="dp-service-dot" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {d.languages?.length > 0 && (
              <div className="dp-section">
                <h2 className="dp-section-title">Languages</h2>
                <div className="dp-tags">
                  {d.languages.map(l => (
                    <span key={l} className="dp-lang-chip">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {(d.education?.length ?? 0) > 0 && (
              <div className="dp-section">
                <h2 className="dp-section-title">Education</h2>
                <div className="dp-edu-list">
                  {d.education!.map((e, i) => (
                    <div key={i} className="dp-edu-item">
                      <div className="dp-edu-icon">🎓</div>
                      <div className="dp-edu-info">
                        <p className="dp-edu-degree">{e.degree}</p>
                        <p className="dp-edu-institute">{e.institute}</p>
                        {e.year && <p className="dp-edu-year">Class of {e.year}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {(d.awards?.length ?? 0) > 0 && (
              <div className="dp-section">
                <h2 className="dp-section-title">Awards & Recognition</h2>
                <div className="dp-edu-list">
                  {d.awards!.map((a, i) => (
                    <div key={i} className="dp-edu-item">
                      <div className="dp-edu-icon">🏆</div>
                      <div className="dp-edu-info">
                        <p className="dp-edu-degree">{a.title}</p>
                        {a.organization && <p className="dp-edu-institute">{a.organization}</p>}
                        {a.year && <p className="dp-edu-year">{a.year}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── Right sticky column ── */}
          <aside className="dp-right">
            <div className="dp-booking-card">

              {/* Fee */}
              {(d.appointment_fee ?? 0) > 0 && (
                <div className="dp-fee-row">
                  <div>
                    <p className="dp-fee-label">Consultation Fee</p>
                    <p className="dp-fee-amount">₹{d.appointment_fee!.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="dp-fee-validity">Valid 30 days</span>
                </div>
              )}

              {/* Next available pill */}
              {d.next_available && (
                <div className="dp-next-avail">
                  <span className="dp-next-dot" />
                  <span>Next slot: <strong>{d.next_available.day}, {shortDateStr(d.next_available.date)}</strong></span>
                </div>
              )}

              {availDates.length > 0 ? (
                <>
                  {/* Step 1 — Date */}
                  <div className="dp-avail-step">
                    <div className="dp-avail-step-hd">
                      <span className="dp-avail-num">1</span>
                      <span className="dp-avail-title">Select a date</span>
                    </div>
                    <div className="dp-date-tabs">
                      {availDates.map((ad, i) => {
                        const { day: dayNum, month } = parseDateParts(ad.date)
                        return (
                          <button
                            key={ad.date}
                            className={`dp-date-tab${selectedDate === i ? ' dp-date-tab--active' : ''}`}
                            onClick={() => { setSelectedDate(i); setSelectedSlot(null) }}
                          >
                            <span className="dp-date-tab-day">{ad.day.slice(0, 3)}</span>
                            <span className="dp-date-tab-num">{dayNum}</span>
                            <span className="dp-date-tab-mon">{month}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Step 2 — Time slots */}
                  {slots.length > 0 && (
                    <div className="dp-avail-step">
                      <div className="dp-avail-step-hd">
                        <span className="dp-avail-num">2</span>
                        <span className="dp-avail-title">Pick a time <span className="dp-avail-sub">· 30 min each</span></span>
                      </div>
                      <div className="dp-slots">
                        {slots.map(s => {
                          const past = isSlotPast(s.start, currentDate?.date ?? '')
                          const booked = currentDate?.booked_slots?.includes(s.start) ?? false
                          const unavailable = past || booked
                          return (
                            <button
                              key={s.start}
                              className={`dp-slot${selectedSlot === s.start ? ' dp-slot--active' : ''}${past ? ' dp-slot--past' : ''}${booked ? ' dp-slot--booked' : ''}`}
                              onClick={() => !unavailable && setSelectedSlot(s.start)}
                              disabled={unavailable}
                            >
                              {fmtTime(s.start)}
                              {booked
                                ? <small className="dp-slot-booked-label">Booked</small>
                                : !past && <small className="dp-slot-avail-label">Available</small>
                              }
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected summary */}
                  {selectedSlot && currentDate && (
                    <div className="dp-booking-summary">
                      <span className="dp-summary-check">✓</span>
                      <div>
                        <p className="dp-summary-date">{currentDate.day}, {shortDateStr(currentDate.date)}</p>
                        <p className="dp-summary-time">
                          {fmtTime(selectedSlot)}{selectedSlotObj ? ` – ${fmtTime(selectedSlotObj.end)}` : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="dp-no-avail">No availability published yet — our team will reach out to confirm a slot.</p>
              )}

              {bookingError && <p className="dp-booking-error">{bookingError}</p>}

              <button
                className="dp-consult-btn"
                disabled={submitting || (availDates.length > 0 && !selectedSlot)}
                onClick={() => {
                  if (!d || !currentDate || !selectedSlot) return
                  if (!user) { setShowAuthGate(true); return }
                  handleBook(d, currentDate, selectedSlot)
                }}
              >
                {submitting ? 'Processing…' : 'Book Consultation →'}
              </button>

              <div className="dp-trust-mini">
                <span>🔒 Secure Payment</span>
                <span>↩ Easy Reschedule</span>
                <span>✓ Verified Expert</span>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {showAuthGate && (
        <AuthModal
          onClose={() => setShowAuthGate(false)}
          initialTab="login"
          initialUserType="user"
          onAuthSuccess={() => { setShowAuthGate(false); setPendingBook(true) }}
        />
      )}
    </main>
    </>
  )
}
