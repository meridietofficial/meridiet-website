const techPoints = [
  { icon: 'fa-solid fa-brain', text: 'Analyses your body details, lifestyle & health goals' },
  { icon: 'fa-solid fa-utensils', text: 'Maps your food preferences to Indian recipes & ingredients' },
  { icon: 'fa-solid fa-chart-line', text: 'Calculates precise calorie & macronutrient targets' },
  { icon: 'fa-solid fa-bolt', text: 'Generates your personalized plan in minutes' },
]

const dietPoints = [
  { icon: 'fa-solid fa-user-check', text: 'Qualified dietitian reviews every plan before delivery' },
  { icon: 'fa-solid fa-pen-to-square', text: 'Refines meals based on your individual needs' },
  { icon: 'fa-solid fa-shield-halved', text: 'Ensures the plan is safe, balanced & practical' },
  { icon: 'fa-solid fa-comments', text: 'Available for direct consultation if you need more support' },
]

const TechPlusDietitian = () => (
  <section className="tpd-section">
    <div className="container">
      <div className="tpd-header">
        <span className="section-tag">Our Approach</span>
        <h2 className="section-title">Smart Technology. <span className="tpd-accent">Expert Human Guidance.</span></h2>
        <p className="section-sub">Smart nutrition technology helps create your personalized diet plan, while expert dietitians review and refine it for your individual needs.</p>
      </div>
      <div className="tpd-grid">
        <div className="tpd-card">
          <h3 className="tpd-card-title">Smart Technology</h3>
          <ul className="tpd-list">
            {techPoints.map(p => (
              <li key={p.text} className="tpd-item">
                <i className={`${p.icon} tpd-item-icon`} />
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="tpd-plus">+</div>
        <div className="tpd-card">
          <h3 className="tpd-card-title">Expert Dietitians</h3>
          <ul className="tpd-list">
            {dietPoints.map(p => (
              <li key={p.text} className="tpd-item">
                <i className={`${p.icon} tpd-item-icon`} />
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
)

export default TechPlusDietitian
