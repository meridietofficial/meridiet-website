import React from 'react'

const steps = [
  {
    img: '/how-step2.png',
    step: '01',
    title: 'Tell Us About You',
    desc: 'Share your lifestyle, body details, food preferences, routine and goals.',
  },
  {
    img: '/how-step3.png',
    step: '02',
    title: 'Your Plan Is Created',
    desc: 'Smart nutrition technology creates a personalized diet plan based on your information.',
  },
  {
    img: '/how-step4.png',
    step: '03',
    title: 'Expert Dietitian Review',
    desc: 'A qualified dietitian reviews and refines your plan according to your individual needs.',
  },
  {
    img: '/how-step1.png',
    step: '04',
    title: 'Get Your Final Plan',
    desc: 'Receive your personalized diet plan via WhatsApp and Email.',
  },
]

const HowItWorks = ({ onOpenForm }: { onOpenForm?: () => void }) => {
  return (
    <section className="how-section" id="how-it-works">
      <div className="container">
        <div className="how-header">
          <span className="section-tag">Simple Process</span>
          <h2 className="section-title">How MeriDiet Works</h2>
          <p className="section-sub">
            From Your Information to Your Personalized Diet Plan
          </p>
        </div>

        <div className="how-steps">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="how-card">
                <div className="how-card-num">{s.step}</div>
                <div className="how-card-icon">
                  <img src={s.img} alt={s.title} className="how-card-img" />
                </div>
                <h3 className="how-card-title">{s.title}</h3>
                <p className="how-card-desc">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="how-arrow">
                  <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="8" x2="32" y2="8" stroke="#1e8e3e" strokeWidth="1.5" strokeLinecap="round"/>
                    <polyline points="27,3 36,8 27,13" stroke="#1e8e3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {onOpenForm && (
          <div className="how-cta-wrap">
            <button className="how-cta-btn" onClick={onOpenForm}>Create My Diet Plan →</button>
          </div>
        )}
      </div>
    </section>
  )
}

export default HowItWorks
