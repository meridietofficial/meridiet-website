import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

const reviews = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'I lost 8 kg in 2 months following my MeriDiet plan! The meals are delicious and so easy to prepare. Best part — everything is Indian food I already love.',
    initials: 'PS',
    color: '#e76f51',
    goal: 'Weight Loss',
  },
  {
    name: 'Rajesh Kumar',
    location: 'Delhi',
    rating: 5,
    text: 'As a diabetic, finding the right diet was always a challenge. MeriDiet gave me a proper plan that my doctor also approved. My sugar levels are much more stable now.',
    initials: 'RK',
    color: '#2a9d8f',
    goal: 'Diabetes Management',
  },
  {
    name: 'Ananya Singh',
    location: 'Bangalore',
    rating: 5,
    text: 'Dealing with PCOS for years, and finally found something that works! The plan is so detailed, with breakfast to dinner covered. Highly recommend to all women with PCOS.',
    initials: 'AS',
    color: '#457b9d',
    goal: 'PCOS Management',
  },
  {
    name: 'Meera Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: 'My thyroid levels were making it impossible to lose weight. MeriDiet created a plan that worked around my condition. Lost 5 kg in 6 weeks and feel so much more energetic!',
    initials: 'MP',
    color: '#9b5de5',
    goal: 'Thyroid Management',
  },
  {
    name: 'Vikram Nair',
    location: 'Chennai',
    rating: 5,
    text: 'I wanted to build muscle without compromising on my vegetarian diet. MeriDiet nailed it — high-protein Indian meals that actually taste great. Gained 4 kg lean muscle.',
    initials: 'VN',
    color: '#f77f00',
    goal: 'Muscle Gain',
  },
  {
    name: 'Sunita Devi',
    location: 'Jaipur',
    rating: 5,
    text: 'Simple, affordable, and effective! The plan uses ingredients from my local market and fits my budget perfectly. Lost 6 kg and my family loves the new recipes too.',
    initials: 'SD',
    color: '#d62828',
    goal: 'Weight Loss',
  },
  {
    name: 'Arjun Mehta',
    location: 'Pune',
    rating: 5,
    text: 'After my heart scare, my cardiologist suggested a diet overhaul. MeriDiet gave me a low-sodium, heart-friendly Indian diet plan. My cholesterol dropped significantly in 3 months.',
    initials: 'AM',
    color: '#118ab2',
    goal: 'Heart Health',
  },
  {
    name: 'Kavita Reddy',
    location: 'Hyderabad',
    rating: 5,
    text: 'I never thought eating healthy could be this easy! MeriDiet taught me portion control with desi food. No fancy ingredients, no crash dieting — just real, lasting results.',
    initials: 'KR',
    color: '#06d6a0',
    goal: 'Healthy Eating',
  },
]

const Testimonials = () => {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const step = 1
    const delay = 20

    const tick = () => {
      if (!pausedRef.current && track) {
        track.scrollLeft += step
        // seamless loop: when we've scrolled past the first half (original set), jump back
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

  // Duplicate cards for seamless infinite loop
  const allCards = [...reviews, ...reviews]

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <div className="test-header">
          <span className="section-tag">Client Stories</span>
          <h2 className="section-title">Loved by Our Clients</h2>
          <p className="section-sub">
            Real results from real people. Join thousands of Indians who transformed their health
            with MeriDiet.
          </p>
        </div>
      </div>

      <div className="reviews-scroll-wrap">
        <div
          className="reviews-track"
          ref={trackRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {allCards.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-top">
                <div className="reviewer-avatar" style={{ background: r.color }}>
                  {r.initials}
                </div>
                <div className="reviewer-info">
                  <div className="reviewer-name">{r.name}</div>
                  <div className="reviewer-loc">
                    <MapPin size={11} strokeWidth={2} />
                    {r.location}
                  </div>
                </div>
                <span className="reviewer-goal">{r.goal}</span>
              </div>
              <div className="review-stars">{'★'.repeat(r.rating)}</div>
              <p className="review-text">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="test-trust">
          <span>⭐ 4.9/5 average rating</span>
          <span>•</span>
          <span>50,000+ happy clients</span>
          <span>•</span>
          <span>Verified reviews only</span>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
