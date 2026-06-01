import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DIETITIANS } from '../data/dietitians'

export default function DietitianProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const d = DIETITIANS.find(x => x.id === Number(id))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  if (!d) {
    return (
      <main className="dp-page">
        <div className="container dp-not-found">
          <p>Dietitian not found.</p>
          <button className="dp-back-btn" onClick={() => navigate('/consult-dietitian')}>← Back to Dietitians</button>
        </div>
      </main>
    )
  }

  return (
    <main className="dp-page">
      <div className="container">

        {/* Back */}
        <button className="dp-back-btn" onClick={() => navigate('/consult-dietitian')}>
          ← Back to Dietitians
        </button>

        <div className="dp-layout">

          {/* ── Left column ── */}
          <div className="dp-left">

            {/* Profile header card */}
            <div className="dp-profile-card">
              <div className="dp-avatar">
                {d.image
                  ? <img src={d.image} alt={d.name} />
                  : <span className="dp-initials">{d.initials}</span>
                }
              </div>
              <div className="dp-header-info">
                <div className="dp-name-row">
                  <h1 className="dp-name">{d.name} <span className="dp-verified">✓</span></h1>
                  <span className={`cd-avail-badge ${d.availabilityClass}`}>{d.availability}</span>
                </div>
                <p className="dp-title">{d.title}</p>
                <div className="dp-rating-row">
                  <span className="dp-stars">{'★'.repeat(Math.round(d.rating))}{'☆'.repeat(5 - Math.round(d.rating))}</span>
                  <span className="dp-rating-num">{d.rating}</span>
                  <span className="dp-rating-count">({d.reviews} reviews)</span>
                </div>
                <div className="dp-quick-stats">
                  <div className="dp-stat">
                    <span className="dp-stat-icon">⏱</span>
                    <div>
                      <p className="dp-stat-val">{d.experience.replace(' Experience', '')}</p>
                      <p className="dp-stat-label">Experience</p>
                    </div>
                  </div>
                  <div className="dp-stat-divider" />
                  <div className="dp-stat">
                    <span className="dp-stat-icon">👥</span>
                    <div>
                      <p className="dp-stat-val">{d.consultations}+</p>
                      <p className="dp-stat-label">Consultations</p>
                    </div>
                  </div>
                  <div className="dp-stat-divider" />
                  <div className="dp-stat">
                    <span className="dp-stat-icon">📍</span>
                    <div>
                      <p className="dp-stat-val">{d.location.split(',')[0]}</p>
                      <p className="dp-stat-label">Location</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="dp-section">
              <h2 className="dp-section-title">About</h2>
              <p className="dp-about-text">{d.about}</p>
            </div>

            {/* Education */}
            <div className="dp-section">
              <h2 className="dp-section-title">Education & Qualifications</h2>
              <ul className="dp-edu-list">
                {d.education.map(e => (
                  <li key={e} className="dp-edu-item">
                    <span className="dp-edu-icon">🎓</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specializations */}
            <div className="dp-section">
              <h2 className="dp-section-title">Specializations</h2>
              <div className="dp-tags">
                {d.specializations.map(s => (
                  <span key={s} className="cd-tag dp-tag">{s}</span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="dp-section">
              <h2 className="dp-section-title">Languages</h2>
              <div className="dp-tags">
                {d.languages.map(l => (
                  <span key={l} className="dp-lang-chip">{l}</span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="dp-section">
              <h2 className="dp-section-title">Patient Reviews</h2>
              <div className="dp-reviews">
                {d.reviewsList.map((r, i) => (
                  <div key={i} className="dp-review-card">
                    <div className="dp-review-top">
                      <div className="dp-reviewer-avatar">{r.name[0]}</div>
                      <div>
                        <p className="dp-reviewer-name">{r.name}</p>
                        <div className="dp-review-stars">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>
                      </div>
                      <span className="dp-review-date">{r.date}</span>
                    </div>
                    <p className="dp-review-comment">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right sticky column ── */}
          <aside className="dp-right">
            <div className="dp-booking-card">
              <p className="dp-booking-label">Consultation Fee</p>
              <p className="dp-booking-price">₹{d.fee.toLocaleString()}</p>
              <p className="dp-booking-validity">✓ Valid for 30 Days &nbsp;|&nbsp; ✓ 1-on-1 Session</p>

              <div className="dp-slots-section">
                <p className="dp-slots-label">🕐 Next Available: <strong>{d.nextAvailable}</strong></p>
                <p className="dp-slots-pick">Pick a slot</p>
                <div className="dp-slots">
                  {d.slots.map(slot => (
                    <button
                      key={slot}
                      className={`dp-slot${selectedSlot === slot ? ' dp-slot--active' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <button className="dp-consult-btn">Book Consultation →</button>
              <button className="dp-chat-btn">💬 Consult Now</button>

              <div className="dp-trust-mini">
                <span>🔒 Secure Payment</span>
                <span>↩ Easy Reschedule</span>
                <span>✓ Verified Expert</span>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
