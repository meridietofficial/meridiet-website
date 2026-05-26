import { FlaskConical, Leaf, IndianRupee, HeartHandshake, Users, Award, Clock, Star } from 'lucide-react'

const stats = [
  { icon: Users,  value: '50,000+', label: 'Clients Served'       },
  { icon: Award,  value: '50+',     label: 'Certified Dietitians' },
  { icon: Clock,  value: '8+',      label: 'Years of Experience'  },
  { icon: Star,   value: '4.9/5',   label: 'Average Rating'       },
]

const values = [
  {
    icon: FlaskConical,
    title: 'Science-Backed',
    desc: 'Every plan is grounded in nutritional science and clinical research, not fads or trends.',
  },
  {
    icon: Leaf,
    title: '100% Indian',
    desc: 'We use only familiar Indian ingredients — dal, roti, sabzi — food your family already loves.',
  },
  {
    icon: IndianRupee,
    title: 'Truly Affordable',
    desc: "Expert nutrition guidance shouldn't be a luxury. We've made it accessible to every Indian household.",
  },
  {
    icon: HeartHandshake,
    title: 'Expert Care',
    desc: "Real certified dietitians review every single plan. You're never talking to a bot.",
  },
]

const team = [
  { initials: 'PM', name: 'Dr. Priya Mehta',  role: 'Chief Nutritionist & Founder', color: '#e76f51', exp: '12 yrs exp' },
  { initials: 'RS', name: 'Rahul Sharma',     role: 'Co-founder & CEO',             color: '#2a9d8f', exp: '10 yrs exp' },
  { initials: 'AB', name: 'Dr. Anita Bose',   role: 'Senior Dietitian',             color: '#457b9d', exp: '9 yrs exp'  },
  { initials: 'VP', name: 'Vikram Patel',     role: 'Head of Technology',           color: '#9b5de5', exp: '8 yrs exp'  },
]

const AboutUs = () => {
  return (
    <section className="about-section" id="about">
      <div className="container">

        {/* ── Header ── */}
        <div className="about-header">
          <span className="section-tag">Our Story</span>
          <h2 className="section-title">The Team Behind <span className="about-green">MeriDiet</span></h2>
          <p className="section-sub">
            Born out of a simple belief — every Indian deserves personalized nutrition advice, not
            generic diet charts from the internet.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="about-stats">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="about-stat">
                <div className="about-stat-icon">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className="about-stat-value">{s.value}</div>
                <div className="about-stat-label">{s.label}</div>
              </div>
            )
          })}
        </div>

        {/* ── Story split ── */}
        <div className="about-story">
          <div className="about-story-text">
            <h3 className="about-story-title">Why We Built MeriDiet</h3>
            <p className="about-story-p">
              In 2016, our founder Dr. Priya Mehta noticed a gap — most online diet plans were
              either Western, overly expensive, or completely generic. Indian bodies, lifestyles,
              and food cultures are unique. A plan for someone in Mumbai should look nothing like
              one for someone in Jaipur.
            </p>
            <p className="about-story-p">
              We built MeriDiet to change that. Today, our team of 50+ certified dietitians crafts
              plans that consider your age, health conditions, regional preferences, budget, and
              daily routine — all in under 3 minutes of your time.
            </p>
            <div className="about-story-quote">
              "Food is medicine. The right food for the right person at the right time."
              <span>— Dr. Priya Mehta, Founder</span>
            </div>
          </div>

          <div className="about-story-visual">
            <img src="/hero-bowl.png" alt="Healthy Indian meal" className="about-img about-img--main" />
            <img src="/hero-plate.png" alt="Balanced plate" className="about-img about-img--accent" />
            <div className="about-img-badge">
              <Award size={18} strokeWidth={2} />
              <span>FSSAI Certified Dietitians</span>
            </div>
          </div>
        </div>

        {/* ── Values ── */}
        <div className="about-values">
          <h3 className="about-section-sub-title">Our Core Values</h3>
          <div className="about-values-grid">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div key={i} className="about-value-card">
                  <div className="about-value-icon">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <h4 className="about-value-title">{v.title}</h4>
                  <p className="about-value-desc">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Team ── */}
        <div className="about-team">
          <h3 className="about-section-sub-title">Meet the Team</h3>
          <div className="about-team-grid">
            {team.map((m, i) => (
              <div key={i} className="about-team-card">
                <div className="about-team-avatar" style={{ background: m.color }}>
                  {m.initials}
                </div>
                <div className="about-team-name">{m.name}</div>
                <div className="about-team-role">{m.role}</div>
                <div className="about-team-exp">{m.exp}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default AboutUs
