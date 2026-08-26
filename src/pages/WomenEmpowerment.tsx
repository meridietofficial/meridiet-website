import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

const WHY_MATTERS = [
  { img: '/why-matters-1.png', text: 'Many women want to become financially independent.' },
  { img: '/why-matters-2.png', text: 'But barriers like lack of training, mobility, time and money hold them back.' },
  { img: '/why-matters-3.png', text: 'We provide practical skills that can be used from home with flexibility.' },
  { img: '/why-matters-4.png', text: 'This creates an opportunity for women to learn, grow and earn.' },
  { img: '/why-matters-5.png', text: 'Empowered women empower families and communities.' },
]

const LEARN_MODULES = [
  {
    img: '/learn-1.png',
    title: 'Nutrition Fundamentals',
    points: ['Basics of nutrition', 'Calories & macros', 'Portion planning', 'Healthy habits'],
  },
  {
    img: '/learn-2.png',
    title: 'Indian Meal Plans',
    points: ['Indian foods', 'Veg & Non-veg plans', 'Balanced meals', 'Budget-friendly food'],
  },
  {
    img: '/learn-3.png',
    title: 'Weight & Wellness Concepts',
    points: ['BMI & body metrics', 'Weight management', 'Meal timing', 'Sustainable habits'],
  },
  {
    img: '/learn-4.png',
    title: 'Client Communication',
    points: ['Understanding goals', 'Collecting information', 'Clear communication', 'Client follow-up'],
  },
  {
    img: '/learn-5.png',
    title: 'Digital & AI Skills',
    points: ['Digital tools', 'AI for nutrition work', 'Organizing data', 'Online communication'],
  },
  {
    img: '/learn-6.png',
    title: 'Livelihood & Entrepreneurship',
    points: ['Start small', 'Client management', 'Pricing & packages', 'Grow your income'],
  },
]

const STATS = [
  { value: '20+', label: 'Cities Reached' },
  { value: '500+', label: 'Women Trained' },
  { value: '50+', label: 'NGO & CSR Partners' },
  { value: '95%', label: 'Recommendation' },
]

const HOW_IT_WORKS = [
  { num: 1, icon: '/how-step-icon-1.svg', title: 'NGO or CSR Partner Sponsors a Cohort', desc: 'They select women from your community.' },
  { num: 2, icon: '/how-step-icon-2.svg', title: 'Women Join the Learning Program', desc: 'They get access to our structured curriculum.' },
  { num: 3, icon: '/how-step-icon-3.svg', title: 'Complete Learning & Assessments', desc: 'Interactive modules, quizzes & assignments.' },
  { num: 4, icon: '/how-step-icon-4.svg', title: 'Receive Course Completion', desc: 'Participants earn a Meri Diet certificate.' },
  { num: 5, icon: '/how-step-icon-5.svg', title: 'Livelihood Readiness & Support', desc: 'Guidance on work-from-home opportunities & growth.' },
]

const WHY_PARTNER = [
  'Structured, practical & easy-to-understand curriculum',
  'Designed for home-based learning',
  'Digital & entrepreneurship skills included',
  'Regular progress tracking & reports',
  'Certification for completed participants',
  'Dedicated support for your organization',
]

const AREAS_OF_INTEREST = [
  'Support a Cohort',
  'Corporate CSR',
  'NGO Partnership',
  'Government Program',
  'Individual Sponsorship',
  'Other',
]

