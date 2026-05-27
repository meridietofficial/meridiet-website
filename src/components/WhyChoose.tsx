import {
  CheckCircle2, XCircle, UtensilsCrossed, UserCheck, BadgeCheck,
  IndianRupee, BookOpen, CalendarCheck, MessageCircle, Target,
  Star, Users, ShieldCheck, Pill, Stethoscope, Leaf, Trophy,
} from 'lucide-react'

const stats = [
  { icon: Users,        value: '50,000+', label: 'Happy Clients' },
  { icon: Star,         value: '4.9/5',   label: 'Average Rating' },
  { icon: Leaf,         value: '100%',    label: 'Indian Recipes' },
  { icon: Trophy,       value: '#1',      label: 'Diet Platform' },
]

const features = [
  { icon: UtensilsCrossed, label: 'Personalized Indian meal plans' },
  { icon: UserCheck,       label: 'Plans made by expert dietitians' },
  { icon: BadgeCheck,      label: 'Certified nutritionist review' },
  { icon: IndianRupee,     label: 'Affordable pricing' },
  { icon: BookOpen,        label: 'Recipe & shopping list included' },
  { icon: CalendarCheck,   label: '7-day free trial available' },
  { icon: MessageCircle,   label: 'WhatsApp support' },
  { icon: Target,          label: 'Tracks your health goals' },
]

const columns = [
  { label: 'Generic Diet Pills', icon: Pill,         highlight: false, color: '#94a3b8' },
  { label: 'MeriDiet',          icon: ShieldCheck,  highlight: true,  color: '#fff'    },
  { label: 'Nutritionist',      icon: Stethoscope,  highlight: false, color: '#94a3b8' },
]

const data: boolean[][] = [
  [false, true,  true ],
  [false, true,  false],
  [false, true,  true ],
  [false, true,  false],
  [false, true,  false],
  [false, true,  false],
  [false, true,  false],
  [false, true,  false],
]

const WhyChoose = () => {
  return (
    <section className="why-section" id="why">

      {/* decorative food images */}
      <img src="/rainbow-buddha-bowl.png"   alt="" className="why-deco why-deco--tl" aria-hidden="true" />
      <img src="/fruit-plate-colorful.png"  alt="" className="why-deco why-deco--tr" aria-hidden="true" />
      <img src="/grilled-chicken-salad.png" alt="" className="why-deco why-deco--bl" aria-hidden="true" />
      <img src="/salmon-avocado-bowl.png"   alt="" className="why-deco why-deco--br" aria-hidden="true" />
      <img src="/avocado-egg-bowl.png"      alt="" className="why-deco why-deco--mc" aria-hidden="true" />

      <div className="container">

        <div className="why-header">
          <span className="section-tag">Why Us</span>
          <h2 className="section-title">
            Why Choose <span className="why-green">MeriDiet?</span>
          </h2>
          <p className="section-sub">
            See how MeriDiet compares to other options. No gimmicks — just real,
            science-backed personalized nutrition.
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div className="why-stats">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="why-stat">
                <div className="why-stat-icon">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <div className="why-stat-value">{s.value}</div>
                  <div className="why-stat-label">{s.label}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Comparison table ── */}
        <div className="compare-wrap">
          <div className="compare-table">

            <div className="compare-header">
              <div className="compare-feature-col">
                <span className="compare-feat-heading">Features</span>
              </div>

              {columns.map((col, ci) => {
                const ColIcon = col.icon
                return (
                  <div
                    key={ci}
                    className={`compare-col-head${col.highlight ? ' highlighted' : ''}`}
                  >
                    {col.highlight && (
                      <div className="compare-badge">
                        <Star size={10} strokeWidth={3} fill="currentColor" /> Best Choice
                      </div>
                    )}
                    <div className="compare-col-icon">
                      <ColIcon size={20} strokeWidth={1.8} />
                    </div>
                    <span className="compare-col-name">{col.label}</span>
                  </div>
                )
              })}
            </div>

            {features.map((feat, fi) => {
              const FeatIcon = feat.icon
              return (
                <div key={fi} className="compare-row">
                  <div className="compare-feat">
                    <span className="compare-feat-icon">
                      <FeatIcon size={14} strokeWidth={2} />
                    </span>
                    {feat.label}
                  </div>

                  {data[fi].map((val, ci) => (
                    <div
                      key={ci}
                      className={`compare-cell${columns[ci].highlight ? ' highlighted' : ''}`}
                    >
                      {val
                        ? <CheckCircle2 size={22} strokeWidth={2} className="icon-check" />
                        : <XCircle     size={22} strokeWidth={2} className="icon-cross" />
                      }
                    </div>
                  ))}
                </div>
              )
            })}

            {/* footer row */}
            <div className="compare-footer-row">
              <div className="compare-feat" style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                Ready to start?
              </div>
              <div className="compare-cell" />
              <div className="compare-cell highlighted">
                <a href="#get-plan" className="compare-cta-btn">Get Plan →</a>
              </div>
              <div className="compare-cell" />
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default WhyChoose
