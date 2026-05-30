// Maps all frontend FormData values → backend API payload

type FormData = Record<string, unknown>

// ── Lookup maps ─────────────────────────────────────────────

const GENDER: Record<string, string> = {
  'Male':              'male',
  'Female':            'female',
  'Other':             'other',
  'Prefer not to say': 'prefer_not_to_say',
}

const HEIGHT_UNIT: Record<string, string> = {
  'cm':    'cm',
  'ft/in': 'ft_in',
}

const WEIGHT_UNIT: Record<string, string> = {
  'kg':  'kg',
  'lbs': 'lbs',
}

const GOALS: Record<string, string> = {
  'Weight Loss':       'weight_loss',
  'Fat Loss':          'fat_loss',
  'Muscle Gain':       'muscle_gain',
  'PCOS Support':      'pcos_support',
  'Healthy Lifestyle': 'healthy_lifestyle',
}

const ACTIVITY: Record<string, string> = {
  'Sedentary (little or no exercise)': 'sedentary',
  'Lightly Active (1–3 days/week)':    'lightly_active',
  'Moderately Active':                 'moderately_active',
  'Very Active (6–7 days/week)':       'very_active',
  'Super Active (athlete)':            'super_active',
}

const WORK_TYPE: Record<string, string> = {
  'Desk Job':     'desk_job',
  'Standing Job': 'standing_job',
  'Physical Job': 'physical_job',
}

const WORKOUT_TYPE: Record<string, string> = {
  'None':                   'none',
  'Gym / Strength Training': 'gym',
  'Yoga / Meditation':      'yoga',
  'Running / Cardio':       'running',
  'Sports':                 'sports',
  'Mixed':                  'mixed',
}

const DIET_TYPE: Record<string, string> = {
  'Vegetarian':     'vegetarian',
  'Non-Vegetarian': 'non_vegetarian',
  'Eggetarian':     'eggetarian',
}

const CUISINE: Record<string, string> = {
  'North Indian':  'north_indian',
  'South Indian':  'south_indian',
  'Bengali':       'bengali',
  'Gujarati':      'gujarati',
  'Punjabi':       'punjabi',
  'Maharashtrian': 'maharashtrian',
  'No Preference': 'no_preference',
}

const PREFERRED_MEALS: Record<string, string> = {
  'Home Cooked':    'home_cooked',
  'Restaurant Food':'restaurant',
  'Meal Prep':      'meal_prep',
  'No Preference':  'no_preference',
}

const ALLERGIES: Record<string, string> = {
  'None':            'none',
  'Gluten':          'gluten',
  'Dairy / Lactose': 'dairy_lactose',
  'Nuts':            'nuts',
  'Soy':             'soy',
  'Eggs':            'eggs',
}

const ON_MEDICATION: Record<string, string> = {
  'Yes, regularly':   'yes_regularly',
  'Yes, occasionally':'yes_occasionally',
  'No':               'no',
}

const DIGESTIVE: Record<string, string> = {
  'Excellent': 'excellent',
  'Good':      'good',
  'Average':   'average',
  'Poor':      'poor',
}

const SMOKE_ALCOHOL: Record<string, string> = {
  'Neither':        'neither',
  'Smoke':          'smoke',
  'Consume Alcohol':'alcohol',
  'Both':           'both',
}

const DELIVERY_METHOD: Record<string, string> = {
  'whatsapp': 'whatsapp',
  'email':    'email',
}

// ── Helpers ──────────────────────────────────────────────────

function lookup(map: Record<string, string>, val: string) {
  return map[val] ?? val
}

function lookupArr(map: Record<string, string>, arr: string[]) {
  return arr.map(v => map[v] ?? v).filter(Boolean)
}

