import { useEffect, useRef, useState } from 'react'
import { IN_STATES, getCitiesOfState } from '../data/indiaCities'
import DatePicker from './DatePicker'
import SearchableSelect from './SearchableSelect'
import dietFormApi from '../api/dietForm'
import { ApiError } from '../api/client'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  { label: 'Basic Details', sub: 'Tell us about yourself' },
  { label: 'Lifestyle', sub: 'Your daily habits' },
  { label: 'Food Preferences', sub: 'What do you eat & prefer?' },
  { label: 'Health & Medical', sub: 'Your health matters' },
  { label: 'Contact Details', sub: "Let's stay in touch" },
]

const INIT: FormData = {
  fullName: '',
  age: '',
  gender: '',
  dob: '',
  heightUnit: 'cm',
  height: '',
  weightUnit: 'kg',
  weight: '',
  bodyType: '',
  basicNotes: '',
  goals: [],
  activityLevel: '',
  sleepDuration: '',
  waterIntake: '',
  workType: '',
  workoutFrequency: '',
  workoutType: '',
  dailySteps: '',
  dietType: '',
  cuisinePreference: [],
  preferredMeals: [],
  foodAllergies: '',
  foodsDislike: '',
  favoriteFoods: '',
  breakfastTime: '8:00 AM',
  midMorningTime: '11:00 AM',
  lunchTime: '1:30 PM',
  eveningSnackTime: '5:00 PM',
  dinnerTime: '8:30 PM',
  medicalConditions: [],
  otherCondition: '',
  onMedication: '',
  medications: '',
  foodIntolerances: [],
  otherIntolerance: '',
  digestiveHealth: '',
  smokeAlcohol: '',
  healthNotes: '',
  budget: '',
  mealPreference: [],
  prepTime: '',
  groceryShopping: '',
  cookingSupport: '',
  otherPreferences: '',
  contactName: '',
  whatsapp: '',
  email: '',
  deliveryMethod: ['whatsapp'],
  city: '',
  state: '',
  stateCode: '',
  finalNotes: '',
  planType: '',
}

type FormData = {
  fullName: string
  age: string
  gender: string
  dob: string
  heightUnit: 'cm' | 'ft/in'
  height: string
  weightUnit: 'kg' | 'lbs'
  weight: string
  bodyType: string
  basicNotes: string
  goals: string[]
  activityLevel: string
  sleepDuration: string
  waterIntake: string
  workType: string
  workoutFrequency: string
  workoutType: string
  dailySteps: string
  dietType: string
  cuisinePreference: string[]
  preferredMeals: string[]
  foodAllergies: string
  foodsDislike: string
  favoriteFoods: string
  breakfastTime: string
  midMorningTime: string
  lunchTime: string
  eveningSnackTime: string
  dinnerTime: string
  medicalConditions: string[]
  otherCondition: string
  onMedication: string
  medications: string
  foodIntolerances: string[]
  otherIntolerance: string
  digestiveHealth: string
  smokeAlcohol: string
  healthNotes: string
  budget: string
  mealPreference: string[]
  prepTime: string
  groceryShopping: string
  cookingSupport: string
  otherPreferences: string
  contactName: string
  whatsapp: string
  email: string
  deliveryMethod: string[]
  city: string
  state: string
  stateCode: string
  finalNotes: string
  planType: string
}

type SetFn = (k: keyof FormData, v: FormData[keyof FormData]) => void
type ToglFn = (k: keyof FormData, v: string) => void
type Errors = Partial<Record<keyof FormData, string>>

const FieldErr = ({ msg }: { msg?: string }) =>
  msg ? <p className="df-err-msg">⚠ {msg}</p> : null

const TIMES = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM',
]

/* ─── Step 1 ─────────────────────────────────────────────── */
const TODAY = new Date().toISOString().split('T')[0]

const GOALS = [
  { k: 'Weight Loss', e: '⚖️', d: 'Lose weight & feel lighter' },
  { k: 'Fat Loss', e: '🏋️', d: 'Reduce body fat & improve shape' },
  { k: 'Muscle Gain', e: '💪', d: 'Build muscle & get stronger' },
  { k: 'PCOS Support', e: '♀️', d: 'Manage PCOS symptoms naturally' },
  { k: 'Healthy Lifestyle', e: '🌱', d: 'Maintain overall health & wellness' },
]

function calcAge(dob: string): string {
  if (!dob) return ''
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age >= 0 && age <= 120 ? String(age) : ''
}

