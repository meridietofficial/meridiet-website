import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import SEO from '../components/SEO'
import BLOGS, { type BlogBlock } from '../data/blogs'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Block({ block }: { block: BlogBlock }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  switch (block.type) {
    case 'h2':
      return <h2 className="bp-h2">{block.text}</h2>
    case 'h3':
      return <h3 className="bp-h3">{block.text}</h3>
    case 'p':
      return <p className="bp-p">{block.text}</p>
    case 'list':
      return (
        <ul className={`bp-list${block.variant === 'boxed' ? ' bp-list--boxed' : ''}`}>
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )
    case 'steps':
      return (
        <ol className="bp-steps">
          {block.items.map((step, i) => (
            <li key={i} className="bp-step">
              <div className="bp-step-num">{i + 1}</div>
              <div className="bp-step-body">
                <strong className="bp-step-title">{step.title}</strong>
                <p className="bp-step-text">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      )
    case 'cta':
      return (
        <div className="bp-cta">
          <h3 className="bp-cta-heading">{block.heading}</h3>
          <p className="bp-cta-text">{block.text}</p>
          <Link to={block.link} className="bp-cta-btn">{block.label}</Link>
        </div>
      )
    case 'faq':
      return (
        <div className="bp-faq">
          <h2 className="bp-faq-title">Frequently Asked Questions</h2>
          {block.items.map((item, i) => (
            <div key={i} className={`bp-faq-item${openFaq === i ? ' open' : ''}`}>
              <button
                className="bp-faq-q"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <span className="bp-faq-icon">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <div className="bp-faq-a">{item.a}</div>}
            </div>
          ))}
        </div>
      )
    default:
      return null
  }
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = BLOGS.find(b => b.slug === slug)

  if (!post) return <Navigate to="/blog" replace />

  const canonicalUrl = `https://meridiet.com/blog/${post.slug}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: canonicalUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    author: {
      '@type': 'Organization',
      name: 'MeriDiet Editorial Team',
      url: 'https://meridiet.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MeriDiet',
      url: 'https://meridiet.com',
      logo: { '@type': 'ImageObject', url: 'https://meridiet.com/logo-header.png' },
    },
  }

  const faqBlock = post.content.find(b => b.type === 'faq') as Extract<typeof post.content[number], { type: 'faq' }> | undefined
  const faqSchema = faqBlock
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqBlock.items.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://meridiet.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: 'https://meridiet.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.category, item: `https://meridiet.com/blog/${post.slug}` },
    ],
  }

  const schemas = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])]

  return (
    <main className="bp-page">
      <SEO
        title={post.title}
        description={post.description}
        canonical={`/blog/${post.slug}`}
        ogType="article"
        jsonLd={schemas}
      />

      <div className="bp-hero">
        <div className="container bp-hero-inner">
          <div className="bp-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/blog">Blog</Link>
            <span>/</span>
            <span>{post.category}</span>
          </div>
          <span className="bp-category">{post.category}</span>
          <h1 className="bp-title">{post.title}</h1>
          <div className="bp-meta">
            <span className="bp-meta-item">
              <i className="fa-regular fa-calendar" /> {formatDate(post.date)}
            </span>
            <span className="bp-meta-sep">·</span>
            <span className="bp-meta-item">
              <i className="fa-regular fa-clock" /> {post.readTime}
            </span>
            <span className="bp-meta-sep">·</span>
            <span className="bp-meta-item">
              <i className="fa-regular fa-user" /> {post.author}
            </span>
            <span className="bp-meta-sep">·</span>
            <span className="bp-reviewed-badge">
              <i className="fa-solid fa-shield-halved" /> Reviewed by a Registered Dietitian
            </span>
          </div>
        </div>
      </div>

      <div className="container bp-body">
        <article className="bp-article">
          {post.content.map((block, i) => (
            <Block key={i} block={block} />
          ))}
          <div className="bp-author-card">
            <div className="bp-author-avatar">
              <i className="fa-solid fa-users" />
            </div>
            <div className="bp-author-info">
              <p className="bp-author-label">Written by</p>
              <p className="bp-author-name">{post.author}</p>
              <p className="bp-author-bio">
                The MeriDiet Editorial Team consists of registered dietitians, certified nutritionists and health writers dedicated to providing accurate, evidence-based nutrition information for Indian lifestyles. All content is reviewed by a qualified dietitian before publication.
              </p>
              <Link to="/about" className="bp-author-link">About MeriDiet →</Link>
            </div>
          </div>

          <div className="bp-disclaimer">
            <i className="fa-solid fa-circle-info bp-disclaimer-icon" />
            <p>
              <strong>Medical Disclaimer:</strong> This article is for informational purposes only and does not constitute medical advice, diagnosis or treatment. Always consult a qualified healthcare professional or registered dietitian before making changes to your diet, especially if you have a medical condition.
            </p>
          </div>
        </article>

        <aside className="bp-sidebar">
          <div className="bp-sidebar-card">
            <p className="bp-sidebar-eyebrow">Get Started</p>
            <h3 className="bp-sidebar-title">Get Your Personalized Diet Plan</h3>
            <p className="bp-sidebar-text">Answer a quick quiz about your goals and lifestyle and get a plan designed around you.</p>
            <Link to="/diet-plan" className="bp-sidebar-btn">Take the Quiz →</Link>
          </div>
          <div className="bp-sidebar-card bp-sidebar-card--consult">
            <p className="bp-sidebar-eyebrow">Expert Help</p>
            <h3 className="bp-sidebar-title">Consult a Dietitian</h3>
            <p className="bp-sidebar-text">Book a 1-on-1 session with a certified dietitian for personalized guidance.</p>
            <Link to="/consult-dietitian" className="bp-sidebar-btn bp-sidebar-btn--outline">Book a Session →</Link>
          </div>
        </aside>
      </div>
    </main>
  )
}
