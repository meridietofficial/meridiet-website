const PRICING_FEATURES = [
  { icon: 'fa-solid fa-tag',            text: 'White Label Diet Charts with your branding' },
  { icon: 'fa-solid fa-video',          text: 'Online Appointments & Video Consultations' },
  { icon: 'fa-solid fa-users',          text: 'Manage Online + Offline Clients in one place' },
  { icon: 'fa-solid fa-calendar-check', text: 'Appointment & Follow-up Tracking' },
  { icon: 'fa-solid fa-wallet',         text: 'Earnings Dashboard & Payout Management' },
  { icon: 'fa-solid fa-shield-halved',  text: 'Verified Dietitian Badge on your profile' },
  { icon: 'fa-solid fa-headset',        text: 'Dedicated Support at every step' },
  { icon: 'fa-solid fa-coins',          text: '₹100 wallet credit on your trial account' },
]

const BENEFITS = [
  { icon: '/benefit-icon-1.png', text: 'White label diet charts under your brand' },
  { icon: '/benefit-icon-2.png', text: 'Manage online & offline clients in one place' },
  { icon: '/benefit-icon-3.png', text: 'Online appointments with video consultations' },
  { icon: '/benefit-icon-4.png', text: 'Dedicated support at every step' },
]

const WHY_JOIN_CARDS = [
  { img: '/why-join-1.png', title: 'Get New Clients', desc: 'Access thousands of users looking for diet experts' },
  { img: '/why-join-2.png', title: 'AI-Assisted Diet Plans', desc: 'Create personalized diet plans with our advanced AI' },
  { img: '/why-join-3.png', title: 'Weekly Payments', desc: 'Easy withdrawals and transparent earnings' },
  { img: '/why-join-4.png', title: 'Work From Anywhere', desc: 'Consult clients from the comfort of your space' },
  { img: '/why-join-5.png', title: 'Build Your Personal Brand', desc: 'Establish your presence with your personal branding' },
  { img: '/why-join-6.png', title: 'Simple Dashboard', desc: 'Track earnings, clients, and everything in one place' },
]

const HOW_IT_WORKS_STEPS = [
  { img: '/how-step-1.png', title: 'Submit Profile', desc: 'Share your details and qualifications' },
  { img: '/how-step-2.png', title: 'Verify Credentials', desc: 'We verify your certifications' },
  { img: '/how-step-3.png', title: 'Activate Account', desc: 'Set your availability and consultation fee' },
  { img: '/how-step-4.png', title: 'Receive Requests', desc: 'Start getting diet plan requests' },
  { img: '/how-step-5.png', title: 'Earn Every Week', desc: 'Get paid for every consultation' },
]

const FEATURE_COLUMNS = [
  {
    title: 'Online Consultations Made Simple',
    img: '/feature-img-1.png',
    features: [
      'Set consultation bookings',
      'Set your availability',
      'Get instant notifications',
      'Video consultations',
      'Manage & follow-ups',
      'Secure payments & payouts',
    ]
  },
  {
    title: 'Manage Offline Clients Like a Pro',
    img: '/feature-img-2.png',
    features: [
      'Add unlimited clients',
      'Client history & progress',
      'Notes & observations',
      'Follow-ups',
      'Payments',
      'Email alerts',
    ]
  },
  {
    title: 'AI Diet Plans with Your Branding',
    img: '/feature-img-3.png',
    features: [
      'Generate diet plans in seconds',
      'Edit & customize plans',
      'Add your logo & branding',
      'Download in multiple formats',
      'Streamlined client workflow',
      'Share with your clients',
    ]
  },
  {
    title: 'Wallet, Payments & Reports',
    img: '/feature-img-4.png',
    features: [
      'Easy wallet & credit system',
      'Recharge anytime',
      'Track your earnings',
      'Generate reports',
      'Business insights',
      'Export data',
    ]
  },
]

const WHY_CARDS = [
  { icon: '/why-icon-1.png', title: 'Verified Clients',    desc: 'We bring genuine & quality clients to you' },
  { icon: '/why-icon-4.png', title: 'Smart Technology',    desc: 'Tools that simplify your consultation' },
  { icon: '/why-icon-3.png', title: 'Professional Growth', desc: 'Build your reputation and grow your brand' },
  { icon: '/why-icon-2.png', title: 'Dedicated Support',   desc: 'We are here to help you at every step' },
]

