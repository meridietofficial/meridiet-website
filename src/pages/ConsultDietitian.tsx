import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Search, SlidersHorizontal, X, UserRound, MessagesSquare, ShieldCheck, Lock, Stethoscope, ClipboardList, Headset } from 'lucide-react'
import dietitianApi, {
  type Specialization,
  type DietitianCard,
  type DietitianListParams,
  type PaginationMeta,
} from '../api/dietitian'
import ConsultModal from '../components/ConsultModal'
import SearchableSelect from '../components/SearchableSelect'
import { IN_STATES, getCitiesOfState } from '../data/indiaCities'
import SEO from '../components/SEO'

const ALL_CATEGORY = 'All Dietitians'
const CONSULT_FEE = 0
const FEE_RANGE_MIN = 1499
const FEE_RANGE_MAX = 4500

const TRUST_ITEMS = [
  { icon: Lock,           title: 'Secure Payments',     desc: '100% safe & secure' },
  { icon: Stethoscope,    title: 'Expert Dietitians',   desc: 'Verified & experienced' },
  { icon: ClipboardList,  title: 'Personalized Plans',  desc: 'Tailored just for you' },
  { icon: Headset,        title: 'Ongoing Support',     desc: 'Chat with your dietitian anytime' },
]

// Same experience buckets dietitians choose during registration
const EXPERIENCE_OPTIONS = ['Less than 1 year', '1 – 3 years', '3 – 5 years', '5 – 10 years', '10+ years']
const EXP_BOUNDS: Record<string, [number, number]> = {
  'Less than 1 year': [0, 1],
  '1 – 3 years':      [1, 3],
  '3 – 5 years':      [3, 5],
  '5 – 10 years':     [5, 10],
  '10+ years':        [10, Infinity],
}
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Punjabi']

const SORT_OPTIONS: { value: NonNullable<DietitianListParams['sort']>; label: string }[] = [
  { value: 'top_rated',     label: 'Top Rated' },
  { value: 'most_reviewed', label: 'Most Reviewed' },
  { value: 'available_now', label: 'Available Now' },
  { value: 'experience',    label: 'Most Experienced' },
]

// Map the (multi-select) experience checkboxes to numeric year bounds
function experienceRange(buckets: string[]): { min_years?: number; max_years?: number } {
  const ranges = buckets.map(b => EXP_BOUNDS[b]).filter(Boolean)
  if (!ranges.length) return {}
  const min = Math.min(...ranges.map(r => r[0]))
  const max = Math.max(...ranges.map(r => r[1]))
  return { min_years: min, max_years: max === Infinity ? undefined : max }
}