const WomenEmpowerment = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    org: '', name: '', email: '', phone: '', city: '', state: '', area: '', message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="we-page">
      <SEO
        title="Women Empowerment Program | MeriDiet"
        description="MeriDiet Women Empowerment Program — Learn Nutrition, Build Digital Skills, Create New Livelihood Opportunities from home."
        keywords="women empowerment, nutrition program, work from home, women livelihood, MeriDiet women"
        canonical="/women-empowerment"
      />

      {/* ── Hero ── */}
      <section className="we-hero">
        <div className="we-hero-left">
          <p className="we-hero-eyebrow">MERI DIET WOMEN EMPOWERMENT PROGRAM</p>
          <h1 className="we-hero-title">
            Empower Women<br />
            With Skills<br />
            <span className="we-hero-title--green">They Can Use<br />From Home</span>
          </h1>
          <p className="we-hero-desc">
            Learn Nutrition. Build Digital Skills.<br />Create New Livelihood Opportunities.
          </p>
          <p className="we-hero-sub">
            A structured nutrition and wellness training program for women who want to become independent and build a better future for themselves and their families.
          </p>
          <div className="we-hero-btns">
            <button className="btn-primary we-hero-btn">Partner With Meri Diet</button>
            <button className="btn-outline we-hero-btn" onClick={() => navigate('/sponsor-cohort')}>Sponsor a Women's Cohort</button>
          </div>
          <div className="we-hero-chips-inline">
            <span className="we-chip"><i className="fa-solid fa-indian-rupee-sign" /> Low Investment</span>
            <span className="we-chip"><i className="fa-solid fa-house" /> Learn From Home</span>
            <span className="we-chip"><i className="fa-solid fa-clock" /> Flexible Work</span>
            <span className="we-chip"><i className="fa-solid fa-star" /> Better Future</span>
          </div>
        </div>
        <div className="we-hero-right">
          <img src="/women-hero.svg" alt="Women Empowerment" className="we-hero-img" />
        </div>
      </section>

      {/* ── Why This Program Matters ── */}
      <section className="we-why">
        <div className="container we-why-inner">
          <h2 className="we-section-title we-section-title--with-divider">Why This Program <span style={{ color: '#006E1B' }}>Matters?</span></h2>
          <img src="/section-divider.svg" alt="" className="we-section-divider" />
          <div className="we-why-grid">
            {WHY_MATTERS.map((item, idx) => (
              <div key={idx} className="we-why-card">
                <img src={item.img} alt="" className="we-why-icon" />
                <p className="we-why-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What Participants Will Learn ── */}
      <section className="we-learn">
        <div className="container we-learn-inner">
          <h2 className="we-section-title we-section-title--with-divider">What Participants Will <span style={{ color: '#006E1B' }}>Learn</span></h2>
          <img src="/section-divider.svg" alt="" className="we-section-divider" />
          <div className="we-learn-grid">
            {LEARN_MODULES.map((mod) => (
              <div key={mod.title} className="we-learn-card">
                <img src={mod.img} alt={mod.title} className="we-learn-icon" />
                <h3 className="we-learn-title">{mod.title}</h3>
                <ul className="we-learn-list">
                  {mod.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="we-stats">
        <div className="container we-stats-inner">
          <div className="we-stats-content">
            <p className="we-stats-label">Creating Real Impact</p>
            <div className="we-stats-grid">
              {STATS.map((s) => (
                <div key={s.label} className="we-stat">
                  <span className="we-stat-value">{s.value}</span>
                  <span className="we-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <img src="/impact-image.svg" alt="Impact" className="we-stats-img" />
        </div>
      </section>

      {/* ── How the Program Works ── */}
      <section className="we-how">
        <div className="container we-how-inner">
          <h2 className="we-section-title">How the Program Works</h2>
          <div className="we-how-steps">
            {HOW_IT_WORKS.map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="we-how-step">
                  <div className="we-how-num">{step.num}</div>
                </div>
                <div className="we-how-connector">
                  <div className="we-how-connector-track">
                    <span className="we-how-dash" />
                    <img src={step.icon} alt="" className="we-how-connector-icon" />
                    <span className="we-how-dash" />
                  </div>
                  <h3 className="we-how-title">{step.title}</h3>
                  <p className="we-how-desc">{step.desc}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Partner + Contact Form ── */}
      <section className="we-partner">
        <div className="container we-partner-inner">
          <div className="we-partner-left we-partner-left--card">
            <h2 className="we-partner-title">Why Partner With <span style={{ color: '#006E1B' }}>Meri Diet?</span></h2>
            <ul className="we-partner-list">
              {WHY_PARTNER.map((item) => (
                <li key={item} className="we-partner-item">
                  <i className="fa-solid fa-circle-check" /> {item}
                </li>
              ))}
            </ul>
            <img src="/partner-girl.svg" alt="" className="we-partner-girl" />
          </div>
          <div className="we-partner-right">
            <h2 className="we-form-title">Partner With Us</h2>
            <p className="we-form-sub">Let's empower more women together.</p>
            {submitted ? (
              <div className="we-form-success">
                <i className="fa-solid fa-circle-check" />
                <p>Thank you! We'll be in touch shortly.</p>
              </div>
            ) : (
              <form className="we-form" onSubmit={handleSubmit}>
                <div className="we-form-row">
                  <div className="we-form-group">
                    <label>Organization Name</label>
                    <input placeholder="NGO / CSR / Corporate" value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} required />
                  </div>
                  <div className="we-form-group">
                    <label>Contact Person</label>
                    <input placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="we-form-row">
                  <div className="we-form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="we-form-group">
                    <label>Phone Number</label>
                    <input placeholder="+91" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                  </div>
                </div>
                <div className="we-form-row">
                  <div className="we-form-group">
                    <label>City</label>
                    <input placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                  </div>
                  <div className="we-form-group">
                    <label>State</label>
                    <input placeholder="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                  </div>
                </div>
                <div className="we-form-group">
                  <label>Area of Interest</label>
                  <select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                    <option value="">Support a Cohort</option>
                    {AREAS_OF_INTEREST.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="we-form-group">
                  <label>Message (Optional)</label>
                  <textarea placeholder="Tell us more about your interest..." rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>
                <button type="submit" className="btn-primary we-form-submit">Request Partnership Discussion →</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default WomenEmpowerment
