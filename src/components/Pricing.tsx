import { Check, Crown, Zap, CalendarDays } from 'lucide-react'

const plans = [
  {
    icon: Zap,
    name: '1 Week',
    subtitle: 'Try it out',
    price: 199,
    period: 'one-time',
    popular: false,
    badge: null,
    savings: null,
    accentColor: '#457b9d',
    features: [
      '7-day personalized diet plan',
      '3 meals + 2 snacks daily',
      'Crafted by certified dietitian',
      'Downloadable PDF plan',
      'WhatsApp plan delivery',
    ],
    cta: 'Get 1-Week Plan',
  },
  {
    icon: Crown,
    name: '1 Month',
    subtitle: 'Best for results',
    price: 499,
    period: 'per month',
    popular: true,
    badge: '🔥 Most Popular',
    savings: null,
    accentColor: '#1E8E3E',
    features: [
      '28-day personalized diet plan',
      '3 meals + 2 snacks daily',
      'Weekly plan updates',
      'Grocery shopping list',
      'Recipe booklet included',
      'WhatsApp + email support',
      '1 free dietitian consultation',
    ],
    cta: 'Get 1-Month Plan',
  },
  {
    icon: CalendarDays,
    name: '3 Months',
    subtitle: 'Best value',
    price: 999,
    period: '3 months',
    popular: false,
    badge: '⭐ Best Value',
    savings: 'Save ₹498 vs monthly',
    accentColor: '#d97706',
    features: [
      'Everything in 1-Month plan',
      '3 months of diet plans',
      'Monthly health check-ins',
      'Priority WhatsApp support',
      '1 video consultation',
      'Free plan modifications',
    ],
    cta: 'Get 3-Month Plan',
  },
]

const Pricing = () => {
  return (
    <section className="pricing-section" id="pricing">
      <div className="container">

        <div className="pricing-header">
          <span className="section-tag">Pricing</span>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-sub">
            No hidden charges. Pick a plan that fits your goal and get started in minutes.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, i) => {
            const Icon = plan.icon
            return (
              <div
                key={i}
                className={`pricing-card${plan.popular ? ' pricing-card--popular' : ''}`}
              >
                {plan.badge && (
                  <div className="pricing-badge">{plan.badge}</div>
                )}

                <div className="pricing-card-top">
                  <div className="pricing-icon" style={{ background: plan.popular ? 'rgba(255,255,255,0.2)' : '#f0faf4', color: plan.popular ? '#fff' : plan.accentColor }}>
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="pricing-plan-name">{plan.name}</div>
                    <div className="pricing-plan-sub">{plan.subtitle}</div>
                  </div>
                </div>

                <div className="pricing-amount">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-price">{plan.price.toLocaleString('en-IN')}</span>
                  <span className="pricing-period">/ {plan.period}</span>
                </div>

                {plan.savings && (
                  <div className="pricing-savings">{plan.savings}</div>
                )}

                <ul className="pricing-features">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="pricing-feature">
                      <Check size={15} strokeWidth={2.5} className="pricing-check" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#get-plan"
                  className={`pricing-cta ${plan.popular ? 'pricing-cta--primary' : 'pricing-cta--outline'}`}
                >
                  {plan.cta}
                </a>
              </div>
            )
          })}
        </div>

        <p className="pricing-note">
          🔒 Secure payment &nbsp;·&nbsp; 📄 Instant plan delivery &nbsp;·&nbsp; 💬 WhatsApp support included
        </p>

      </div>
    </section>
  )
}

export default Pricing