// "8:00 AM" → "08:00",  "1:30 PM" → "13:30"
function toHHMM(t: string): string {
  if (!t) return ''
  const [time, period] = t.split(' ')
  const [hStr, m] = time.split(':')
  let h = parseInt(hStr, 10)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${m}`
}

function omitEmpty(val: unknown) {
  if (val === '' || val === null || val === undefined) return undefined
  if (Array.isArray(val) && val.length === 0) return undefined
  return val
}

// ── Main mapper ───────────────────────────────────────────────

export function mapFormToPayload(d: FormData) {
  const payload: Record<string, unknown> = {}

  const set = (key: string, val: unknown) => {
    const v = omitEmpty(val)
    if (v !== undefined) payload[key] = v
  }

  // ── Step 1: Basic Details & Goals ──
  set('full_name',   d.fullName)
  set('age',         d.age ? Number(d.age) : undefined)
  set('gender',      lookup(GENDER,       String(d.gender      ?? '')))
  set('dob',         d.dob)
  set('height_unit', lookup(HEIGHT_UNIT,  String(d.heightUnit  ?? '')))
  set('height',      d.height ? Number(d.height) : undefined)
  set('weight_unit', lookup(WEIGHT_UNIT,  String(d.weightUnit  ?? '')))
  set('weight',      d.weight ? Number(d.weight) : undefined)
  set('goals',       lookupArr(GOALS, (d.goals as string[]) ?? []))

  // ── Step 2: Lifestyle ──
  set('activity_level', lookup(ACTIVITY,     String(d.activityLevel ?? '')))
  set('work_type',      lookup(WORK_TYPE,    String(d.workType      ?? '')))
  set('workout_type',   lookup(WORKOUT_TYPE, String(d.workoutType   ?? '')))

  // ── Step 3: Food Preferences ──
  set('diet_type',          lookup(DIET_TYPE, String(d.dietType ?? '')))
  set('cuisine_preference', (d.cuisinePreference as string[] | undefined)?.length
    ? (d.cuisinePreference as string[]).map((v: string) => lookup(CUISINE, v))
    : undefined)
  set('preferred_meals', (d.preferredMeals as string[] ?? []).map(v => PREFERRED_MEALS[v] ?? v))
  set('food_allergies',  d.foodAllergies
    ? [lookup(ALLERGIES, String(d.foodAllergies))]
    : undefined)
  set('foods_dislike',   d.foodsDislike)
  set('favorite_foods',  d.favoriteFoods)
  set('breakfast_time',     toHHMM(String(d.breakfastTime    ?? '')))
  set('mid_morning_time',   toHHMM(String(d.midMorningTime   ?? '')))
  set('lunch_time',         toHHMM(String(d.lunchTime        ?? '')))
  set('evening_snack_time', toHHMM(String(d.eveningSnackTime ?? '')))
  set('dinner_time',        toHHMM(String(d.dinnerTime       ?? '')))

  // ── Step 4: Health & Medical ──
  set('medical_conditions', (d.medicalConditions as string[] ?? [])
    .filter(v => v !== 'Other')
    .map(v => v.toLowerCase().replace(/[\s\/]+/g, '_')))
  set('other_condition',  d.otherCondition)
  set('on_medication',    lookup(ON_MEDICATION, String(d.onMedication   ?? '')))
  set('medications',      d.medications)
  set('digestive_health', lookup(DIGESTIVE,     String(d.digestiveHealth ?? '')))
  set('smoke_alcohol',    lookup(SMOKE_ALCOHOL, String(d.smokeAlcohol   ?? '')))
  set('health_notes',     d.healthNotes)

  // ── Step 5: Contact Details ──
  set('contact_name',    d.contactName)
  set('whatsapp',        d.whatsapp
    ? `+91${String(d.whatsapp).replace(/^\+91/, '')}`
    : undefined)
  set('email',           d.email)
  set('delivery_method', lookupArr(DELIVERY_METHOD, (d.deliveryMethod as string[]) ?? []))
  set('city',            d.city)
  set('state',           d.state)
  set('state_code',      d.stateCode)
  set('final_notes',     d.finalNotes)

  return payload
}
