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
            <span className="hero-title-line">in Minutes</span>
          </h1>
          <p className="hero-desc">
            <span style={{ color: '#1a2e1a', fontWeight: 700 }}>India's First AI-Powered Platform Blending<br />
            Intelligent Technology with Expert Dietitians.</span><br />
            <span style={{ opacity: 0.8 }}>Smarter, personalized nutrition — thoughtfully crafted for complete well-being.</span>
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

          <div className="hero-avatars">
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
          </div>
        </div>

        {/* ── Right visual ── */}
        <div className="hero-visual">
          {/* soft background blob */}
          <div className="hv-blob" />

          {/* food images behind phone */}
          <img src="/rainbow-buddha-bowl.png"   alt="" className="hv-food hv-food-left"   aria-hidden="true" />
          <img src="/fruit-plate-colorful.png" alt="" className="hv-food hv-food-right"  aria-hidden="true" />
          <img src="/indian-thali.png"         alt="" className="hv-food hv-food-bottom" aria-hidden="true" />

          {/* leaf decoration */}
          <img src="/hero-leaf.png" alt="" className="hv-leaf" aria-hidden="true" />

          {/* lime */}
          <span className="hv-lime" aria-hidden="true">🍋</span>

          {/* phone mockup — real screenshot */}
          <img
            src="/meri%20diet%20mobile%20view.png"
            alt="MeriDiet App"
            className="hv-phone-img"
          />
        </div>
      </div>

      {/* ── Bottom feature strip ── */}
      <div className="hero-strip">
        <div className="container">
          <div className="hero-strip-grid">
            <div className="hero-strip-item">
              <i className="fa-solid fa-bowl-food hero-strip-icon" />
              <div className="hero-strip-text">
                <h4>Personalized Meal Plans</h4>
                <p>Tailored Indian nutrition plans</p>
              </div>
            </div>
            <div className="hero-strip-item">
              <i className="fa-solid fa-location-dot hero-strip-icon" />
              <div className="hero-strip-text">
                <h4>Based On Region</h4>
                <p>Food preference based planning</p>
              </div>
            </div>
            <div className="hero-strip-item">
              <i className="fa-brands fa-whatsapp hero-strip-icon" />
              <div className="hero-strip-text">
                <h4>Delivered Instantly</h4>
                <p>WhatsApp & Email delivery</p>
              </div>
            </div>
            <div className="hero-strip-item">
              <i className="fa-solid fa-brain hero-strip-icon" />
              <div className="hero-strip-text">
                <h4>Expert Dietitian</h4>
                <p>Smart nutrition planning</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
