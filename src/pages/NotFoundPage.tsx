import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function NotFoundPage() {
  return (
    <main style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist. Go back to MeriDiet and find your personalized Indian diet plan."
        canonical="/404"
        noIndex={true}
      />
      <h1 style={{ fontSize: '6rem', fontWeight: 800, color: '#1E8E3E', margin: 0, lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '1rem 0 0.5rem' }}>Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '2rem', maxWidth: 400 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" style={{ background: '#1E8E3E', color: '#fff', padding: '0.75rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
        Go to Homepage
      </Link>
    </main>
  )
}
