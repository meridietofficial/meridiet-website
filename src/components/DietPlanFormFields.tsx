export type DietPlanFormValues = {
  age: string
  gender: string
  height: string
  height_unit: 'cm' | 'ft_in'
  weight: string
  weight_unit: 'kg' | 'lbs'
  goals: string[]
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
}

export const EMPTY_FORM: DietPlanFormValues = {
  age: '', gender: '', height: '', height_unit: 'cm', weight: '', weight_unit: 'kg',
  goals: [], activity_level: '', work_type: '', workout_type: '', diet_type: '',
  cuisine_preference: [], food_allergies: [], foods_dislike: '', favorite_foods: '',
  medical_conditions: [], other_condition: '', on_medication: '', medications: '',
  digestive_health: '', smoke_alcohol: '', health_notes: '', plan_type: '',
}

const GOALS_OPTIONS = [
  { value: 'weight_loss',     label: 'Weight Loss' },
  { value: 'muscle_gain',     label: 'Muscle Gain' },
  { value: 'maintenance',     label: 'Maintenance' },
  { value: 'improve_energy',  label: 'Improve Energy' },
  { value: 'manage_condition', label: 'Manage Condition' },
  { value: 'hormonal_balance', label: 'Hormonal Balance' },
  { value: 'improve_digestion', label: 'Improve Digestion' },
  { value: 'general_fitness', label: 'General Fitness' },
]

const CUISINE_OPTIONS = [
  { value: 'north_indian',   label: 'North Indian' },
  { value: 'south_indian',   label: 'South Indian' },
  { value: 'east_indian',    label: 'East Indian' },
  { value: 'chinese',        label: 'Chinese' },
  { value: 'continental',    label: 'Continental' },
  { value: 'mediterranean',  label: 'Mediterranean' },
  { value: 'mughlai',        label: 'Mughlai' },
  { value: 'thai',           label: 'Thai' },
]

const ALLERGY_OPTIONS = [
  { value: 'dairy',      label: 'Dairy' },
  { value: 'gluten',     label: 'Gluten' },
  { value: 'nuts',       label: 'Nuts' },
  { value: 'eggs',       label: 'Eggs' },
  { value: 'shellfish',  label: 'Shellfish' },
  { value: 'soy',        label: 'Soy' },
  { value: 'none',       label: 'None' },
]

const MEDICAL_OPTIONS = [
  { value: 'diabetes',        label: 'Diabetes' },
  { value: 'hypertension',    label: 'Hypertension' },
  { value: 'thyroid',         label: 'Thyroid' },
  { value: 'pcod_pcos',       label: 'PCOD/PCOS' },
  { value: 'high_cholesterol', label: 'High Cholesterol' },
  { value: 'heart_disease',   label: 'Heart Disease' },
  { value: 'kidney_disease',  label: 'Kidney Disease' },
  { value: 'ibs',             label: 'IBS/IBD' },
  { value: 'arthritis',       label: 'Arthritis' },
  { value: 'none',            label: 'None' },
]

type Props = {
  form: DietPlanFormValues
  onChange: <K extends keyof DietPlanFormValues>(key: K, val: DietPlanFormValues[K]) => void
  disabled?: boolean
}

