import React from 'react'

const steps = [
  { icon: 'fa-solid fa-user-doctor', label: 'Choose a Dietitian' },
  { icon: 'fa-solid fa-comments',    label: 'Discuss Your Goals' },
  { icon: 'fa-solid fa-lightbulb',   label: 'Get Expert Guidance' },
  { icon: 'fa-solid fa-file-lines',  label: 'Receive Your Personalized Diet Plan' },
]

const ConsultJourney = () => (
  <section className="cj-section">
    <div className="container">
      <div className="cj-header">
        <span className="section-tag">Consultation</span>
        <h2 className="section-title">Consult. Personalise. <span className="cj-accent">Get Your Plan.</span></h2>
      </div>
      <div className="cj-steps">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="cj-step">
              <div className="cj-step-icon">
                <i className={s.icon} />
              </div>
              <p className="cj-step-label">{s.label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="cj-arrow">
                <i className="fa-solid fa-arrow-right" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
)

export default ConsultJourney
