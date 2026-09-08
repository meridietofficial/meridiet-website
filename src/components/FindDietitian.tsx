import { Link } from 'react-router-dom'

const filters = [
  { icon: 'fa-solid fa-bullseye',       label: 'Your Goal or Health Concern' },
  { icon: 'fa-solid fa-stethoscope',    label: 'Specialization' },
  { icon: 'fa-solid fa-clock',          label: 'Experience' },
  { icon: 'fa-solid fa-calendar-check', label: 'Availability' },
  { icon: 'fa-solid fa-indian-rupee-sign', label: 'Consultation Fee' },
  { icon: 'fa-solid fa-star',           label: 'Ratings & Reviews' },
]

const FindDietitian = () => (
  <section className="fd-section">
    <div className="container">
      <div className="fd-inner">
        <div className="fd-text">
          <span className="section-tag">Our Dietitians</span>
          <h2 className="section-title">Find the Right <span className="fd-accent">Dietitian</span> for You</h2>
          <p className="section-sub">Choose a dietitian that fits your needs — not just whoever is available.</p>
          <ul className="fd-filters">
            {filters.map(f => (
              <li key={f.label} className="fd-filter-item">
                <i className={`${f.icon} fd-filter-icon`} />
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
          <Link to="/consult-dietitian" className="fd-cta-btn">Find Your Dietitian →</Link>
        </div>
        <div className="fd-visual">
          <img src="/dietitian-stats.png" alt="Dietitian with stats" className="fd-img" />
        </div>
      </div>
    </div>
  </section>
)

export default FindDietitian
