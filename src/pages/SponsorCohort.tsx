import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import apiClient from '../api/client'
import ENDPOINTS from '../api/endpoints'

const WHY_SPONSOR = [
  { icon: 'fa-graduation-cap', title: 'Transform Lives', desc: 'Give women access to education and practical skills for a better life.' },
  { icon: 'fa-briefcase', title: 'Build Livelihoods', desc: 'Help women explore work-from-home opportunities with low investment.' },
  { icon: 'fa-users', title: 'Strengthen Communities', desc: 'Empowered women create a positive ripple effect in families and communities.' },
  { icon: 'fa-chart-line', title: 'Measurable Impact', desc: 'Receive regular reports on learning outcomes and impact created through your support.' },
  { icon: 'fa-handshake', title: 'Trusted Partner', desc: 'MeriDiet ensures quality training, support and ethical empowerment for every participant.' },
  { icon: 'fa-award', title: 'Recognition', desc: 'We acknowledge your support and partnership in every step of the journey.' },
]

const INCLUDED = [
  'Comprehensive nutrition & wellness curriculum',
  'Digital skills and AI tools training',
  'Entrepreneurship & work-from-home guidance',
  'Assessments & course completion certificate',
  'Mentorship and learning support',
  'Cohort tracking & progress reports',
  'Impact report for sponsors',
]

const COHORTS = [
  { size: '25', label: 'Women', tag: 'PILOT COHORT', desc: 'Start small, see the impact, build confidence.', price: '₹3,75,000', perHead: '₹15,000 / woman', popular: false, contact: false },
  { size: '50', label: 'Women', tag: 'COMMUNITY COHORT', desc: 'Build skills at scale across your community.', price: '₹7,50,000', perHead: '₹15,000 / woman', popular: true, contact: false },
  { size: '100', label: 'Women', tag: 'IMPACT COHORT', desc: 'Create deep, measurable change together.', price: '₹15,00,000', perHead: '₹15,000 / woman', popular: false, contact: false },
  { size: '500+', label: 'Women', tag: 'TRANSFORM COMMUNITIES', desc: 'Large-scale regional impact with custom support.', price: 'Custom Pricing', perHead: 'Contact us for bulk rates', popular: false, contact: true },
]

const IMPACT = [
  { icon: 'fa-tools', label: 'Skills for Livelihoods' },
  { icon: 'fa-coins', label: 'Financial Independence' },
  { icon: 'fa-house-heart', label: 'Stronger Families' },
  { icon: 'fa-heart-pulse', label: 'Healthier Communities' },
]

const PARTNER_RECEIVE = [
  { icon: 'fa-file-chart-column', label: 'Detailed Impact Reports' },
  { icon: 'fa-users-gear', label: 'Cohort Progress Tracking' },
  { icon: 'fa-certificate', label: 'Certificate of Partnership' },
  { icon: 'fa-bullhorn', label: 'Acknowledgement & Visibility' },
]

const ORG_TYPES = ['NGO', 'Corporate / CSR', 'Government Body', 'Foundation', 'Individual', 'Other']
const COHORT_SIZES = ['25 Women – Pilot Cohort', '50 Women – Community Cohort', '100 Women – Impact Cohort', '500+ Women – Transform Communities']

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh']