function MultiChip({
  options, value, onChange, disabled,
}: {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (v: string[]) => void
  disabled?: boolean
}) {
  return (
    <div className="cdp-chips">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          className={`cdp-chip${value.includes(opt.value) ? ' cdp-chip--active' : ''}`}
          onClick={() => onChange(
            value.includes(opt.value)
              ? value.filter(v => v !== opt.value)
              : [...value, opt.value]
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function DietPlanFormFields({ form, onChange, disabled }: Props) {
  return (
    <>
      {/* ─── Basic Information ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <i className="fa-solid fa-user" /> Basic Information
        </h3>
        <div className="cdp-row">
          <div className="cdp-field">
            <label className="cdp-label">Age</label>
            <input
              type="number" min="1" max="120"
              className="cdp-input"
              placeholder="e.g. 28"
              value={form.age}
              onChange={e => onChange('age', e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="cdp-field">
            <label className="cdp-label">Gender</label>
            <select
              className="cdp-select"
              value={form.gender}
              onChange={e => onChange('gender', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="cdp-row">
          <div className="cdp-field">
            <label className="cdp-label">Height</label>
            <div className="cdp-input-unit">
              <input
                className="cdp-input"
                placeholder={form.height_unit === 'cm' ? 'e.g. 165' : "e.g. 5'6\""}
                value={form.height}
                onChange={e => onChange('height', e.target.value)}
                disabled={disabled}
              />
              <select
                className="cdp-unit-sel"
                value={form.height_unit}
                onChange={e => onChange('height_unit', e.target.value as 'cm' | 'ft_in')}
                disabled={disabled}
              >
                <option value="cm">cm</option>
                <option value="ft_in">ft</option>
              </select>
            </div>
          </div>
          <div className="cdp-field">
            <label className="cdp-label">Weight</label>
            <div className="cdp-input-unit">
              <input
                type="number" min="1"
                className="cdp-input"
                placeholder="e.g. 65"
                value={form.weight}
                onChange={e => onChange('weight', e.target.value)}
                disabled={disabled}
              />
              <select
                className="cdp-unit-sel"
                value={form.weight_unit}
                onChange={e => onChange('weight_unit', e.target.value as 'kg' | 'lbs')}
                disabled={disabled}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Fitness Goals ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <i className="fa-solid fa-bullseye" /> Fitness Goals
        </h3>
        <div className="cdp-field">
          <label className="cdp-label">Select all that apply</label>
          <MultiChip
            options={GOALS_OPTIONS}
            value={form.goals}
            onChange={v => onChange('goals', v)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* ─── Lifestyle ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <i className="fa-solid fa-person-running" /> Lifestyle
        </h3>
        <div className="cdp-row cdp-row--3">
          <div className="cdp-field">
            <label className="cdp-label">Activity Level</label>
            <select
              className="cdp-select"
              value={form.activity_level}
              onChange={e => onChange('activity_level', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select</option>
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly Active</option>
              <option value="moderately_active">Moderately Active</option>
              <option value="very_active">Very Active</option>
              <option value="super_active">Super Active (Athlete)</option>
            </select>
          </div>
          <div className="cdp-field">
            <label className="cdp-label">Work Type</label>
            <select
              className="cdp-select"
              value={form.work_type}
              onChange={e => onChange('work_type', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select</option>
              <option value="desk_job">Desk Job</option>
              <option value="standing_job">Standing Job</option>
              <option value="physical_job">Physical Job</option>
            </select>
          </div>
          <div className="cdp-field">
            <label className="cdp-label">Workout Type</label>
            <select
              className="cdp-select"
              value={form.workout_type}
              onChange={e => onChange('workout_type', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select</option>
              <option value="none">No Exercise</option>
              <option value="gym">Gym / Weights</option>
              <option value="yoga">Yoga / Pilates</option>
              <option value="running">Running</option>
              <option value="sports">Sports</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Food Preferences ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <i className="fa-solid fa-bowl-food" /> Food Preferences
        </h3>
        <div className="cdp-row">
          <div className="cdp-field">
            <label className="cdp-label">Diet Type</label>
            <select
              className="cdp-select"
              value={form.diet_type}
              onChange={e => onChange('diet_type', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="non_vegetarian">Non-Vegetarian</option>
              <option value="eggetarian">Eggetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>
        </div>
        <div className="cdp-field">
          <label className="cdp-label">Cuisine Preference</label>
          <MultiChip
            options={CUISINE_OPTIONS}
            value={form.cuisine_preference}
            onChange={v => onChange('cuisine_preference', v)}
            disabled={disabled}
          />
        </div>
        <div className="cdp-field" style={{ marginTop: 16 }}>
          <label className="cdp-label">Food Allergies</label>
          <MultiChip
            options={ALLERGY_OPTIONS}
            value={form.food_allergies}
            onChange={v => onChange('food_allergies', v)}
            disabled={disabled}
          />
        </div>
        <div className="cdp-row" style={{ marginTop: 16 }}>
          <div className="cdp-field">
            <label className="cdp-label">Foods to Avoid</label>
            <input
              className="cdp-input"
              placeholder="e.g. bitter gourd, cabbage"
              value={form.foods_dislike}
              onChange={e => onChange('foods_dislike', e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="cdp-field">
            <label className="cdp-label">Favourite Foods</label>
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

      {/* ─── Health History ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <i className="fa-solid fa-heart-pulse" /> Health History
        </h3>
        <div className="cdp-field">
          <label className="cdp-label">Medical Conditions</label>
          <MultiChip
            options={MEDICAL_OPTIONS}
            value={form.medical_conditions}
            onChange={v => onChange('medical_conditions', v)}
            disabled={disabled}
          />
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
        <div className="cdp-row" style={{ marginTop: 16 }}>
          <div className="cdp-field">
            <label className="cdp-label">On Medication?</label>
            <select
              className="cdp-select"
              value={form.on_medication}
              onChange={e => onChange('on_medication', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select</option>
              <option value="yes_regularly">Yes, Regularly</option>
              <option value="yes_occasionally">Yes, Occasionally</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="cdp-field">
            <label className="cdp-label">Medications (if any)</label>
            <input
              className="cdp-input"
              placeholder="List medications"
              value={form.medications}
              onChange={e => onChange('medications', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="cdp-row" style={{ marginTop: 16 }}>
          <div className="cdp-field">
            <label className="cdp-label">Digestive Health</label>
            <select
              className="cdp-select"
              value={form.digestive_health}
              onChange={e => onChange('digestive_health', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="average">Average</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          <div className="cdp-field">
            <label className="cdp-label">Smoke / Alcohol</label>
            <select
              className="cdp-select"
              value={form.smoke_alcohol}
              onChange={e => onChange('smoke_alcohol', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select</option>
              <option value="neither">Neither</option>
              <option value="smoke">Smoke</option>
              <option value="alcohol">Drink Alcohol</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Plan Details ─── */}
      <div className="cdp-section">
        <h3 className="cdp-section-title">
          <i className="fa-solid fa-calendar-days" /> Plan Details
        </h3>
        <div className="cdp-row">
          <div className="cdp-field cdp-field--half">
            <label className="cdp-label">Plan Duration</label>
            <select
              className="cdp-select"
              value={form.plan_type}
              onChange={e => onChange('plan_type', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select</option>
              <option value="1">2 Weeks</option>
              <option value="2">1 Month</option>
              <option value="3">3 Months</option>
            </select>
          </div>
        </div>
        <div className="cdp-field" style={{ marginTop: 16 }}>
          <label className="cdp-label">Health Notes</label>
          <textarea
            className="cdp-textarea"
            rows={4}
            placeholder="Any additional notes about the client's health, preferences, or special requirements…"
            value={form.health_notes}
            onChange={e => onChange('health_notes', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </>
  )
}
