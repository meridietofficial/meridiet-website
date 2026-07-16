import { useEffect } from 'react'
import DatePicker from './DatePicker'

export type DietPlanFormValues = {
  dob: string
  age: string
  gender: string
  height: string
  height_unit: 'cm' | 'ft_in'
  weight: string
  weight_unit: 'kg' | 'lbs'
  goals: string[]
  goals_other: string
  activity_level: string
  work_type: string
  workout_type: string
  diet_type: string
  cuisine_preference: string[]
  food_allergies: string[]
  foods_dislike: string
  favorite_foods: string
  medical_conditions: string[]
  other_condition: string
  on_medication: string
  medications: string
  digestive_health: string
  smoke_alcohol: string
  health_notes: string
  plan_type: string
  city: string
  state: string
}

export const EMPTY_FORM: DietPlanFormValues = {
  dob: '', age: '', gender: '', height: '', height_unit: 'cm', weight: '', weight_unit: 'kg',
  goals: [], goals_other: '', activity_level: '', work_type: '', workout_type: '', diet_type: '',
  cuisine_preference: [], food_allergies: [], foods_dislike: '', favorite_foods: '',
  medical_conditions: [], other_condition: '', on_medication: '', medications: '',
  digestive_health: '', smoke_alcohol: '', health_notes: '', plan_type: '',
  city: '', state: '',
}

const TODAY = new Date().toISOString().split('T')[0]

function calcAge(dob: string): string {
  if (!dob) return ''
  const birth = new Date(dob.split('T')[0] + 'T00:00:00')
  if (isNaN(birth.getTime())) return ''
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age >= 0 && age <= 120 ? String(age) : ''
}

const GOALS_OPTIONS = [
  { value: 'weight_loss',       label: 'Weight Loss',       emoji: '⚖️', desc: 'Lose weight & feel lighter' },
  { value: 'fat_loss',          label: 'Fat Loss',          emoji: '🏋️', desc: 'Reduce body fat & shape up' },
  { value: 'muscle_gain',       label: 'Muscle Gain',       emoji: '💪', desc: 'Build muscle & get stronger' },
  { value: 'pcos_support',      label: 'PCOS Support',      emoji: '♀️', desc: 'Manage PCOS symptoms naturally' },
  { value: 'healthy_lifestyle', label: 'Healthy Lifestyle', emoji: '🌱', desc: 'Overall health & wellness' },
  { value: 'maintenance',       label: 'Maintenance',       emoji: '⚡', desc: 'Maintain current weight' },
  { value: 'improve_energy',    label: 'Improve Energy',    emoji: '🔋', desc: 'Boost daily energy levels' },
  { value: 'manage_condition',  label: 'Manage Condition',  emoji: '🏥', desc: 'Support a medical condition' },
  { value: 'hormonal_balance',  label: 'Hormonal Balance',  emoji: '⚗️', desc: 'Balance hormones naturally' },
  { value: 'improve_digestion', label: 'Improve Digestion', emoji: '🌿', desc: 'Improve gut health' },
  { value: 'general_fitness',   label: 'General Fitness',   emoji: '🎯', desc: 'Overall fitness' },
  { value: 'other',             label: 'Other',             emoji: '✏️', desc: 'Type a custom goal' },
]

const ACTIVITY_OPTIONS = [
  { value: 'sedentary',         label: 'Sedentary',       emoji: '🛋️', sub: 'Little / no exercise' },
  { value: 'lightly_active',    label: 'Lightly Active',  emoji: '🚶', sub: '1–3 days/week' },
  { value: 'moderately_active', label: 'Moderate',        emoji: '🏃', sub: '3–5 days/week' },
  { value: 'very_active',       label: 'Very Active',     emoji: '💪', sub: '6–7 days/week' },
  { value: 'super_active',      label: 'Super Active',    emoji: '🏆', sub: 'Athlete level' },
]

const WORK_OPTIONS = [
  { value: 'desk_job',     label: 'Desk Job',      emoji: '💻' },
  { value: 'standing_job', label: 'Standing Job',  emoji: '🧍' },
  { value: 'physical_job', label: 'Physical Job',  emoji: '⚒️' },
]

