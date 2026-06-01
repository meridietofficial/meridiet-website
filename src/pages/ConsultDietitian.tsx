import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DIETITIANS } from '../data/dietitians'

const CATEGORIES = [
  'All Dietitians',
  'Weight Loss',
  'PCOS / PCOD',
  'Diabetes',
  'Thyroid',
  'Sports Nutrition',
  'Child Nutrition',
  'Gut Health',
]

const TRUST_ITEMS = [
  { icon: '🔒', title: 'Secure Payments', desc: '100% safe & secure' },
  { icon: '👩‍⚕️', title: 'Expert Dietitians', desc: 'Verified & experienced' },
  { icon: '📋', title: 'Personalized Plans', desc: 'Tailored just for you' },
  { icon: '💬', title: 'Ongoing Support', desc: 'Chat with your dietitian anytime' },
]

const SPECIALIZATION_OPTIONS = [
  'Weight Loss', 'Weight Gain', 'PCOS / PCOD', 'Diabetes', 'Thyroid',
  'Sports Nutrition', 'Child Nutrition', 'Gut Health', 'Muscle Gain',
]

const EXPERIENCE_OPTIONS = ['0 - 3 years', '3 - 7 years', '7+ years']
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Punjabi']

export default function ConsultDietitian() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Dietitians')
  const [gender, setGender] = useState('all')
  const [location, setLocation] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [experience, setExperience] = useState<string[]>([])
  const [language, setLanguage] = useState('')
  const [availableNow, setAvailableNow] = useState(false)

  const toggleExperience = (val: string) =>
    setExperience(prev => prev.includes(val) ? prev.filter(e => e !== val) : [...prev, val])

  const clearFilters = () => {
    setGender('all')
    setLocation('')
    setSpecialization('')
    setExperience([])
    setLanguage('')
    setAvailableNow(false)
  }

  const filtered = DIETITIANS.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) &&
      !d.title.toLowerCase().includes(search.toLowerCase()) &&
      !d.specializations.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false
    if (activeCategory !== 'All Dietitians' && !d.specializations.includes(activeCategory)) return false
    if (gender !== 'all' && d.gender !== gender) return false
    if (specialization && !d.specializations.includes(specialization)) return false
    if (language && !d.languages.includes(language)) return false
    if (availableNow && d.availability !== 'Available Now') return false
    if (experience.length > 0) {
      const yearsMatch = experience.some(exp => {
        if (exp === '0 - 3 years') return parseInt(d.experience) <= 3
        if (exp === '3 - 7 years') return parseInt(d.experience) >= 3 && parseInt(d.experience) <= 7
        if (exp === '7+ years') return parseInt(d.experience) >= 7
        return false
      })
      if (!yearsMatch) return false
    }
    return true
  })

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
              <span className="cd-badge"><span className="cd-badge-icon">👤</span> Live 1-on-1 Consultation</span>
              <span className="cd-badge"><span className="cd-badge-icon">💬</span> Chat Support 7 Days a Week</span>
              <span className="cd-badge"><span className="cd-badge-icon">🔒</span> 100% Confidential &amp; Secure</span>
            </div>
          </div>

          <div className="cd-hero-card">
            <p className="cd-hero-card-title">Start your health journey today!</p>
            <p className="cd-hero-card-sub">Book a 1-on-1 consultation</p>
            <p className="cd-hero-card-price">₹2499</p>
            <p className="cd-hero-card-validity">Valid for 30 Days</p>
            <button className="cd-book-btn">Book Consultation →</button>
          </div>
        </div>
      </section>

      {/* ── Main Body ── */}
      <div className="container cd-body">

        {/* Sidebar */}
        <aside className="cd-sidebar">
          <div className="cd-sidebar-header">
            <span className="cd-sidebar-title">Filters</span>
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
            <p className="cd-filter-label">Location</p>
            <select className="cd-select" value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">Select Location</option>
              <option>Mumbai, Maharashtra</option>
              <option>Delhi, India</option>
              <option>Bengaluru, Karnataka</option>
              <option>Chennai, Tamil Nadu</option>
              <option>Pune, Maharashtra</option>
              <option>Hyderabad, Telangana</option>
            </select>
          </div>

          <div className="cd-filter-group">
            <p className="cd-filter-label">Specialization</p>
            <select className="cd-select" value={specialization} onChange={e => setSpecialization(e.target.value)}>
              <option value="">Select Specialization</option>
              {SPECIALIZATION_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
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
            <select className="cd-select" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="">Select Language</option>
              {LANGUAGE_OPTIONS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div className="cd-filter-group">
            <p className="cd-filter-label">Availability</p>
            <label className="cd-check-label">
              <input type="checkbox" checked={availableNow} onChange={e => setAvailableNow(e.target.checked)} />
              <span>Available Now</span>
            </label>
          </div>

          <button className="cd-apply-btn" onClick={() => {}}>Apply Filters</button>
        </aside>

        {/* Content */}
        <div className="cd-content">
          {/* Search + Sort */}
          <div className="cd-search-row">
            <div className="cd-search-wrap">
              <span className="cd-search-icon">🔍</span>
              <input
                className="cd-search"
                placeholder="Search by name, specialization, keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="cd-sort-wrap">
              <span className="cd-sort-label">Sort by</span>
              <select className="cd-sort-select">
                <option>Top Rated</option>
                <option>Most Reviewed</option>
                <option>Available Now</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="cd-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cd-tab${activeCategory === cat ? ' cd-tab--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dietitian Cards */}
          <div className="cd-cards">
            {filtered.length === 0 ? (
              <p className="cd-no-results">No dietitians found matching your filters.</p>
            ) : (
              filtered.map(d => (
                <div key={d.id} className="cd-card">
                  <div className="cd-card-top">
                    <div className="cd-card-avatar">
                      {d.image
                        ? <img src={d.image} alt={d.name} />
                        : <span className="cd-card-initials">{d.initials}</span>
                      }
                    </div>
                    <div className="cd-card-info">
                      <div className="cd-card-name-row">
                        <h3 className="cd-card-name">{d.name} <span className="cd-verified">✓</span></h3>
                        <span className={`cd-avail-badge ${d.availabilityClass}`}>{d.availability}</span>
                      </div>
                      <p className="cd-card-title">{d.title}</p>
                      <div className="cd-card-rating">
                        <span className="cd-star">★</span>
                        <span className="cd-rating-num">{d.rating}</span>
                        <span className="cd-rating-reviews">({d.reviews} reviews)</span>
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
                      {d.specializations.map(s => <span key={s} className="cd-tag">{s}</span>)}
                    </div>
                  </div>

                  <div className="cd-card-section">
                    <p className="cd-card-section-label">Languages</p>
                    <div className="cd-langs">
                      {d.languages.map(l => <span key={l} className="cd-lang">{l}</span>)}
                    </div>
                  </div>

                  <div className="cd-card-next">
                    <span className="cd-next-icon">🕐</span>
                    <span>Next Available: <strong>{d.nextAvailable}</strong></span>
                  </div>

                  <div className="cd-card-actions">
                    <button className="cd-view-btn" onClick={() => navigate(`/dietitian/${d.id}`)}>View Profile</button>
                    <button className="cd-consult-btn">Consult Now 💬</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Trust Bar */}
          <div className="cd-trust-bar">
            {TRUST_ITEMS.map(t => (
              <div key={t.title} className="cd-trust-item">
                <span className="cd-trust-icon">{t.icon}</span>
                <div>
                  <p className="cd-trust-title">{t.title}</p>
                  <p className="cd-trust-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
