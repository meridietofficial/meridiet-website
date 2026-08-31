import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

function CalcCTA({ message }: { message: string }) {
  return (
    <div className="calc-cta">
      <p className="calc-cta-msg">{message}</p>
      <div className="calc-cta-btns">
        <Link to="/diet-plan" className="calc-cta-primary">Get My Diet Plan →</Link>
        <Link to="/consult-dietitian" className="calc-cta-secondary">Talk to a Dietitian</Link>
      </div>
    </div>
  )
}

/* ── BMI ─────────────────────────────────────────────── */
function BMICalc() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [result, setResult] = useState<{ bmi: number; label: string; color: string } | null>(null)

  function calculate() {
    const w = parseFloat(weight)
    const h = parseFloat(height) / 100
    if (!w || !h || h <= 0) return
    const bmi = w / (h * h)
    let label = '', color = ''
    if (bmi < 18.5)      { label = 'Underweight'; color = '#3b82f6' }
    else if (bmi < 25)   { label = 'Normal weight'; color = '#16a34a' }
    else if (bmi < 30)   { label = 'Overweight'; color = '#f59e0b' }
    else                 { label = 'Obese'; color = '#ef4444' }
    setResult({ bmi: Math.round(bmi * 10) / 10, label, color })
  }

  return (
    <div className="calc-card">
      <div className="calc-icon">⚖️</div>
      <h2 className="calc-title">BMI Calculator</h2>
      <p className="calc-desc">Body Mass Index — check if your weight is healthy for your height.</p>
      <div className="calc-fields">
        <div className="calc-field">
          <label>Weight (kg)</label>
          <input type="number" placeholder="e.g. 70" value={weight} onChange={e => setWeight(e.target.value)} min="1" />
        </div>
        <div className="calc-field">
          <label>Height (cm)</label>
          <input type="number" placeholder="e.g. 170" value={height} onChange={e => setHeight(e.target.value)} min="1" />
        </div>
      </div>
      <button className="calc-btn" onClick={calculate}>Calculate BMI</button>
      {result && (
        <div className="calc-result">
          <div className="calc-result-number" style={{ color: result.color }}>{result.bmi}</div>
          <div className="calc-result-label" style={{ color: result.color }}>{result.label}</div>
          <div className="calc-bmi-scale">
            <div className="calc-bmi-bar">
              <div className="calc-bmi-segment" style={{ background: '#3b82f6', flex: 1 }}>
                <span>&lt;18.5</span>
              </div>
              <div className="calc-bmi-segment" style={{ background: '#16a34a', flex: 1.3 }}>
                <span>18.5–24.9</span>
              </div>
              <div className="calc-bmi-segment" style={{ background: '#f59e0b', flex: 1 }}>
                <span>25–29.9</span>
              </div>
              <div className="calc-bmi-segment" style={{ background: '#ef4444', flex: 1 }}>
                <span>≥30</span>
              </div>
            </div>
            <div className="calc-bmi-labels">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
          </div>
          <CalcCTA message={
            result.label === 'Underweight' ? 'A dietitian can help you gain weight healthily with an Indian diet plan.' :
            result.label === 'Normal weight' ? 'Maintain your healthy weight with a personalised Indian diet plan.' :
            'A personalised diet plan can help you reach a healthy BMI.'
          } />
        </div>
      )}
    </div>
  )
}

