const BENEFITS = [
  { icon: '/benefit-icon-1.png', text: 'Get new clients every day' },
  { icon: '/benefit-icon-2.png', text: 'Flexible consultation timings' },
  { icon: '/benefit-icon-3.png', text: 'Grow your brand with MeriDiet' },
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

const ForDietitians = () => {
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  return (
  <main className="fd-page">

    {/* ── Hero ── */}
    <section className="fd-hero">
      <div className="container fd-hero-inner">

        {/* Left */}
        <div className="fd-hero-left">
          <p className="fd-hero-eyebrow">Join MeriDiet as a</p>
          <h1 className="fd-hero-title">Dietitian</h1>
          <p className="fd-hero-desc">
            Empower lives with science-backed nutrition.<br />
            Grow your practice with India's trusted nutrition platform.
          </p>

          <ul className="fd-benefits">
            {BENEFITS.map((b) => (
              <li key={b.text} className="fd-benefit-item">
                <img src={b.icon} alt="" className="fd-benefit-icon" />
                {b.text}
              </li>
            ))}
          </ul>

          <div className="fd-cta-row">
            <button className="btn-primary fd-cta-btn" onClick={() => navigate('/for-dietitians/basic-info')}>Join as Dietitian</button>
            <button className="btn-outline fd-cta-btn" onClick={() => setLoginOpen(true)}>Login</button>
          </div>
          <p className="fd-free-note">
            <img src="/free-icon.png" alt="" className="fd-free-check" /> It's free to register
          </p>
        </div>

        {/* Right – image (badges & leaf are part of the image) */}
        <div className="fd-hero-right">
          <img src="/dietitian-hero-v2.png" alt="Dietitian" className="fd-hero-img" />
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
