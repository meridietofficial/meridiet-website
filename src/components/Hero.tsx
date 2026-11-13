import { useNavigate } from 'react-router-dom'

const Hero = ({ onOpenForm }: { onOpenForm: () => void }) => {
  const navigate = useNavigate()
  return (
    <section className="hero" id="hero">
      <div className="container hero-inner">

        {/* ── Left content ── */}
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-title-line">Get Your Personalized</span>
            <span className="hero-title-line highlight">Indian Diet Plan</span>
            <span className="hero-title-line">Within 24 Hours</span>
          </h1>
          <p className="hero-desc">
            <span style={{ color: '#1a2e1a', fontWeight: 700 }}>India's First AI-Powered Platform Blending<br />
            Intelligent Technology with Expert Dietitians.</span><br />
            <span style={{ opacity: 0.8 }}>Your personalized Indian diet plan is crafted and delivered within 24 hours — backed by AI dietitian consultation tailored to your body, goals, and food preferences.</span>
          </p>

          <div className="hero-actions">
            <button className="btn-primary hero-btn" onClick={onOpenForm}>
              Get My Diet Plan →
            </button>
            <button
              className="hero-btn-outline"
              onClick={() => navigate('/consult-dietitian')}
            >
              <i className="fa-solid fa-user-doctor" /> Consult Dietitians
            </button>
          </div>

          {/* <div className="hero-avatars">
            <div className="avatar-stack">
              {['A', 'B', 'C', 'D'].map((l, i) => (
                <div
                  key={i}
                  className="avatar"
                  style={{ background: ['#f4a261', '#2a9d8f', '#e76f51', '#457b9d'][i] }}
                >
                  {l}
                </div>
              ))}
            </div>
            <span className="hero-social-proof">
              Trusted by <strong>1,000+</strong> happy clients
            </span>
          </div> */}
        </div>

        {/* ── Right visual ── */}
        {/* Old Hero Section
        <div className="hero-visual">
          <div className="hv-blob" />
          <img src="/rainbow-buddha-bowl.png"   alt="" className="hv-food hv-food-left"   aria-hidden="true" />
          <img src="/fruit-plate-colorful.png" alt="" className="hv-food hv-food-right"  aria-hidden="true" />
          <img src="/indian-thali.png"         alt="" className="hv-food hv-food-bottom" aria-hidden="true" />
          <img src="/hero-leaf.png" alt="" className="hv-leaf" aria-hidden="true" />
          <span className="hv-lime" aria-hidden="true">🍋</span>
          <img
            src="/meri%20diet%20mobile%20view.png"
            alt="MeriDiet App"
            className="hv-phone-img"
          />
        </div>
        */}
        <div className="hero-visual">
          <div className="hv-visual-stack">
            <img src="/hero-blob-bg.png" alt="" className="hv-blob-bg" aria-hidden="true" />
            <img src="/hero-food-overlay.png" alt="Healthy Indian food bowls" className="hv-food-overlay" />
          </div>
        </div>
      </div>

      {/* ── Bottom feature strip ── */}
      <div className="hero-strip">
        <div className="container">
          <div className="hero-strip-grid">
            <div className="hero-strip-item">
              <div className="hero-strip-item-inner">
                <img src="/strip-meal-plans.png" alt="Personalized meal plans icon" className="hero-strip-icon-img" />
                <div className="hero-strip-text">
                  <span>Personalized<br />Meal Plans</span>
                </div>
              </div>
            </div>
            <div className="hero-strip-item">
              <div className="hero-strip-item-inner">
                <img src="/strip-region.png" alt="Regional food preferences icon" className="hero-strip-icon-img" />
                <div className="hero-strip-text">
                  <span>Based on Your Region<br />& Food Preferences</span>
                </div>
              </div>
            </div>
            <div className="hero-strip-item">
              <div className="hero-strip-item-inner">
                <img src="/strip-whatsapp.png" alt="Diet plan delivered on WhatsApp icon" className="hero-strip-icon-img hero-strip-icon-img--lg" />
                <div className="hero-strip-text">
                  <span>Delivered Within 24 Hours<br />on WhatsApp & Email</span>
                </div>
              </div>
            </div>
            <div className="hero-strip-item">
              <div className="hero-strip-item-inner">
                <img src="/strip-dietitian.png" alt="AI-assisted nutrition planning icon" className="hero-strip-icon-img" />
                <div className="hero-strip-text">
                  <span>AI-Assisted<br />Nutrition Planning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
