const CTA = ({ onOpenForm }: { onOpenForm: () => void }) => {
  return (
    <section className="cta-section" id="get-plan">
      <div className="container">
        <div className="cta-box">
          <div className="cta-content">
            <span className="section-tag">Free to Start</span>
            <h2 className="cta-title">Start Your Personalized Nutrition Journey Today</h2>
            <p className="cta-sub">
              Get your free 7-day Indian diet plan in just 3 minutes. No credit card required.
            </p>
            <div className="cta-actions">
              <button className="btn-primary cta-btn" onClick={onOpenForm}>
                Get My Diet Plan →
              </button>
              <a
                href="https://wa.me/91XXXXXXXXXX"
                className="cta-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="wa-icon">💬</span>
                Chat on WhatsApp
              </a>
            </div>
            <p className="cta-note">
              ✓ Free plan &nbsp;|&nbsp; ✓ No spam &nbsp;|&nbsp; ✓ 100% Indian food
            </p>
          </div>

          <div className="cta-decor">
            <div className="cta-emoji-pile">
              {['🥗', '🍛', '🥘', '🫓', '🌿', '🥦'].map((e, i) => (
                <span key={i} className="cta-emoji">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA
