import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 5000, suffix: '+', label: 'Diet Plans' },
  { value: 500,  suffix: '+', label: 'Active Clients This Month' },
  { value: 100,  suffix: '+', label: 'Dietitians' },
  { value: 95,   suffix: '%', label: 'Satisfaction Rate' },
]

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, active])
  return count
}

function StatItem({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCountUp(value, 1800, active)
  return (
    <div className="sc-stat">
      <div className="sc-number">
        {count.toLocaleString('en-IN')}<span className="sc-suffix">{suffix}</span>
      </div>
      <div className="sc-label">{label}</div>
    </div>
  )
}

export default function StatsCounter() {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="sc-section" ref={ref}>
      <div className="container">
        <div className="sc-grid">
          {STATS.map(s => (
            <StatItem key={s.label} value={s.value} suffix={s.suffix} label={s.label} active={active} />
          ))}
        </div>
      </div>
    </section>
  )
}
