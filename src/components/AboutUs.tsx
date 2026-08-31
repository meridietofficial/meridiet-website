import { FlaskConical, Leaf, IndianRupee, HeartHandshake } from 'lucide-react'
import SEO from './SEO'

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

const socials = [
  { icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn',  url: 'https://www.linkedin.com/company/meridiet/' },
  { icon: 'fa-brands fa-instagram',   label: 'Instagram', url: 'https://www.instagram.com/meridietofficial/' },
  { icon: 'fa-brands fa-youtube',     label: 'YouTube',   url: 'https://www.youtube.com/@MeriDiet' },
  { icon: 'fa-brands fa-x-twitter',   label: 'X',         url: 'https://x.com/Meridietoffical' },
  { icon: 'fa-brands fa-facebook-f',  label: 'Facebook',  url: 'https://www.facebook.com/people/MeriDiet/61564942492475/' },
]

const founder = {
  initials: 'HB',
  name: 'Harmeet Batra',
  role: 'Founder & CEO',
  company: 'MeriDiet Technologies Pvt. Ltd.',
  color: 'linear-gradient(135deg, #2f7a4d, #4caf72)',
  bio: [
    'Harmeet Batra is an entrepreneur focused on building technology-driven businesses that solve real-world challenges through innovation, automation, and scalable digital platforms.',
    'As Founder & CEO, he is leading the development of an AI-powered personalized nutrition ecosystem designed specifically for Indian lifestyles — making professional nutrition guidance more accessible by combining artificial intelligence, data-driven wellness tools, and expert dietitian support on a single platform.',
    'Under his leadership, MeriDiet is evolving beyond traditional diet planning into a comprehensive wellness platform offering personalized diet plans, health calculators, supplement recommendations, dietitian consultations, and white-label solutions for nutrition professionals.',
    'Harmeet strongly believes that nutrition should be personalized, practical, and backed by technology. Through MeriDiet, he aims to help individuals make better health decisions while empowering dietitians with modern tools to scale their practices and deliver professional client experiences.',
    'His entrepreneurial interests span HealthTech, SaaS platforms, digital wellness, artificial intelligence, workforce mobility, and technology-enabled services.',
  ],
  quote: 'At MeriDiet, our mission is simple: make personalized nutrition accessible to everyone.',
}

const AboutUs = () => {
  return (
    <section className="about-section" id="about">
      <SEO
        title="About Us – India's AI Diet Plan & Nutrition Platform"
        description="MeriDiet is India's leading platform for AI-powered personalized diet plans and online dietitian consultations. Science-backed nutrition made affordable for every Indian."
        keywords="about MeriDiet, Indian diet platform, AI nutrition India, personalized diet India, online dietitian platform India"
        canonical="/about"
      />
      <div className="container">

        {/* ── Header ── */}
        <div className="about-header">
          <span className="section-tag">Our Story</span>
          <h1 className="about-page-title">About MeriDiet – India's AI-Powered Nutrition Platform</h1>
          <h2 className="section-title">The Mind Behind <span className="about-green">MeriDiet</span></h2>
          <p className="section-sub">
            Born out of a simple belief — every Indian deserves personalized nutrition advice, not
            generic diet charts from the internet.
          </p>
        </div>

        {/* ── Founder (featured) ── */}
        <div className="about-founder-feature">
          <div className="ff-card">
            <div className="ff-side">
              <div className="ff-avatar" style={{ background: founder.color }}>{founder.initials}</div>
              <div className="ff-name">{founder.name}</div>
              <div className="ff-role">{founder.role}</div>
              <div className="ff-company">{founder.company}</div>
              <div className="ff-socials">
                {socials.map(s => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ff-social"
                    aria-label={s.label}
                  >
                    <i className={s.icon} />
                  </a>
                ))}
              </div>
            </div>

            <div className="ff-main">
              <span className="ff-tag">Meet the Founder</span>
              {founder.bio.map((p, j) => (
                <p key={j} className="ff-bio">{p}</p>
              ))}
              <blockquote className="ff-quote">"{founder.quote}"</blockquote>
            </div>
          </div>
        </div>

        {/* ── Story split ── */}
        <div className="about-story">
          <div className="about-story-text">
            <h3 className="about-story-title">Why We Built MeriDiet</h3>
            <p className="about-story-p">
              For too long, nutrition advice has been generic, confusing, and difficult to follow.
              We believe every individual has unique health goals, lifestyles, and nutritional needs.
            </p>
            <p className="about-story-p">
              By combining technology, artificial intelligence, and expert dietitian guidance, we are
              creating a smarter way for people to understand their health and make informed decisions.
              Our goal is not just to provide diet plans, but to build a complete wellness ecosystem
              that supports healthier lives through personalization, education, and innovation.
            </p>
            <div className="about-story-quote">
              "At MeriDiet, our mission is simple: make personalized nutrition accessible to everyone."
              <span>— Harmeet Batra, Founder &amp; CEO</span>
            </div>
          </div>

          <div className="about-story-visual">
            <img src="/logo-header.png" alt="MeriDiet" className="about-story-logo-img" />
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

      </div>
    </section>
  )
}

export default AboutUs
