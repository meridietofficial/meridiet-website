import React from 'react'

const steps = [
  {
    img: '/how-step2.png',
    step: '01',
    title: 'Fill Assessment',
    desc: 'Answer simple questions about your health, lifestyle, and food preferences.',
  },
  {
    img: '/how-step3.png',
    step: '02',
    title: 'AI Analyzes Data',
    desc: 'Our AI analyzes your information to understand your unique nutrition needs.',
  },
  {
    img: '/how-step4.png',
    step: '03',
    title: 'Diet Plan Generated',
    desc: 'A personalized Indian diet plan is created specifically for your goal.',
  },
  {
    img: '/how-step1.png',
    step: '04',
    title: 'Delivered to You',
    desc: 'Receive your plan instantly on WhatsApp & email in a neat PDF.',
  },
]

const HowItWorks = () => {
  return (
    <section className="how-section" id="how-it-works">
      <div className="container">
        <div className="how-header">
          <span className="section-tag">Simple Process</span>
          <h2 className="section-title">How MeriDiet Works</h2>
          <p className="section-sub">
            From sign-up to personalized plan in under 3 minutes. No complicated forms, no
            confusion.
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
      </div>
    </section>
  )
}

export default HowItWorks
