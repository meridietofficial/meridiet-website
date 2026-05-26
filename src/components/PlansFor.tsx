import { useEffect, useRef, useState } from 'react'

const plans = [
  { icon: 'fa-solid fa-scale-balanced', label: 'Weight Loss',    desc: 'Lose weight sustainably',            color: '#3b82f6', bg: '#eff6ff' },
  { icon: 'fa-solid fa-droplet',        label: 'Diabetes',       desc: 'Control blood sugar naturally',      color: '#ef4444', bg: '#fef2f2' },
  { icon: 'fa-solid fa-venus',          label: 'PCOS',           desc: 'Balance hormones with food',         color: '#ec4899', bg: '#fdf2f8' },
  { icon: 'fa-solid fa-stethoscope',    label: 'Thyroid',        desc: 'Support thyroid function',           color: '#8b5cf6', bg: '#f5f3ff' },
  { icon: 'fa-solid fa-heart',          label: 'Healthy Living', desc: 'Build lifelong healthy habits',      color: '#2d8c4e', bg: '#e8f5ee' },
  { icon: 'fa-solid fa-leaf',           label: 'Vegetarian',     desc: '100% plant-based nutrition',         color: '#16a34a', bg: '#f0fdf4' },
  { icon: 'fa-solid fa-seedling',       label: 'Vegan',          desc: 'Dairy-free & plant-powered',         color: '#0d9488', bg: '#f0fdfa' },
  { icon: 'fa-solid fa-dumbbell',       label: 'Muscle Gain',    desc: 'Build lean muscle & strength',       color: '#f97316', bg: '#fff7ed' },
  { icon: 'fa-solid fa-baby',           label: 'Pregnancy',      desc: 'Nourish you & your baby',            color: '#f43f5e', bg: '#fff1f2' },
  { icon: 'fa-solid fa-person-cane',    label: 'Senior Health',  desc: 'Age gracefully with nutrition',      color: '#d97706', bg: '#fffbeb' },
  { icon: 'fa-solid fa-heart-pulse',    label: 'Heart Health',   desc: 'Protect your cardiovascular health', color: '#dc2626', bg: '#fef2f2' },
  { icon: 'fa-solid fa-bacterium',      label: 'Gut Health',     desc: 'Heal your gut from inside out',      color: '#7c3aed', bg: '#f5f3ff' },
]

const CARD_STEP = 245

const PlansFor = () => {
  const [active, setActive] = useState(0)
  const pausedRef = useRef(false)
  const total = plans.length

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setActive(prev => (prev + 1) % total)
      }
    }, 2500)
    return () => clearInterval(id)
  }, [total])

  const getOffset = (i: number) => {
    let offset = i - active
    if (offset > total / 2) offset -= total
    if (offset < -total / 2) offset += total
    return offset
  }

  return (
    <section className="plans-section" id="plans">
      <div className="container">
        <div className="plans-header">
          <span className="section-tag">For Everyone</span>
          <h2 className="section-title">
            Plans Designed For <span className="plans-title-green">Every Goal</span>
          </h2>
          <p className="section-sub">
            Whatever your health goal, MeriDiet has a plan designed specifically for your needs.
          </p>
        </div>
      </div>

      <div
        className="plans-carousel-wrap"
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
      >
        <div className="plans-carousel">
          {plans.map((p, i) => {
            const offset = getOffset(i)
            const isActive = offset === 0
            const absOffset = Math.abs(offset)
            const isVisible = absOffset <= 2
            const scale = isActive ? 1 : absOffset === 1 ? 0.82 : 0.66
            const opacity = isActive ? 1 : absOffset === 1 ? 0.72 : 0.45
            return (
              <div
                key={i}
                className={`plan-card${isActive ? ' plan-card--active' : ''}`}
                style={{
                  transform: `translateX(${offset * CARD_STEP}px) scale(${scale})`,
                  opacity: isVisible ? opacity : 0,
                  pointerEvents: isVisible ? 'auto' : 'none',
                  zIndex: isActive ? 3 : absOffset === 1 ? 2 : 1,
                  '--pc': p.color,
                  '--pb': p.bg,
                } as React.CSSProperties}
                onClick={() => setActive(i)}
              >
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
            )
          })}
        </div>
      </div>

      <div className="plans-dots">
        {plans.map((_, i) => (
          <button
            key={i}
            className={`plans-dot${i === active ? ' plans-dot--active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Plan ${i + 1}`}
          />
        ))}
      </div>

      <p className="plans-more">And many more personalized goals & conditions</p>
    </section>
  )
}

export default PlansFor