const SponsorCohort = () => {
  const navigate = useNavigate()
  const [selectedCohort, setSelectedCohort] = useState(1)
  const [form, setForm] = useState({ org: '', designation: '', contact: '', orgType: '', email: '', state: '', phone: '', city: '', cohortSize: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      await apiClient.apiPost(ENDPOINTS.sponsorCohort.submit, form)
      setSubmitted(true)
    } catch (err: unknown) {
      setSubmitError((err as { message?: string })?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="sc-page">
      <SEO
        title="Sponsor a Women's Cohort – CSR & NGO Partnership for Nutrition"
        description="Sponsor a cohort of women and help them learn nutrition, digital skills and entrepreneurship. Partner with MeriDiet to create generational impact."
        canonical="/sponsor-cohort"
      />

      {/* ── Hero ── */}
      <section className="we-hero">
        <div className="we-hero-left">
          <p className="we-hero-eyebrow">MERI DIET WOMEN EMPOWERMENT PROGRAM</p>
          <h1 className="we-hero-title">
            Sponsor a<br />
            Women's<br />
            <span className="we-hero-title--green">Cohort</span>
          </h1>
          <p className="we-hero-desc">
            Empower Women. Enable Livelihoods.<br />Create Generational Impact.
          </p>
          <p className="we-hero-sub">
            Sponsor a cohort of women from underserved communities and help them learn nutrition, digital skills and entrepreneurship to build a better future for themselves and their families.
          </p>
          <div className="we-hero-btns">
            <button className="btn-primary we-hero-btn" onClick={() => document.querySelector('.sc-form-section')?.scrollIntoView({ behavior: 'smooth' })}>Sponsor a Cohort →</button>
          </div>
          <div className="we-hero-chips-inline">
            <span className="we-chip"><i className="fa-solid fa-seedling" /> Practical Skills</span>
            <span className="we-chip"><i className="fa-solid fa-laptop-house" /> Work From Home</span>
            <span className="we-chip"><i className="fa-solid fa-people-group" /> Stronger Communities</span>
            <span className="we-chip"><i className="fa-solid fa-star" /> Lasting Impact</span>
          </div>
        </div>
        <div className="we-hero-right">
          <img src="/sponsor-hero.svg" alt="Sponsor a Women's Cohort" className="we-hero-img" />
        </div>
      </section>

      {/* ── Why Sponsor ── */}
      <section className="sc-why">
        <div className="container sc-why-inner">
          <h2 className="sc-section-title">Why Sponsor a <span className="sc-green">Women's Cohort?</span></h2>
          <img src="/section-divider.svg" alt="" className="sc-divider" />
          <div className="sc-why-grid">
            {WHY_SPONSOR.map(item => (
              <div key={item.title} className="sc-why-card">
                <div className="sc-why-icon"><i className={`fa-solid ${item.icon}`} /></div>
                <h3 className="sc-why-title">{item.title}</h3>
                <p className="sc-why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Included + Cohort Size ── */}
      <section className="sc-mid">
        <div className="container sc-mid-inner">
          <div className="sc-included">
            <h2 className="sc-section-title sc-section-title--left">What's Included in the <span className="sc-green">Program</span></h2>
            <ul className="sc-included-list">
              {INCLUDED.map(item => (
                <li key={item} className="sc-included-item">
                  <i className="fa-solid fa-circle-check" /> {item}
                </li>
              ))}
            </ul>
            <img src="/impact-image.svg" alt="" className="sc-included-img" />
          </div>

          <div className="sc-cohort-size">
            <h2 className="sc-section-title sc-section-title--left">Choose Your <span className="sc-green">Cohort Size</span></h2>
            <p className="sc-cohort-sub">Select the number of women you would like to sponsor</p>
            <div className="sc-cohort-cards">
              {COHORTS.map((c, idx) => (
                <div key={c.tag} className={`sc-cohort-card ${selectedCohort === idx ? 'sc-cohort-card--active' : ''} ${c.popular ? 'sc-cohort-card--popular' : ''}`} onClick={() => setSelectedCohort(idx)}>
                  {c.popular && <div className="sc-cohort-popular">Most Popular</div>}
                  <div className="sc-cohort-top">
                    <div className="sc-cohort-num">{c.size}</div>
                    <div className="sc-cohort-label">{c.label}</div>
                  </div>
                  <div className="sc-cohort-tag">{c.tag}</div>
                  <p className="sc-cohort-desc">{c.desc}</p>
                  <div className="sc-cohort-price-block">
                    <div className="sc-cohort-price">{c.price}</div>
                    <div className="sc-cohort-perhead">{c.perHead}</div>
                  </div>
                  {c.contact
                    ? <button className="sc-cohort-btn sc-cohort-btn--outline" onClick={e => { e.stopPropagation(); navigate('/women-empowerment') }}>Contact Us</button>
                    : <button className={`sc-cohort-btn ${selectedCohort === idx ? 'sc-cohort-btn--selected' : ''}`} onClick={e => { e.stopPropagation(); setSelectedCohort(idx) }}>
                        {selectedCohort === idx ? '✓ Selected' : 'Select'}
                      </button>
                  }
                </div>
              ))}
            </div>
            <p className="sc-cohort-note"><i className="fa-solid fa-circle-info" /> All amounts are indicative. Custom programs and larger cohorts available.</p>
          </div>
        </div>
      </section>

      {/* ── Impact ── */}
      <section className="sc-impact">
        <div className="container sc-impact-inner">
          <h2 className="sc-section-title">Impact You Help <span className="sc-green">Create</span></h2>
          <div className="sc-impact-grid">
            {IMPACT.map(item => (
              <div key={item.label} className="sc-impact-card">
                <div className="sc-impact-icon"><i className={`fa-solid ${item.icon}`} /></div>
                <p className="sc-impact-label">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="sc-impact-quote">"When you educate a woman, you educate a family.<br />When you empower a woman, you transform a community."</p>
        </div>
      </section>

      {/* ── What Partners Receive ── */}
      <section className="sc-receive">
        <div className="container sc-receive-inner">
          <h2 className="sc-section-title">What Our <span className="sc-green">Partners Receive</span></h2>
          <div className="sc-receive-grid">
            {PARTNER_RECEIVE.map(item => (
              <div key={item.label} className="sc-receive-card">
                <div className="sc-receive-icon"><i className={`fa-solid ${item.icon}`} /></div>
                <p className="sc-receive-label">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="sc-receive-banner">
            <img src="/impact-image.svg" alt="" className="sc-receive-img" />
            <div className="sc-receive-banner-text">
              <p>You Sponsor.</p>
              <p>We Train.</p>
              <p>Women Succeed.</p>
              <p>Communities Thrive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="sc-form-section">
        <div className="container sc-form-inner">
          <h2 className="sc-section-title">Sponsor a <span className="sc-green">Women's Cohort</span></h2>
          <p className="sc-form-sub">Fill out the form and our team will connect with you.</p>

          {submitted ? (
            <div className="sc-form-success">
              <i className="fa-solid fa-circle-check" />
              <p>Thank you! We'll connect with you shortly.</p>
            </div>
          ) : (
            <form className="sc-form" onSubmit={handleSubmit}>
              <div className="sc-form-row">
                <div className="sc-form-group">
                  <label>Organization Name <span>*</span></label>
                  <input placeholder="Enter organization name" value={form.org} onChange={set('org')} required />
                </div>
                <div className="sc-form-group">
                  <label>Designation</label>
                  <input placeholder="Enter designation" value={form.designation} onChange={set('designation')} />
                </div>
              </div>
              <div className="sc-form-row">
                <div className="sc-form-group">
                  <label>Contact Person <span>*</span></label>
                  <input placeholder="Enter contact person name" value={form.contact} onChange={set('contact')} required />
                </div>
                <div className="sc-form-group">
                  <label>Organization Type <span>*</span></label>
                  <select value={form.orgType} onChange={set('orgType')} required>
                    <option value="">Select type</option>
                    {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="sc-form-row">
                <div className="sc-form-group">
                  <label>Email Address <span>*</span></label>
                  <input type="email" placeholder="Enter email address" value={form.email} onChange={set('email')} required />
                </div>
                <div className="sc-form-group">
                  <label>State <span>*</span></label>
                  <select value={form.state} onChange={set('state')} required>
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="sc-form-row">
                <div className="sc-form-group">
                  <label>Phone Number <span>*</span></label>
                  <input placeholder="Enter phone number" value={form.phone} onChange={set('phone')} required />
                </div>
                <div className="sc-form-group">
                  <label>City <span>*</span></label>
                  <input placeholder="Enter city" value={form.city} onChange={set('city')} required />
                </div>
              </div>
              <div className="sc-form-group">
                <label>Preferred Cohort Size <span>*</span></label>
                <select value={form.cohortSize} onChange={set('cohortSize')} required>
                  <option value="">Select preferred cohort size</option>
                  {COHORT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="sc-form-group">
                <label>Message / Additional Requirements</label>
                <textarea rows={4} placeholder="Tell us about your goals, location, target group, timeline or any other requirement." value={form.message} onChange={set('message')} />
              </div>
              {submitError && <p className="sc-form-error">{submitError}</p>}
              <button type="submit" className="sc-form-submit" disabled={submitting}>
                {submitting ? 'Submitting…' : <> Submit Sponsorship Request <i className="fa-solid fa-arrow-right" /></>}
              </button>
              <p className="sc-form-privacy"><i className="fa-solid fa-lock" /> Your information is safe with us. We respect your privacy.</p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

export default SponsorCohort
