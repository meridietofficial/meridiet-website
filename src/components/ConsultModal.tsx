import { useState, useEffect } from 'react'
import type { DietitianCard } from '../api/dietitian'

const PLAN_VALIDITY_DAYS = 30
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

// "2026-06-05" → "5 Jun"
function shortDate(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// Expand a working-hour range like "09:00-18:00" into 30-min slots
function expandToSlots(ranges: string[], stepMin = SLOT_MINUTES): { start: string; end: string }[] {
  const fmt = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
  const slots: { start: string; end: string }[] = []
  for (const range of ranges) {
    const [s, e] = range.split('-')
    if (!s || !e) continue
    const [sh, sm] = s.split(':').map(Number)
    const [eh, em] = e.split(':').map(Number)
    let cur = sh * 60 + sm
    const end = eh * 60 + em
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
  const dates = dietitian.available_dates ?? []
  const [goal, setGoal] = useState('')
  const [selectedDate, setSelectedDate] = useState(dates[0]?.date ?? '')
  const [selectedSlot, setSelectedSlot] = useState('')   // slot start time, e.g. "09:30"
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const activeDate = dates.find(d => d.date === selectedDate)
  const slots = activeDate ? expandToSlots(activeDate.slots) : []
  const needsSlot = dates.length > 0
  const slotLabel = selectedSlot && activeDate
    ? `${activeDate.day}, ${shortDate(activeDate.date)} · ${selectedSlot}`
    : ''

  // Close on Escape + lock body scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const handleProceed = async () => {
    setSubmitting(true)
    // ── Backend hook ──────────────────────────────────────────
    // When the booking/payment API exists, replace this block with:
    //   const order = await consultationApi.book({
    //     dietitian_id: dietitian.id,
    //     date: selectedDate,
    //     slot_start: selectedSlot,                       // "09:30"
    //     slot_end: addMinutes(selectedSlot, SLOT_MINUTES), // "10:00"
    //     goal,
    //     amount: fee,
    //   })
    //   await startPayment(order)   // e.g. Razorpay checkout
    // For now we just simulate a successful request.
    await new Promise(r => setTimeout(r, 600))
    setSubmitting(false)
    setDone(true)
  }

  return (
    <div className="cm-backdrop" onClick={onClose}>
      <div
        className="cm-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Consult ${dietitian.full_name}`}
        onClick={e => e.stopPropagation()}
      >
        <button className="cm-close" onClick={onClose} aria-label="Close">✕</button>

        {done ? (
          <div className="cm-success">
            <div className="cm-success-check">✓</div>
            <h3 className="cm-success-title">Request received!</h3>
            <p className="cm-success-text">
              Thanks — your consultation request with <strong>{dietitian.full_name}</strong>
              {slotLabel ? <> for <strong>{slotLabel}</strong></> : ''} is noted.
              Secure payment &amp; scheduling are coming soon, and our team will reach out to confirm.
            </p>
            <button className="cm-primary-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <div className="cm-split">
            {/* LEFT — dietitian details */}
            <aside className="cm-side">
              <div className="cm-avatar">
                {dietitian.avatar_url
                  ? <img src={dietitian.avatar_url} alt={dietitian.full_name} />
                  : <span className="cm-initials">{initialsOf(dietitian.full_name)}</span>
                }
              </div>
              <h3 className="cm-name">
                {dietitian.full_name} {dietitian.is_verified && <span className="cm-verified">✓</span>}
              </h3>
              <p className="cm-title">{dietitian.title}</p>
              <p className="cm-meta">⏱ {dietitian.experience}</p>
              <p className="cm-meta">📍 {dietitian.location}</p>

              {dietitian.specialization.length > 0 && (
                <div className="cm-side-block">
                  <p className="cm-side-label">Specializations</p>
                  <div className="cm-side-tags">
                    {dietitian.specialization.map(s => <span key={s} className="cm-side-tag">{s}</span>)}
                  </div>
                </div>
              )}

              {dietitian.languages.length > 0 && (
                <div className="cm-side-block">
                  <p className="cm-side-label">Languages</p>
                  <p className="cm-side-langs">{dietitian.languages.join(', ')}</p>
                </div>
              )}

              <div className="cm-side-plan">
                <p className="cm-plan-name">1-on-1 Consultation</p>
                <p className="cm-side-price">
                  ₹{fee.toLocaleString('en-IN')} <span>/ {PLAN_VALIDITY_DAYS} days</span>
                </p>
                <p className="cm-plan-feats">{PLAN_FEATURES.join(' · ')}</p>
              </div>
            </aside>

            {/* RIGHT — booking */}
            <div className="cm-main">
              <div className="cm-main-body">
                {needsSlot ? (
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
                            <span className="cm-date-day">{d.day.slice(0, 3)}</span>
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
                          {slots.map(s => (
                            <button
                              key={s.start}
                              type="button"
                              className={`cm-slot${selectedSlot === s.start ? ' cm-slot--active' : ''}`}
                              onClick={() => setSelectedSlot(s.start)}
                            >
                              {s.start} – {s.end}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="cm-empty-slots">No slots available on this date.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="cm-empty-slots">
                    This dietitian hasn’t published availability yet — submit a request and our team will reach out to confirm a slot.
                  </p>
                )}

                <div className="cm-field">
                  <label className="cm-label">What's your main health goal? <span className="cm-optional">(optional)</span></label>
                  <textarea
                    className="cm-textarea"
                    rows={2}
                    placeholder="e.g. Manage thyroid & lose 5 kg over 2 months"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="cm-foot">
                <div className="cm-footer">
                  <div className="cm-total">
                    <span className="cm-total-label">Total</span>
                    <span className="cm-total-amount">₹{fee.toLocaleString('en-IN')}</span>
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
  )
}