const Step1 = ({ d, set, tog, err }: { d: FormData; set: SetFn; tog: ToglFn; err: Errors }) => {
  return (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">📋</div>
      <div className="df-hd-text">
        <h2>Basic Details &amp; Health Goals</h2>
        <p>Tell us about yourself and what you want to achieve.</p>
      </div>
      <span className="df-conf-badge">🔒 100% Confidential</span>
    </div>

    <div className="df-grid-2">
      <div className="df-field">
        <label className="df-label">
          Full Name <span className="df-req">*</span>
        </label>
        <div className={`df-input-wrap${err.fullName ? ' df-input-wrap--err' : ''}`}>
          <span className="df-icon">👤</span>
          <input
            className="df-input"
            type="text"
            placeholder="Enter your full name"
            maxLength={50}
            value={d.fullName}
            onChange={(e) => set('fullName', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
          />
        </div>
        <FieldErr msg={err.fullName} />
      </div>

      <div className="df-field">
        <label className="df-label">Date of Birth <span className="df-req">*</span></label>
        <DatePicker
          value={d.dob}
          min="1900-01-01"
          max={TODAY}
          hasError={!!err.dob}
          onChange={(val) => {
            set('dob', val)
            set('age', calcAge(val))
          }}
        />
        <FieldErr msg={err.dob} />
      </div>
    </div>

    <div className="df-grid-2">
      <div className="df-field">
        <label className="df-label">
          Age {d.dob && <span className="df-age-auto">Auto-filled</span>}
        </label>
        <div className={`df-input-wrap${err.age ? ' df-input-wrap--err' : ''}${d.dob ? ' df-input-wrap--auto' : ''}`}>
          <span className="df-icon">🎂</span>
          <input
            className="df-input"
            type="number"
            placeholder="Your age"
            value={d.age}
            readOnly={!!d.dob}
            onChange={(e) => { if (!d.dob) set('age', e.target.value) }}
          />
        </div>
        <FieldErr msg={err.age} />
      </div>
      <div className="df-field">
        <label className="df-label">
          Gender <span className="df-req">*</span>
        </label>
        <select className={`df-select${err.gender ? ' df-select--err' : ''}`} value={d.gender} onChange={(e) => set('gender', e.target.value)}>
          <option value="">Select gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
          <option>Prefer not to say</option>
        </select>
        <FieldErr msg={err.gender} />
      </div>
    </div>

    <div className="df-grid-2">
      <div className="df-field">
        <div className="df-label-row">
          <label className="df-label">
            Height <span className="df-req">*</span>
          </label>
          <div className="df-unit-tog">
            {(['cm', 'ft/in'] as const).map((u) => (
              <button key={u} className={d.heightUnit === u ? 'act' : ''} onClick={() => set('heightUnit', u)}>
                {u}
              </button>
            ))}
          </div>
        </div>
        <input
          className={`df-input${err.height ? ' df-input--err' : ''}`}
          type="number"
          min={d.heightUnit === 'cm' ? 50 : 1}
          max={d.heightUnit === 'cm' ? 300 : 9}
          step="0.1"
          placeholder={d.heightUnit === 'cm' ? '50 – 300 cm' : '1 – 9 ft'}
          value={d.height}
          onChange={(e) => set('height', e.target.value)}
        />
        <FieldErr msg={err.height} />
      </div>
      <div className="df-field">
        <div className="df-label-row">
          <label className="df-label">
            Weight <span className="df-req">*</span>
          </label>
          <div className="df-unit-tog">
            {(['kg', 'lbs'] as const).map((u) => (
              <button key={u} className={d.weightUnit === u ? 'act' : ''} onClick={() => set('weightUnit', u)}>
                {u}
              </button>
            ))}
          </div>
        </div>
        <input
          className={`df-input${err.weight ? ' df-input--err' : ''}`}
          type="number"
          min={1}
          max={d.weightUnit === 'kg' ? 300 : 660}
          step="0.1"
          placeholder={d.weightUnit === 'kg' ? '1 – 300 kg' : '1 – 660 lbs'}
          value={d.weight}
          onChange={(e) => set('weight', e.target.value)}
        />
        <FieldErr msg={err.weight} />
      </div>
    </div>

    {/* ── Goals section ── */}
    <div className="df-card-field">
      <label className="df-label">Your Health Goal <span className="df-req">*</span></label>
      <p className="df-field-sub">Choose the one that best describes what you want to achieve.</p>
      <div className={`df-goals-grid${err.goals ? ' df-group--err' : ''}`}>
        {GOALS.map((g) => (
          <button
            key={g.k}
            className={`df-goal-card ${d.goals.includes(g.k) ? 'sel' : ''}`}
            onClick={() => set('goals', [g.k])}
          >
            {d.goals.includes(g.k) && <span className="df-goal-chk">✓</span>}
            <span className="df-goal-icon">{g.e}</span>
            <strong>{g.k}</strong>
            <span className="df-goal-desc">{g.d}</span>
          </button>
        ))}
      </div>
      <FieldErr msg={err.goals} />
    </div>
  </div>
  )
}

/* ─── Step 2 (kept for reference, not rendered) ─────────── */
const Step2 = ({ d, tog, err }: { d: FormData; tog: ToglFn; err: Errors }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">🎯</div>
      <div className="df-hd-text">
        <h2>What are your health &amp; fitness goals?</h2>
        <p>Select all that apply. This helps us create the perfect plan for you.</p>
      </div>
    </div>
    <div className={`df-goals-grid${err.goals ? ' df-group--err' : ''}`}>
      {GOALS.map((g) => (
        <button
          key={g.k}
          className={`df-goal-card ${d.goals.includes(g.k) ? 'sel' : ''}`}
          onClick={() => tog('goals', g.k)}
        >
          {d.goals.includes(g.k) && <span className="df-goal-chk">✓</span>}
          <span className="df-goal-icon">{g.e}</span>
          <strong>{g.k}</strong>
          <span className="df-goal-desc">{g.d}</span>
        </button>
      ))}
    </div>
    <FieldErr msg={err.goals} />
    <div className="df-tip-box">
      💡 <strong>Not sure?</strong> You can select multiple goals. Our experts will customize your plan accordingly.
    </div>
  </div>
)

/* ─── Step 3 ─────────────────────────────────────────────── */
const ACTIVITY = [
  { v: 'Sedentary (little or no exercise)', icon: '🛋️', short: 'Sedentary',    sub: 'Little / no exercise' },
  { v: 'Lightly Active (1–3 days/week)',    icon: '🚶', short: 'Lightly Active', sub: '1–3 days/week' },
  { v: 'Moderately Active',                icon: '🏃', short: 'Moderate',       sub: '3–5 days/week' },
  { v: 'Very Active (6–7 days/week)',       icon: '💪', short: 'Very Active',    sub: '6–7 days/week' },
  { v: 'Super Active (athlete)',            icon: '🏆', short: 'Super Active',   sub: 'Athlete level' },
]
const SLEEP   = ['< 5 hrs', '5–6 hrs', '6–7 hrs', '7–8 hrs', '> 8 hrs']
const SLEEP_V = ['Less than 5 hours', '5 – 6 hours', '6 – 7 hours', '7 – 8 hours', 'More than 8 hours']
const WATER   = ['< 1 L', '1–2 L', '2–3 L', '3–4 L', '> 4 L']
const WATER_V = ['Less than 1 liter', '1 – 2 liters', '2 – 3 liters', '3 – 4 liters', 'More than 4 liters']
const FREQ    = ['Never', '1×/week', '2–3×/week', '4–5×/week', 'Daily']
const FREQ_V  = ['Never', '1 time per week', '2 – 3 times per week', '4 – 5 times per week', 'Daily']
const WORKOUT_TYPE = [
  { v: 'Gym / Strength Training', icon: '🏋️' },
  { v: 'Yoga / Meditation',       icon: '🧘' },
  { v: 'Running / Cardio',        icon: '🏃' },
  { v: 'Sports',                  icon: '⚽' },
  { v: 'Mixed',                   icon: '🔄' },
  { v: 'None',                    icon: '😴' },
]
const WORK_TYPE = [
  { v: 'Desk Job',      icon: '💻' },
  { v: 'Standing Job',  icon: '🧍' },
  { v: 'Physical Job',  icon: '⚒️' },
]

const Step3 = ({ d, set, err }: { d: FormData; set: SetFn; err: Errors }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">🏃</div>
      <div className="df-hd-text">
        <h2>Tell us about your lifestyle</h2>
        <p>This helps us understand your routine and create a plan that fits your life.</p>
      </div>
    </div>

    {/* Activity Level */}
    <div className="df-card-field">
      <label className="df-label">Activity Level <span className="df-req">*</span></label>
      <p className="df-field-sub">How active are you on a daily basis?</p>
      <div className="ls-activity-grid">
        {ACTIVITY.map((a) => (
          <button
            key={a.v}
            className={`ls-activity-card${d.activityLevel === a.v ? ' sel' : ''}`}
            onClick={() => set('activityLevel', a.v)}
          >
            <span className="ls-ac-icon">{a.icon}</span>
            <span className="ls-ac-short">{a.short}</span>
            <span className="ls-ac-sub">{a.sub}</span>
            {d.activityLevel === a.v && <span className="ls-ac-check">✓</span>}
          </button>
        ))}
      </div>
      <FieldErr msg={err.activityLevel} />
    </div>

    {/* Work Type */}
    <div className="df-card-field">
      <label className="df-label">Work Type <span className="df-req">*</span></label>
      <p className="df-field-sub">What type of work do you do?</p>
      <div className="ls-icon-row">
        {WORK_TYPE.map((w) => (
          <button
            key={w.v}
            className={`ls-icon-pill${d.workType === w.v ? ' sel' : ''}`}
            onClick={() => set('workType', w.v)}
          >
            <span>{w.icon}</span>
            <span>{w.v}</span>
          </button>
        ))}
      </div>
      <FieldErr msg={err.workType} />
    </div>

    {/* Workout Type */}
    <div className="df-card-field">
      <label className="df-label">Workout Type <span className="df-req">*</span></label>
      <p className="df-field-sub">What type of workouts do you prefer?</p>
      <div className="ls-workout-grid">
        {WORKOUT_TYPE.map((w) => (
          <button
            key={w.v}
            className={`ls-workout-card${d.workoutType === w.v ? ' sel' : ''}`}
            onClick={() => set('workoutType', w.v)}
          >
            <span className="ls-wt-icon">{w.icon}</span>
            <span className="ls-wt-label">{w.v}</span>
            {d.workoutType === w.v && <span className="ls-wt-check">✓</span>}
          </button>
        ))}
      </div>
      <FieldErr msg={err.workoutType} />
    </div>

    <div className="df-tip-box">💡 Tip: Be honest! The more accurate your answers, the better your plan will be.</div>
  </div>
)

/* ─── Step 4 ─────────────────────────────────────────────── */
const DIET_TYPES = [
  { v: 'Vegetarian',     icon: '🌿', desc: 'Pure plant-based diet' },
  { v: 'Non-Vegetarian', icon: '🍗', desc: 'Includes meat & fish' },
  { v: 'Eggetarian',     icon: '🥚', desc: 'Vegetarian + eggs' },
]
const CUISINES = [
  { v: 'North Indian',    icon: '🫓' },
  { v: 'South Indian',    icon: '🌶️' },
  { v: 'Bengali',         icon: '🐟' },
  { v: 'Gujarati',        icon: '🥜' },
  { v: 'Punjabi',         icon: '🧈' },
  { v: 'Maharashtrian',   icon: '🥘' },
  { v: 'Rajasthani',      icon: '🏜️' },
  { v: 'Goan',            icon: '🌴' },
  { v: 'Kerala',          icon: '🥥' },
  { v: 'Mughlai',         icon: '🍖' },
  { v: 'Hyderabadi',      icon: '🍛' },
  { v: 'Odia',            icon: '🍚' },
  { v: 'Bihari',          icon: '🌾' },
  { v: 'Kashmiri',        icon: '🏔️' },
  { v: 'Chettinad',       icon: '🌿' },
  { v: 'Continental',     icon: '🥗' },
  { v: 'Mediterranean',   icon: '🫒' },
  { v: 'Chinese',         icon: '🥡' },
  { v: 'No Preference',   icon: '✌️' },
]
const ALLERGIES = [
  { v: 'None',           icon: '✅' },
  { v: 'Gluten',         icon: '🌾' },
  { v: 'Dairy / Lactose',icon: '🥛' },
  { v: 'Nuts',           icon: '🥜' },
  { v: 'Soy',            icon: '🫘' },
  { v: 'Eggs',           icon: '🥚' },
]
const MEAL_TIMES = [
  { lbl: 'Breakfast',     icon: '☀️',  key: 'breakfastTime',   opt: false },
  { lbl: 'Mid-morning',   icon: '☕',  key: 'midMorningTime',  opt: true  },
  { lbl: 'Lunch',         icon: '🌤️', key: 'lunchTime',       opt: false },
  { lbl: 'Evening Snack', icon: '🌅',  key: 'eveningSnackTime',opt: true  },
  { lbl: 'Dinner',        icon: '🌙',  key: 'dinnerTime',      opt: false },
]

const Step4 = ({ d, set, tog, err }: { d: FormData; set: SetFn; tog: ToglFn; err: Errors }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">🥗</div>
      <div className="df-hd-text">
        <h2>Tell us about your food preferences</h2>
        <p>This helps us create a diet plan with meals you enjoy and ingredients you prefer.</p>
      </div>
    </div>

    {/* Diet Type */}
    <div className="df-card-field">
      <label className="df-label">Diet Type <span className="df-req">*</span></label>
      <p className="df-field-sub">What type of diet do you follow?</p>
      <div className="fp-diet-grid">
        {DIET_TYPES.map((t) => (
          <button
            key={t.v}
            className={`fp-diet-card${d.dietType === t.v ? ' sel' : ''}`}
            onClick={() => set('dietType', t.v)}
          >
            {d.dietType === t.v && <span className="fp-diet-check">✓</span>}
            <span className="fp-diet-icon">{t.icon}</span>
            <strong className="fp-diet-name">{t.v}</strong>
            <span className="fp-diet-desc">{t.desc}</span>
          </button>
        ))}
      </div>
      <FieldErr msg={err.dietType} />
    </div>

    {/* Cuisine Preference — multi-select */}
    <div className="df-card-field">
      <label className="df-label">Cuisine Preference <span className="df-opt">(Select all that apply)</span></label>
      <div className="ls-pill-group">
        {CUISINES.map((c) => (
          <button
            key={c.v}
            className={`ls-pill fp-cuisine-pill${d.cuisinePreference.includes(c.v) ? ' sel' : ''}`}
            onClick={() => tog('cuisinePreference', c.v)}
          >
            <span>{c.icon}</span>
            <span>{c.v}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Allergies + Dislikes + Favourites */}
    <div className="df-card-field">
      <label className="df-label">Food Allergies / Intolerances</label>
      <p className="df-field-sub">Do you have any allergies?</p>
      <div className="ls-pill-group">
        {ALLERGIES.map((a) => (
          <button
            key={a.v}
            className={`ls-pill${d.foodAllergies === a.v ? ' sel' : ''}`}
            onClick={() => set('foodAllergies', a.v)}
          >
            <span>{a.icon}</span>
            <span>{a.v}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="df-grid-2">
      <div className="df-card-field">
        <label className="df-label">Foods You Dislike <span className="df-opt">(Optional)</span></label>
        <p className="df-field-sub">Any foods you want to avoid?</p>
        <div className="df-input-wrap">
          <span className="df-icon">🚫</span>
          <input className="df-input" type="text" placeholder="e.g., mushrooms, tofu…"
            value={d.foodsDislike} onChange={(e) => set('foodsDislike', e.target.value)} />
        </div>
      </div>
      <div className="df-card-field">
        <label className="df-label">Favourite Foods <span className="df-opt">(Optional)</span></label>
        <p className="df-field-sub">Tell us what you love!</p>
        <div className="df-input-wrap">
          <span className="df-icon">❤️</span>
          <input className="df-input" type="text" placeholder="e.g., dal, paneer, rajma, oats…"
            value={d.favoriteFoods} onChange={(e) => set('favoriteFoods', e.target.value)} />
        </div>
      </div>
    </div>

    {/* Meal Timings */}
    <div className="df-card-field" style={{ display: 'none' }}>
      <label className="df-label">Meal Timings</label>
      <p className="df-field-sub">What is your usual meal schedule?</p>
      <div className="fp-timings-grid">
        {MEAL_TIMES.map((t) => (
          <div key={t.key} className="fp-timing-card">
            <div className="fp-timing-header">
              <span className="fp-timing-icon">{t.icon}</span>
              <span className="fp-timing-lbl">
                {t.lbl}{t.opt && <span className="df-opt"> (Opt)</span>}
              </span>
            </div>
            <select
              className="fp-timing-select"
              value={(d as unknown as Record<string, string>)[t.key]}
              onChange={(e) => set(t.key as keyof FormData, e.target.value)}
            >
              {TIMES.map((tt) => <option key={tt}>{tt}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>

    <div className="df-tip-box">
      💡 Tip: The more we know about your preferences, the better and tastier your plan will be! 😊
    </div>
  </div>
)

/* ─── Step 5 ─────────────────────────────────────────────── */
const MEDICAL_CONDITIONS = [
  { v: 'Diabetes',         icon: '💉' },
  { v: 'Thyroid',          icon: '🦋' },
  { v: 'PCOS / PCOD',      icon: '♀️' },
  { v: 'High BP',          icon: '❤️' },
  { v: 'Cholesterol',      icon: '🫀' },
  { v: 'Heart Condition',  icon: '💔' },
  { v: 'None',             icon: '✅' },
  { v: 'Other',            icon: '➕' },
]
const MEDICATION_OPTS = [
  { v: 'Yes, regularly',   icon: '💊', desc: 'Take medicines daily' },
  { v: 'Yes, occasionally',icon: '🩺', desc: 'Sometimes as needed' },
  { v: 'No',               icon: '✅', desc: 'Not on any medication' },
]
const INTOLERANCES = [
  { v: 'None',            icon: '✅' },
  { v: 'Gluten',          icon: '🌾' },
  { v: 'Dairy / Lactose', icon: '🥛' },
  { v: 'Nuts',            icon: '🥜' },
  { v: 'Soy',             icon: '🫘' },
  { v: 'Eggs',            icon: '🥚' },
  { v: 'Other',           icon: '➕' },
]
const DIGESTION_OPTS = [
  { v: 'Excellent', icon: '😄', color: '#22c55e' },
  { v: 'Good',      icon: '🙂', color: '#84cc16' },
  { v: 'Average',   icon: '😐', color: '#f59e0b' },
  { v: 'Poor',      icon: '😟', color: '#ef4444' },
]
const SMOKE_OPTS = [
  { v: 'Neither',         icon: '🌿' },
  { v: 'Smoke',           icon: '🚬' },
  { v: 'Consume Alcohol', icon: '🍺' },
  { v: 'Both',            icon: '⚠️' },
]

const Step5 = ({ d, set, tog, err }: { d: FormData; set: SetFn; tog: ToglFn; err: Errors }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">🏥</div>
      <div className="df-hd-text">
        <h2>Tell us about your health</h2>
        <p>This helps us create a safe and effective plan tailored just for you.</p>
      </div>
    </div>

    {/* Medical Conditions */}
    <div className="df-card-field">
      <label className="df-label">Do you have any medical conditions? <span className="df-req">*</span></label>
      <p className="df-field-sub">Select all that apply</p>
      <div className="hl-chip-group">
        {MEDICAL_CONDITIONS.map((c) => (
          <button
            key={c.v}
            className={`hl-chip${d.medicalConditions.includes(c.v) ? ' sel' : ''}`}
            onClick={() => {
              if (c.v === 'None') {
                set('medicalConditions', ['None'])
              } else {
                const without = d.medicalConditions.filter(x => x !== 'None' && x !== c.v)
                const next = d.medicalConditions.includes(c.v) ? without : [...without, c.v]
                set('medicalConditions', next)
              }
            }}
          >
            <span>{c.icon}</span>
            <span>{c.v}</span>
            {d.medicalConditions.includes(c.v) && <span className="hl-chip-x">✓</span>}
          </button>
        ))}
      </div>
      {d.medicalConditions.includes('Other') && (
        <div className="df-input-wrap" style={{ marginTop: 10 }}>
          <input
            className="df-input"
            type="text"
            placeholder="Please specify your condition"
            value={d.otherCondition}
            onChange={(e) => set('otherCondition', e.target.value)}
            style={{ paddingLeft: 12 }}
          />
        </div>
      )}
      <FieldErr msg={err.medicalConditions} />
    </div>

    {/* Medication */}
    <div className="df-card-field">
      <label className="df-label">Are you currently on any medication? <span className="df-req">*</span></label>
      <div className="hl-answer-row">
        {MEDICATION_OPTS.map((m) => (
          <button
            key={m.v}
            className={`hl-answer-card${d.onMedication === m.v ? ' sel' : ''}`}
            onClick={() => set('onMedication', m.v)}
          >
            {d.onMedication === m.v && <span className="hl-answer-check">✓</span>}
            <span className="hl-answer-icon">{m.icon}</span>
            <strong>{m.v}</strong>
            <span className="hl-answer-desc">{m.desc}</span>
          </button>
        ))}
      </div>
      {(d.onMedication === 'Yes, regularly' || d.onMedication === 'Yes, occasionally') && (
        <div style={{ marginTop: 12 }}>
          <label className="df-label">List your medications <span className="df-opt">(optional)</span></label>
          <textarea className="df-textarea" rows={2}
            placeholder="e.g., Metformin, Thyroxine, Vitamin D"
            value={d.medications} onChange={(e) => set('medications', e.target.value)} />
        </div>
      )}
      <FieldErr msg={err.onMedication} />
    </div>

    {/* Digestive + Smoke */}
    <div className="df-grid-2">
      <div className="df-card-field">
        <label className="df-label">Digestive Health <span className="df-req">*</span></label>
        <p className="df-field-sub">How would you describe your digestion?</p>
        <div className="hl-digest-row">
          {DIGESTION_OPTS.map((o) => (
            <button
              key={o.v}
              className={`hl-digest-card${d.digestiveHealth === o.v ? ' sel' : ''}`}
              style={d.digestiveHealth === o.v ? { borderColor: o.color, background: `${o.color}15` } : {}}
              onClick={() => set('digestiveHealth', o.v)}
            >
              <span className="hl-digest-icon">{o.icon}</span>
              <span className="hl-digest-lbl">{o.v}</span>
            </button>
          ))}
        </div>
        <FieldErr msg={err.digestiveHealth} />
      </div>

      <div className="df-card-field">
        <label className="df-label">Smoke or alcohol? <span className="df-req">*</span></label>
        <div className="hl-chip-group">
          {SMOKE_OPTS.map((o) => (
            <button
              key={o.v}
              className={`hl-chip${d.smokeAlcohol === o.v ? ' sel' : ''}`}
              onClick={() => set('smokeAlcohol', o.v)}
            >
              <span>{o.icon}</span>
              <span>{o.v}</span>
              {d.smokeAlcohol === o.v && <span className="hl-chip-x">✓</span>}
            </button>
          ))}
        </div>
        <FieldErr msg={err.smokeAlcohol} />
      </div>
    </div>

    {/* Health Notes */}
    <div className="df-card-field">
      <label className="df-label">Anything else we should know? <span className="df-opt">(Optional)</span></label>
      <p className="df-field-sub">Recent surgery, pregnancy, breastfeeding, etc.</p>
      <div className="df-ta-wrap">
        <textarea className="df-textarea" rows={3} maxLength={250}
          placeholder="Share any other health information…"
          value={d.healthNotes} onChange={(e) => set('healthNotes', e.target.value)} />
        <span className="df-char">{d.healthNotes.length}/250</span>
      </div>
    </div>
  </div>
)

/* ─── Step 6 ─────────────────────────────────────────────── */
const BUDGET_OPTS = [
  { v: 'Under ₹500 / month',       icon: '💵', short: '< ₹500',    pop: false },
  { v: '₹500 – ₹1,000 / month',    icon: '💴', short: '₹500–1k',   pop: false },
  { v: '₹1,000 – ₹2,000 / month',  icon: '💳', short: '₹1k–2k',    pop: true  },
  { v: '₹2,000 – ₹3,000 / month',  icon: '💰', short: '₹2k–3k',    pop: false },
  { v: 'Above ₹3,000 / month',      icon: '🏆', short: '> ₹3k',     pop: false },
]
const MEAL_PREF_OPTS = [
  { v: 'Home Cooked (Fresh Meals)',       icon: '🍳', desc: 'Fresh meals daily' },
  { v: 'Meal Prep / Batch Cooking',       icon: '🥡', desc: 'Cook once, eat all week' },
  { v: 'Ready to Eat (Healthy Options)',  icon: '🥙', desc: 'Quick healthy options' },
  { v: 'Food Delivery Apps',             icon: '🛵', desc: 'Order from Zomato / Swiggy' },
]
const PREP_TIME_OPTS = [
  { v: 'Less than 30 minutes', icon: '⚡', short: '< 30 min' },
  { v: '30 – 60 minutes',      icon: '⏱️', short: '30–60 min' },
  { v: '1 – 2 hours',          icon: '⏰', short: '1–2 hrs' },
  { v: 'More than 2 hours',    icon: '🕰️', short: '> 2 hrs' },
]
const GROCERY_OPTS = [
  { v: 'Online (Instamart, BigBasket, etc.)', icon: '📱', short: 'Online' },
  { v: 'Local market / sabzi mandi',          icon: '🛒', short: 'Local Market' },
  { v: 'Both',                                icon: '🔄', short: 'Both' },
]
const COOKING_OPTS = [
  { v: 'I cook myself',         icon: '👨‍🍳', desc: 'Solo in the kitchen' },
  { v: 'Someone helps me',      icon: '👫',   desc: 'Family helps out' },
  { v: 'Full-time house help',  icon: '🏠',   desc: 'Dedicated cook' },
]

const Step6 = ({ d, set, tog, err }: { d: FormData; set: SetFn; tog: ToglFn; err: Errors }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">💰</div>
      <div className="df-hd-text">
        <h2>Let's plan what works for you</h2>
        <p>This helps us create a plan that fits your budget and lifestyle.</p>
      </div>
    </div>

    {/* Budget */}
    <div className="df-card-field">
      <label className="df-label">What is your budget for this plan? <span className="df-req">*</span></label>
      <p className="df-field-sub">Choose the range that works best for you</p>
      <div className="bc-budget-grid">
        {BUDGET_OPTS.map((b) => (
          <button
            key={b.v}
            className={`bc-budget-card${d.budget === b.v ? ' sel' : ''}`}
            onClick={() => set('budget', b.v)}
          >
            {b.pop && <span className="bc-popular-tag">⭐ Popular</span>}
            {d.budget === b.v && <span className="bc-budget-check">✓</span>}
            <span className="bc-budget-icon">{b.icon}</span>
            <span className="bc-budget-short">{b.short}</span>
            <span className="bc-budget-sub">per month</span>
          </button>
        ))}
      </div>
      <FieldErr msg={err.budget} />
    </div>

    {/* Meal Preference + Prep Time */}
    <div className="df-grid-2">
      <div className="df-card-field">
        <label className="df-label">How do you prefer your meals? <span className="df-req">*</span></label>
        <p className="df-field-sub">Select all that apply</p>
        <div className="bc-meal-grid">
          {MEAL_PREF_OPTS.map((m) => (
            <button
              key={m.v}
              className={`bc-meal-card${d.mealPreference.includes(m.v) ? ' sel' : ''}`}
              onClick={() => tog('mealPreference', m.v)}
            >
              {d.mealPreference.includes(m.v) && <span className="bc-meal-check">✓</span>}
              <span className="bc-meal-icon">{m.icon}</span>
              <strong className="bc-meal-name">{m.v}</strong>
              <span className="bc-meal-desc">{m.desc}</span>
            </button>
          ))}
        </div>
        <FieldErr msg={err.mealPreference} />
      </div>

      <div className="df-card-field">
        <label className="df-label">Meal prep time? <span className="df-req">*</span></label>
        <p className="df-field-sub">How much time can you spend cooking?</p>
        <div className="bc-prep-grid">
          {PREP_TIME_OPTS.map((p) => (
            <button
              key={p.v}
              className={`bc-prep-card${d.prepTime === p.v ? ' sel' : ''}`}
              onClick={() => set('prepTime', p.v)}
            >
              {d.prepTime === p.v && <span className="bc-prep-check">✓</span>}
              <span className="bc-prep-icon">{p.icon}</span>
              <span className="bc-prep-short">{p.short}</span>
            </button>
          ))}
        </div>
        <FieldErr msg={err.prepTime} />
      </div>
    </div>

    {/* Grocery + Cooking Support */}
    <div className="df-grid-2">
      <div className="df-card-field">
        <label className="df-label">Grocery shopping preference</label>
        <p className="df-field-sub">How do you usually buy groceries?</p>
        <div className="ls-icon-row">
          {GROCERY_OPTS.map((g) => (
            <button
              key={g.v}
              className={`ls-icon-pill${d.groceryShopping === g.v ? ' sel' : ''}`}
              onClick={() => set('groceryShopping', g.v)}
            >
              <span>{g.icon}</span>
              <span>{g.short}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="df-card-field">
        <label className="df-label">Cooking support at home?</label>
        <p className="df-field-sub">Who cooks in your household?</p>
        <div className="bc-cook-grid">
          {COOKING_OPTS.map((c) => (
            <button
              key={c.v}
              className={`bc-cook-card${d.cookingSupport === c.v ? ' sel' : ''}`}
              onClick={() => set('cookingSupport', c.v)}
            >
              {d.cookingSupport === c.v && <span className="bc-cook-check">✓</span>}
              <span className="bc-cook-icon">{c.icon}</span>
              <strong className="bc-cook-name">{c.v}</strong>
              <span className="bc-cook-desc">{c.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Other preferences */}
    <div className="df-card-field">
      <label className="df-label">Any other preferences? <span className="df-opt">(Optional)</span></label>
      <p className="df-field-sub">Religious fasting, travel habits, weekend eating, etc.</p>
      <div className="df-ta-wrap">
        <textarea className="df-textarea" rows={3} maxLength={250}
          placeholder="e.g., I travel frequently, eat out on weekends, religious fasting…"
          value={d.otherPreferences} onChange={(e) => set('otherPreferences', e.target.value)} />
        <span className="df-char">{d.otherPreferences.length}/250</span>
      </div>
    </div>

    <div className="df-tip-box">💡 Tip: Don't worry, you can always update your preferences later.</div>
  </div>
)

/* ─── Step 7 ─────────────────────────────────────────────── */
const PLAN_OPTS = [
  { v: '1 Week',   price: '₹199', icon: '⚡', desc: '7-day personalized plan', badge: null },
  { v: '1 Month',  price: '₹499', icon: '👑', desc: '28-day plan + dietitian consult', badge: '🔥 Most Popular' },
  { v: '3 Months', price: '₹999', icon: '📅', desc: '3 months + monthly check-ins', badge: '⭐ Best Value' },
]

const DELIVERY_OPTS = [
  { k: 'whatsapp', icon: '💬', lbl: 'WhatsApp', sub: 'Instant delivery on WhatsApp', badge: '⚡ Recommended' },
  { k: 'email',   icon: '📧', lbl: 'Email',     sub: 'Delivered to your inbox',      badge: null },
]

const Step7 = ({ d, set, err }: { d: FormData; set: SetFn; err: Errors }) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const phoneFromUser = !!(user?.phone_number)
  const methods = d.deliveryMethod as string[]
  const hasMethod = (k: string) => methods.includes(k)
  const toggleMethod = (k: string) => {
    const next = hasMethod(k) ? methods.filter(x => x !== k) : [...methods, k]
    if (next.length > 0) set('deliveryMethod', next)
  }

  return (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">🎉</div>
      <div className="df-hd-text">
        <h2>Almost done! Just a few details</h2>
        <p>We'll use this to deliver your personalized diet plan.</p>
      </div>
    </div>

    {/* Plan Selection */}
    <div className="df-card-field">
      <label className="df-label">Choose Your Plan <span className="df-req">*</span></label>
      <p className="df-field-sub">Select the plan that works best for you</p>
      <div className="ct-plan-grid">
        {PLAN_OPTS.map((p) => (
          <button
            key={p.v}
            className={`ct-plan-card${d.planType === p.v ? ' sel' : ''}`}
            onClick={() => set('planType', p.v)}
          >
            {p.badge && <span className="ct-plan-badge">{p.badge}</span>}
            {d.planType === p.v && <span className="ct-plan-check">✓</span>}
            <span className="ct-plan-icon">{p.icon}</span>
            <strong className="ct-plan-name">{p.v}</strong>
            <span className="ct-plan-price">{p.price}</span>
            <span className="ct-plan-desc">{p.desc}</span>
          </button>
        ))}
      </div>
      <FieldErr msg={err.planType} />
    </div>

    {/* Contact + Delivery */}
    <div className="df-grid-2">

      {/* Contact fields */}
      <div className="ct-contact-card">
        <div className="ct-contact-header">
          <span className="ct-contact-icon">👤</span>
          <div>
            <p className="ct-contact-title">Contact Information</p>
            <p className="ct-contact-sub">How can we reach you?</p>
          </div>
        </div>

        <div className="df-field">
          <label className="df-label">Full Name <span className="df-req">*</span></label>
          <div className={`df-input-wrap${err.contactName ? ' df-input-wrap--err' : ''}`}>
            <span className="df-icon">👤</span>
            <input className="df-input" type="text" placeholder="Enter your full name"
              value={d.contactName}
              onChange={(e) => set('contactName', e.target.value.replace(/[^a-zA-Z\s]/g, ''))} />
          </div>
          <FieldErr msg={err.contactName} />
        </div>

        <div className="df-field">
          <label className="df-label">
            Phone / WhatsApp Number
            {hasMethod('whatsapp') && <span className="df-req"> *</span>}
          </label>
          <div className="df-phone-row">
            <select className="df-phone-code"><option>+91</option></select>
            <div className={`df-input-wrap${err.whatsapp ? ' df-input-wrap--err' : ''}`} style={{ flex: 1 }}>
              <span className="df-icon">📱</span>
              <input className="df-input" type="tel" placeholder="10-digit number"
                value={d.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
              {phoneFromUser
                ? <span className="df-verified-badge">✓ Verified</span>
                : d.whatsapp.trim().length >= 10 && (
                  <button
                    type="button"
                    className="df-verify-btn"
                    onClick={() => showToast('OTP sent to your number!', 'success')}
                  >
                    Verify
                  </button>
                )
              }
            </div>
          </div>
          <FieldErr msg={err.whatsapp} />
        </div>

        <div className="df-field">
          <label className="df-label">
            Email Address
            {hasMethod('email') && <span className="df-req"> *</span>}
            {!hasMethod('email') && <span className="df-opt"> (Optional)</span>}
          </label>
          <div className={`df-input-wrap${err.email ? ' df-input-wrap--err' : ''}`}>
            <span className="df-icon">📧</span>
            <input className="df-input" type="email" placeholder="Enter your email address"
              value={d.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <FieldErr msg={err.email} />
        </div>
      </div>

      {/* Delivery method */}
      <div className="df-card-field">
        <label className="df-label">Where should we send your plan?</label>
        <p className="df-field-sub">You can select both WhatsApp and email</p>
        <div className="ct-delivery-grid">
          {DELIVERY_OPTS.map((m) => (
            <button
              key={m.k}
              className={`ct-delivery-card${hasMethod(m.k) ? ' sel' : ''}`}
              onClick={() => toggleMethod(m.k)}
            >
              {m.badge && <span className="ct-delivery-badge">{m.badge}</span>}
              {hasMethod(m.k) && <span className="ct-delivery-check">✓</span>}
              <span className="ct-delivery-icon">{m.icon}</span>
              <strong className="ct-delivery-lbl">{m.lbl}</strong>
              <span className="ct-delivery-sub">{m.sub}</span>
            </button>
          ))}
        </div>
        <div className="ct-delivery-note">
          <span>🕐</span>
          <span>Your plan will be ready within <strong>24 hours</strong> of submitting this form.</span>
        </div>
      </div>
    </div>

    {/* Location + Notes */}
    <div className="df-grid-2">
      <div className="df-card-field">
        <label className="df-label">📍 Your Location</label>
        <p className="df-field-sub">Helps us suggest locally available ingredients</p>
        <div className="ct-location-grid">
          <div className="df-field">
            <label className="df-label">State <span className="df-req">*</span></label>
            <SearchableSelect
              options={IN_STATES.map(s => ({ value: s.isoCode, label: s.name }))}
              value={d.stateCode}
              onChange={(code) => {
                const name = IN_STATES.find(s => s.isoCode === code)?.name ?? ''
                set('stateCode', code)
                set('state', name)
                set('city', '')
              }}
              placeholder="Select your state"
              searchPlaceholder="Search state..."
              hasError={!!err.state}
            />
            <FieldErr msg={err.state} />
          </div>
          <div className="df-field">
            <label className="df-label">City <span className="df-req">*</span></label>
            <SearchableSelect
              options={d.stateCode
                ? getCitiesOfState(d.stateCode).map(c => ({ value: c.name, label: c.name }))
                : []
              }
              value={d.city}
              onChange={(city) => set('city', city)}
              placeholder={d.stateCode ? 'Select your city' : 'Select state first'}
              searchPlaceholder="Search city..."
              disabled={!d.stateCode}
              hasError={!!err.city}
            />
            <FieldErr msg={err.city} />
          </div>
        </div>
      </div>

      <div className="df-card-field">
        <label className="df-label">Anything else we should know? <span className="df-opt">(Optional)</span></label>
        <p className="df-field-sub">Irregular eating habits, fasting days, no onion-garlic, etc.</p>
        <div className="df-ta-wrap">
          <textarea className="df-textarea" rows={5} maxLength={250}
            placeholder="Share anything important for your plan…"
            value={d.finalNotes} onChange={(e) => set('finalNotes', e.target.value)} />
          <span className="df-char">{d.finalNotes.length}/250</span>
        </div>
      </div>
    </div>

    {/* Trust strip */}
    <div className="ct-trust-strip">
      {[
        { icon: '🔒', text: '100% Confidential' },
        { icon: '⚡', text: 'Plan in 24 hours' },
        { icon: '🌿', text: 'Expert Designed' },
        { icon: '🎯', text: 'Fully Personalized' },
      ].map((t) => (
        <div key={t.text} className="ct-trust-item">
          <span>{t.icon}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  </div>
  )
}

/* ─── Sidebar – Step 1 ────────────────────────────────────── */
const SidebarStep1 = ({ step }: { step: number }) => (
  <aside className="df-sidebar df-sidebar-s1">

    <div className="df-s1-hero">
      <h2 className="df-s1-title">
        Your Personalized
        <br />
        <span className="df-s1-green">Journey Starts Here</span>
      </h2>
      <p className="df-s1-desc">
        Complete this quick assessment and receive a fully customized diet plan tailored to your unique body,
        goals, and lifestyle.
      </p>
    </div>

    <div className="df-s1-illus">
      <span className="df-s1-illus-main">📋</span>
      <div className="df-s1-illus-foods">
        <span>🥗</span>
        <span>🥦</span>
        <span>🍛</span>
        <span>🫛</span>
      </div>
    </div>

    <nav className="df-sb-steps df-s1-steps">
      {STEPS.map((s, i) => {
        const num = i + 1
        const active = num === step
        return (
          <div key={i} className="df-sb-step-wrap">
            <div className={`df-sb-step ${active ? 'active' : ''}`}>
              <div className="df-sb-dot">{num}</div>
              <div className="df-sb-info">
                <span className="df-sb-lbl">{s.label}</span>
              </div>
            </div>
            {i < STEPS.length - 1 && <div className="df-sb-line" />}
          </div>
        )
      })}
    </nav>

    <div className="df-s1-privacy-note">🔒 Your information is 100% safe &amp; private</div>
  </aside>
)

/* ─── Sidebar – Steps 2–7 ─────────────────────────────────── */
const SidebarMain = ({ step }: { step: number }) => (
  <aside className="df-sidebar">
    <div className="df-sidebar-inner">

      <div className="df-sb-privacy">
        <span className="df-sb-priv-icon">🔒</span>
        <p>Your information is safe with us. We never share your data with anyone.</p>
      </div>

      <nav className="df-sb-steps">
        {STEPS.map((s, i) => {
          const num = i + 1
          const done = num < step
          const active = num === step
          return (
            <div key={i} className="df-sb-step-wrap">
              <div className={`df-sb-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                <div className="df-sb-dot">{done ? '✓' : num}</div>
                <div className="df-sb-info">
                  <span className="df-sb-lbl">{s.label}</span>
                  <span className="df-sb-sub">{s.sub}</span>
                </div>
              </div>
              {i < STEPS.length - 1 && <div className={`df-sb-line ${done ? 'done' : ''}`} />}
            </div>
          )
        })}
      </nav>

      <div className="df-sb-help">
        <span className="df-sb-help-icon">💬</span>
        <div>
          <p className="df-sb-help-title">Need Help?</p>
          <p className="df-sb-help-sub">
            Chat with our team on{' '}
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </p>
        </div>
      </div>

    </div>
  </aside>
)

/* ─── Main Component ──────────────────────────────────────── */
function validateStep(s: number, d: FormData): Errors {
  const e: Errors = {}
  if (s === 1) {
    if (!d.fullName.trim())       e.fullName = 'Full name is required'
    if (!d.dob)                   e.dob = 'Date of birth is required'
    if (!d.gender)                e.gender = 'Please select your gender'
    if (!d.height.trim()) {
      e.height = 'Height is required'
    } else {
      const h = +d.height
      if (d.heightUnit === 'cm'   && (h < 50  || h > 300)) e.height = 'Height must be between 50 and 300 cm'
      if (d.heightUnit === 'ft/in' && (h < 1   || h > 9))  e.height = 'Height must be between 1 and 9 ft'
    }
    if (!d.weight.trim()) {
      e.weight = 'Weight is required'
    } else {
      const w = +d.weight
      if (d.weightUnit === 'kg'  && (w < 1 || w > 300)) e.weight = 'Weight must be between 1 and 300 kg'
      if (d.weightUnit === 'lbs' && (w < 1 || w > 660)) e.weight = 'Weight must be between 1 and 660 lbs'
    }
    if (d.goals.length === 0) e.goals = 'Please select at least one goal'
  }
  if (s === 2) {
    if (!d.activityLevel) e.activityLevel = 'Please select your activity level'
    if (!d.workType)      e.workType      = 'Please select your work type'
    if (!d.workoutType)   e.workoutType   = 'Please select your workout type'
  }
  if (s === 3) {
    if (!d.dietType) e.dietType = 'Please select your diet type'
  }
  if (s === 4) {
    if (d.medicalConditions.length === 0) e.medicalConditions = 'Please select at least one option'
    if (!d.onMedication)                  e.onMedication      = 'Please select an option'
    if (!d.digestiveHealth)               e.digestiveHealth   = 'Please select your digestive health'
    if (!d.smokeAlcohol)                  e.smokeAlcohol      = 'Please select an option'
  }
  if (s === 5) {
    const methods = d.deliveryMethod as string[]
    if (!d.planType) e.planType = 'Please select a plan'
    if (!d.contactName.trim()) e.contactName = 'Contact name is required'
    if (methods.includes('whatsapp')) {
      if (!d.whatsapp.trim()) e.whatsapp = 'WhatsApp number is required'
      else if (!/^\d{10}$/.test(d.whatsapp.replace(/\s|-/g, ''))) e.whatsapp = 'Enter a valid 10-digit number'
    }
    if (methods.includes('email') && !d.email.trim()) e.email = 'Email address is required'
    if (!d.city)  e.city  = 'Please select your city'
    if (!d.state) e.state = 'Please select your state'
  }
  return e
}

const DietForm = ({ onClose }: { onClose: () => void }) => {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [data, setData] = useState<FormData>(INIT)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Auto-fill contact name from step 1 whenever fullName changes
  useEffect(() => {
    if (data.fullName) {
      setData(p => ({ ...p, contactName: data.fullName }))
    }
  }, [data.fullName])

  // Pre-fill phone & email from logged-in user on mount
  useEffect(() => {
    if (user) {
      setData(p => ({
        ...p,
        ...(user.phone_number && !p.whatsapp ? { whatsapp: user.phone_number } : {}),
        ...(user.email        && !p.email    ? { email: user.email }            : {}),
      }))
    }
  }, [])

  const set: SetFn = (k, v) => {
    setData((p) => ({ ...p, [k]: v }))
    setErrors((p) => { const n = { ...p }; delete n[k]; return n })
  }
  const tog: ToglFn = (k, v) => {
    const arr = data[k] as string[]
    set(k, arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  }

  const go = (n: number) => {
    if (n > step) {
      const e = validateStep(step, data)
      if (Object.keys(e).length > 0) {
        setErrors(e)
        overlayRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }
    setErrors({})
    setDirection(n > step ? 'forward' : 'backward')
    setStep(n)
    overlayRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (submitted) {
    return (
      <div className="df-overlay df-success-screen" ref={overlayRef}>
        <div className="df-success-box">
          <div className="df-success-emoji">🎉</div>
          <h2>Your Plan is on its way!</h2>
          <p>
            Thank you, <strong>{data.contactName || data.fullName || 'there'}</strong>! We'll send your
            personalized diet plan to your {(data.deliveryMethod as string[]).map(m => m === 'whatsapp' ? 'WhatsApp' : 'Email').join(' & ')} within
            24 hours.
          </p>
          <button className="btn-primary df-success-btn" onClick={onClose}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="df-overlay" ref={overlayRef}>
      <div className="df-layout">
        <SidebarMain step={step} />

        <div className="df-right">
          <div className="df-panel">
            <div className="df-topbar">
              <span className="df-step-counter">
                Step <strong>{step}</strong> of 5
              </span>
              {/* <span className="df-secure">🔒 100% Secure &amp; Confidential</span> */}
            </div>

            <div className="df-stepper">
              {STEPS.map((s, i) => {
                const num = i + 1
                const done = num < step
                const active = num === step
                return (
                  <div key={i} className="df-stepper-item">
                    {i > 0 && <div className={`df-stepper-line ${done || active ? 'filled' : ''}`} />}
                    <div className={`df-stepper-dot ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                      {done ? '✓' : num}
                    </div>
                    <span className={`df-stepper-lbl ${active ? 'active' : ''}`}>{s.label}</span>
                  </div>
                )
              })}
            </div>

            <div className="df-content-area">
              <div key={step} className={`df-step-anim df-step-anim--${direction}`}>
                {step === 1 && <Step1 d={data} set={set} tog={tog} err={errors} />}
                {step === 2 && <Step3 d={data} set={set} err={errors} />}
                {step === 3 && <Step4 d={data} set={set} tog={tog} err={errors} />}
                {step === 4 && <Step5 d={data} set={set} tog={tog} err={errors} />}
                {step === 5 && <Step7 d={data} set={set} err={errors} />}
              </div>
            </div>

            <div className="df-nav-footer">
              <button className="df-back-btn" onClick={() => (step === 1 ? onClose() : go(step - 1))}>
                ← {step === 1 ? 'Close' : 'Back'}
              </button>
              {step < 5 ? (
                <button className="btn-primary df-next-btn" onClick={() => go(step + 1)}>
                  Next Step →
                </button>
              ) : (
                <button
                  className="btn-primary df-next-btn"
                  disabled={submitting}
                  onClick={async () => {
                    const e = validateStep(5, data)
                    if (Object.keys(e).length > 0) { setErrors(e); return }
                    setSubmitting(true)
                    try {
                      await dietFormApi.submit(data as unknown as Record<string, unknown>)
                      setSubmitted(true)
                    } catch (err) {
                      showToast(
                        err instanceof ApiError ? err.message : 'Submission failed. Please try again.',
                        'error',
                      )
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit & Get My Plan →'}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      <div className="df-feature-wrap">
        <div className="df-feature-strip">
          {[
            { icon: '🛡️', label: 'Expert Designed', sub: 'Plans by Nutrition Experts' },
            { icon: '🌿', label: '100% Personalized', sub: 'Tailored for your body, goals & lifestyle' },
            { icon: '🎯', label: 'Real Results', sub: 'Proven approach for real transformation' },
            { icon: '🎧', label: 'Ongoing Support', sub: "We're with you at every step" },
          ].map((f) => (
            <div key={f.label} className="df-feature-item">
              <div className="df-feature-icon">{f.icon}</div>
              <div className="df-feature-text">
                <span className="df-feature-title">{f.label}</span>
                <span className="df-feature-sub">{f.sub}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="df-form-timing">
          <span>Takes only 5–7 minutes</span>
          <span className="df-form-timing-dot">●</span>
          <span>5 Simple Steps</span>
          <span className="df-form-timing-dot">●</span>
          <span>Lifetime of Benefits</span>
        </div>
      </div>
    </div>
  )
}

export default DietForm
