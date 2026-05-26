import { useEffect, useRef, useState } from 'react'

const STEPS = [
  { label: 'Basic Details', sub: 'Tell us about yourself' },
  { label: 'Goals', sub: 'What do you want to achieve?' },
  { label: 'Lifestyle', sub: 'Your daily habits' },
  { label: 'Food Preferences', sub: 'What do you eat & prefer?' },
  { label: 'Health & Medical', sub: 'Your health matters' },
  { label: 'Budget & Convenience', sub: 'What works for you?' },
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
  cuisinePreference: '',
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
  deliveryMethod: 'whatsapp',
  city: '',
  state: '',
  finalNotes: '',
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
  cuisinePreference: string
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
  deliveryMethod: string
  city: string
  state: string
  finalNotes: string
}

type SetFn = (k: keyof FormData, v: FormData[keyof FormData]) => void
type ToglFn = (k: keyof FormData, v: string) => void

const TIMES = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM',
]
const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur',
  'Lucknow', 'Chandigarh', 'Surat', 'Indore', 'Bhopal', 'Nagpur', 'Patna', 'Vadodara', 'Other',
]
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Other',
]

/* ─── Step 1 ─────────────────────────────────────────────── */
const Step1 = ({ d, set }: { d: FormData; set: SetFn }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">👤</div>
      <div className="df-hd-text">
        <h2>Basic Details</h2>
        <p>Let's start with some basic information about you.</p>
      </div>
      <span className="df-conf-badge">🔒 100% Confidential</span>
    </div>

    <div className="df-field">
      <label className="df-label">
        Full Name <span className="df-req">*</span>
      </label>
      <div className="df-input-wrap">
        <span className="df-icon">👤</span>
        <input
          className="df-input"
          type="text"
          placeholder="Enter your full name"
          value={d.fullName}
          onChange={(e) => set('fullName', e.target.value)}
        />
      </div>
    </div>

    <div className="df-grid-3">
      <div className="df-field">
        <label className="df-label">
          Age <span className="df-req">*</span>
        </label>
        <div className="df-input-wrap">
          <span className="df-icon">📅</span>
          <input
            className="df-input"
            type="number"
            placeholder="Enter your age"
            value={d.age}
            onChange={(e) => set('age', e.target.value)}
          />
        </div>
      </div>
      <div className="df-field">
        <label className="df-label">
          Gender <span className="df-req">*</span>
        </label>
        <select className="df-select" value={d.gender} onChange={(e) => set('gender', e.target.value)}>
          <option value="">Select gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
          <option>Prefer not to say</option>
        </select>
      </div>
      <div className="df-field">
        <label className="df-label">Date of Birth</label>
        <div className="df-input-wrap">
          <span className="df-icon">📅</span>
          <input
            className="df-input"
            type="text"
            placeholder="DD / MM / YYYY"
            value={d.dob}
            onChange={(e) => set('dob', e.target.value)}
          />
        </div>
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
          className="df-input"
          type="text"
          placeholder={`Enter height in ${d.heightUnit}`}
          value={d.height}
          onChange={(e) => set('height', e.target.value)}
        />
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
          className="df-input"
          type="text"
          placeholder={`Enter weight in ${d.weightUnit}`}
          value={d.weight}
          onChange={(e) => set('weight', e.target.value)}
        />
      </div>
    </div>

    <div className="df-field">
      <label className="df-label">How would you describe your body type?</label>
      <div className="df-body-row">
        {[
          { k: 'Slim', e: '🧍' },
          { k: 'Average', e: '🚶' },
          { k: 'Overweight', e: '🏃' },
          { k: 'Obese', e: '👤' },
          { k: 'Athletic', e: '💪' },
        ].map((b) => (
          <button
            key={b.k}
            className={`df-body-card ${d.bodyType === b.k ? 'sel' : ''}`}
            onClick={() => set('bodyType', b.k)}
          >
            {d.bodyType === b.k && <span className="df-chk">✓</span>}
            <span className="df-body-fig">{b.e}</span>
            <span>{b.k}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="df-field">
      <label className="df-label">Any specific other information you'd like to share?</label>
      <textarea
        className="df-textarea"
        rows={3}
        placeholder="E.g. recent weight changes, family history, etc."
        value={d.basicNotes}
        onChange={(e) => set('basicNotes', e.target.value)}
      />
    </div>
  </div>
)

/* ─── Step 2 ─────────────────────────────────────────────── */
const GOALS = [
  { k: 'Weight Loss', e: '⚖️', d: 'Lose weight & feel lighter' },
  { k: 'Fat Loss', e: '🏋️', d: 'Reduce body fat & improve shape' },
  { k: 'Muscle Gain', e: '💪', d: 'Build muscle & get stronger' },
  { k: 'PCOS Support', e: '♀️', d: 'Manage PCOS symptoms naturally' },
  { k: 'Diabetes Management', e: '💉', d: 'Control blood sugar & improve health' },
  { k: 'Thyroid Support', e: '🦋', d: 'Support thyroid health & balance' },
  { k: 'Healthy Lifestyle', e: '🌱', d: 'Maintain overall health & wellness' },
]

const Step2 = ({ d, tog }: { d: FormData; tog: ToglFn }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">🎯</div>
      <div className="df-hd-text">
        <h2>What are your health &amp; fitness goals?</h2>
        <p>Select all that apply. This helps us create the perfect plan for you.</p>
      </div>
    </div>
    <div className="df-goals-grid">
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
    <div className="df-tip-box">
      💡 <strong>Not sure?</strong> You can select multiple goals. Our experts will customize your plan accordingly.
    </div>
  </div>
)

/* ─── Step 3 ─────────────────────────────────────────────── */
const Step3 = ({ d, set }: { d: FormData; set: SetFn }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">🏃</div>
      <div className="df-hd-text">
        <h2>Tell us about your lifestyle</h2>
        <p>This helps us understand your routine and create a plan that fits your life.</p>
      </div>
    </div>

    <div className="df-grid-3">
      <div className="df-card-field">
        <label className="df-label">Activity Level</label>
        <p className="df-field-sub">How active are you on a daily basis?</p>
        <select
          className="df-select"
          value={d.activityLevel}
          onChange={(e) => set('activityLevel', e.target.value)}
        >
          <option value="">Select</option>
          <option>Sedentary (little or no exercise)</option>
          <option>Lightly Active (1–3 days/week)</option>
          <option>Moderately Active</option>
          <option>Very Active (6–7 days/week)</option>
          <option>Super Active (athlete)</option>
        </select>
      </div>
      <div className="df-card-field">
        <label className="df-label">Sleep Duration</label>
        <p className="df-field-sub">How many hours do you sleep daily?</p>
        <select
          className="df-select"
          value={d.sleepDuration}
          onChange={(e) => set('sleepDuration', e.target.value)}
        >
          <option value="">Select</option>
          <option>Less than 5 hours</option>
          <option>5 – 6 hours</option>
          <option>6 – 7 hours</option>
          <option>7 – 8 hours</option>
          <option>More than 8 hours</option>
        </select>
      </div>
      <div className="df-card-field">
        <label className="df-label">Water Intake</label>
        <p className="df-field-sub">How much water do you drink daily?</p>
        <select
          className="df-select"
          value={d.waterIntake}
          onChange={(e) => set('waterIntake', e.target.value)}
        >
          <option value="">Select</option>
          <option>Less than 1 liter</option>
          <option>1 – 2 liters</option>
          <option>2 – 3 liters</option>
          <option>3 – 4 liters</option>
          <option>More than 4 liters</option>
        </select>
      </div>
    </div>

    <div className="df-grid-3">
      <div className="df-card-field">
        <label className="df-label">Work Type</label>
        <p className="df-field-sub">What type of work do you do?</p>
        <div className="df-btn-grp">
          {['Desk Job', 'Standing Job', 'Physical Job'].map((w) => (
            <button
              key={w}
              className={`df-opt-btn ${d.workType === w ? 'sel' : ''}`}
              onClick={() => set('workType', w)}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      <div className="df-card-field">
        <label className="df-label">Workout Frequency</label>
        <p className="df-field-sub">How often do you workout?</p>
        <select
          className="df-select"
          value={d.workoutFrequency}
          onChange={(e) => set('workoutFrequency', e.target.value)}
        >
          <option value="">Select</option>
          <option>Never</option>
          <option>1 time per week</option>
          <option>2 – 3 times per week</option>
          <option>4 – 5 times per week</option>
          <option>Daily</option>
        </select>
      </div>
      <div className="df-card-field">
        <label className="df-label">
          Workout Type <span className="df-opt">(Optional)</span>
        </label>
        <p className="df-field-sub">What type of workouts do you prefer?</p>
        <select
          className="df-select"
          value={d.workoutType}
          onChange={(e) => set('workoutType', e.target.value)}
        >
          <option value="">Select</option>
          <option>None</option>
          <option>Gym / Strength Training</option>
          <option>Yoga / Meditation</option>
          <option>Running / Cardio</option>
          <option>Sports</option>
          <option>Mixed</option>
        </select>
      </div>
    </div>

    <div className="df-card-field">
      <label className="df-label">
        Daily Step Count <span className="df-opt">(Optional)</span>
      </label>
      <p className="df-field-sub">On average, how many steps do you take daily?</p>
      <div className="df-seg-grp">
        {['< 2,000', '2,000 – 5,000', '5,000 – 8,000', '8,000 – 12,000', '> 12,000'].map((s) => (
          <button
            key={s}
            className={`df-seg-btn ${d.dailySteps === s ? 'sel' : ''}`}
            onClick={() => set('dailySteps', s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>

    <div className="df-tip-box">💡 Tip: Be honest! The more accurate your answers, the better your plan will be.</div>
  </div>
)

/* ─── Step 4 ─────────────────────────────────────────────── */
const Step4 = ({ d, set, tog }: { d: FormData; set: SetFn; tog: ToglFn }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">🥗</div>
      <div className="df-hd-text">
        <h2>Tell us about your food preferences</h2>
        <p>This helps us create a diet plan with meals you enjoy and ingredients you prefer.</p>
      </div>
    </div>

    <div className="df-grid-3">
      <div className="df-card-field">
        <label className="df-label">Diet Type</label>
        <p className="df-field-sub">What type of diet do you follow?</p>
        <div className="df-btn-grp">
          {['Vegetarian', 'Non-Vegetarian', 'Eggetarian'].map((t) => (
            <button
              key={t}
              className={`df-opt-btn ${d.dietType === t ? 'sel' : ''}`}
              onClick={() => set('dietType', t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="df-card-field">
        <label className="df-label">Cuisine Preference</label>
        <p className="df-field-sub">Which cuisine do you prefer?</p>
        <select
          className="df-select"
          value={d.cuisinePreference}
          onChange={(e) => set('cuisinePreference', e.target.value)}
        >
          <option value="">Select</option>
          <option>North Indian</option>
          <option>South Indian</option>
          <option>Bengali</option>
          <option>Gujarati</option>
          <option>Punjabi</option>
          <option>Maharashtrian</option>
          <option>No Preference</option>
        </select>
      </div>
      <div className="df-card-field">
        <label className="df-label">Preferred Meals</label>
        <p className="df-field-sub">Select your preferred meal options</p>
        <div className="df-tag-grp">
          {['Home Cooked', 'Restaurant Food', 'Meal Prep', 'No Preference'].map((m) => (
            <button
              key={m}
              className={`df-tag ${d.preferredMeals.includes(m) ? 'sel' : ''}`}
              onClick={() => tog('preferredMeals', m)}
            >
              {m} {d.preferredMeals.includes(m) ? '✓' : ''}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="df-grid-3">
      <div className="df-card-field">
        <label className="df-label">Food Allergies / Intolerances</label>
        <p className="df-field-sub">Do you have any allergies?</p>
        <select
          className="df-select"
          value={d.foodAllergies}
          onChange={(e) => set('foodAllergies', e.target.value)}
        >
          <option value="">Select</option>
          <option>None</option>
          <option>Gluten</option>
          <option>Dairy / Lactose</option>
          <option>Nuts</option>
          <option>Soy</option>
          <option>Eggs</option>
        </select>
      </div>
      <div className="df-card-field">
        <label className="df-label">Foods You Dislike</label>
        <p className="df-field-sub">Any foods you dislike or want to avoid?</p>
        <input
          className="df-input"
          type="text"
          placeholder="e.g., mushrooms, tofu, etc."
          value={d.foodsDislike}
          onChange={(e) => set('foodsDislike', e.target.value)}
        />
      </div>
      <div className="df-card-field">
        <label className="df-label">
          Favourite Foods <span className="df-opt">(Optional)</span>
        </label>
        <p className="df-field-sub">Tell us what you love!</p>
        <input
          className="df-input"
          type="text"
          placeholder="e.g., dal, paneer, rajma, oats, etc."
          value={d.favoriteFoods}
          onChange={(e) => set('favoriteFoods', e.target.value)}
        />
      </div>
    </div>

    <div className="df-card-field">
      <label className="df-label">Meal Timings</label>
      <p className="df-field-sub">What is your usual meal schedule?</p>
      <div className="df-timings-row">
        {[
          { lbl: 'Breakfast', icon: '☀️', key: 'breakfastTime', opt: false },
          { lbl: 'Mid-morning', icon: '☕', key: 'midMorningTime', opt: true },
          { lbl: 'Lunch', icon: '🌤️', key: 'lunchTime', opt: false },
          { lbl: 'Evening Snack', icon: '🌅', key: 'eveningSnackTime', opt: true },
          { lbl: 'Dinner', icon: '🌙', key: 'dinnerTime', opt: false },
        ].map((t) => (
          <div key={t.key} className="df-timing-col">
            <span className="df-timing-lbl">
              {t.icon} {t.lbl}
              {t.opt && <span className="df-opt"> (Opt)</span>}
            </span>
            <select
              className="df-select"
              value={(d as unknown as Record<string, string>)[t.key]}
              onChange={(e) => set(t.key as keyof FormData, e.target.value)}
            >
              {TIMES.map((tt) => (
                <option key={tt}>{tt}</option>
              ))}
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
const Step5 = ({ d, set, tog }: { d: FormData; set: SetFn; tog: ToglFn }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">🏥</div>
      <div className="df-hd-text">
        <h2>Tell us about your health</h2>
        <p>This helps us create a safe and effective plan tailored just for you.</p>
      </div>
    </div>

    <div className="df-grid-2">
      <div className="df-card-field">
        <label className="df-label">Do you have any medical conditions?</label>
        <p className="df-field-sub">(Select all that apply)</p>
        <div className="df-check-grid">
          {['Diabetes', 'Thyroid', 'PCOS / PCOD', 'High BP', 'Cholesterol', 'Heart Condition', 'None'].map(
            (c) => (
              <label key={c} className={`df-chk-lbl ${d.medicalConditions.includes(c) ? 'sel' : ''}`}>
                <input
                  type="checkbox"
                  checked={d.medicalConditions.includes(c)}
                  onChange={() => tog('medicalConditions', c)}
                />
                {c}
              </label>
            ),
          )}
          <label className={`df-chk-lbl ${d.medicalConditions.includes('Other') ? 'sel' : ''}`}>
            <input
              type="checkbox"
              checked={d.medicalConditions.includes('Other')}
              onChange={() => tog('medicalConditions', 'Other')}
            />
            Other
          </label>
        </div>
        {d.medicalConditions.includes('Other') && (
          <input
            className="df-input"
            style={{ marginTop: 8 }}
            type="text"
            placeholder="Please specify"
            value={d.otherCondition}
            onChange={(e) => set('otherCondition', e.target.value)}
          />
        )}
      </div>

      <div className="df-card-field">
        <label className="df-label">Are you currently on any medication?</label>
        <div className="df-radio-grp">
          {['Yes, regularly', 'Yes, occasionally', 'No'].map((opt) => (
            <label key={opt} className="df-radio-lbl">
              <input
                type="radio"
                name="onMed"
                checked={d.onMedication === opt}
                onChange={() => set('onMedication', opt)}
              />
              {opt}
            </label>
          ))}
        </div>
        {(d.onMedication === 'Yes, regularly' || d.onMedication === 'Yes, occasionally') && (
          <div style={{ marginTop: 12 }}>
            <label className="df-label">
              Please list your medications <span className="df-opt">(optional)</span>
            </label>
            <textarea
              className="df-textarea"
              rows={3}
              placeholder="e.g., Metformin, Thyroxine, Vitamin D"
              value={d.medications}
              onChange={(e) => set('medications', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>

    <div className="df-grid-3">
      <div className="df-card-field">
        <label className="df-label">Any food allergies or intolerances?</label>
        <p className="df-field-sub">(Select all that apply)</p>
        <div className="df-check-grid">
          {['Gluten', 'Dairy / Lactose', 'Nuts', 'Soy', 'Eggs', 'None'].map((c) => (
            <label key={c} className={`df-chk-lbl ${d.foodIntolerances.includes(c) ? 'sel' : ''}`}>
              <input
                type="checkbox"
                checked={d.foodIntolerances.includes(c)}
                onChange={() => tog('foodIntolerances', c)}
              />
              {c}
            </label>
          ))}
          <label className={`df-chk-lbl ${d.foodIntolerances.includes('Other') ? 'sel' : ''}`}>
            <input
              type="checkbox"
              checked={d.foodIntolerances.includes('Other')}
              onChange={() => tog('foodIntolerances', 'Other')}
            />
            Other
          </label>
        </div>
        {d.foodIntolerances.includes('Other') && (
          <input
            className="df-input"
            style={{ marginTop: 8 }}
            type="text"
            placeholder="Please specify"
            value={d.otherIntolerance}
            onChange={(e) => set('otherIntolerance', e.target.value)}
          />
        )}
      </div>

      <div className="df-card-field">
        <label className="df-label">Digestive Health</label>
        <p className="df-field-sub">How would you describe your digestion?</p>
        <div className="df-radio-grp">
          {['Excellent', 'Good', 'Average', 'Poor'].map((opt) => (
            <label key={opt} className="df-radio-lbl">
              <input
                type="radio"
                name="digestion"
                checked={d.digestiveHealth === opt}
                onChange={() => set('digestiveHealth', opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div className="df-card-field">
        <label className="df-label">Do you smoke or consume alcohol?</label>
        <div className="df-radio-grp">
          {['Neither', 'Smoke', 'Consume Alcohol', 'Both'].map((opt) => (
            <label key={opt} className="df-radio-lbl">
              <input
                type="radio"
                name="smokeAlc"
                checked={d.smokeAlcohol === opt}
                onChange={() => set('smokeAlcohol', opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </div>

    <div className="df-card-field">
      <label className="df-label">Anything else we should know?</label>
      <p className="df-field-sub">
        Share any other health information that might be important for your plan (optional)
      </p>
      <div className="df-ta-wrap">
        <textarea
          className="df-textarea"
          rows={3}
          maxLength={250}
          placeholder="e.g., recent surgery, pregnancy, breastfeeding, etc."
          value={d.healthNotes}
          onChange={(e) => set('healthNotes', e.target.value)}
        />
        <span className="df-char">{d.healthNotes.length}/250</span>
      </div>
    </div>
  </div>
)

/* ─── Step 6 ─────────────────────────────────────────────── */
const Step6 = ({ d, set, tog }: { d: FormData; set: SetFn; tog: ToglFn }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">💰</div>
      <div className="df-hd-text">
        <h2>Let's plan what works for you</h2>
        <p>This helps us create a plan that fits your budget and lifestyle.</p>
      </div>
    </div>

    <div className="df-grid-3">
      <div className="df-card-field">
        <label className="df-label">What is your budget for this plan?</label>
        <p className="df-field-sub">Choose the range that works best for you.</p>
        <div className="df-radio-grp">
          {[
            { v: 'Under ₹500 / month', pop: false },
            { v: '₹500 – ₹1,000 / month', pop: false },
            { v: '₹1,000 – ₹2,000 / month', pop: true },
            { v: '₹2,000 – ₹3,000 / month', pop: false },
            { v: 'Above ₹3,000 / month', pop: false },
          ].map((opt) => (
            <label key={opt.v} className="df-radio-lbl">
              <input
                type="radio"
                name="budget"
                checked={d.budget === opt.v}
                onChange={() => set('budget', opt.v)}
              />
              {opt.v}
              {opt.pop && <span className="df-pop-tag">Most Popular</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="df-card-field">
        <label className="df-label">How do you prefer your meals?</label>
        <p className="df-field-sub">Select all that apply.</p>
        <div className="df-mp-grid">
          {[
            { k: 'Home Cooked (Fresh Meals)', e: '🍳' },
            { k: 'Meal Prep / Batch Cooking', e: '🥡' },
            { k: 'Ready to Eat (Healthy Options)', e: '🥙' },
            { k: 'Food Delivery Apps', e: '🛵' },
          ].map((m) => (
            <button
              key={m.k}
              className={`df-mp-card ${d.mealPreference.includes(m.k) ? 'sel' : ''}`}
              onClick={() => tog('mealPreference', m.k)}
            >
              {d.mealPreference.includes(m.k) && <span className="df-goal-chk">✓</span>}
              <span className="df-mp-icon">{m.e}</span>
              <span>{m.k}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="df-card-field">
        <label className="df-label">How much time can you spend on preparing meals?</label>
        <p className="df-field-sub">Select one option.</p>
        <div className="df-radio-grp">
          {['Less than 30 minutes', '30 – 60 minutes', '1 – 2 hours', 'More than 2 hours'].map((opt) => (
            <label key={opt} className="df-radio-lbl">
              <input
                type="radio"
                name="prepTime"
                checked={d.prepTime === opt}
                onChange={() => set('prepTime', opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </div>

    <div className="df-grid-3">
      <div className="df-card-field">
        <label className="df-label">Grocery Shopping Preference</label>
        <p className="df-field-sub">How do you usually shop for groceries?</p>
        <select
          className="df-select"
          value={d.groceryShopping}
          onChange={(e) => set('groceryShopping', e.target.value)}
        >
          <option value="">Select</option>
          <option>Online (Instamart, BigBasket, etc.)</option>
          <option>Local market / sabzi mandi</option>
          <option>Both</option>
        </select>
      </div>

      <div className="df-card-field">
        <label className="df-label">Any cooking support at home?</label>
        <p className="df-field-sub">Select the option that applies.</p>
        <div className="df-btn-grp df-btn-grp-col">
          {['I cook myself', 'Someone helps me', 'Full-time house help'].map((c) => (
            <button
              key={c}
              className={`df-opt-btn ${d.cookingSupport === c ? 'sel' : ''}`}
              onClick={() => set('cookingSupport', c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="df-card-field">
        <label className="df-label">
          Any other preferences? <span className="df-opt">(Optional)</span>
        </label>
        <p className="df-field-sub">Tell us anything else we should keep in mind while planning your diet.</p>
        <div className="df-ta-wrap">
          <textarea
            className="df-textarea"
            rows={4}
            maxLength={250}
            placeholder="e.g., I travel frequently, eat out on weekends, religious fasting, etc."
            value={d.otherPreferences}
            onChange={(e) => set('otherPreferences', e.target.value)}
          />
          <span className="df-char">{d.otherPreferences.length}/250</span>
        </div>
      </div>
    </div>

    <div className="df-tip-box">💡 Tip: Don't worry, you can always update your preferences later.</div>
  </div>
)

/* ─── Step 7 ─────────────────────────────────────────────── */
const Step7 = ({ d, set }: { d: FormData; set: SetFn }) => (
  <div className="df-step-content">
    <div className="df-step-hd">
      <div className="df-hd-icon">📧</div>
      <div className="df-hd-text">
        <h2>Almost done! Just a few details</h2>
        <p>We'll use this to deliver your personalized diet plan.</p>
      </div>
    </div>

    <div className="df-grid-2">
      <div className="df-card-field">
        <label className="df-label">Contact Information</label>
        <p className="df-field-sub">How can we reach you?</p>
        <div className="df-field" style={{ marginTop: 14 }}>
          <label className="df-label">Full Name</label>
          <div className="df-input-wrap">
            <span className="df-icon">👤</span>
            <input
              className="df-input"
              type="text"
              placeholder="Enter your full name"
              value={d.contactName}
              onChange={(e) => set('contactName', e.target.value)}
            />
          </div>
        </div>
        <div className="df-field" style={{ marginTop: 12 }}>
          <label className="df-label">WhatsApp Number</label>
          <div className="df-phone-row">
            <select className="df-phone-code">
              <option>+91</option>
            </select>
            <div className="df-input-wrap" style={{ flex: 1 }}>
              <span className="df-icon">📱</span>
              <input
                className="df-input"
                type="tel"
                placeholder="Enter your WhatsApp number"
                value={d.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="df-field" style={{ marginTop: 12 }}>
          <label className="df-label">
            Email Address <span className="df-opt">(Optional)</span>
          </label>
          <div className="df-input-wrap">
            <span className="df-icon">📧</span>
            <input
              className="df-input"
              type="email"
              placeholder="Enter your email address"
              value={d.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="df-card-field">
        <label className="df-label">Where should we send your plan?</label>
        <p className="df-field-sub">Select your preferred option</p>
        <div className="df-delivery-grid">
          {[
            { k: 'whatsapp', e: '💬', lbl: 'WhatsApp', sub: 'Get your plan on WhatsApp (instantly)' },
            { k: 'email', e: '📧', lbl: 'Email', sub: 'Get your plan on Email' },
          ].map((m) => (
            <button
              key={m.k}
              className={`df-delivery-card ${d.deliveryMethod === m.k ? 'sel' : ''}`}
              onClick={() => set('deliveryMethod', m.k)}
            >
              <div className={`df-radio-circle ${d.deliveryMethod === m.k ? 'sel' : ''}`} />
              <span className="df-delivery-icon">{m.e}</span>
              <strong>{m.lbl}</strong>
              <span>{m.sub}</span>
            </button>
          ))}
        </div>
        <div className="df-delivery-note">✦ We'll send your plan within 24 hours after you complete this form.</div>
      </div>
    </div>

    <div className="df-grid-2">
      <div className="df-card-field">
        <label className="df-label">Your Location</label>
        <p className="df-field-sub">
          This helps us suggest meals &amp; ingredients easily available near you.
        </p>
        <div className="df-field" style={{ marginTop: 14 }}>
          <label className="df-label">📍 City</label>
          <select className="df-select" value={d.city} onChange={(e) => set('city', e.target.value)}>
            <option value="">Select your city</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="df-field" style={{ marginTop: 12 }}>
          <label className="df-label">📍 State</label>
          <select className="df-select" value={d.state} onChange={(e) => set('state', e.target.value)}>
            <option value="">Select your state</option>
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="df-card-field">
        <label className="df-label">
          Anything else you want us to know? <span className="df-opt">(Optional)</span>
        </label>
        <p className="df-field-sub">
          Share anything important we should keep in mind while creating your plan.
        </p>
        <div className="df-ta-wrap">
          <textarea
            className="df-textarea"
            rows={6}
            maxLength={250}
            placeholder="e.g., I have irregular eating habits, travel frequently, prefer no onion garlic, etc."
            value={d.finalNotes}
            onChange={(e) => set('finalNotes', e.target.value)}
          />
          <span className="df-char">{d.finalNotes.length}/250</span>
        </div>
      </div>
    </div>
  </div>
)

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
  </aside>
)

/* ─── Main Component ──────────────────────────────────────── */
const DietForm = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(INIT)
  const [submitted, setSubmitted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const set: SetFn = (k, v) => setData((p) => ({ ...p, [k]: v }))
  const tog: ToglFn = (k, v) => {
    const arr = data[k] as string[]
    set(k, arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  }

  const go = (n: number) => {
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
            personalized diet plan to your {data.deliveryMethod === 'whatsapp' ? 'WhatsApp' : 'email'} within
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
                Step <strong>{step}</strong> of 7
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
              {step === 1 && <Step1 d={data} set={set} />}
              {step === 2 && <Step2 d={data} tog={tog} />}
              {step === 3 && <Step3 d={data} set={set} />}
              {step === 4 && <Step4 d={data} set={set} tog={tog} />}
              {step === 5 && <Step5 d={data} set={set} tog={tog} />}
              {step === 6 && <Step6 d={data} set={set} tog={tog} />}
              {step === 7 && <Step7 d={data} set={set} />}
            </div>

            <div className="df-nav-footer">
              <button className="df-back-btn" onClick={() => (step === 1 ? onClose() : go(step - 1))}>
                ← {step === 1 ? 'Close' : 'Back'}
              </button>
              {step < 7 ? (
                <button className="btn-primary df-next-btn" onClick={() => go(step + 1)}>
                  Next Step →
                </button>
              ) : (
                <button className="btn-primary df-next-btn" onClick={() => setSubmitted(true)}>
                  Submit &amp; Get My Plan →
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
          <span>7 Simple Steps</span>
          <span className="df-form-timing-dot">●</span>
          <span>Lifetime of Benefits</span>
        </div>
      </div>
    </div>
  )
}

export default DietForm
