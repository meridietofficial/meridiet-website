import { useState } from 'react'

type StarFilter = 'all' | '5' | '4' | '3' | '2' | '1'

const REVIEWS = [
  {
    id: 1, name: 'Anjali Singh', initials: 'AS', plan: '3-Month Weight Loss',
    stars: 5, date: 'Jun 4, 2026',
    text: "Dr. Priya completely transformed my relationship with food. I lost 8 kg in 3 months without feeling deprived. Her meal plans are practical, delicious, and fit perfectly into my busy schedule. She is always available on chat and never makes you feel judged. Highly recommend!",
    tags: ['Practical Plans', 'Responsive', 'Motivating'],
    reply: "Thank you so much Anjali! Your dedication was truly inspiring. Keep up the great work!",
    helpful: 14,
  },
  {
    id: 2, name: 'Rohan Mehta', initials: 'RM', plan: '1-Month Muscle Gain',
    stars: 5, date: 'May 30, 2026',
    text: "Absolutely brilliant! I have tried many dietitians before but none explained the science behind nutrition the way Dr. Priya does. My performance at the gym improved significantly within 3 weeks. The protein targets and meal timing advice were spot on.",
    tags: ['Science-Based', 'Detailed', 'Results-Driven'],
    reply: '',
    helpful: 9,
  },
  {
    id: 3, name: 'Sneha Iyer', initials: 'SI', plan: '6-Month PCOS Program',
    stars: 5, date: 'May 22, 2026',
    text: "Managing PCOS has always been a struggle for me. Dr. Priya designed a plan specifically targeting hormonal balance through anti-inflammatory foods. Within 2 months my cycles regularised and I felt so much more energetic. Life-changing experience!",
    tags: ['Specialised Care', 'Empathetic', 'Knowledgeable'],
    reply: "So happy to hear this Sneha! PCOS management through diet can make such a huge difference. You have been very disciplined.",
    helpful: 21,
  },
  {
    id: 4, name: 'Vikram Singh', initials: 'VS', plan: '1-Month Basic Consultation',
    stars: 4, date: 'May 18, 2026',
    text: "Good experience overall. The diet plan was well-structured and I saw some improvement in energy levels. The video call sessions were informative. Would have loved more frequent check-ins, but I understand the constraints. Would recommend for someone looking for a solid start.",
    tags: ['Informative', 'Structured'],
    reply: '',
    helpful: 5,
  },
  {
    id: 5, name: 'Priya Sharma', initials: 'PS', plan: '3-Month Diabetes Management',
    stars: 5, date: 'May 12, 2026',
    text: "My blood sugar levels have never been this stable. Dr. Priya tailored a low-GI plan that is both sustainable and enjoyable. She explained how each food choice impacts insulin response which helped me understand my condition much better. Truly grateful.",
    tags: ['Expert Knowledge', 'Personalised', 'Caring'],
    reply: "It is wonderful to see your progress Priya! Consistency is key and you have nailed it.",
    helpful: 18,
  },
  {
    id: 6, name: 'Arjun Kapoor', initials: 'AK', plan: '6-Month Sports Nutrition',
    stars: 4, date: 'Apr 28, 2026',
    text: "Very happy with the sports nutrition plan. My recovery times improved and I am hitting new PRs. The supplement guidance was clear and practical. Only minor feedback is that the app interface for tracking could be improved, but the consultation itself was excellent.",
    tags: ['Sports Expertise', 'Clear Guidance'],
    reply: '',
    helpful: 7,
  },
  {
    id: 7, name: 'Meera Joshi', initials: 'MJ', plan: '1-Month Basic Plan',
    stars: 3, date: 'Apr 15, 2026',
    text: "Decent experience. The plan was generic to begin with and took a couple of iterations to feel personalised. Dr. Priya was responsive to feedback and adjusted accordingly. Saw moderate results. Good for someone just starting out but may feel basic for those with specific goals.",
    tags: ['Responsive'],
    reply: "Thank you for the honest feedback Meera! I appreciate it and will work on personalising plans faster from the first session.",
    helpful: 3,
  },
  {
    id: 8, name: 'Deepika Nair', initials: 'DN', plan: '3-Month Weight Loss',
    stars: 5, date: 'Apr 8, 2026',
    text: "Five stars without hesitation! Dr. Priya is incredibly patient and thorough. She took time to understand my food preferences, allergies and lifestyle before designing my plan. Lost 6 kg steadily and never felt starved. She genuinely cares about long-term health, not quick fixes.",
    tags: ['Patient', 'Thorough', 'Long-Term Focus'],
    reply: '',
    helpful: 12,
  },
]