/* ── BMR ─────────────────────────────────────────────── */
function BMRCalc() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge]       = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [result, setResult] = useState<number | null>(null)

  function calculate() {
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age)
    if (!w || !h || !a) return
    const bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161
    setResult(Math.round(bmr))
  }

  return (
    <div className="calc-card">
      <div className="calc-icon">🔥</div>
      <h2 className="calc-title">BMR Calculator</h2>
      <p className="calc-desc">Basal Metabolic Rate — calories your body burns at complete rest.</p>
      <div className="calc-gender-row">
        {(['male', 'female'] as const).map(g => (
          <button
            key={g}
            className={`calc-gender-btn${gender === g ? ' active' : ''}`}
            onClick={() => setGender(g)}
          >
            {g === 'male' ? '♂ Male' : '♀ Female'}
          </button>
        ))}
      </div>
      <div className="calc-fields">
        <div className="calc-field">
          <label>Weight (kg)</label>
          <input type="number" placeholder="e.g. 70" value={weight} onChange={e => setWeight(e.target.value)} min="1" />
        </div>
        <div className="calc-field">
          <label>Height (cm)</label>
          <input type="number" placeholder="e.g. 170" value={height} onChange={e => setHeight(e.target.value)} min="1" />
        </div>
        <div className="calc-field">
          <label>Age (years)</label>
          <input type="number" placeholder="e.g. 28" value={age} onChange={e => setAge(e.target.value)} min="1" />
        </div>
      </div>
      <button className="calc-btn" onClick={calculate}>Calculate BMR</button>
      {result !== null && (
        <div className="calc-result">
          <div className="calc-result-number">{result.toLocaleString('en-IN')}</div>
          <div className="calc-result-unit">calories / day</div>
          <p className="calc-result-note">This is how many calories your body needs just to stay alive at rest.</p>
          <CalcCTA message="Get a meal plan built around your exact calorie needs." />
        </div>
      )}
    </div>
  )
}

/* ── TDEE ────────────────────────────────────────────── */
const ACTIVITY_LEVELS = [
  { label: 'Sedentary',         desc: 'Little or no exercise',          multiplier: 1.2   },
  { label: 'Lightly Active',    desc: 'Exercise 1–3 days/week',         multiplier: 1.375 },
  { label: 'Moderately Active', desc: 'Exercise 3–5 days/week',         multiplier: 1.55  },
  { label: 'Very Active',       desc: 'Hard exercise 6–7 days/week',    multiplier: 1.725 },
  { label: 'Extra Active',      desc: 'Physical job + daily exercise',  multiplier: 1.9   },
]