const WHY_LOVE_ICONS = [
  { img: '/wl-icon-1.png', label: 'No Marketing Required' },
  { img: '/wl-icon-2.png', label: 'No Software Purchase' },
  { img: '/wl-icon-3.png', label: 'Client Management' },
  { img: '/wl-icon-4.png', label: 'AI Diet Generation' },
  { img: '/wl-icon-5.png', label: 'Appointment Scheduling' },
  { img: '/wl-icon-6.png', label: 'Secure Payments' },
  { img: '/wl-icon-7.png', label: 'Weekly Payouts' },
  { img: '/wl-icon-8.png', label: 'Professional Profile' },
]

const WHO_CAN_APPLY = [
  'Registered Dietitians (RD)',
  'Clinical Nutritionists',
  'Sports Nutritionists',
  'Renal Nutritionists',
  'Pediatric Nutritionists',
  'Wellness Nutritionists',
]

const TESTIMONIALS = [
  {
    quote: 'MeriDiet has helped me reach clients beyond my city. The AI diet planner saves me so much time!',
    name: 'Dr. Arjun Kapoor',
    stars: 5,
  },
  {
    quote: 'The platform is super easy to use and the weekly payouts are always on time. Highly recommended!',
    name: 'Dt. Priya Singh',
    stars: 5,
  },
  {
    quote: 'I love the flexibility and the amazing support team. MeriDiet is a game changer for dietitians!',
    name: 'Dt. Sanjli Iyer',
    stars: 5,
  },
]

const FAQS = [
  { q: 'Is there any registration fee?', a: 'No, registration on MeriDiet is absolutely free for all qualified dietitians and nutritionists.' },
  { q: 'When will I receive my payouts?', a: 'Payouts are processed every week directly to your linked bank account or wallet.' },
  { q: 'Can I choose my consultation fee?', a: 'Yes, you have full control over setting your own consultation fees.' },
  { q: 'Can I work part-time?', a: 'Absolutely! You can set your own availability and work as little or as much as you want.' },
]

const VS_TRADITIONAL = [
  'Limited to local clients',
  'Manual diet planning',
  'Paper records',
  'Manual scheduling',
  'Separate payment collection',
]

const VS_MERIDIET = [
  'Reach clients from anywhere',
  'AI-assisted diet planning',
  'Digital client management',
  'Built-in appointment system',
  'Integrated secure payouts',
]

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal'
import SEO from '../components/SEO'

