import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dietitianApi from '../api/dietitian'
import type { DietitianCard } from '../api/dietitian'

const GAP = 16

function getVisibleCount() {
  const w = window.innerWidth
  if (w <= 600) return 1
  if (w <= 900) return 2
  return 3
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const SkeletonCard = () => (
  <div className="ds-card ds-card--skeleton">
    <div className="ds-sk ds-sk-avatar" />
    <div className="ds-sk ds-sk-line ds-sk-line--lg" />
    <div className="ds-sk ds-sk-line ds-sk-line--md" />
    <div className="ds-sk ds-sk-line ds-sk-line--sm" />
    <div className="ds-sk-tags">
      <div className="ds-sk ds-sk-tag" />
      <div className="ds-sk ds-sk-tag" />
    </div>
    <div className="ds-sk ds-sk-btn" />
  </div>
)

export default function DietitianShowcase() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [dietitians, setDietitians] = useState<DietitianCard[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(3)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dietitianApi.listDietitians({ limit: 6, sort: 'top_rated' })
      .then(res => setDietitians(res.data))
      .catch(() => setDietitians([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const items = loading ? Array(6).fill(null) : dietitians
  const max = Math.max(0, items.length - visibleCount)

  // Clamp index when screen size changes
  useEffect(() => {
    setIndex(i => Math.min(i, max))
  }, [max])

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(max, i + 1))

  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev()
    touchStartX.current = null
  }

  // Exact translation per step: card-width + gap
  // card-width = (100% - (visibleCount-1)*GAP) / visibleCount
  // step = card-width + GAP = 100%/visibleCount + GAP/visibleCount
  const stepPct = (100 / visibleCount).toFixed(6)
  const stepPx  = (GAP / visibleCount).toFixed(6)
  const translate = `translateX(calc(-${index} * (${stepPct}% + ${stepPx}px)))`

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
        <div className="ds-carousel-wrap" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="ds-track" ref={trackRef} style={{ transform: translate }}>
            {loading
              ? Array(6).fill(null).map((_, i) => <SkeletonCard key={i} />)
              : dietitians.map(d => (
                <div key={d.id} className="ds-card">
                  <span className={`ds-avail ${d.availability === 'online' ? 'ds-avail--online' : 'ds-avail--offline'}`}>
                    {d.availability === 'online' ? 'Available Online' : 'Available Offline'}
                  </span>

                  <div className="ds-avatar">
                    {d.avatar_url
                      ? <img src={d.avatar_url} alt={d.full_name} />
                      : <span className="ds-initials">{getInitials(d.full_name)}</span>
                    }
                  </div>

                  <h3 className="ds-name">
                    {d.full_name}
                    {(d.is_verified === true || d.is_verified === 1) && <span className="ds-verified">✓</span>}
                  </h3>
                  <p className="ds-title-text">{d.title}</p>

                  <div className="ds-rating">
                    <span className="ds-star">★</span>
                    <span className="ds-rating-num">{d.rating > 0 ? d.rating.toFixed(1) : '—'}</span>
                    {d.reviews > 0 && <span className="ds-rating-count">({d.reviews})</span>}
                  </div>

                  <div className="ds-meta">
                    <span>⏱ {d.experience}</span>
                    <span>📍 {d.location?.split(',')[0] ?? '—'}</span>
                  </div>

                  <div className="ds-tags">
                    {d.specialization.slice(0, 2).map(s => (
                      <span key={s} className="ds-tag">{s}</span>
                    ))}
                    {d.specialization.length > 2 && (
                      <span className="ds-tag ds-tag--more">+{d.specialization.length - 2}</span>
                    )}
                  </div>

                  <div className="ds-actions">
                    <button className="ds-view-btn" onClick={() => navigate(`/dietitian/${d.id}`)}>
                      View Profile
                    </button>
                    <button className="ds-consult-btn" onClick={() => navigate(`/dietitian/${d.id}`)}>
                      Consult Now
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Nav buttons */}
        {!loading && items.length > visibleCount && (
          <div className="ds-nav">
            <button className="ds-nav-btn" onClick={prev} disabled={index === 0} aria-label="Previous">‹</button>
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
            <button className="ds-nav-btn" onClick={next} disabled={index === max} aria-label="Next">›</button>
          </div>
        )}

      </div>
    </section>
  )
}
