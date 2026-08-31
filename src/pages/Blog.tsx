import { useState } from 'react'
import SEO from '../components/SEO'

const ARTICLES = [
  {
    title: 'MeriDiet Technologies Launches AI-Powered Nutrition Platform Serving 50,000 Indians',
    outlet: 'Hindustan Metro',
    outletShort: 'HM',
    color: '#c0392b',
    logo: 'https://hindustanmetro.com/uploads/logo/logo_69e4bdc74d8338-90418036.png',
    url: 'https://hindustanmetro.com/meridiet-technologies-launches-ai-powered-nutrition-platform-serving-50000-indians',
    category: 'Technology',
    date: 'July 2025',
  },
  {
    title: 'MeriDiet Technologies Launches Women Empowerment Initiative to Help Female Dietitians Build Careers from Home',
    outlet: 'Times Release',
    outletShort: 'TR',
    color: '#2980b9',
    logo: 'https://timesrelease.com/wp-content/uploads/2024/06/cropped-Times-Release-1.png',
    url: 'https://timesrelease.com/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
    category: 'Women Empowerment',
    date: 'July 2025',
  },
  {
    title: 'MeriDiet Technologies Launches Women Empowerment Initiative to Help Female Dietitians Build Careers from Home',
    outlet: 'Prime Bulletins',
    outletShort: 'PB',
    color: '#27ae60',
    logo: 'https://primebulletins.com/wp-content/uploads/2024/07/cropped-new.png',
    url: 'https://primebulletins.com/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
    category: 'Women Empowerment',
    date: 'July 2025',
  },
  {
    title: 'MeriDiet Technologies Launches Women Empowerment Initiative to Help Female Dietitians Build Careers from Home',
    outlet: 'Latest Tales',
    outletShort: 'LT',
    color: '#8e44ad',
    logo: 'https://latesttales.in/wp-content/uploads/2024/07/cropped-PRIME-1.png',
    url: 'https://latesttales.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
    category: 'Women Empowerment',
    date: 'July 2025',
  },
  {
    title: 'MeriDiet Technologies Launches Women Empowerment Initiative to Help Female Dietitians Build Careers from Home',
    outlet: 'Hindustan Hunt',
    outletShort: 'HH',
    color: '#e67e22',
    logo: 'https://hindustanhunt.com/wp-content/uploads/2024/06/Hindustan-Hunt.png',
    url: 'https://hindustanhunt.com/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
    category: 'Women Empowerment',
    date: 'July 2025',
  },
  {
    title: 'MeriDiet Technologies Launches Women Empowerment Initiative to Help Female Dietitians Build Careers from Home',
    outlet: 'Daily Viewer',
    outletShort: 'DV',
    color: '#16a085',
    logo: 'https://dailyviewer.in/wp-content/uploads/2024/06/Daily-viewer.png',
    url: 'https://dailyviewer.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
    category: 'Women Empowerment',
    date: 'July 2025',
  },
  {
    title: 'MeriDiet Technologies Launches Women Empowerment Initiative to Help Female Dietitians Build Careers from Home',
    outlet: 'Bollywood Insider',
    outletShort: 'BI',
    color: '#d35400',
    logo: null,
    url: 'https://bollywoodinsider.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
    category: 'Women Empowerment',
    date: 'July 2025',
  },
  {
    title: 'MeriDiet Technologies Launches Women Empowerment Initiative to Help Female Dietitians Build Careers from Home',
    outlet: 'InfluenciveIndia',
    outletShort: 'II',
    color: '#1abc9c',
    logo: 'https://influenciveindia.in/uploads/logo/logo_68136cd2bd7fb.png',
    url: 'https://influenciveindia.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home',
    category: 'Women Empowerment',
    date: 'July 2025',
  },
  {
    title: 'MeriDiet Technologies Launches Women Empowerment Initiative to Help Female Dietitians Build Careers from Home',
    outlet: 'InstaStory',
    outletShort: 'IS',
    color: '#e91e8c',
    logo: 'https://instastory.in/uploads/logo/logo_631c32ea9676e.png',
    url: 'https://instastory.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home',
    category: 'Women Empowerment',
    date: 'July 2025',
  },
  {
    title: 'MeriDiet Technologies Launches Women Empowerment Initiative to Help Female Dietitians Build Careers from Home',
    outlet: 'TPTV',
    outletShort: 'TV',
    color: '#2c3e50',
    logo: 'https://tptv.in/uploads/logo/logo_631c322a14d0a.png',
    url: 'https://tptv.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home',
    category: 'Women Empowerment',
    date: 'July 2025',
  },
]

function OutletLogo({ logo, name, short, color }: { logo: string | null; name: string; short: string; color: string }) {
  const [failed, setFailed] = useState(false)
  if (logo && !failed) {
    return (
      <div className="blog-card-outlet-logo-wrap">
        <img
          src={logo}
          alt={name}
          className="blog-card-outlet-logo"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }
  return (
    <div className="blog-card-outlet-icon" style={{ background: `${color}18`, borderColor: `${color}30` }}>
      <span style={{ color, fontWeight: 800, fontSize: 17 }}>{short}</span>
    </div>
  )
}

export default function Blog() {
  return (
    <main className="blog-page">
      <SEO
        title="Press & Media Coverage – In the News"
        description="Read the latest press coverage and media features about MeriDiet's AI-powered nutrition platform and dietitian empowerment initiatives across India."
        keywords="MeriDiet press, MeriDiet news, MeriDiet media coverage, AI diet plan India news, dietitian platform India"
        canonical="/press"
      />

      <div className="blog-hero">
        <div className="container">
          <span className="section-tag">Press & Media</span>
          <h1 className="blog-hero-title">MeriDiet in the News</h1>
          <p className="blog-hero-sub">
            Discover what leading media outlets across India are saying about our AI-powered nutrition platform and our mission to empower dietitians.
          </p>
        </div>
      </div>

      <div className="container blog-grid-wrap">
        <div className="blog-grid">
          {ARTICLES.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="blog-card"
            >
              <div className="blog-card-top">
                <OutletLogo logo={a.logo} name={a.outlet} short={a.outletShort} color={a.color} />
                <span className="blog-card-category" style={{ background: `${a.color}15`, color: a.color }}>
                  {a.category}
                </span>
              </div>
              <h3 className="blog-card-title">{a.title}</h3>
              <div className="blog-card-footer">
                <span className="blog-card-outlet">{a.outlet}</span>
                <span className="blog-card-date">{a.date}</span>
              </div>
              <span className="blog-card-link">
                Read Article
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
