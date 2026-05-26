import React from 'react'
import { ClipboardList, UserCheck, FileText, BadgeCheck, ChevronRight } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Fill Assessment',
    desc: 'Answer simple questions about your age, weight, health goals, food preferences, and lifestyle.',
  },
  {
    icon: UserCheck,
    step: '02',
    title: 'Dietitian Review',
    desc: 'Our certified dietitians carefully review your responses and craft a plan tailored to your body and goals.',
  },
  {
    icon: FileText,
    step: '03',
    title: 'Get Your Plan',
    desc: 'Receive a complete 7-day personalized Indian diet plan with recipes and shopping list.',
  },
  {
    icon: BadgeCheck,
    step: '04',
    title: 'Expert Review',
    desc: 'Certified nutritionists review and fine-tune your plan before delivery for best results.',
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
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <React.Fragment key={i}>
                <div className="how-card">
                  <div className="how-card-num">{s.step}</div>
                  <div className="how-card-icon">
                    <Icon size={24} strokeWidth={1.6} />
                  </div>
                  <h3 className="how-card-title">{s.title}</h3>
                  <p className="how-card-desc">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="how-arrow">
                    <ChevronRight size={18} strokeWidth={2} />
                    <ChevronRight size={18} strokeWidth={2} />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
