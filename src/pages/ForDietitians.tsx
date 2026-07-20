const PRICING_FEATURES = [
  { icon: 'fa-solid fa-tag',            text: 'White Label Diet Charts with your branding' },
  { icon: 'fa-solid fa-video',          text: 'Online Appointments & Video Consultations' },
  { icon: 'fa-solid fa-users',          text: 'Manage Online + Offline Clients in one place' },
  { icon: 'fa-solid fa-calendar-check', text: 'Appointment & Follow-up Tracking' },
  { icon: 'fa-solid fa-wallet',         text: 'Earnings Dashboard & Payout Management' },
  { icon: 'fa-solid fa-shield-halved',  text: 'Verified Dietitian Badge on your profile' },
  { icon: 'fa-solid fa-headset',        text: 'Dedicated Support at every step' },
  { icon: 'fa-solid fa-coins',          text: '₹500 wallet credit added to your account' },
]

const BENEFITS = [
  { icon: '/benefit-icon-1.png', text: 'White label diet charts under your brand' },
  { icon: '/benefit-icon-2.png', text: 'Manage online & offline clients in one place' },
  { icon: '/benefit-icon-3.png', text: 'Online appointments with video consultations' },
  { icon: '/benefit-icon-4.png', text: 'Dedicated support at every step' },
]

const WHY_CARDS = [
  { icon: '/why-icon-1.png', title: 'Verified Clients',    desc: 'We bring genuine & quality clients to you' },
  { icon: '/why-icon-4.png', title: 'Smart Technology',    desc: 'Tools that simplify your consultation' },
  { icon: '/why-icon-3.png', title: 'Professional Growth', desc: 'Build your reputation and grow your brand' },
  { icon: '/why-icon-2.png', title: 'Dedicated Support',   desc: 'We are here to help you at every step' },
]

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal'
import SEO from '../components/SEO'

const ForDietitians = () => {
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  return (
  <main className="fd-page">
    <SEO
      title="Join MeriDiet as a Dietitian | Grow Your Online Practice"
      description="Are you a dietitian or nutritionist? Join MeriDiet to connect with thousands of clients seeking personalized diet plans. Build your online practice and earn more."
      keywords="join as dietitian India, online dietitian platform, nutritionist jobs India, dietitian registration, grow dietitian practice online, diet consultation platform India"
      canonical="/for-dietitians"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: 'Online Dietitian / Nutritionist',
        description: 'Join MeriDiet as a verified dietitian. Connect with clients across India, provide online consultations, and grow your nutrition practice.',
        hiringOrganization: { '@type': 'Organization', name: 'MeriDiet', sameAs: 'https://meridiet.com' },
        jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
        employmentType: 'CONTRACTOR',
      }}
    />

    {/* ── Hero ── */}
    <section className="fd-hero">
      <div className="container fd-hero-inner">

        {/* Left */}
        <div className="fd-hero-left">
          <p className="fd-hero-eyebrow">Join MeriDiet as a</p>
          <h1 className="fd-hero-title">Dietitian</h1>
          <p className="fd-hero-desc">
            Build your online + offline practice with powerful tools designed for dietitians.<br />
            Manage clients, appointments, and diet plans — all in one place.
          </p>

          <ul className="fd-benefits">
            {BENEFITS.map((b) => (
              <li key={b.text} className="fd-benefit-item">
                <img src={b.icon} alt="" className="fd-benefit-icon" />
                {b.text}
              </li>
            ))}
          </ul>

          <div className="fd-hero-price-chip">
            <span className="fd-hero-price-amount">₹2,499</span>
            <span className="fd-hero-price-sep" />
            <span className="fd-hero-price-note">One-time fee &nbsp;·&nbsp; ₹500 wallet credit included</span>
          </div>

          <div className="fd-cta-row">
            <button className="btn-primary fd-cta-btn" onClick={() => navigate('/for-dietitians/basic-info')}>Join as Dietitian</button>
            <button className="btn-outline fd-cta-btn" onClick={() => setLoginOpen(true)}>Login</button>
          </div>
          <p className="fd-free-note">
            <img src="/free-icon.png" alt="" className="fd-free-check" /> Trusted by dietitians across India
          </p>
        </div>

        {/* Right – image (badges & leaf are part of the image) */}
        <div className="fd-hero-right">
          <img src="/dietitian-hero-v2.png" alt="Dietitian" className="fd-hero-img" />
        </div>

      </div>
    </section>

    {/* ── Pricing Section ── */}
    <section className="fd-pricing">
      <div className="container fd-pricing-inner">
        <div className="fd-pricing-left">
          <p className="fd-pricing-eyebrow">Simple & Transparent Pricing</p>
          <h2 className="fd-pricing-title">One-Time Investment to Grow Your Practice</h2>
          <p className="fd-pricing-sub">
            Pay <strong className="fd-pricing-amount-inline">₹2,499</strong> once — no monthly fees, no hidden charges.
            Get lifetime access to all MeriDiet features.
          </p>

          <ul className="fd-pricing-features">
            {PRICING_FEATURES.map(f => (
              <li key={f.text} className="fd-pricing-feature-item">
                <span className="fd-pricing-feature-icon-wrap">
                  <i className={f.icon} />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="fd-pricing-right">
          <div className="fd-plan-card">
            <div className="fd-plan-badge">One-Time Fee</div>
            <div className="fd-plan-price-row">
              <span className="fd-plan-currency">₹</span>
              <span className="fd-plan-amount">2,499</span>
            </div>
            <p className="fd-plan-credit-note">
              <i className="fa-solid fa-coins" style={{ color: '#f59e0b', marginRight: 6 }} />
              Includes <strong>₹500 wallet credit</strong> on activation
            </p>
            <div className="fd-plan-divider" />
            <p className="fd-plan-value-note">Effective cost just <strong>₹1,999</strong> after credit</p>
            <button className="btn-primary fd-plan-cta" onClick={() => navigate('/for-dietitians/basic-info')}>
              Get Started →
            </button>
            <p className="fd-plan-secure">
              <i className="fa-solid fa-lock" style={{ fontSize: 11, marginRight: 5 }} />
              Secured by Razorpay · 100% safe
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ── Why Dietitians love MeriDiet ── */}
    <section className="fd-why">
      <div className="fd-why-inner">
        <h2 className="fd-why-title">Why Dietitians love MeriDiet?</h2>
        <div className="fd-why-grid">
          {WHY_CARDS.map((c) => (
            <div key={c.title} className="fd-why-card">
              <img src={c.icon} alt={c.title} className="fd-why-icon" />
              <div className="fd-why-text">
                <strong className="fd-why-name">{c.title}</strong>
                <p className="fd-why-desc">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {loginOpen && (
      <AuthModal
        onClose={() => setLoginOpen(false)}
        initialUserType="dietitian"
        initialTab="login"
      />
    )}
  </main>
  )
}

export default ForDietitians