function initialsOf(name: string) {
  return name.replace(/^(dr\.?|dt\.?)\s+/i, '').split(/\s+/).map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

function availabilityLabel(a: string) {
  return a === 'online'
    ? { text: 'Available Now', cls: 'cd-avail--now' }
    : { text: 'Offline', cls: 'cd-avail--tomorrow' }
}

// "2026-06-05" → "5 Jun"
function shortDate(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function ConsultDietitian() {
  const navigate = useNavigate()
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [results, setResults] = useState<DietitianCard[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [consulting, setConsulting] = useState<DietitianCard | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY)
  const [sort, setSort] = useState<NonNullable<DietitianListParams['sort']>>('top_rated')
  const [page, setPage] = useState(1)

  // Sidebar filters — applied live (no Apply button needed)
  const [gender, setGender] = useState('all')
  const [stateCode, setStateCode] = useState('')
  const [stateName, setStateName] = useState('')
  const [city, setCity] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [experience, setExperience] = useState<string[]>([])
  const [language, setLanguage] = useState('')
  const [availableNow, setAvailableNow] = useState(false)
  const [feeMin, setFeeMin] = useState(FEE_RANGE_MIN)
  const [feeMax, setFeeMax] = useState(FEE_RANGE_MAX)
  const [debouncedFeeMin, setDebouncedFeeMin] = useState(FEE_RANGE_MIN)
  const [debouncedFeeMax, setDebouncedFeeMax] = useState(FEE_RANGE_MAX)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Cities for the selected state (local map, keyed by state code)
  const cities = stateCode ? getCitiesOfState(stateCode).map(c => c.name) : []

  useEffect(() => {
    dietitianApi.getSpecializations()
      .then(list => setSpecializations(list.filter(s => s.is_active)))
      .catch(err => console.error('[Specializations] Failed to load:', err))

  }, [])

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  // Debounce fee slider — wait until user stops dragging before firing API
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedFeeMin(feeMin); setDebouncedFeeMax(feeMax) }, 600)
    return () => clearTimeout(t)
  }, [feeMin, feeMax])

  // Any filter change resets to page 1 (no-op re-render if already 1)
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, activeCategory, sort, gender, stateName, city, specialization, experience, language, availableNow, debouncedFeeMin, debouncedFeeMax])

  // Fetch the dietitian list whenever the query changes (filters apply live)
  useEffect(() => {
    const params: DietitianListParams = {
      search:         debouncedSearch || undefined,
      specialization: activeCategory !== ALL_CATEGORY ? activeCategory : (specialization || undefined),
      gender:         gender !== 'all' ? gender : undefined,
      location:       city || stateName || undefined,
      language:       language || undefined,
      available_now:  availableNow || undefined,
      min_fee: debouncedFeeMin > FEE_RANGE_MIN ? debouncedFeeMin : undefined,
      max_fee: debouncedFeeMax < FEE_RANGE_MAX ? debouncedFeeMax : undefined,
      sort,
      page,
      limit: 12,
      ...experienceRange(experience),
    }
    let cancelled = false
    if (page === 1) { setLoading(true); setResults([]) }
    else setLoadingMore(true)
    setError(null)
    dietitianApi.listDietitians(params)
      .then(({ data, meta }) => {
        if (!cancelled) {
          setResults(prev => page === 1 ? data : [...prev, ...data])
          setMeta(meta)
        }
      })
      .catch(err => { if (!cancelled) { setError(err?.message ?? 'Failed to load dietitians'); if (page === 1) setResults([]) } })
      .finally(() => { if (!cancelled) { setLoading(false); setLoadingMore(false) } })
    return () => { cancelled = true }
  }, [debouncedSearch, activeCategory, sort, page, gender, stateName, city, specialization, experience, language, availableNow, debouncedFeeMin, debouncedFeeMax])

  // IntersectionObserver — load next page when sentinel enters view
  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && meta && page < meta.totalPages) {
      setPage(p => p + 1)
    }
  }, [loadingMore, loading, meta, page])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  // Tabs: "All" + each specialization's short label (value kept for filtering)
  const categories = [{ value: ALL_CATEGORY, label: ALL_CATEGORY }, ...specializations]

  const toggleExperience = (val: string) =>
    setExperience(prev => prev.includes(val) ? prev.filter(e => e !== val) : [...prev, val])

  const clearFilters = () => {
    setGender('all')
    setStateCode('')
    setStateName('')
    setCity('')
    setSpecialization('')
    setExperience([])
    setLanguage('')
    setAvailableNow(false)
    setFeeMin(FEE_RANGE_MIN)
    setFeeMax(FEE_RANGE_MAX)
  }

  return (
    <main className="cd-page">
      <SEO
        title="Consult a Dietitian Online | Expert Nutrition Advice"
        description="Book a 1-on-1 online consultation with verified Indian dietitians. Get expert diet advice for weight loss, PCOS, diabetes, thyroid & muscle gain. Book your slot now."
        keywords="consult dietitian online India, online nutritionist India, book dietitian appointment, nutrition consultation India, diet consultation online, best dietitian India, online diet advice"
        canonical="/consult-dietitian"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'MedicalBusiness',
          name: 'MeriDiet – Online Dietitian Consultation',
          url: 'https://meridiet.com/consult-dietitian',
          description: 'Book 1-on-1 online consultations with verified Indian dietitians for weight loss, PCOS, diabetes and more.',
          areaServed: 'IN',
          availableService: {
            '@type': 'MedicalTherapy',
            name: 'Online Dietitian Consultation',
          },
        }}
      />

      {/* ── Hero ── */}
      <section className="cd-hero">
        <div className="container cd-hero-inner">
          <div className="cd-hero-left">
            <h1 className="cd-hero-title">
              Consult Top <span className="cd-green">Dietitians</span> Online
            </h1>
            <p className="cd-hero-sub">Get a personalised diet plan, expert guidance, and ongoing support — all in one place.</p>
            <div className="cd-hero-badges">
              <span className="cd-badge"><span className="cd-badge-icon"><UserRound size={14} strokeWidth={2.4} /></span> 1-on-1 Consultation</span>
              <span className="cd-badge"><span className="cd-badge-icon"><MessagesSquare size={14} strokeWidth={2.4} /></span> 7-Day Chat Support</span>
              <span className="cd-badge"><span className="cd-badge-icon"><ShieldCheck size={14} strokeWidth={2.4} /></span> 100% Confidential</span>
            </div>
            <div className="cd-hero-stats">
              <div className="cd-hero-stat">
                <span className="cd-hero-stat-val">500+</span>
                <span className="cd-hero-stat-label">Verified Dietitians</span>
              </div>
              <div className="cd-hero-stat-divider" />
              <div className="cd-hero-stat">
                <span className="cd-hero-stat-val">10,000+</span>
                <span className="cd-hero-stat-label">Happy Clients</span>
              </div>
              <div className="cd-hero-stat-divider" />
              <div className="cd-hero-stat">
                <span className="cd-hero-stat-val">4.8 ★</span>
                <span className="cd-hero-stat-label">Average Rating</span>
              </div>
            </div>
          </div>

          <div className="cd-hero-card">
            <div className="cd-hero-card-info">
              <span className="cd-hero-card-badge">✦ 1-on-1 Expert Session</span>
              <p className="cd-hero-card-title">Start Your Health Journey</p>
              <p className="cd-hero-card-sub">Personalised consultation with a verified dietitian</p>
              <div className="cd-hero-card-price-wrap">
                <span className="cd-hero-card-price-label">Starting from</span>
                <span className="cd-hero-card-price">₹1,499</span>
              </div>
              <p className="cd-hero-card-validity">Price set by each dietitian</p>
              <button
                className="cd-book-btn"
                onClick={() => document.getElementById('cd-listing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Book Consultation →
              </button>
            </div>
            <img className="cd-hero-card-img" src="/consult-hero-dietitian.png" alt="Dietitian consultation" />
          </div>
        </div>
      </section>

      {/* ── Main Body ── */}
      <div className="container cd-body">

        {/* Mobile filter toggle — only visible on ≤900px */}
        <button className="cd-filter-toggle" onClick={() => setSidebarOpen(o => !o)}>
          <SlidersHorizontal size={16} strokeWidth={2.2} />
          {sidebarOpen ? 'Hide Filters' : 'Filters'}
          {sidebarOpen ? <X size={15} strokeWidth={2.5} /> : null}
        </button>

        {/* Sidebar */}
        <aside className={`cd-sidebar${sidebarOpen ? ' cd-sidebar--open' : ''}`}>
          <div className="cd-sidebar-header">
            <span className="cd-sidebar-title">
              <SlidersHorizontal size={16} strokeWidth={2.2} /> Filters
            </span>
            <button className="cd-clear-btn" onClick={clearFilters}>Clear All</button>
          </div>

          {/* 1 — Availability */}
          <div className="cd-filter-group">
            <p className="cd-filter-label">Availability</p>
            <label className="cd-check-label">
              <input type="checkbox" checked={availableNow} onChange={e => setAvailableNow(e.target.checked)} />
              <span>Available Now</span>
            </label>
          </div>

          {/* 2 — Consultation Fee */}
          <div className="cd-filter-group">
            <p className="cd-filter-label">Consultation Fee</p>
            <div className="cd-fee-range-vals">
              <span>₹{feeMin.toLocaleString('en-IN')}</span>
              <span>₹{feeMax.toLocaleString('en-IN')}</span>
            </div>
            <div className="cd-fee-range-track">
              <div
                className="cd-fee-range-fill"
                style={{
                  left: `${((feeMin - FEE_RANGE_MIN) / (FEE_RANGE_MAX - FEE_RANGE_MIN)) * 100}%`,
                  right: `${100 - ((feeMax - FEE_RANGE_MIN) / (FEE_RANGE_MAX - FEE_RANGE_MIN)) * 100}%`,
                }}
              />
              <input
                type="range"
                className="cd-fee-slider cd-fee-slider--min"
                min={FEE_RANGE_MIN}
                max={FEE_RANGE_MAX}
                step={50}
                value={feeMin}
                onChange={e => setFeeMin(Math.min(Number(e.target.value), feeMax - 1))}
              />
              <input
                type="range"
                className="cd-fee-slider cd-fee-slider--max"
                min={FEE_RANGE_MIN}
                max={FEE_RANGE_MAX}
                step={50}
                value={feeMax}
                onChange={e => setFeeMax(Math.max(Number(e.target.value), feeMin + 1))}
              />
            </div>
            <div className="cd-fee-range-labels">
              <span>₹{FEE_RANGE_MIN.toLocaleString('en-IN')}</span>
              <span>₹{FEE_RANGE_MAX.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* 3 — Specialization */}
          <div className="cd-filter-group">
            <p className="cd-filter-label">Specialization</p>
            <SearchableSelect
              options={specializations.map(s => ({ value: s.value, label: s.value }))}
              value={specialization}
              onChange={setSpecialization}
              placeholder="Select specialization"
              searchPlaceholder="Search specialization..."
            />
          </div>

          {/* 4 — Experience */}
          <div className="cd-filter-group">
            <p className="cd-filter-label">Experience</p>
            {EXPERIENCE_OPTIONS.map(exp => (
              <label key={exp} className="cd-check-label">
                <input type="checkbox" checked={experience.includes(exp)} onChange={() => toggleExperience(exp)} />
                <span>{exp}</span>
              </label>
            ))}
          </div>

          {/* 5 — Gender */}
          <div className="cd-filter-group">
            <p className="cd-filter-label">Gender</p>
            {(['all', 'female', 'male'] as const).map(g => (
              <label key={g} className="cd-radio-label">
                <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} />
                <span>{g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}</span>
              </label>
            ))}
          </div>

          {/* 6 — Language */}
          <div className="cd-filter-group">
            <p className="cd-filter-label">Language</p>
            <SearchableSelect
              options={LANGUAGE_OPTIONS.map(l => ({ value: l, label: l }))}
              value={language}
              onChange={setLanguage}
              placeholder="Select language"
              searchPlaceholder="Search language..."
            />
          </div>

          {/* 7 — Location */}
          <div className="cd-filter-group">
            <p className="cd-filter-label">State</p>
            <SearchableSelect
              options={IN_STATES.map(s => ({ value: s.isoCode, label: s.name }))}
              value={stateCode}
              onChange={code => {
                const name = IN_STATES.find(s => s.isoCode === code)?.name ?? ''
                setStateCode(code)
                setStateName(name)
                setCity('')
              }}
              placeholder="Select state"
              searchPlaceholder="Search state..."
            />
          </div>

          <div className="cd-filter-group">
            <p className="cd-filter-label">City</p>
            <SearchableSelect
              options={cities.map(c => ({ value: c, label: c }))}
              value={city}
              onChange={setCity}
              placeholder={!stateCode ? 'Select a state first' : 'Select city'}
              searchPlaceholder="Search city..."
              disabled={!stateCode}
            />
          </div>

        </aside>

        {/* Content */}
        <div className="cd-content">
          {/* Search + Sort */}
          <div className="cd-search-row" id="cd-listing">
            <div className="cd-search-wrap">
              <Search className="cd-search-icon" size={17} strokeWidth={2.2} />
              <input
                className="cd-search"
                placeholder="Search by name, specialization, keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="cd-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={14} strokeWidth={2.6} />
                </button>
              )}
            </div>
            <div className="cd-sort-wrap">
              <span className="cd-sort-label">Sort by</span>
              <select
                className="cd-sort-select"
                value={sort}
                onChange={e => setSort(e.target.value as NonNullable<DietitianListParams['sort']>)}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="cd-tabs">
            {categories.map(cat => (
              <button
                key={cat.value}
                className={`cd-tab${activeCategory === cat.value ? ' cd-tab--active' : ''}`}
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Dietitian Cards */}
          <div className="cd-cards">
            {loading ? (
              <p className="cd-no-results">Loading dietitians…</p>
            ) : error ? (
              <p className="cd-no-results">{error}</p>
            ) : results.length === 0 ? (
              <p className="cd-no-results">No dietitians found matching your filters.</p>
            ) : (
              results.map(d => {
                const avail = availabilityLabel(d.availability)
                return (
                <div key={d.id} className="cd-card">

                  {/* ── Header ── */}
                  <div className="cd-card-top">
                    <div className="cd-card-avatar">
                      {d.avatar_url
                        ? <img src={d.avatar_url} alt={d.full_name} />
                        : <span className="cd-card-initials">{initialsOf(d.full_name)}</span>
                      }
                    </div>
                    <div className="cd-card-info">
                      <h3 className="cd-card-name">
                        {d.full_name} {d.is_verified && <span className="cd-verified">✓</span>}
                      </h3>
                      <p className="cd-card-title">{d.title}</p>
                      <div className="cd-card-rating-row">
                        <div className="cd-card-rating">
                          {d.reviews > 0 ? (
                            <>
                              <span className="cd-star">★</span>
                              <span className="cd-rating-num">{d.rating}</span>
                              <span className="cd-rating-reviews">({d.reviews})</span>
                            </>
                          ) : (
                            <span className="cd-rating-reviews">New</span>
                          )}
                        </div>
                        <span className={`cd-avail-badge ${avail.cls}`}>{avail.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Fee row ── */}
                  {(d.appointment_fee ?? 0) > 0 && (
                    <div className="cd-card-fee-row">
                      <span className="cd-card-fee-amt">₹{d.appointment_fee!.toLocaleString('en-IN')}</span>
                      <span className="cd-card-fee-label">per session <span className="cd-card-fee-followup">+ Follow Up</span></span>
                    </div>
                  )}

                  {/* ── Meta ── */}
                  <div className="cd-card-meta">
                    <span className="cd-meta-item">⏱ {d.experience}</span>
                    <span className="cd-meta-item">📍 {d.location}</span>
                  </div>

                  {d.specialization.length > 0 && (
                    <div className="cd-card-section">
                      <p className="cd-card-section-label">Specializations</p>
                      <div className="cd-tags">
                        {d.specialization.slice(0, 3).map(s => <span key={s} className="cd-tag">{s}</span>)}
                        {d.specialization.length > 3 && (
                          <button className="cd-tag cd-tag--more" onClick={() => navigate(`/dietitian/${d.id}`)}>
                            +{d.specialization.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {d.languages.length > 0 && (
                    <div className="cd-card-section">
                      <p className="cd-card-section-label">Languages</p>
                      <div className="cd-langs">
                        {d.languages.map(l => <span key={l} className="cd-lang">{l}</span>)}
                      </div>
                    </div>
                  )}

                  {d.next_available && (
                    <div className="cd-card-next">
                      <span className="cd-next-icon">🕐</span>
                      <span>Next: <strong>{d.next_available.day}, {shortDate(d.next_available.date)}</strong></span>
                    </div>
                  )}

                  {/* ── Actions ── */}
                  <div className="cd-card-actions">
                    <button className="cd-view-btn" onClick={() => navigate(`/dietitian/${d.id}`)}>View Profile</button>
                    <button className="cd-consult-btn" onClick={() => setConsulting(d)}>
                      <MessageCircle size={15} strokeWidth={2.4} /> Consult Now
                    </button>
                  </div>
                </div>
                )
              })
            )}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="cd-sentinel" />
          {loadingMore && (
            <div className="cd-load-more-spinner">
              <span className="cd-spinner" />
              <span>Loading more…</span>
            </div>
          )}
          {!loadingMore && meta && page >= meta.totalPages && results.length > 0 && (
            <p className="cd-end-msg">You've seen all dietitians</p>
          )}

          {/* Trust Bar */}
          <div className="cd-trust-bar">
            {TRUST_ITEMS.map(t => (
              <div key={t.title} className="cd-trust-item">
                <span className="cd-trust-icon"><t.icon size={20} strokeWidth={2.2} /></span>
                <div>
                  <p className="cd-trust-title">{t.title}</p>
                  <p className="cd-trust-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {consulting && (
        <ConsultModal dietitian={consulting} fee={consulting.appointment_fee ?? 0} onClose={() => setConsulting(null)} />
      )}
    </main>
  )
}
