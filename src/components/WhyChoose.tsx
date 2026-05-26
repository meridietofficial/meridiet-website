const features = [
  'Personalized Indian meal plans',
  'Plans made by expert dietitians',
  'Certified nutritionist review',
  'Affordable pricing',
  'Recipe & shopping list included',
  '7-day free trial available',
  'WhatsApp support',
  'Tracks your health goals',
]

const columns = [
  { label: 'MeriDiet', color: '#2d8c4e', highlight: true },
  { label: 'Generic Diet Pills', color: '#e53e3e', highlight: false },
  { label: 'Nutritionist', color: '#d69e2e', highlight: false },
]

const data = [
  [true, false, true],
  [true, false, false],
  [true, false, true],
  [true, false, false],
  [true, false, false],
  [true, false, false],
  [true, false, false],
  [true, false, false],
]

const WhyChoose = () => {
  return (
    <section className="why-section" id="why">
      <div className="container">
        <div className="why-inner">
          <div className="why-image">
            <div className="why-img-box">
              <div className="food-emoji-grid">
                {['🥗', '🫓', '🥘', '🍛', '🥦', '🫚', '🌿', '🥑', '🍋', '🫙', '🥕', '🧄'].map(
                  (e, i) => (
                    <span key={i} className="food-emoji">
                      {e}
                    </span>
                  ),
                )}
              </div>
              <div className="why-img-overlay">
                <span className="why-img-text">100% Natural</span>
                <span className="why-img-sub">Indian Ingredients</span>
              </div>
            </div>
          </div>

          <div className="why-content">
            <span className="section-tag">Why Us</span>
            <h2 className="section-title">Why Choose MeriDiet?</h2>
            <p className="section-sub" style={{ marginBottom: 32 }}>
              See how MeriDiet compares to other options. No gimmicks — just real, science-backed
              personalized nutrition.
            </p>

            <div className="compare-table">
              <div className="compare-header">
                <div className="compare-feature-col" />
                {columns.map((col, i) => (
                  <div
                    key={i}
                    className={`compare-col-head ${col.highlight ? 'highlighted' : ''}`}
                    style={{ color: col.color }}
                  >
                    {col.label}
                  </div>
                ))}
              </div>

              {features.map((feat, fi) => (
                <div key={fi} className={`compare-row ${fi % 2 === 0 ? 'row-alt' : ''}`}>
                  <div className="compare-feat">{feat}</div>
                  {data[fi].map((val, ci) => (
                    <div
                      key={ci}
                      className={`compare-cell ${columns[ci].highlight ? 'highlighted' : ''}`}
                    >
                      {val ? <span className="check">✓</span> : <span className="cross">✗</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <a
              href="#get-plan"
              className="btn-primary"
              style={{ marginTop: 28, display: 'inline-block' }}
            >
              Start Your Free Plan →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChoose
