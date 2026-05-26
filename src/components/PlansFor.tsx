const plans = [
  { icon: 'fa-solid fa-scale-balanced', label: 'Weight Loss',    desc: 'Lose weight sustainably',       color: '#3b82f6', bg: '#eff6ff' },
  { icon: 'fa-solid fa-droplet',        label: 'Diabetes',       desc: 'Control blood sugar naturally', color: '#ef4444', bg: '#fef2f2' },
  { icon: 'fa-solid fa-venus',          label: 'PCOS',           desc: 'Balance hormones with food',    color: '#ec4899', bg: '#fdf2f8' },
  { icon: 'fa-solid fa-stethoscope',    label: 'Thyroid',        desc: 'Support thyroid function',      color: '#8b5cf6', bg: '#f5f3ff' },
  { icon: 'fa-solid fa-heart',          label: 'Healthy Living', desc: 'Build lifelong healthy habits', color: '#2d8c4e', bg: '#e8f5ee' },
  { icon: 'fa-solid fa-leaf',           label: 'Vegetarian',     desc: '100% plant-based nutrition',    color: '#16a34a', bg: '#f0fdf4' },
  { icon: 'fa-solid fa-seedling',       label: 'Vegan',          desc: 'Dairy-free & plant-powered',    color: '#0d9488', bg: '#f0fdfa' },
  { icon: 'fa-solid fa-dumbbell',       label: 'Muscle Gain',    desc: 'Build lean muscle & strength',  color: '#f97316', bg: '#fff7ed' },
  { icon: 'fa-solid fa-baby',           label: 'Pregnancy',      desc: 'Nourish you & your baby',       color: '#f43f5e', bg: '#fff1f2' },
  { icon: 'fa-solid fa-person-cane',    label: 'Senior Health',  desc: 'Age gracefully with nutrition', color: '#d97706', bg: '#fffbeb' },
  { icon: 'fa-solid fa-heart-pulse',    label: 'Heart Health',   desc: 'Protect your cardiovascular health', color: '#dc2626', bg: '#fef2f2' },
  { icon: 'fa-solid fa-bacterium',      label: 'Gut Health',     desc: 'Heal your gut from inside out', color: '#7c3aed', bg: '#f5f3ff' },
]

const PlansFor = () => {
  return (
    <section className="plans-section" id="plans">
      <div className="container">

        <div className="plans-header">
          <span className="section-tag">For Everyone</span>
          <h2 className="section-title">Plans Designed For <span className="plans-title-green">Every Goal</span></h2>
          <p className="section-sub">
            Whatever your health goal, MeriDiet has a plan designed specifically for your needs.
          </p>
        </div>

        <div className="plans-grid">
          {plans.map((p, i) => (
            <div key={i} className="plan-card" style={{ '--pc': p.color, '--pb': p.bg } as React.CSSProperties}>
              <div className="plan-card-top">
                <div className="plan-icon-wrap">
                  <i className={p.icon} />
                </div>
              </div>
              <div className="plan-card-body">
                <span className="plan-label">{p.label}</span>
                <span className="plan-desc">{p.desc}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default PlansFor
