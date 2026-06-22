import { useNavigate } from 'react-router-dom'

const CTA = ({ onOpenForm }: { onOpenForm: () => void }) => {
  const navigate = useNavigate()
  return (
    <section className="cta-section" id="get-plan">
      <div className="container">
        <div className="cta-box">
          <div className="cta-content">
            <span className="section-tag">Expert Dietitians</span>
            <h2 className="cta-title">Start Your Personalized Nutrition Journey Today</h2>
            <p className="cta-sub">
              Get a customized Indian diet plan crafted by certified dietitians — tailored to your health goals and lifestyle.
            </p>
            <div className="cta-actions">
              <button className="btn-primary cta-btn" onClick={() => navigate('/consult-dietitian')}>
                Book a Consultation →
              </button>
            </div>
            <p className="cta-note">
              ✓ Certified Dietitians &nbsp;|&nbsp; ✓ Personalized Plans &nbsp;|&nbsp; ✓ 100% Indian food
            </p>
          </div>

          <div className="cta-decor">
            <div className="cta-food-stack">
              <img src="/indian-thali.png"          alt="Indian thali"   className="cta-food cta-food--back"   />
              <img src="/rainbow-buddha-bowl.png"   alt="Buddha bowl"    className="cta-food cta-food--mid"    />
              <img src="/fruit-plate-colorful.png"  alt="Fruit plate"    className="cta-food cta-food--front"  />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA
