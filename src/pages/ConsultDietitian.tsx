import { useState, useEffect } from 'react'
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

const ALL_CATEGORY = 'All Dietitians'
const CONSULT_FEE = 2499   // fallback until /consultation-fee resolves

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
  const [fee, setFee] = useState(CONSULT_FEE)

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

  // Cities for the selected state (local map, keyed by state code)
  const cities = stateCode ? getCitiesOfState(stateCode).map(c => c.name) : []

  useEffect(() => {
    dietitianApi.getSpecializations()
      .then(list => setSpecializations(list.filter(s => s.is_active)))
      .catch(err => console.error('[Specializations] Failed to load:', err))

    dietitianApi.getConsultationFee()
      .then(amount => { if (amount > 0) setFee(amount) })
      .catch(err => console.error('[Consultation Fee] Failed to load:', err))
  }, [])

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  // Any filter change resets to page 1 (no-op re-render if already 1)
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, activeCategory, sort, gender, stateName, city, specialization, experience, language, availableNow])

  // Fetch the dietitian list whenever the query changes (filters apply live)
  useEffect(() => {
    const params: DietitianListParams = {
      search:         debouncedSearch || undefined,
      specialization: activeCategory !== ALL_CATEGORY ? activeCategory : (specialization || undefined),
      gender:         gender !== 'all' ? gender : undefined,
      location:       city || stateName || undefined,
      language:       language || undefined,
      available_now:  availableNow || undefined,
      sort,
      page,
      limit: 12,
      ...experienceRange(experience),
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    dietitianApi.listDietitians(params)
      .then(({ data, meta }) => { if (!cancelled) { setResults(data); setMeta(meta) } })
      .catch(err => { if (!cancelled) { setError(err?.message ?? 'Failed to load dietitians'); setResults([]) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedSearch, activeCategory, sort, page, gender, stateName, city, specialization, experience, language, availableNow])

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
  }

  return (
    <main className="cd-page">

      {/* ── Hero ── */}
      <section className="cd-hero">
        <div className="container cd-hero-inner">
          <div className="cd-hero-left">
            <h1 className="cd-hero-title">
              Consult Top <span className="cd-green">Dietitians</span> Online
            </h1>
            <p className="cd-hero-sub">Personalized guidance. Real results. Anytime, anywhere.</p>
            <div className="cd-hero-badges">
              <span className="cd-badge"><span className="cd-badge-icon"><UserRound size={15} strokeWidth={2.4} /></span> Live 1-on-1 Consultation</span>
              <span className="cd-badge"><span className="cd-badge-icon"><MessagesSquare size={15} strokeWidth={2.4} /></span> Chat Support 7 Days a Week</span>
              <span className="cd-badge"><span className="cd-badge-icon"><ShieldCheck size={15} strokeWidth={2.4} /></span> 100% Confidential &amp; Secure</span>
            </div>
          </div>

          <div className="cd-hero-card">
            <div className="cd-hero-card-info">
              <p className="cd-hero-card-title">Start your health journey today!</p>
              <p className="cd-hero-card-sub">Book a 1-on-1 consultation</p>
              <p className="cd-hero-card-price">₹{fee.toLocaleString('en-IN')}</p>
              <p className="cd-hero-card-validity">Valid for 30 Days</p>
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

        {/* Sidebar */}
        <aside className="cd-sidebar">
          <div className="cd-sidebar-header">
            <span className="cd-sidebar-title">
              <SlidersHorizontal size={16} strokeWidth={2.2} /> Filters
            </span>
            <button className="cd-clear-btn" onClick={clearFilters}>Clear All</button>
          </div>

          <div className="cd-filter-group">
            <p className="cd-filter-label">Gender</p>
            {(['all', 'female', 'male'] as const).map(g => (
              <label key={g} className="cd-radio-label">
                <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} />
                <span>{g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}</span>
              </label>
            ))}
          </div>

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

          <div className="cd-filter-group">
            <p className="cd-filter-label">Experience</p>
            {EXPERIENCE_OPTIONS.map(exp => (
              <label key={exp} className="cd-check-label">
                <input type="checkbox" checked={experience.includes(exp)} onChange={() => toggleExperience(exp)} />
                <span>{exp}</span>
              </label>
            ))}
          </div>

          <div className="cd-filter-group">
            <p className="cd-filter-label">Language Known</p>
            <SearchableSelect
              options={LANGUAGE_OPTIONS.map(l => ({ value: l, label: l }))}
              value={language}
              onChange={setLanguage}
              placeholder="Select language"
              searchPlaceholder="Search language..."
            />
          </div>

          <div className="cd-filter-group">
            <p className="cd-filter-label">Availability</p>
            <label className="cd-check-label">
              <input type="checkbox" checked={availableNow} onChange={e => setAvailableNow(e.target.checked)} />
              <span>Available Now</span>
            </label>
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
                  <div className="cd-card-top">
                    <div className="cd-card-avatar">
                      {d.avatar_url
                        ? <img src={d.avatar_url} alt={d.full_name} />
                        : <span className="cd-card-initials">{initialsOf(d.full_name)}</span>
                      }
                    </div>
                    <div className="cd-card-info">
                      <div className="cd-card-name-row">
                        <h3 className="cd-card-name">
                          {d.full_name} {d.is_verified && <span className="cd-verified">✓</span>}
                        </h3>
                        <span className={`cd-avail-badge ${avail.cls}`}>{avail.text}</span>
                      </div>
                      <p className="cd-card-title">{d.title}</p>
                      <div className="cd-card-rating">
                        {d.reviews > 0 ? (
                          <>
                            <span className="cd-star">★</span>
                            <span className="cd-rating-num">{d.rating}</span>
                            <span className="cd-rating-reviews">({d.reviews} reviews)</span>
                          </>
                        ) : (
                          <span className="cd-rating-reviews">New</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="cd-card-meta">
                    <span className="cd-meta-item">⏱ {d.experience}</span>
                    <span className="cd-meta-item">📍 {d.location}</span>
                  </div>

                  <div className="cd-card-section">
                    <p className="cd-card-section-label">Specializations</p>
                    <div className="cd-tags">
                      {d.specialization.map(s => <span key={s} className="cd-tag">{s}</span>)}
                    </div>
                  </div>

                  <div className="cd-card-section">
                    <p className="cd-card-section-label">Languages</p>
                    <div className="cd-langs">
                      {d.languages.map(l => <span key={l} className="cd-lang">{l}</span>)}
                    </div>
                  </div>

                  {d.next_available && (
                    <div className="cd-card-next">
                      <span className="cd-next-icon">🕐</span>
                      <span>Next Available: <strong>{d.next_available.day}, {shortDate(d.next_available.date)}</strong></span>
                    </div>
                  )}

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

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="cd-pagination">
              <button
                className="cd-page-btn"
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <span className="cd-page-info">Page {meta.page} of {meta.totalPages}</span>
              <button
                className="cd-page-btn"
                disabled={page >= meta.totalPages || loading}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
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
        <ConsultModal dietitian={consulting} fee={fee} onClose={() => setConsulting(null)} />
      )}
    </main>
  )
}
