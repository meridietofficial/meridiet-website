import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import CONDITIONS from '../data/conditions'
import BLOGS from '../data/blogs'

interface Props { slug: string }

export default function ConditionPage({ slug }: Props) {
  const data = CONDITIONS.find(c => c.slug === slug)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!data) return null

  const relatedPosts = BLOGS.filter(b => data.relatedSlugs.includes(b.slug)).slice(0, 3)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://meridiet.com/' },
      { '@type': 'ListItem', position: 2, name: data.heroTitle, item: `https://meridiet.com/${data.slug}` },
    ],
  }

  return (
    <main className="cond-page">
      <SEO
        title={data.seoTitle}
        description={data.seoDescription}
        keywords={data.keywords}
        canonical={`/${data.slug}`}
        jsonLd={[data.schema, faqSchema, breadcrumbSchema]}
      />

      {/* Hero */}
      <section className="cond-hero">
        <div className="container cond-hero-inner">
          <div className="cond-hero-text">
            <nav className="cond-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>{data.heroTitle}</span>
            </nav>
            <h1 className="cond-hero-title">{data.heroTitle}</h1>
            <p className="cond-hero-sub">{data.heroSubtitle}</p>
            <div className="cond-hero-actions">
              <Link to="/consult-dietitian" className="cond-btn-primary">
                <i className="fas fa-calendar-check" /> Book a Dietitian
              </Link>
              <Link to="/diet-plan" className="cond-btn-outline">
                Get Diet Plan →
              </Link>
            </div>
          </div>
          <div className="cond-hero-stats">
            {data.stats.map((s, i) => (
              <div key={i} className="cond-stat">
                <span className="cond-stat-val">{s.val}</span>
                <span className="cond-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="cond-about">
        <div className="container cond-about-inner">
          <h2 className="cond-section-title">{data.about.heading}</h2>
          {data.about.paragraphs.map((p, i) => (
            <p key={i} className="cond-about-p">{p}</p>
          ))}
        </div>
      </section>

      {/* Diet Tips */}
      <section className="cond-tips">
        <div className="container">
          <h2 className="cond-section-title cond-section-title--center">Key Diet Strategies</h2>
          <div className="cond-tips-grid">
            {data.dietTips.map((tip, i) => (
              <div key={i} className="cond-tip-card">
                <div className="cond-tip-icon">
                  <i className={`fas ${tip.icon}`} />
                </div>
                <h3 className="cond-tip-title">{tip.title}</h3>
                <p className="cond-tip-text">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eat / Avoid */}
      <section className="cond-eatavoid">
        <div className="container cond-eatavoid-inner">
          <div className="cond-eat-col">
            <h2 className="cond-eat-heading cond-eat-heading--green">
              <i className="fas fa-circle-check" /> What to Eat
            </h2>
            <ul className="cond-eat-list">
              {data.eat.map((item, i) => (
                <li key={i} className="cond-eat-item cond-eat-item--green">
                  <i className="fas fa-check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cond-eat-col">
            <h2 className="cond-eat-heading cond-eat-heading--red">
              <i className="fas fa-circle-xmark" /> What to Avoid
            </h2>
            <ul className="cond-eat-list">
              {data.avoid.map((item, i) => (
                <li key={i} className="cond-eat-item cond-eat-item--red">
                  <i className="fas fa-xmark" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cond-cta-banner">
        <div className="container cond-cta-banner-inner">
          <div className="cond-cta-text">
            <h2 className="cond-cta-title">Get a Personalised Diet Plan</h2>
            <p className="cond-cta-sub">Talk to a registered Indian dietitian and get a plan built around your specific health condition, food preferences and lifestyle.</p>
          </div>
          <div className="cond-cta-actions">
            <Link to="/consult-dietitian" className="cond-btn-primary cond-btn-primary--lg">
              Book a Dietitian
            </Link>
            <Link to="/diet-plan" className="cond-btn-outline cond-btn-outline--light">
              Try AI Plan ₹499
            </Link>
          </div>
        </div>
      </section>

      {/* Related Blog Posts */}
      {relatedPosts.length > 0 && (
        <section className="cond-related">
          <div className="container">
            <h2 className="cond-section-title cond-section-title--center">Related Articles</h2>
            <div className="cond-related-grid">
              {relatedPosts.map(post => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="cond-related-card">
                  <span className="cond-related-cat">{post.category}</span>
                  <h3 className="cond-related-title">{post.title}</h3>
                  <p className="cond-related-desc">{post.description.slice(0, 100)}…</p>
                  <span className="cond-related-read">Read Article →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="cond-faq">
        <div className="container cond-faq-inner">
          <h2 className="cond-section-title cond-section-title--center">Frequently Asked Questions</h2>
          <div className="cond-faq-list">
            {data.faqs.map((item, i) => (
              <div key={i} className={`cond-faq-item${openFaq === i ? ' open' : ''}`}>
                <button
                  className="cond-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <i className={`fas ${openFaq === i ? 'fa-minus' : 'fa-plus'} cond-faq-icon`} />
                </button>
                {openFaq === i && (
                  <div className="cond-faq-a">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom disclaimer */}
      <div className="container">
        <div className="cond-disclaimer">
          <i className="fa-solid fa-circle-info" />
          <p><strong>Medical Disclaimer:</strong> This page is for informational purposes only and does not constitute medical advice, diagnosis or treatment. Always consult a qualified healthcare professional or registered dietitian before making changes to your diet, especially if you have a medical condition.</p>
        </div>
      </div>
    </main>
  )
}