const STAR_DIST = [
  { star: 5, count: 5, pct: 63 },
  { star: 4, count: 2, pct: 25 },
  { star: 3, count: 1, pct: 12 },
  { star: 2, count: 0, pct: 0  },
  { star: 1, count: 0, pct: 0  },
]

const avgRating = 4.7

function Stars({ n, size = 13 }: { n: number; size?: number }) {
  return (
    <span className="rv-stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <i
          key={i}
          className={i <= n ? 'fa-solid fa-star' : 'fa-regular fa-star'}
          style={{ color: i <= n ? '#f59e0b' : '#d1d5db' }}
        />
      ))}
    </span>
  )
}

export default function DietitianReviews() {
  const [filter, setFilter]       = useState<StarFilter>('all')
  const [search, setSearch]       = useState('')
  const [replyOpen, setReplyOpen] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies]     = useState<Record<number, string>>(
    Object.fromEntries(REVIEWS.map(r => [r.id, r.reply]))
  )

  const filtered = REVIEWS.filter(r => {
    if (filter !== 'all' && r.stars !== Number(filter)) return false
    const q = search.toLowerCase()
    return !q || r.name.toLowerCase().includes(q) || r.text.toLowerCase().includes(q) || r.plan.toLowerCase().includes(q)
  })

  const handleSendReply = (id: number) => {
    if (!replyText.trim()) return
    setReplies(prev => ({ ...prev, [id]: replyText.trim() }))
    setReplyText('')
    setReplyOpen(null)
  }

  return (
    <div className="rv-root">

      {/* ── Header ── */}
      <div className="rv-header">
        <div>
          <h1 className="rv-title">Reviews</h1>
          <p className="rv-subtitle">What your clients say about you</p>
        </div>
        <div className="rv-header-right">
          <div className="rv-overall-badge">
            <span className="rv-overall-num">{avgRating}</span>
            <div>
              <Stars n={Math.round(avgRating)} size={14} />
              <p className="rv-overall-count">{REVIEWS.length} reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="rv-body">

        {/* ── Left: review list ── */}
        <div className="rv-list-col">

          {/* Toolbar */}
          <div className="rv-toolbar">
            <div className="rv-filter-tabs">
              {(['all','5','4','3','2','1'] as StarFilter[]).map(f => {
                const count = f === 'all' ? REVIEWS.length : REVIEWS.filter(r => r.stars === Number(f)).length
                return (
                  <button
                    key={f}
                    className={`rv-filter-btn${filter === f ? ' rv-filter-btn--active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'All' : <><i className="fa-solid fa-star" style={{ color: '#f59e0b', fontSize: 10 }} /> {f}</>}
                    <span className="rv-filter-count">{count}</span>
                  </button>
                )
              })}
            </div>
            <div className="rv-search-wrap">
              <i className="fa-solid fa-magnifying-glass rv-search-icon" />
              <input
                className="rv-search"
                placeholder="Search reviews…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Review cards */}
          {filtered.length === 0 ? (
            <div className="rv-empty">
              <i className="fa-regular fa-star" />
              <span>No reviews match your filter</span>
            </div>
          ) : filtered.map(r => (
            <div key={r.id} className="rv-card">
              <div className="rv-card-top">
                <div className="rv-avatar">{r.initials}</div>
                <div className="rv-card-meta">
                  <div className="rv-card-name-row">
                    <span className="rv-card-name">{r.name}</span>
                    <Stars n={r.stars} size={12} />
                  </div>
                  <p className="rv-card-plan">{r.plan} · {r.date}</p>
                </div>
                <div className="rv-card-star-badge" data-stars={r.stars}>
                  <i className="fa-solid fa-star" /> {r.stars}.0
                </div>
              </div>

              <p className="rv-card-text">{r.text}</p>

              <div className="rv-card-tags">
                {r.tags.map(t => (
                  <span key={t} className="rv-tag">{t}</span>
                ))}
              </div>

              <div className="rv-card-footer">
                <button className="rv-helpful-btn">
                  <i className="fa-regular fa-thumbs-up" /> Helpful ({r.helpful})
                </button>
                <button
                  className={`rv-reply-btn${replyOpen === r.id ? ' rv-reply-btn--active' : ''}`}
                  onClick={() => {
                    setReplyOpen(replyOpen === r.id ? null : r.id)
                    setReplyText(replies[r.id] ?? '')
                  }}
                >
                  <i className="fa-solid fa-reply" />
                  {replies[r.id] ? 'Edit Reply' : 'Reply'}
                </button>
              </div>

              {/* Existing reply */}
              {replies[r.id] && replyOpen !== r.id && (
                <div className="rv-reply-box">
                  <div className="rv-reply-header">
                    <i className="fa-solid fa-reply rv-reply-icon" />
                    <span className="rv-reply-label">Your Response</span>
                  </div>
                  <p className="rv-reply-text">{replies[r.id]}</p>
                </div>
              )}

              {/* Reply input */}
              {replyOpen === r.id && (
                <div className="rv-reply-input-wrap">
                  <textarea
                    className="rv-reply-textarea"
                    placeholder="Write your response…"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={3}
                  />
                  <div className="rv-reply-actions">
                    <button className="rv-reply-cancel" onClick={() => setReplyOpen(null)}>Cancel</button>
                    <button className="rv-reply-send" onClick={() => handleSendReply(r.id)}>
                      <i className="fa-solid fa-paper-plane" /> Post Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Right: sticky summary ── */}
        <div className="rv-right-col">

          {/* Rating breakdown */}
          <div className="rv-panel">
            <h2 className="rv-panel-title">Rating Breakdown</h2>
            <div className="rv-rating-hero">
              <span className="rv-rating-big">{avgRating}</span>
              <div>
                <Stars n={5} size={18} />
                <p className="rv-rating-total">{REVIEWS.length} verified reviews</p>
              </div>
            </div>
            <div className="rv-dist-list">
              {STAR_DIST.map(d => (
                <button
                  key={d.star}
                  className={`rv-dist-row${filter === String(d.star) ? ' rv-dist-row--active' : ''}`}
                  onClick={() => setFilter(filter === String(d.star) ? 'all' : String(d.star) as StarFilter)}
                >
                  <span className="rv-dist-label">
                    <i className="fa-solid fa-star" style={{ color: '#f59e0b', fontSize: 10 }} /> {d.star}
                  </span>
                  <div className="rv-dist-bar-bg">
                    <div
                      className="rv-dist-bar-fill"
                      style={{ width: `${d.pct}%`, background: d.star >= 4 ? '#22c55e' : d.star === 3 ? '#f59e0b' : '#ef4444' }}
                    />
                  </div>
                  <span className="rv-dist-count">{d.count}</span>
                  <span className="rv-dist-pct">{d.pct}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="rv-panel">
            <h2 className="rv-panel-title">Performance</h2>
            <div className="rv-perf-list">
              {[
                { icon: 'fa-solid fa-star',          label: 'Average Rating',   val: `${avgRating} / 5`, color: '#f59e0b' },
                { icon: 'fa-solid fa-thumbs-up',     label: '5-Star Reviews',   val: '63%',              color: '#22c55e' },
                { icon: 'fa-solid fa-reply',          label: 'Response Rate',    val: '63%',              color: '#3b82f6' },
                { icon: 'fa-solid fa-calendar-day',  label: 'Reviews This Month', val: '3',              color: '#a855f7' },
              ].map(s => (
                <div key={s.label} className="rv-perf-row">
                  <div className="rv-perf-icon" style={{ background: s.color + '18', color: s.color }}>
                    <i className={s.icon} />
                  </div>
                  <span className="rv-perf-label">{s.label}</span>
                  <span className="rv-perf-val" style={{ color: s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common tags */}
          <div className="rv-panel">
            <h2 className="rv-panel-title">Client Praise</h2>
            <div className="rv-praise-tags">
              {[
                { label: 'Knowledgeable', count: 6 },
                { label: 'Responsive',    count: 5 },
                { label: 'Personalised',  count: 5 },
                { label: 'Motivating',    count: 4 },
                { label: 'Caring',        count: 4 },
                { label: 'Detailed',      count: 3 },
                { label: 'Patient',       count: 3 },
                { label: 'Results-Driven', count: 3 },
              ].map(t => (
                <span key={t.label} className="rv-praise-tag">
                  {t.label} <span className="rv-praise-count">{t.count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Pending replies alert */}
          {REVIEWS.filter(r => !replies[r.id]).length > 0 && (
            <div className="rv-pending-alert">
              <i className="fa-solid fa-circle-exclamation rv-pending-icon" />
              <div>
                <p className="rv-pending-title">{REVIEWS.filter(r => !replies[r.id]).length} reviews need a reply</p>
                <p className="rv-pending-sub">Responding boosts your visibility on MeriDiet</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
