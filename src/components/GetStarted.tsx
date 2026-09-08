import { Link } from 'react-router-dom'

const cards = [
  {
    icon: 'fa-solid fa-file-lines',
    title: 'Create Your Diet Plan',
    desc: 'Get a personalized diet plan based on your lifestyle, food preferences and goals.',
    cta: 'Create My Plan →',
    href: null,
    accent: '#1E8E3E',
    bg: '#f0fdf4',
    border: '#c8e8d4',
    onClick: true,
  },
  {
    icon: 'fa-solid fa-user-doctor',
    title: 'Consult a Dietitian',
    desc: 'Choose from 100+ dietitians based on expertise, specialization, availability and consultation fee.',
    cta: 'Find a Dietitian →',
    href: '/consult-dietitian',
    accent: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    onClick: false,
  },
  {
    icon: 'fa-solid fa-building',
    title: 'For Businesses — White Label',
    desc: 'Launch personalized nutrition under your own brand with MeriDiet\'s technology and nutrition infrastructure.',
    cta: 'Learn More →',
    href: '/for-dietitians',
    accent: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    onClick: false,
  },
]

const GetStarted = ({ onOpenForm }: { onOpenForm: () => void }) => (
  <section className="gs-section">
    <div className="container">
      <div className="gs-header">
        <span className="section-tag">Get Started</span>
        <h2 className="section-title">Choose How You Want to <span className="gs-accent">Get Started</span></h2>
        <p className="section-sub">Whether you want a plan, a consultation, or a business solution — we have you covered.</p>
      </div>
      <div className="gs-grid">
        {cards.map(c => {
          const inner = (
            <>
              <div className="gs-card-icon" style={{ background: c.bg, color: c.accent }}>
                <i className={c.icon} />
              </div>
              <h3 className="gs-card-title">{c.title}</h3>
              <p className="gs-card-desc">{c.desc}</p>
              <span className="gs-card-cta" style={{ color: c.accent }}>{c.cta}</span>
            </>
          )
          return c.onClick ? (
            <button key={c.title} className="gs-card" style={{ '--gs-accent': c.accent, '--gs-border': c.border } as React.CSSProperties} onClick={onOpenForm}>
              {inner}
            </button>
          ) : (
            <Link key={c.title} to={c.href!} className="gs-card" style={{ '--gs-accent': c.accent, '--gs-border': c.border } as React.CSSProperties}>
              {inner}
            </Link>
          )
        })}
      </div>
    </div>
  </section>
)

export default GetStarted
