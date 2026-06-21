import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DietitianCard } from '../api/dietitian'
import dietitianApi from '../api/dietitian'
import appointmentApi from '../api/appointment'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import { trackPurchase, trackConsultationBooked } from '../utils/analytics'

const SLOT_MINUTES = 30
const PLAN_FEATURES = [
  'Personalized diet plan',
  '30 days of chat support',
  'Follow-up consultation',
  '100% confidential',
]

function initialsOf(name: string) {
  return name.replace(/^(dr\.?|dt\.?)\s+/i, '').split(/\s+/).map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

function shortDate(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
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

function getTodayISO() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

function isToday(iso: string) { return iso === getTodayISO() }

function isSlotPast(slotStart: string, dateISO: string): boolean {
  const today = getTodayISO()
  if (dateISO < today) return true
  if (dateISO > today) return false
  return toMins(slotStart) < new Date().getHours() * 60 + new Date().getMinutes()
}

function expandToSlots(ranges: string[], stepMin = SLOT_MINUTES): { start: string; end: string }[] {
  const fmt = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
  const slots: { start: string; end: string }[] = []
  for (const range of ranges) {
    const [s, e] = range.split('-')
    if (!s || !e) continue
    let cur = toMins(s)
    const end = toMins(e)
    while (cur + stepMin <= end) {
      slots.push({ start: fmt(cur), end: fmt(cur + stepMin) })
      cur += stepMin
    }
  }
  return slots
}


type ConsultModalProps = {
  dietitian: DietitianCard
  fee: number
  onClose: () => void
}

export default function ConsultModal({ dietitian, fee, onClose }: ConsultModalProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch fresh detail data on open so booked_slots & available_dates are always current
  const [fullData, setFullData] = useState<DietitianCard>(dietitian)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    setLoadingData(true)
    dietitianApi.getDietitianById(dietitian.id)
      .then(data => { setFullData(data); setLoadingData(false) })
      .catch(() => { setFullData(dietitian); setLoadingData(false) })
  }, [dietitian.id])

  const consultFee = fullData.appointment_fee ?? fullData.fee ?? fee
  const dates = fullData.available_dates ?? []


  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [confirmedLabel, setConfirmedLabel] = useState('')
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [pendingProceed, setPendingProceed] = useState(false)

  // Auto-select first date once fresh data loads
  useEffect(() => {
    if (!loadingData && dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].date)
    }
  }, [loadingData, dates, selectedDate])

  const activeDate = dates.find(d => d.date === selectedDate)
  const slots = activeDate ? expandToSlots(activeDate.slots) : []
  const needsSlot = dates.length > 0

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const handleProceed = async () => {
    if (!activeDate || !selectedSlot) return
    if (!user) { setShowAuthGate(true); return }
    setSubmitting(true)
    setError('')
    try {
      const slotObj = slots.find(s => s.start === selectedSlot)
      const order = await appointmentApi.createOrder({
        dietitian_id: fullData.id,
        appointment_date: activeDate.date,
        slot: selectedSlot,
        name: user?.full_name ?? '',
        email: user?.email || undefined,
        phone: user?.phone_number || undefined,
        fee: consultFee,
      })

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount * 100,
        currency: order.currency ?? 'INR',
        order_id: order.order_id,
        name: 'MeriDiet',
        description: `Consultation with ${fullData.full_name}`,
        image: '/logo.png',
        prefill: { name: user?.full_name ?? '', email: user?.email ?? '', contact: user?.phone_number ?? '' },
        theme: { color: '#006B28' },
        handler: async (rzpRes: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const result = await appointmentApi.verify({
              razorpay_order_id: rzpRes.razorpay_order_id,
              razorpay_payment_id: rzpRes.razorpay_payment_id,
              razorpay_signature: rzpRes.razorpay_signature,
            })
            const slotDisplay = slotObj
              ? `${fmtTime(result.slot)} – ${fmtTime(slotObj.end)}`
              : fmtTime(result.slot)
            setConfirmedLabel(`${shortDate(result.appointment_date)} · ${slotDisplay}`)
            trackPurchase(consultFee, 'INR')
            trackConsultationBooked(consultFee, fullData.full_name)
            navigate('/consult-dietitian/success', { replace: true })
            setDone(true)
          } catch {
            setError('Payment received but confirmation failed. Please contact support.')
          } finally {
            setSubmitting(false)
          }
        },
        modal: {
          ondismiss: async () => {
            try { await appointmentApi.failed(order.order_id) } catch {}
            setError('Payment cancelled — your slot is still available, try again anytime.')
            setSubmitting(false)
          },
        },
      })
      rzp.open()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? ''
      setError(
        msg.toLowerCase().includes('already booked')
          ? 'This slot was just taken. Please pick another time.'
          : 'Failed to initiate payment. Please try again.'
      )
      setSubmitting(false)
    }
  }

  // After login, user lands in context — auto-trigger payment
  useEffect(() => {
    if (pendingProceed && user) {
      setPendingProceed(false)
      handleProceed()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingProceed])

  return (
    <>
    {showAuthGate && (
      <AuthModal
        onClose={() => setShowAuthGate(false)}
        initialTab="login"
        initialUserType="user"
        onAuthSuccess={() => { setShowAuthGate(false); setPendingProceed(true) }}
      />
    )}
    <div className="cm-backdrop" onClick={onClose}>
      <div className="cm-dialog" role="dialog" aria-modal="true" aria-label={`Consult ${dietitian.full_name}`} onClick={e => e.stopPropagation()}>
        <button className="cm-close" onClick={onClose} aria-label="Close">✕</button>

        {done ? (
          <div className="cm-success">
            <div className="cm-success-check">✓</div>
            <h3 className="cm-success-title">Appointment Confirmed!</h3>
            <p className="cm-success-text">
              Your consultation with <strong>{dietitian.full_name}</strong>
              {confirmedLabel ? <> for <strong>{confirmedLabel}</strong></> : ''} is confirmed.
              You'll receive a confirmation shortly.
            </p>
            <button className="cm-primary-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <div className="cm-split">

            {/* LEFT — dietitian info */}
            <aside className="cm-side">
              <div className="cm-avatar">
                {fullData.avatar_url
                  ? <img src={fullData.avatar_url} alt={fullData.full_name} />
                  : <span className="cm-initials">{initialsOf(fullData.full_name)}</span>
                }
              </div>
              <h3 className="cm-name">
                {fullData.full_name} {fullData.is_verified && <span className="cm-verified">✓</span>}
              </h3>
              <p className="cm-title">{fullData.title}</p>
              <p className="cm-meta">⏱ {fullData.experience}</p>
              <p className="cm-meta">📍 {fullData.location}</p>

              {fullData.specialization.length > 0 && (
                <div className="cm-side-block">
                  <p className="cm-side-label">Specializations</p>
                  <div className="cm-side-tags">
                    {fullData.specialization.map(s => <span key={s} className="cm-side-tag">{s}</span>)}
                  </div>
                </div>
              )}

              {fullData.languages.length > 0 && (
                <div className="cm-side-block">
                  <p className="cm-side-label">Languages</p>
                  <p className="cm-side-langs">{fullData.languages.join(', ')}</p>
                </div>
              )}

              <div className="cm-side-plan">
                <p className="cm-plan-name">1-on-1 Consultation</p>
                <p className="cm-side-price">
                  ₹{consultFee.toLocaleString('en-IN')} <span>/ 30 days</span>
                </p>
                <p className="cm-plan-feats">{PLAN_FEATURES.join(' · ')}</p>
              </div>
            </aside>

            {/* RIGHT — booking */}
            <div className="cm-main">
              <div className="cm-main-body">

                {loadingData ? (
                  <div className="cm-loading">
                    <div className="cm-sk cm-sk-label" />
                    <div className="cm-sk cm-sk-dates" />
                    <div className="cm-sk cm-sk-label" style={{ marginTop: 20 }} />
                    <div className="cm-sk cm-sk-slots" />
                  </div>
                ) : needsSlot ? (
                  <>
                    <div className="cm-field">
                      <label className="cm-label">Select a date</label>
                      <div className="cm-dates">
                        {dates.map(d => (
                          <button
                            key={d.date}
                            type="button"
                            className={`cm-date${selectedDate === d.date ? ' cm-date--active' : ''}`}
                            onClick={() => { setSelectedDate(d.date); setSelectedSlot('') }}
                          >
                            <span className="cm-date-day">{isToday(d.date) ? 'Today' : d.day.slice(0, 3)}</span>
                            <span className="cm-date-num">{shortDate(d.date)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="cm-field">
                      <label className="cm-label">
                        Select a time slot <span className="cm-optional">({SLOT_MINUTES} min each)</span>
                      </label>
                      {slots.length ? (
                        <div className="cm-slots">
                          {slots.map(s => {
                            const past = isSlotPast(s.start, activeDate?.date ?? '')
                            const booked = activeDate?.booked_slots?.includes(s.start) ?? false
                            const unavailable = past || booked
                            return (
                              <button
                                key={s.start}
                                type="button"
                                className={`cm-slot${selectedSlot === s.start ? ' cm-slot--active' : ''}${past ? ' cm-slot--past' : ''}${booked ? ' cm-slot--booked' : ''}`}
                                onClick={() => !unavailable && setSelectedSlot(s.start)}
                                disabled={unavailable}
                              >
                                <span>{fmtTime(s.start)} – {fmtTime(s.end)}</span>
                                {booked
                                  ? <small className="cm-slot-booked-label">Booked</small>
                                  : !past && <small className="cm-slot-avail-label">Available</small>
                                }
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="cm-empty-slots">No slots available on this date.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="cm-empty-slots">
                    This dietitian hasn't published availability yet — submit a request and our team will reach out to confirm a slot.
                  </p>
                )}

              </div>

              {/* Footer */}
              <div className="cm-foot">
                {error && <p className="cm-error-msg">{error}</p>}
                <div className="cm-footer">
                  <div className="cm-total">
                    <span className="cm-total-label">Total</span>
                    <span className="cm-total-amount">₹{consultFee.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    className="cm-primary-btn"
                    onClick={handleProceed}
                    disabled={submitting || (needsSlot && !selectedSlot)}
                  >
                    {submitting ? 'Processing…' : 'Proceed to Pay →'}
                  </button>
                </div>
                <p className="cm-secure-note">🔒 100% secure &amp; confidential</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
    </>
  )
}
