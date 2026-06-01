import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DIETITIANS } from '../data/dietitians'

const VISIBLE = 3

export default function DietitianShowcase() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const max = DIETITIANS.length - VISIBLE
  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(max, i + 1))

  return (
    <section className="ds-section">
      <div className="container">

        {/* Header */}
        <div className="ds-header">
          <div>
            <p className="ds-eyebrow">Expert Dietitians</p>
            <h2 className="ds-title">Meet Our <span className="ds-green">Top Dietitians</span></h2>
            <p className="ds-sub">Verified experts ready to guide your health journey</p>
          </div>
          <button className="ds-view-all" onClick={() => navigate('/consult-dietitian')}>
            View All →
          </button>
        </div>

        {/* Carousel */}
        <div className="ds-carousel-wrap">
          <div
            className="ds-track"
            ref={trackRef}
            style={{ transform: `translateX(calc(-${index} * (100% / ${VISIBLE} + 8px)))` }}
          >
            {DIETITIANS.map(d => (
              <div key={d.id} className="ds-card">
                {/* Availability badge */}
                <span className={`ds-avail ${d.availabilityClass}`}>{d.availability}</span>

                {/* Avatar */}
                <div className="ds-avatar">
                  {d.image
                    ? <img src={d.image} alt={d.name} />
                    : <span className="ds-initials">{d.initials}</span>
                  }
                </div>

                {/* Info */}
                <h3 className="ds-name">{d.name} <span className="ds-verified">✓</span></h3>
                <p className="ds-title-text">{d.title}</p>

                <div className="ds-rating">
                  <span className="ds-star">★</span>
                  <span className="ds-rating-num">{d.rating}</span>
                  <span className="ds-rating-count">({d.reviews})</span>
                </div>

                <div className="ds-meta">
                  <span>⏱ {d.experience}</span>
                  <span>📍 {d.location.split(',')[0]}</span>
                </div>

                {/* Specializations */}
                <div className="ds-tags">
                  {d.specializations.slice(0, 2).map(s => (
                    <span key={s} className="ds-tag">{s}</span>
                  ))}
                  {d.specializations.length > 2 && (
                    <span className="ds-tag ds-tag--more">+{d.specializations.length - 2}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="ds-actions">
                  <button className="ds-view-btn" onClick={() => navigate(`/dietitian/${d.id}`)}>
                    View Profile
                  </button>
                  <button className="ds-consult-btn" onClick={() => navigate(`/dietitian/${d.id}`)}>
                    Consult Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nav buttons */}
        <div className="ds-nav">
          <button className="ds-nav-btn" onClick={prev} disabled={index === 0} aria-label="Previous">
            ‹
          </button>
          <div className="ds-dots">
            {Array.from({ length: max + 1 }).map((_, i) => (
              <button
                key={i}
                className={`ds-dot${i === index ? ' ds-dot--active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button className="ds-nav-btn" onClick={next} disabled={index === max} aria-label="Next">
            ›
          </button>
        </div>

      </div>
    </section>
  )
}
