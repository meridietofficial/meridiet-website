import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import BLOGS from '../data/blogs'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogList() {
  return (
    <main className="blog-list-page">
      <SEO
        title="Blog – Nutrition Tips, Diet Advice & Wellness Guides"
        description="Read expert articles on personalized nutrition, weight loss, Indian diet planning and healthy eating from the MeriDiet team."
        keywords="nutrition blog India, diet tips, weight loss articles, Indian diet advice, healthy eating blog"
        canonical="/blog"
      />

      <div className="blog-list-hero">
        <div className="container">
          <span className="blog-list-eyebrow">MeriDiet Blog</span>
          <h1 className="blog-list-title">Nutrition Insights & Diet Guides</h1>
          <p className="blog-list-sub">
            Practical, science-informed articles on nutrition, weight management and healthy eating — crafted for Indian lifestyles.
          </p>
        </div>
      </div>

      <div className="container blog-list-body">
        <div className="blog-grid">
          {[...BLOGS].sort((a, b) => b.date.localeCompare(a.date)).map(post => (
            <article key={post.slug} className="blog-card">
              <div className="blog-card-top">
                <span className="blog-card-category">{post.category}</span>
                <span className="blog-card-read-time">{post.readTime}</span>
              </div>
              <h2 className="blog-card-title">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="blog-card-desc">{post.description}</p>
              <div className="blog-card-footer">
                <span className="blog-card-date">{formatDate(post.date)}</span>
                <Link to={`/blog/${post.slug}`} className="blog-card-link">
                  Read Article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