function TDEECalc() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge]       = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [activity, setActivity] = useState(1.55)
  const [result, setResult] = useState<{ tdee: number; loss: number; gain: number } | null>(null)

  function calculate() {
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age)
    if (!w || !h || !a) return
    const bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161
    const tdee = Math.round(bmr * activity)
    setResult({ tdee, loss: tdee - 500, gain: tdee + 300 })
  }

  return (
    <div className="calc-card">
      <div className="calc-icon">⚡</div>
      <h2 className="calc-title">TDEE Calculator</h2>
      <p className="calc-desc">Total Daily Energy Expenditure — your actual daily calorie needs based on activity.</p>
      <div className="calc-gender-row">
        {(['male', 'female'] as const).map(g => (
          <button key={g} className={`calc-gender-btn${gender === g ? ' active' : ''}`} onClick={() => setGender(g)}>
            {g === 'male' ? '♂ Male' : '♀ Female'}
          </button>
        ))}
      </div>
      <div className="calc-fields">
        <div className="calc-field">
          <label>Weight (kg)</label>
          <input type="number" placeholder="e.g. 70" value={weight} onChange={e => setWeight(e.target.value)} min="1" />
        </div>
        <div className="calc-field">
          <label>Height (cm)</label>
          <input type="number" placeholder="e.g. 170" value={height} onChange={e => setHeight(e.target.value)} min="1" />
        </div>
        <div className="calc-field">
          <label>Age (years)</label>
          <input type="number" placeholder="e.g. 28" value={age} onChange={e => setAge(e.target.value)} min="1" />
        </div>
      </div>
      <div className="calc-field" style={{ marginBottom: 16 }}>
        <label>Activity Level</label>
        <div className="calc-activity-list">
          {ACTIVITY_LEVELS.map(a => (
            <button
              key={a.multiplier}
              className={`calc-activity-btn${activity === a.multiplier ? ' active' : ''}`}
              onClick={() => setActivity(a.multiplier)}
            >
              <span className="calc-activity-name">{a.label}</span>
              <span className="calc-activity-desc">{a.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <button className="calc-btn" onClick={calculate}>Calculate TDEE</button>
      {result && (
        <div className="calc-result">
          <div className="calc-result-number">{result.tdee.toLocaleString('en-IN')}</div>
          <div className="calc-result-unit">calories / day (maintenance)</div>
          <div className="calc-tdee-goals">
            <div className="calc-tdee-goal calc-tdee-goal--loss">
              <span className="calc-tdee-goal-label">Weight Loss</span>
              <span className="calc-tdee-goal-val">{result.loss.toLocaleString('en-IN')} cal</span>
              <span className="calc-tdee-goal-hint">−500 cal/day</span>
            </div>
            <div className="calc-tdee-goal calc-tdee-goal--maintain">
              <span className="calc-tdee-goal-label">Maintain</span>
              <span className="calc-tdee-goal-val">{result.tdee.toLocaleString('en-IN')} cal</span>
              <span className="calc-tdee-goal-hint">current weight</span>
            </div>
            <div className="calc-tdee-goal calc-tdee-goal--gain">
              <span className="calc-tdee-goal-label">Weight Gain</span>
              <span className="calc-tdee-goal-val">{result.gain.toLocaleString('en-IN')} cal</span>
              <span className="calc-tdee-goal-hint">+300 cal/day</span>
            </div>
          </div>
          <CalcCTA message="Get a personalised Indian diet plan matched to your daily calorie target." />
        </div>
      )}
    </div>
  )
}

/* ── Water Intake ─────────────────────────────────────── */
const WATER_ACTIVITY = [
  { label: 'Sedentary',  desc: 'Desk job, little movement', factor: 0.033 },
  { label: 'Moderate',   desc: 'Walk / light exercise',     factor: 0.038 },
  { label: 'Active',     desc: 'Regular workouts',          factor: 0.045 },
]

function WaterCalc() {
  const [weight, setWeight] = useState('')
  const [factor, setFactor] = useState(0.038)
  const [result, setResult] = useState<{ liters: number; glasses: number } | null>(null)

  function calculate() {
    const w = parseFloat(weight)
    if (!w) return
    const liters = Math.round(w * factor * 10) / 10
    setResult({ liters, glasses: Math.round(liters / 0.25) })
  }

  return (
    <div className="calc-card">
      <div className="calc-icon">💧</div>
      <h2 className="calc-title">Water Intake Calculator</h2>
      <p className="calc-desc">Find out how much water you should drink daily based on your weight and lifestyle.</p>
      <div className="calc-fields">
        <div className="calc-field">
          <label>Weight (kg)</label>
          <input type="number" placeholder="e.g. 70" value={weight} onChange={e => setWeight(e.target.value)} min="1" />
        </div>
      </div>
      <div className="calc-field" style={{ marginBottom: 16 }}>
        <label>Activity Level</label>
        <div className="calc-activity-list">
          {WATER_ACTIVITY.map(a => (
            <button
              key={a.factor}
              className={`calc-activity-btn${factor === a.factor ? ' active' : ''}`}
              onClick={() => setFactor(a.factor)}
            >
              <span className="calc-activity-name">{a.label}</span>
              <span className="calc-activity-desc">{a.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <button className="calc-btn" onClick={calculate}>Calculate Water Intake</button>
      {result && (
        <div className="calc-result">
          <div className="calc-water-row">
            <div className="calc-water-stat">
              <div className="calc-result-number" style={{ color: '#0ea5e9' }}>{result.liters}L</div>
              <div className="calc-result-unit">per day</div>
            </div>
            <div className="calc-water-divider" />
            <div className="calc-water-stat">
              <div className="calc-result-number" style={{ color: '#0ea5e9' }}>{result.glasses}</div>
              <div className="calc-result-unit">glasses (250ml)</div>
            </div>
          </div>
          <p className="calc-result-note">Drink more if it's hot, you're sick, or after intense exercise.</p>
          <CalcCTA message="Pair your hydration goal with a complete nutrition plan from a dietitian." />
        </div>
      )}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────── */
export default function Calculators() {
  return (
    <main className="calcp-page">
      <SEO
        title="Free Health Calculators — BMI, BMR, TDEE & Water Intake"
        description="Use MeriDiet's free health calculators to find your BMI, BMR, daily calorie needs (TDEE), and water intake. Simple, instant results."
        keywords="BMI calculator India, BMR calculator, TDEE calculator, water intake calculator, calorie calculator India"
        canonical="/calculators"
      />

      <div className="calcp-hero">
        <div className="container">
          <span className="section-tag">Free Tools</span>
          <h1 className="calcp-hero-title">Health Calculators</h1>
          <p className="calcp-hero-sub">Quick, science-backed tools to understand your body better.</p>
        </div>
      </div>

      <div className="container calcp-grid">
        <BMICalc />
        <BMRCalc />
        <TDEECalc />
        <WaterCalc />
      </div>
    </main>
  )
}