const WORKOUT_OPTIONS = [
  { value: 'gym',     label: 'Gym / Weights',  emoji: '🏋️' },
  { value: 'yoga',    label: 'Yoga / Pilates', emoji: '🧘' },
  { value: 'running', label: 'Running',        emoji: '🏃' },
  { value: 'sports',  label: 'Sports',         emoji: '⚽' },
  { value: 'mixed',   label: 'Mixed',          emoji: '🔄' },
  { value: 'none',    label: 'No Exercise',    emoji: '😴' },
]

const DIET_OPTIONS = [
  { value: 'vegetarian',     label: 'Vegetarian',     emoji: '🌿', desc: 'Pure plant-based' },
  { value: 'non_vegetarian', label: 'Non-Veg',        emoji: '🍗', desc: 'Includes meat & fish' },
  { value: 'eggetarian',     label: 'Eggetarian',     emoji: '🥚', desc: 'Veg + eggs' },
  { value: 'vegan',          label: 'Vegan',          emoji: '🌱', desc: 'No animal products' },
]

const CUISINE_OPTIONS = [
  { value: 'north_indian',   label: 'North Indian',   emoji: '🫓' },
  { value: 'south_indian',   label: 'South Indian',   emoji: '🌶️' },
  { value: 'bengali',        label: 'Bengali',        emoji: '🐟' },
  { value: 'gujarati',       label: 'Gujarati',       emoji: '🥜' },
  { value: 'punjabi',        label: 'Punjabi',        emoji: '🧈' },
  { value: 'maharashtrian',  label: 'Maharashtrian',  emoji: '🥘' },
  { value: 'rajasthani',     label: 'Rajasthani',     emoji: '🏜️' },
  { value: 'kerala',         label: 'Kerala',         emoji: '🥥' },
  { value: 'hyderabadi',     label: 'Hyderabadi',     emoji: '🍛' },
  { value: 'odia',           label: 'Odia',           emoji: '🍚' },
  { value: 'bihari',         label: 'Bihari',         emoji: '🌾' },
  { value: 'kashmiri',       label: 'Kashmiri',       emoji: '🏔️' },
  { value: 'continental',    label: 'Continental',    emoji: '🥗' },
  { value: 'no_preference',  label: 'No Preference',  emoji: '✌️' },
]

const ALLERGY_OPTIONS = [
  { value: 'none',    label: 'None',    emoji: '✅' },
  { value: 'gluten',  label: 'Gluten',  emoji: '🌾' },
  { value: 'dairy',   label: 'Dairy',   emoji: '🥛' },
  { value: 'nuts',    label: 'Nuts',    emoji: '🥜' },
  { value: 'soy',     label: 'Soy',     emoji: '🫘' },
  { value: 'eggs',    label: 'Eggs',    emoji: '🥚' },
  { value: 'shellfish', label: 'Shellfish', emoji: '🦐' },
]

const MEDICAL_OPTIONS = [
  { value: 'diabetes',          label: 'Diabetes',         emoji: '💉' },
  { value: 'hypertension',      label: 'Hypertension',     emoji: '❤️' },
  { value: 'thyroid',           label: 'Thyroid',          emoji: '🦋' },
  { value: 'pcod_pcos',         label: 'PCOD/PCOS',        emoji: '♀️' },
  { value: 'high_cholesterol',  label: 'High Cholesterol', emoji: '🫀' },
  { value: 'heart_disease',     label: 'Heart Disease',    emoji: '💔' },
  { value: 'kidney_disease',    label: 'Kidney Disease',   emoji: '🫘' },
  { value: 'ibs',               label: 'IBS/IBD',          emoji: '🌿' },
  { value: 'arthritis',         label: 'Arthritis',        emoji: '🦴' },
  { value: 'none',              label: 'None',             emoji: '✅' },
]

const MEDICATION_OPTIONS = [
  { value: 'yes_regularly',    label: 'Yes, Regularly',   emoji: '💊', desc: 'Takes medicines daily' },
  { value: 'yes_occasionally', label: 'Yes, Occasionally',emoji: '🩺', desc: 'Sometimes as needed' },
  { value: 'no',               label: 'No',               emoji: '✅', desc: 'Not on medication' },
]