const ForDietitians = () => {
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  return (
  <main className="fd-page">
    <SEO
      title="Join as a Dietitian | Grow Your Practice Online"
      description="Join MeriDiet to connect with clients seeking personalised diet plans. Build your online nutrition practice and grow your income from home."
      canonical="/for-dietitians"
      jsonLd={[
        {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: 'Online Dietitian / Nutritionist',
          description: 'Join MeriDiet as a verified dietitian. Connect with clients across India, provide online consultations, and grow your nutrition practice.',
          hiringOrganization: { '@type': 'Organization', name: 'MeriDiet', sameAs: 'https://meridiet.com' },
          jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
          employmentType: 'CONTRACTOR',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://meridiet.com/' },
            { '@type': 'ListItem', position: 2, name: 'For Dietitians', item: 'https://meridiet.com/for-dietitians' },
          ],
        },
      ]}
    />

    {/* ── Hero ── */}
    <section className="fd-hero">
      <div className="container fd-hero-inner">

        {/* Left */}
        <div className="fd-hero-left">
          <p className="fd-hero-eyebrow">Join MeriDiet as a</p>
          <h1 className="fd-hero-title">Grow Your Dietitian Practice Online</h1>
          <p className="fd-hero-desc">
            Build your online + offline practice with powerful tools designed for dietitians.<br />
            Manage clients, appointments, and diet plans — all in one place.
          </p>

          <ul className="fd-benefits">
            {BENEFITS.map((b) => (
              <li key={b.text} className="fd-benefit-item">
                <img src={b.icon} alt="" className="fd-benefit-icon" />
                {b.text}
              </li>
            ))}
          </ul>

          <div className="fd-trial-chip">
            <span className="fd-trial-chip-badge">FREE</span>
            <span className="fd-trial-chip-text">7-Day Free Trial &nbsp;·&nbsp; ₹100 wallet credit included</span>
          </div>

          <div className="fd-cta-row">
            <button className="btn-primary fd-cta-btn" onClick={() => navigate('/for-dietitians/basic-info')}>Start Free Trial →</button>
            <button className="btn-outline fd-cta-btn" onClick={() => setLoginOpen(true)}>Login</button>
          </div>
          <p className="fd-free-note">
            <img src="/free-icon.png" alt="" className="fd-free-check" /> No payment required to register
          </p>
        </div>

        {/* Right – image (badges & leaf are part of the image) */}
        <div className="fd-hero-right">
          <img src="/dietitian-hero-v2.png" alt="Dietitian" className="fd-hero-img" />
        </div>

      </div>
    </section>

    {/* ── Why Join MeriDiet ── */}
    <section className="fd-why-join">
      <div className="container fd-why-join-inner">
        <h2 className="fd-why-join-title">Why Join <span style={{ color: '#006B28' }}>MeriDiet?</span></h2>
        <div className="fd-why-join-grid">
          {WHY_JOIN_CARDS.map((c) => (
            <div key={c.title} className="fd-why-join-card">
              <img src={c.img} alt={c.title} className="fd-why-join-img" />
              <h3 className="fd-why-join-name">{c.title}</h3>
              <p className="fd-why-join-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── How It Works ── */}
    <section className="fd-how-it-works">
      <div className="container fd-how-it-works-inner">
        <h2 className="fd-how-it-works-title">How It Works</h2>
        <div className="fd-how-it-works-steps">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div key={idx} className="fd-how-it-works-step">
              <img src={step.img} alt={step.title} className="fd-how-it-works-img" />
              <h3 className="fd-how-it-works-step-title">{step.title}</h3>
              <p className="fd-how-it-works-step-desc">{step.desc}</p>
              {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="fd-how-it-works-arrow">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Feature Columns ── */}
    <section className="fd-features">
      <div className="container fd-features-inner">
        <div className="fd-features-grid">
          {FEATURE_COLUMNS.map((col) => (
            <div key={col.title} className="fd-feature-column">
              <div>
                <h3 className="fd-feature-column-title">{col.title}</h3>
                <ul className="fd-feature-list">
                  {col.features.map((feat) => (
                    <li key={feat} className="fd-feature-item">
                      <i className="fa-solid fa-check" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <img src={col.img} alt={col.title} className="fd-feature-column-img" />
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Dashboard Preview ── */}
    <section className="fd-dashboard-preview">
      <div className="container fd-dashboard-preview-inner">
        <div className="fd-dashboard-preview-left">
          <h2 className="fd-dashboard-preview-title">Powerful Dashboard Made For You</h2>
          <p className="fd-dashboard-preview-desc">Everything you need to manage your practice efficiently.</p>
          <button className="btn-primary fd-dashboard-preview-btn" onClick={() => navigate('/for-dietitians/basic-info')}>Explore Dashboard →</button>
        </div>
        <div className="fd-dashboard-preview-right">
          <img src="/dietitian-dashboard.png" alt="Dashboard Preview" className="fd-dashboard-preview-img" />
        </div>
      </div>
    </section>

    {/* ── Why Dietitians love MeriDiet ── */}
    <section className="fd-why">
      <div className="fd-why-inner">
        <h2 className="fd-why-title">Why Dietitians love <span style={{ color: '#006B28' }}>MeriDiet?</span></h2>
        <div className="fd-why-grid">
          {WHY_CARDS.map((c) => (
            <div key={c.title} className="fd-why-card">
              <img src={c.icon} alt={c.title} className="fd-why-icon" />
              <div className="fd-why-text">
                <strong className="fd-why-name">{c.title}</strong>
                <p className="fd-why-desc">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Why Dietitians Love MeriDiet (icon row) ── */}
    <section className="fd-why-love">
      <div className="container fd-why-love-inner">
        <h2 className="fd-why-love-title">Why Dietitians Love <span style={{ color: '#006B28' }}>MeriDiet?</span></h2>
        <div className="fd-why-love-grid">
          {WHY_LOVE_ICONS.map((item) => (
            <div key={item.label} className="fd-why-love-item">
              <img src={item.img} alt={item.label} className="fd-why-love-img" />
              <span className="fd-why-love-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Who Can Apply + Testimonials ── */}
    <section className="fd-apply-testimonials">
      <div className="container fd-apply-testimonials-inner">
        <div className="fd-apply-col">
          <h2 className="fd-apply-title">Who Can Apply?</h2>
          <ul className="fd-apply-list">
            {WHO_CAN_APPLY.map((item) => (
              <li key={item} className="fd-apply-item">
                <i className="fa-solid fa-circle-check" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="fd-testimonials-col">
          <h2 className="fd-testimonials-title">What Dietitians Say</h2>
          <div className="fd-testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="fd-testimonial-card">
                <p className="fd-testimonial-quote">"{t.quote}"</p>
                <div className="fd-testimonial-stars">{'★'.repeat(t.stars)}</div>
                <p className="fd-testimonial-name">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── FAQ + VS Traditional ── */}
    <section className="fd-faq-vs">
      <div className="container fd-faq-vs-inner">
        <div className="fd-faq-col">
          <h2 className="fd-faq-title">Frequently Asked Questions</h2>
          <div className="fd-faq-list">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="fd-faq-item">
                <button className="fd-faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  {faq.q}
                  <i className={`fa-solid ${openFaq === idx ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
                </button>
                {openFaq === idx && <p className="fd-faq-answer">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="fd-vs-col">
          <h2 className="fd-vs-title">MeriDiet vs Traditional Practice</h2>
          <table className="fd-vs-table">
            <thead>
              <tr>
                <th className="fd-vs-th fd-vs-th--bad">Traditional Practice</th>
                <th className="fd-vs-th fd-vs-th--good">With MeriDiet</th>
              </tr>
            </thead>
            <tbody>
              {VS_TRADITIONAL.map((item, idx) => (
                <tr key={idx} className="fd-vs-tr">
                  <td className="fd-vs-td fd-vs-td--bad">
                    <i className="fa-solid fa-xmark" /> {item}
                  </td>
                  <td className="fd-vs-td fd-vs-td--good">
                    <i className="fa-solid fa-check" /> {VS_MERIDIET[idx]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    {/* ── Pricing Section ── */}
    <section className="fd-pricing">
      <div className="container fd-pricing-inner">
        <div className="fd-pricing-left">
          <p className="fd-pricing-eyebrow">Simple & Transparent</p>
          <h2 className="fd-pricing-title">Start Free — Pay Only After You're Sure</h2>
          <p className="fd-pricing-sub">
            Register for <strong className="fd-pricing-amount-inline">FREE</strong> and get a 7-day trial to explore
            all features. Activate your account for{' '}
            <strong className="fd-pricing-amount-inline"><span className="fd-price-old">₹2,499</span> ₹999</strong>{' '}
            only after you're confident — no surprises, no monthly fees.
          </p>

          <ul className="fd-pricing-features">
            {PRICING_FEATURES.map(f => (
              <li key={f.text} className="fd-pricing-feature-item">
                <span className="fd-pricing-feature-icon-wrap">
                  <i className={f.icon} />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="fd-pricing-right">
          <div className="fd-plan-card">
            <div className="fd-plan-badge">7-Day Free Trial</div>

            {/* Free trial price */}
            <div className="fd-plan-price-row">
              <span className="fd-plan-currency" style={{ fontSize: 20, alignSelf: 'center' }}>₹</span>
              <span className="fd-plan-amount">0</span>
            </div>
            <p className="fd-plan-free-label">to get started today</p>

            {/* Wallet credit highlight */}
            <p className="fd-plan-credit-note">
              <i className="fa-solid fa-coins" style={{ color: '#f59e0b', marginRight: 6 }} />
              Includes <strong>₹100 wallet credit</strong> on your trial account
            </p>

            <div className="fd-plan-divider" />

            {/* How it works steps */}
            <ol className="fd-plan-steps">
              <li>
                <span className="fd-plan-step-num">1</span>
                <span><strong>Register</strong> — free, no card needed</span>
              </li>
              <li>
                <span className="fd-plan-step-num">2</span>
                <span><strong>7-day trial</strong> starts after approval + ₹100 credit</span>
              </li>
              <li>
                <span className="fd-plan-step-num">3</span>
                <span><strong>Activate</strong> for <span className="fd-price-old" style={{ fontSize: 12 }}>₹2,499</span> <strong style={{ color: '#16a34a' }}>₹999</strong> — one-time, lifetime access</span>
              </li>
            </ol>

            <button className="btn-primary fd-plan-cta" onClick={() => navigate('/for-dietitians/basic-info')}>
              Start Free Trial →
            </button>
            <p className="fd-plan-secure">
              <i className="fa-solid fa-shield-halved" style={{ fontSize: 11, marginRight: 5 }} />
              No payment required to register
            </p>
          </div>
        </div>
      </div>
    </section>

    {loginOpen && (
      <AuthModal
        onClose={() => setLoginOpen(false)}
        initialUserType="dietitian"
        initialTab="login"
      />
    )}
  </main>
  )
}

export default ForDietitians
