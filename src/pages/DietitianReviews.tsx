import { useState, useEffect, useRef } from 'react'
import appointmentApi, {
  DietitianReviewItem,
  DietitianReviewsSummary,
} from '../api/appointment'
import SEO from '../components/SEO'

type StarFilter = 'all' | '5' | '4' | '3' | '2' | '1'

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function Stars({ n, size = 13 }: { n: number; size?: number }) {
  return (
    <span className="rv-stars" style={{ fontSize: size }}>
      <SEO noIndex={true} title="Reviews" description="Reviews — private dietitian area." />
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

const LIMIT = 10

export default function DietitianReviews() {
  const [filter, setFilter]               = useState<StarFilter>('all')
  const [search, setSearch]               = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [summary, setSummary]     = useState<DietitianReviewsSummary | null>(null)
  const [reviews, setReviews]     = useState<DietitianReviewItem[]>([])
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const filtersRef = useRef('')

  useEffect(() => {
    const filterKey = JSON.stringify([filter, debouncedSearch])
    const filtersChanged = filterKey !== filtersRef.current
    filtersRef.current = filterKey

    if (filtersChanged && page !== 1) {
      setPage(1)
      setReviews([])
      return
    }

    let aborted = false
    if (page === 1) setLoading(true)
    else setLoadingMore(true)
    setError(null)

    appointmentApi.getDietitianReviews({
      rating: filter !== 'all' ? Number(filter) : undefined,
      search: debouncedSearch || undefined,
      page,
      limit: LIMIT,
    }).then(res => {
      if (aborted) return
      if (page === 1) setSummary(res.data.summary)
      setTotal(res.meta.total)
      setTotalPages(res.meta.totalPages)
      setReviews(prev => page === 1 ? res.data.reviews : [...prev, ...res.data.reviews])
    }).catch(err => {
      if (aborted) return
      setError(err?.message ?? 'Failed to load reviews')
    }).finally(() => {
      if (aborted) return
      setLoading(false)
      setLoadingMore(false)
    })
    return () => { aborted = true }
  }, [filter, debouncedSearch, page])

  const breakdown = summary?.breakdown ?? {}
  const avgRating = summary?.average_rating ?? 0
  const totalReviews = summary?.total_reviews ?? 0
  const fiveStarPct = totalReviews > 0
    ? Math.round(((breakdown['5'] ?? 0) / totalReviews) * 100)
    : 0

  return (
    <div className="rv-root">

      {/* ── Header ── */}
      <div className="rv-header">
        <div>
          <h1 className="rv-title">Reviews</h1>
          <p className="rv-subtitle">What your clients say about you</p>
        </div>
        <div className="rv-header-right">
          {summary && (
            <div className="rv-overall-badge">
              <span className="rv-overall-num">{avgRating.toFixed(1)}</span>
              <div>
                <Stars n={Math.round(avgRating)} size={14} />
                <p className="rv-overall-count">{totalReviews} reviews</p>
              </div>
            </div>
          )}
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
                const count = f === 'all' ? totalReviews : (breakdown[f] ?? 0)
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

          {/* States */}
          {loading && (
            <div className="rv-empty">
              <i className="fa-solid fa-circle-notch fa-spin" />
              <span>Loading reviews…</span>
            </div>
          )}

          {!loading && error && (
            <div className="rv-empty">
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="rv-empty">
              <i className="fa-regular fa-star" />
              <span>No reviews match your filter</span>
            </div>
          )}

          {/* Review cards */}
          {!loading && reviews.map(r => (
            <div key={r.appointment_id} className="rv-card">
              <div className="rv-card-top">
                <div className="rv-avatar">
                  {r.client_avatar
                    ? <img src={r.client_avatar} alt={r.client_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : getInitials(r.client_name)}
                </div>
                <div className="rv-card-meta">
                  <div className="rv-card-name-row">
                    <span className="rv-card-name">{r.client_name}</span>
                    <Stars n={r.user_rating} size={12} />
                  </div>
                  <p className="rv-card-plan">{formatDate(r.user_reviewed_at)}</p>
                </div>
                <div className="rv-card-star-badge" data-stars={r.user_rating}>
                  <i className="fa-solid fa-star" /> {r.user_rating}.0
                </div>
              </div>

              {r.user_review && (
                <p className="rv-card-text">{r.user_review}</p>
              )}
            </div>
          ))}

          {/* Load more */}
          {!loading && !error && page < totalPages && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                className="rv-load-more"
                onClick={() => setPage(p => p + 1)}
                disabled={loadingMore}
              >
                {loadingMore
                  ? <><i className="fa-solid fa-circle-notch fa-spin" /> Loading…</>
                  : `Load more (${total - reviews.length} remaining)`}
              </button>
            </div>
          )}
        </div>

        {/* ── Right: sticky summary ── */}
        <div className="rv-right-col">

          {/* Rating breakdown */}
          <div className="rv-panel">
            <h2 className="rv-panel-title">Rating Breakdown</h2>
            {summary ? (
              <>
                <div className="rv-rating-hero">
                  <span className="rv-rating-big">{avgRating.toFixed(1)}</span>
                  <div>
                    <Stars n={Math.round(avgRating)} size={18} />
                    <p className="rv-rating-total">{totalReviews} verified reviews</p>
                  </div>
                </div>
                <div className="rv-dist-list">
                  {[5,4,3,2,1].map(star => {
                    const count = breakdown[String(star)] ?? 0
                    const pct   = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                    return (
                      <button
                        key={star}
                        className={`rv-dist-row${filter === String(star) ? ' rv-dist-row--active' : ''}`}
                        onClick={() => setFilter(filter === String(star) ? 'all' : String(star) as StarFilter)}
                      >
                        <span className="rv-dist-label">
                          <i className="fa-solid fa-star" style={{ color: '#f59e0b', fontSize: 10 }} /> {star}
                        </span>
                        <div className="rv-dist-bar-bg">
                          <div
                            className="rv-dist-bar-fill"
                            style={{ width: `${pct}%`, background: star >= 4 ? '#22c55e' : star === 3 ? '#f59e0b' : '#ef4444' }}
                          />
                        </div>
                        <span className="rv-dist-count">{count}</span>
                        <span className="rv-dist-pct">{pct}%</span>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="rv-panel-loading"><i className="fa-solid fa-circle-notch fa-spin" /></p>
            )}
          </div>

          {/* Stats */}
          {summary && (
            <div className="rv-panel">
              <h2 className="rv-panel-title">Performance</h2>
              <div className="rv-perf-list">
                {[
                  { icon: 'fa-solid fa-star',       label: 'Average Rating',  val: `${avgRating.toFixed(1)} / 5`, color: '#f59e0b' },
                  { icon: 'fa-solid fa-thumbs-up',  label: '5-Star Reviews',  val: `${fiveStarPct}%`,             color: '#22c55e' },
                  { icon: 'fa-solid fa-list-check',  label: 'Total Reviews',   val: String(totalReviews),          color: '#3b82f6' },
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
          )}

        </div>
      </div>
    </div>
  )
}