const DIGESTION_OPTIONS = [
  { value: 'excellent', label: 'Excellent', emoji: '😄', color: '#22c55e' },
  { value: 'good',      label: 'Good',      emoji: '🙂', color: '#84cc16' },
  { value: 'average',   label: 'Average',   emoji: '😐', color: '#f59e0b' },
  { value: 'poor',      label: 'Poor',      emoji: '😟', color: '#ef4444' },
]

const SMOKE_OPTIONS = [
  { value: 'neither',             label: 'Neither',             emoji: '🌿' },
  { value: 'smoke',               label: 'Smokes',              emoji: '🚬' },
  { value: 'occasionally_smoke',  label: 'Occasionally Smokes', emoji: '💨' },
  { value: 'alcohol',             label: 'Drinks Alcohol',      emoji: '🍺' },
  { value: 'occasionally_drinks', label: 'Occasionally Drinks', emoji: '🥂' },
  { value: 'both',                label: 'Both',                emoji: '⚠️' },
]

type Props = {
  form: DietPlanFormValues
  onChange: <K extends keyof DietPlanFormValues>(key: K, val: DietPlanFormValues[K]) => void
  disabled?: boolean
  afterLifestyle?: React.ReactNode
  afterFoodPrefs?: React.ReactNode
}

function toggleArr(arr: string[], val: string, solo?: boolean): string[] {
  if (solo) return arr.includes(val) ? [] : [val]
  if (val === 'none') return arr.includes('none') ? [] : ['none']
  const without = arr.filter(x => x !== 'none' && x !== val)
  return arr.includes(val) ? without : [...without, val]
}

