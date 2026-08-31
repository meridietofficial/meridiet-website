import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const MEDIA = [
  {
    name: 'Hindustan Metro',
    short: 'HM',
    color: '#c0392b',
    logo: 'https://hindustanmetro.com/uploads/logo/logo_69e4bdc74d8338-90418036.png',
    url: 'https://hindustanmetro.com/meridiet-technologies-launches-ai-powered-nutrition-platform-serving-50000-indians',
  },
  {
    name: 'Times Release',
    short: 'TR',
    color: '#2980b9',
    logo: 'https://timesrelease.com/wp-content/uploads/2024/06/cropped-Times-Release-1.png',
    url: 'https://timesrelease.com/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
  },
  {
    name: 'Prime Bulletins',
    short: 'PB',
    color: '#27ae60',
    logo: 'https://primebulletins.com/wp-content/uploads/2024/07/cropped-new.png',
    url: 'https://primebulletins.com/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
  },
  {
    name: 'Latest Tales',
    short: 'LT',
    color: '#8e44ad',
    logo: 'https://latesttales.in/wp-content/uploads/2024/07/cropped-PRIME-1.png',
    url: 'https://latesttales.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
  },
  {
    name: 'Hindustan Hunt',
    short: 'HH',
    color: '#e67e22',
    logo: 'https://hindustanhunt.com/wp-content/uploads/2024/06/Hindustan-Hunt.png',
    url: 'https://hindustanhunt.com/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
  },
  {
    name: 'Daily Viewer',
    short: 'DV',
    color: '#16a085',
    logo: 'https://dailyviewer.in/wp-content/uploads/2024/06/Daily-viewer.png',
    url: 'https://dailyviewer.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
  },
  {
    name: 'Bollywood Insider',
    short: 'BI',
    color: '#d35400',
    logo: null,
    url: 'https://bollywoodinsider.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home/',
  },
  {
    name: 'InfluenciveIndia',
    short: 'II',
    color: '#1abc9c',
    logo: 'https://influenciveindia.in/uploads/logo/logo_68136cd2bd7fb.png',
    url: 'https://influenciveindia.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home',
  },
  {
    name: 'InstaStory',
    short: 'IS',
    color: '#e91e8c',
    logo: 'https://instastory.in/uploads/logo/logo_631c32ea9676e.png',
    url: 'https://instastory.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home',
  },
  {
    name: 'TPTV',
    short: 'TV',
    color: '#2c3e50',
    logo: 'https://tptv.in/uploads/logo/logo_631c322a14d0a.png',
    url: 'https://tptv.in/meridiet-technologies-launches-women-empowerment-initiative-to-help-female-dietitians-build-careers-from-home',
  },
]

function LogoItem({ m }: { m: typeof MEDIA[0] }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <a
      href={m.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mp-logo-item"
    >
      <div className="mp-logo-img-wrap">
        {m.logo && !imgFailed ? (
          <img
            src={m.logo}
            alt={m.name}
            className="mp-logo-img"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="mp-logo-fallback" style={{ color: m.color, background: `${m.color}15` }}>
            {m.short}
          </span>
        )}
      </div>
      <span className="mp-logo-name">{m.name}</span>
    </a>
  )
}

export default function MediaPress() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const id = setInterval(() => {
      if (!pausedRef.current && track) {
        track.scrollLeft += 1
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft = 0
        }
      }
    }, 20)
    return () => clearInterval(id)
  }, [])

  const allItems = [...MEDIA, ...MEDIA]

  return (
    <section className="mp-section" ref={sectionRef}>
      <div className="container">
        <div className={`mp-header${visible ? ' mp-visible' : ''}`}>
          <span className="section-tag">In The News</span>
          <h2 className="mp-title">As Featured In</h2>
          <p className="mp-subtitle">Leading media outlets covering our story of transforming nutrition in India</p>
        </div>
      </div>

      <div className={`mp-scroll-wrap${visible ? ' mp-visible' : ''}`}>
        <div
          className="mp-track"
          ref={trackRef}
          onMouseEnter={() => { pausedRef.current = true }}
          onMouseLeave={() => { pausedRef.current = false }}
        >
          {allItems.map((m, i) => (
            <LogoItem key={i} m={m} />
          ))}
        </div>
      </div>

      <div className="container">
        <div className={`mp-cta-row${visible ? ' mp-visible' : ''}`}>
          <Link to="/press" className="mp-read-more">
            Read All Press Coverage
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
