const Hero = ({ onOpenForm }: { onOpenForm: () => void }) => {
  return (
    <section className="hero" id="hero">
      <div className="container hero-inner">

        {/* ── Left content ── */}
        <div className="hero-content">
          <h1 className="hero-title">
            Get Your Personalized{' '}
            <span className="highlight">Indian Diet Plan</span>{' '}
            in Minutes
          </h1>
          <p className="hero-desc">
            Answer a few simple questions about your body, lifestyle, food habits,
            and goals — and receive a personalized diet plan tailored for you.
          </p>

          <div className="hero-actions">
            <button className="btn-primary hero-btn" onClick={onOpenForm}>
              Get My Diet Plan →
            </button>
            <button
              className="hero-btn-outline"
              onClick={() => document.getElementById('sample-diet')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>👁</span> See Sample Plan
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

          {/* phone mockup */}
          <div className="hv-phone">
            <div className="hv-notch" />
            <div className="hv-screen">
              <div className="hv-screen-logo">MeriDiet 🌿</div>

              <div className="hv-screen-greeting">
                <strong>Hi, Ananya 👋</strong>
                <span>Your personalized plan</span>
              </div>

              <div className="hv-cal-card">
                <span className="hv-cal-lbl">Daily Calorie Target</span>
                <span className="hv-cal-num">1400 kcal</span>
                <div className="hv-cal-macros">
                  <div><span>Carbs</span><strong>45%</strong></div>
                  <div><span>Protein</span><strong>30%</strong></div>
                  <div><span>Fats</span><strong>25%</strong></div>
                </div>
              </div>

              <p className="hv-plan-hd">Today's Plan</p>

              {[
                { meal: 'Breakfast', desc: 'Oats Upma with Veggies & Curd', e: '🥣' },
                { meal: 'Lunch',     desc: 'Rajma, Brown Rice, Salad & Curd', e: '🍛' },
              ].map((item) => (
                <div key={item.meal} className="hv-meal-row">
                  <div className="hv-meal-text">
                    <span className="hv-meal-lbl">{item.meal}</span>
                    <span className="hv-meal-desc">{item.desc}</span>
                  </div>
                  <div className="hv-meal-thumb">{item.e}</div>
                </div>
              ))}
            </div>
          </div>
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