export default function DietPlanFormFields({ form, onChange, disabled, afterLifestyle, afterFoodPrefs }: Props) {
  // Plan is fixed at 1 Month (value 2) for now
  useEffect(() => {
    if (form.plan_type !== '2') onChange('plan_type', '2')
  }, [])

  return (
    <>
      {/* ─── Basic Information ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <span>📋</span> Basic Information
        </h3>

        {/* DOB + Age row */}
        <div className="cdp-row">
          <div className="cdp-field">
            <label className="cdp-label">Date of Birth</label>
            <DatePicker
              value={form.dob}
              min="1900-01-01"
              max={TODAY}
              onChange={val => {
                onChange('dob', val)
                onChange('age', calcAge(val))
              }}
            />
          </div>
          <div className="cdp-field">
            <div className="dpf-label-row">
              <label className="cdp-label">
                Age
                {form.dob && <span className="dpf-age-badge">Auto-filled from DOB</span>}
              </label>
            </div>
            <input
              type="number" min="1" max="120"
              className="cdp-input"
              placeholder="e.g. 28"
              value={form.age}
              readOnly={!!form.dob}
              onChange={e => { if (!form.dob) onChange('age', e.target.value) }}
              disabled={disabled}
              style={form.dob ? { background: '#f0fdf4', color: '#15803d', fontWeight: 600 } : {}}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="cdp-field">
          <label className="cdp-label">Gender <span className="cdp-req">*</span></label>
          <div className="dpf-pill-row">
            {[
              { value: 'male',   label: 'Male',   emoji: '👨' },
              { value: 'female', label: 'Female', emoji: '👩' },
              { value: 'other',  label: 'Other',  emoji: '🧑' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say', emoji: '🤐' },
            ].map(o => (
              <button
                key={o.value}
                type="button"
                disabled={disabled}
                className={`dpf-pill${form.gender === o.value ? ' active' : ''}`}
                onClick={() => onChange('gender', form.gender === o.value ? '' : o.value)}
              >
                <span>{o.emoji}</span> {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Height + Weight */}
        <div className="cdp-row" style={{ marginTop: 14 }}>
          <div className="cdp-field">
            <div className="dpf-label-row">
              <label className="cdp-label">Height <span className="cdp-req">*</span></label>
              <div className="dpf-unit-tog">
                {(['cm', 'ft_in'] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    disabled={disabled}
                    className={form.height_unit === u ? 'active' : ''}
                    onClick={() => { if (u !== form.height_unit) { onChange('height_unit', u); onChange('height', '') } }}
                  >{u === 'ft_in' ? 'ft/in' : 'cm'}</button>
                ))}
              </div>
            </div>
            <input
              className="cdp-input"
              type="number" step="0.1"
              placeholder={form.height_unit === 'cm' ? '50–300 cm' : '1–9 ft'}
              value={form.height}
              onChange={e => onChange('height', e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="cdp-field">
            <div className="dpf-label-row">
              <label className="cdp-label">Weight <span className="cdp-req">*</span></label>
              <div className="dpf-unit-tog">
                {(['kg', 'lbs'] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    disabled={disabled}
                    className={form.weight_unit === u ? 'active' : ''}
                    onClick={() => { if (u !== form.weight_unit) { onChange('weight_unit', u); onChange('weight', '') } }}
                  >{u}</button>
                ))}
              </div>
            </div>
            <input
              type="number" step="0.1" min="1"
              className="cdp-input"
              placeholder={form.weight_unit === 'kg' ? '1–300 kg' : '1–660 lbs'}
              value={form.weight}
              onChange={e => onChange('weight', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        {/* City + State */}
        <div className="cdp-row" style={{ marginTop: 14 }}>
          <div className="cdp-field">
            <label className="cdp-label">City</label>
            <input
              className="cdp-input"
              type="text"
              placeholder="e.g. Mumbai"
              value={form.city}
              onChange={e => onChange('city', e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="cdp-field">
            <label className="cdp-label">State</label>
            <input
              className="cdp-input"
              type="text"
              placeholder="e.g. Maharashtra"
              value={form.state}
              onChange={e => onChange('state', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* ─── Fitness Goals ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <span>🎯</span> Fitness Goals <span className="cdp-req">*</span>
        </h3>
        <p className="cdp-section-sub">Select the primary goal for this client.</p>
        <div className="dpf-goals-grid">
          {GOALS_OPTIONS.map(g => {
            const active = form.goals.includes(g.value)
            return (
              <button
                key={g.value}
                type="button"
                disabled={disabled}
                className={`dpf-goal-card${active ? ' active' : ''}`}
                onClick={() => onChange('goals', active ? [] : [g.value])}
              >
                {active && <span className="dpf-goal-check">✓</span>}
                <span className="dpf-goal-icon">{g.emoji}</span>
                <span className="dpf-goal-name">{g.label}</span>
                <span className="dpf-goal-desc">{g.desc}</span>
              </button>
            )
          })}
        </div>
        {form.goals.includes('other') && (
          <input
            className="cdp-input"
            style={{ marginTop: 10 }}
            placeholder="Describe the custom goal…"
            value={form.goals_other}
            onChange={e => onChange('goals_other', e.target.value)}
            disabled={disabled}
          />
        )}
      </div>

      {/* ─── Lifestyle ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <span>🏃</span> Lifestyle
        </h3>

        <div className="cdp-field">
          <label className="cdp-label">Activity Level <span className="cdp-req">*</span></label>
          <p className="cdp-section-sub" style={{ marginTop: 0, marginBottom: 6 }}>How active is the client daily?</p>
          <div className="dpf-activity-grid">
            {ACTIVITY_OPTIONS.map(a => {
              const active = form.activity_level === a.value
              return (
                <button
                  key={a.value}
                  type="button"
                  disabled={disabled}
                  className={`dpf-activity-card${active ? ' active' : ''}`}
                  onClick={() => onChange('activity_level', active ? '' : a.value)}
                >
                  {active && <span className="dpf-ac-check">✓</span>}
                  <span className="dpf-ac-icon">{a.emoji}</span>
                  <span className="dpf-ac-label">{a.label}</span>
                  <span className="dpf-ac-sub">{a.sub}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="cdp-field" style={{ marginTop: 16 }}>
          <label className="cdp-label">Work Type <span className="cdp-req">*</span></label>
          <div className="dpf-pill-row">
            {WORK_OPTIONS.map(w => (
              <button
                key={w.value}
                type="button"
                disabled={disabled}
                className={`dpf-pill${form.work_type === w.value ? ' active' : ''}`}
                onClick={() => onChange('work_type', form.work_type === w.value ? '' : w.value)}
              >
                <span>{w.emoji}</span> {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cdp-field" style={{ marginTop: 16 }}>
          <label className="cdp-label">Workout Type <span className="cdp-req">*</span></label>
          <div className="dpf-workout-grid">
            {WORKOUT_OPTIONS.map(w => {
              const active = form.workout_type === w.value
              return (
                <button
                  key={w.value}
                  type="button"
                  disabled={disabled}
                  className={`dpf-workout-card${active ? ' active' : ''}`}
                  onClick={() => onChange('workout_type', active ? '' : w.value)}
                >
                  {active && <span className="dpf-wt-check">✓</span>}
                  <span className="dpf-wt-icon">{w.emoji}</span>
                  <span className="dpf-wt-label">{w.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {afterLifestyle}

      {/* ─── Food Preferences ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <span>🥗</span> Food Preferences
        </h3>

        <div className="cdp-field">
          <label className="cdp-label">Diet Type <span className="cdp-req">*</span></label>
          <div className="dpf-diet-grid">
            {DIET_OPTIONS.map(d => {
              const active = form.diet_type === d.value
              return (
                <button
                  key={d.value}
                  type="button"
                  disabled={disabled}
                  className={`dpf-diet-card${active ? ' active' : ''}`}
                  onClick={() => onChange('diet_type', active ? '' : d.value)}
                >
                  {active && <span className="dpf-diet-check">✓</span>}
                  <span className="dpf-diet-icon">{d.emoji}</span>
                  <span className="dpf-diet-name">{d.label}</span>
                  <span className="dpf-diet-desc">{d.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="cdp-field" style={{ marginTop: 16 }}>
          <label className="cdp-label">Cuisine Preference</label>
          <div className="dpf-chip-group">
            {CUISINE_OPTIONS.map(c => {
              const active = form.cuisine_preference.includes(c.value)
              return (
                <button
                  key={c.value}
                  type="button"
                  disabled={disabled}
                  className={`dpf-chip${active ? ' active' : ''}`}
                  onClick={() => onChange('cuisine_preference', toggleArr(form.cuisine_preference, c.value))}
                >
                  <span>{c.emoji}</span> {c.label}
                  {active && <span className="dpf-chip-x">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="cdp-field" style={{ marginTop: 16 }}>
          <label className="cdp-label">Food Allergies</label>
          <div className="dpf-chip-group">
            {ALLERGY_OPTIONS.map(a => {
              const active = form.food_allergies.includes(a.value)
              return (
                <button
                  key={a.value}
                  type="button"
                  disabled={disabled}
                  className={`dpf-chip${active ? ' active' : ''}`}
                  onClick={() => onChange('food_allergies', toggleArr(form.food_allergies, a.value))}
                >
                  <span>{a.emoji}</span> {a.label}
                  {active && <span className="dpf-chip-x">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="cdp-row" style={{ marginTop: 16 }}>
          <div className="cdp-field">
            <label className="cdp-label">🚫 Foods to Avoid</label>
            <input
              className="cdp-input"
              placeholder="e.g. bitter gourd, cabbage"
              value={form.foods_dislike}
              onChange={e => onChange('foods_dislike', e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="cdp-field">
            <label className="cdp-label">❤️ Favourite Foods</label>
            <input
              className="cdp-input"
              placeholder="e.g. dal, rice, idli"
              value={form.favorite_foods}
              onChange={e => onChange('favorite_foods', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {afterFoodPrefs}

      {/* ─── Health History ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <span>🏥</span> Health History
        </h3>

        <div className="cdp-field">
          <label className="cdp-label">Medical Conditions <span className="cdp-req">*</span></label>
          <p className="cdp-section-sub" style={{ marginTop: 0, marginBottom: 6 }}>Select at least one (choose "None" if no conditions)</p>
          <div className="dpf-chip-group">
            {MEDICAL_OPTIONS.map(m => {
              const active = form.medical_conditions.includes(m.value)
              return (
                <button
                  key={m.value}
                  type="button"
                  disabled={disabled}
                  className={`dpf-chip${active ? ' active' : ''}`}
                  onClick={() => {
                    if (m.value === 'none') {
                      onChange('medical_conditions', active ? [] : ['none'])
                    } else {
                      const without = form.medical_conditions.filter(x => x !== 'none' && x !== m.value)
                      onChange('medical_conditions', active ? without : [...without, m.value])
                    }
                  }}
                >
                  <span>{m.emoji}</span> {m.label}
                  {active && <span className="dpf-chip-x">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="cdp-field" style={{ marginTop: 16 }}>
          <label className="cdp-label">Other Condition</label>
          <input
            className="cdp-input"
            placeholder="Describe any other condition"
            value={form.other_condition}
            onChange={e => onChange('other_condition', e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="cdp-field" style={{ marginTop: 16 }}>
          <label className="cdp-label">On Medication? <span className="cdp-req">*</span></label>
          <div className="dpf-answer-row">
            {MEDICATION_OPTIONS.map(m => {
              const active = form.on_medication === m.value
              return (
                <button
                  key={m.value}
                  type="button"
                  disabled={disabled}
                  className={`dpf-answer-card${active ? ' active' : ''}`}
                  onClick={() => onChange('on_medication', active ? '' : m.value)}
                >
                  {active && <span className="dpf-answer-check">✓</span>}
                  <span className="dpf-answer-icon">{m.emoji}</span>
                  <span className="dpf-answer-label">{m.label}</span>
                  <span className="dpf-answer-desc">{m.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        {(form.on_medication === 'yes_regularly' || form.on_medication === 'yes_occasionally') && (
          <div className="cdp-field" style={{ marginTop: 12 }}>
            <label className="cdp-label">List Medications</label>
            <input
              className="cdp-input"
              placeholder="e.g. Metformin, Thyroxine, Vitamin D"
              value={form.medications}
              onChange={e => onChange('medications', e.target.value)}
              disabled={disabled}
            />
          </div>
        )}

        <div className="cdp-row" style={{ marginTop: 16 }}>
          <div className="cdp-field">
            <label className="cdp-label">Digestive Health <span className="cdp-req">*</span></label>
            <div className="dpf-digest-row">
              {DIGESTION_OPTIONS.map(o => {
                const active = form.digestive_health === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    disabled={disabled}
                    className={`dpf-digest-card${active ? ' active' : ''}`}
                    style={active ? { borderColor: o.color, background: `${o.color}18` } : {}}
                    onClick={() => onChange('digestive_health', active ? '' : o.value)}
                  >
                    <span className="dpf-digest-icon">{o.emoji}</span>
                    <span className="dpf-digest-label">{o.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="cdp-field">
            <label className="cdp-label">Smoke / Alcohol <span className="cdp-req">*</span></label>
            <div className="dpf-chip-group" style={{ marginTop: 8 }}>
              {SMOKE_OPTIONS.map(o => {
                const active = form.smoke_alcohol === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    disabled={disabled}
                    className={`dpf-chip${active ? ' active' : ''}`}
                    onClick={() => onChange('smoke_alcohol', active ? '' : o.value)}
                  >
                    <span>{o.emoji}</span> {o.label}
                    {active && <span className="dpf-chip-x">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Plan Details ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <span>📅</span> Plan Details
        </h3>
        <div className="dpf-plan-badge-wrap">
          <div className="dpf-plan-badge">
            <span className="dpf-plan-badge-icon">👑</span>
            <div className="dpf-plan-badge-text">
              <span className="dpf-plan-badge-title">1 Month Plan</span>
              <span className="dpf-plan-badge-sub">4 weeks · Personalised daily meals</span>
            </div>
            <span className="dpf-plan-badge-tag">Current Plan</span>
          </div>
          <p className="dpf-plan-note">
            <i className="fa-solid fa-circle-info" /> Diet plans are currently generated for <strong>1 month (4 weeks)</strong>. More durations coming soon.
          </p>
        </div>
        <div className="cdp-field" style={{ marginTop: 16 }}>
          <label className="cdp-label">Health Notes</label>
          <textarea
            className="cdp-textarea"
            rows={4}
            placeholder="Additional notes about the client's health, preferences, or special requirements…"
            value={form.health_notes}
            onChange={e => onChange('health_notes', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </>
  )
}
