import { useEffect, useRef } from 'react'

const transformations = [
  {
    id: 1,
    name: 'Tanshik',
    quote: 'Thanks to Meri Diet\'s personalized nutrition plan, I gained 8 kg in 3 months of muscle and improved my fitness results.',
    highlight: 'gained 8 kg in 3 months',
    alt: 'Tanshik before and after MeriDiet muscle gain diet plan – gained 8 kg in 3 months',
  },
  {
    id: 2,
    name: 'Siddhesh',
    quote: 'Meri Diet helped me lose 7kg in 3 months without feeling restricted or hungry all the time.',
    highlight: 'lose 7kg in 3 months',
    alt: 'Siddhesh before and after MeriDiet weight loss plan – lost 7 kg in 3 months',
  },
  {
    id: 3,
    name: 'Gourav',
    quote: 'I lost 20 kgs in 2 years with guidance from Meri Diet. The guidance was easy to follow, and the results exceeded my expectations.',
    highlight: '20 kgs in 2 years',
    alt: 'Gourav before and after MeriDiet diet plan – lost 20 kg in 2 years',
  },
  {
    id: 4,
    name: 'Anmol',
    quote: 'Meri Diet helped me understand what to eat to support my workouts. With a personalized plan, I lost 5kg in 3 months.',
    highlight: '5kg in 3 months',
    alt: 'Anmol before and after MeriDiet weight loss plan – lost 5 kg in 3 months',
  },
  {
    id: 5,
    name: 'Neeraj',
    quote: 'Meri Diet helped me gain 11kg in 5 months in a healthy & sustainable way. The personalized plan was easy to follow & delivered great results.',
    highlight: 'gain 11kg in 5 months',
    alt: 'Neeraj before and after MeriDiet muscle gain nutrition plan – gained 11 kg in 5 months',
  },
  {
    id: 6,
    name: 'Tanshik',
    quote: 'Gained 5 kg in just 40 days with Meri Diet\'s personalized nutrition plan. Simple, effective, and easy to follow!',
    highlight: '5 kg in just 40 days',
    alt: 'Tanshik before and after MeriDiet muscle gain plan – gained 5 kg in 40 days',
  },
  {
    id: 7,
    name: 'Gourav',
    quote: 'I lost 40kg in 3 months with Meri Diet without giving up the foods I love. The plan was simple & easy to follow.',
    highlight: '40kg in 3 months',
    alt: 'Gourav before and after MeriDiet weight loss transformation – lost 40 kg in 3 months',
  },
  {
    id: 8,
    name: 'Priya',
    quote: 'Meri Diet helped me gain 5kg in 2 months. The plan felt practical and sustainable. Highly recommended.',
    highlight: 'gain 5kg in 2 months',
    alt: 'Priya before and after MeriDiet muscle gain diet plan – gained 5 kg in 2 months',
  },
  {
    id: 9,
    name: 'Shubham',
    quote: 'Thanks to Meri Diet, I maintained 63kg and developed healthier habits. I would recommend it to all fitness enthusiasts.',
    highlight: 'maintained 63kg',
    alt: 'Shubham before and after MeriDiet body recomposition plan – maintained 63 kg ideal weight',
  },
  {
    id: 10,
    name: 'Yash',
    quote: 'I gained 20 kg in 6-7 months with Meri Diet\'s personalized nutrition plan. The approach was sustainable, practical, and helped me achieve my goals.',
    highlight: '20 kg in 6-7 months',
    alt: 'Yash before and after MeriDiet muscle gain nutrition plan – gained 20 kg in 6 months',
  },
  {
    id: 11,
    name: 'Nikhil',
    quote: 'I successfully lost 5 kg in just 2 months while preserving lean muscle mass. Meri Diet\'s nutrition plan perfectly supported my fat-loss journey.',
    highlight: '5 kg in just 2 months',
    alt: 'Nikhil before and after MeriDiet fat loss diet plan – lost 5 kg in 2 months while preserving muscle',
  },
  {
    id: 12,
    name: 'Charanjeet Kaur',
    quote: 'I lost 6 kgs in 2 months, thanks to MeriDiet. MeriDiet gave me a personalized meal plan that fit my lifestyle instead of forcing me to change everything.',
    highlight: '6 kgs in 2 months',
    alt: 'Charanjeet Kaur before and after MeriDiet women weight loss plan – lost 6 kg in 2 months',
  },
]

function highlightText(quote: string, highlight: string) {
  const idx = quote.toLowerCase().indexOf(highlight.toLowerCase())
  if (idx === -1) return <span>{quote}</span>
  return (
    <>
      {quote.slice(0, idx)}
      <strong style={{ color: 'var(--green)' }}>{quote.slice(idx, idx + highlight.length)}</strong>
      {quote.slice(idx + highlight.length)}
    </>
  )
}

const TransformationGallery = () => {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const step = 0.8
    const delay = 20

    const tick = () => {
      if (!pausedRef.current && track) {
        track.scrollLeft += step
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft = 0
        }
      }
    }

    const id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [])

  const handleMouseEnter = () => { pausedRef.current = true }
  const handleMouseLeave = () => { pausedRef.current = false }

  return (
    <section className="transformation-section" id="transformations">
      <div className="container">
        <div className="transformation-header">
          <span className="section-tag">Real Results</span>
          <h2 className="section-title">Real Weight Loss &amp; Muscle Gain Transformations</h2>
          <p className="section-sub">
            Thousands of clients have transformed their bodies with MeriDiet's personalised diet plans. These are their real results.
          </p>
        </div>
      </div>

      <div className="transformation-scroll-wrap">
        <div
          className="transformation-track"
          ref={trackRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {transformations.map((t) => (
            <div key={t.id} className="transformation-card">
              <div className="transformation-img-wrap">
                <img src={`/transformation-${t.id}.png`} alt={t.alt} loading="lazy" />
                <div className="transformation-shine" />
              </div>
              <div className="transformation-info">
                <p className="transformation-quote">"{highlightText(t.quote, t.highlight)}"</p>
                <span className="transformation-name">— {t.name}</span>
              </div>
            </div>
          ))}
          {transformations.map((t) => (
            <div key={`dup-${t.id}`} className="transformation-card" aria-hidden="true">
              <div className="transformation-img-wrap">
                <img src={`/transformation-${t.id}.png`} alt="" loading="lazy" />
                <div className="transformation-shine" />
              </div>
              <div className="transformation-info">
                <p className="transformation-quote">"{highlightText(t.quote, t.highlight)}"</p>
                <span className="transformation-name">— {t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="transformation-trust">
          <span>💪 10,000+ clients transformed</span>
          <span>•</span>
          <span>Personalised nutrition plans</span>
          <span>•</span>
          <span>Real people, real results</span>
        </div>
      </div>
    </section>
  )
}

export default TransformationGallery
