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
  'Rajasthani':    'rajasthani',
  'Kerala':        'kerala',
  'Hyderabadi':    'hyderabadi',
  'Odia':          'odia',
  'Bihari':        'bihari',
  'Kashmiri':      'kashmiri',
  'Continental':   'continental',
  'No Preference': 'no_preference',
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
  'Neither':             'neither',
  'Smoke':               'smoke',
  'Occasionally Smoke':  'occasionally_smoke',
  'Consume Alcohol':     'alcohol',
  'Occasionally Drink':  'occasionally_drink',
  'Both':                'both',
}

const DELIVERY_METHOD: Record<string, string> = {
  'whatsapp': 'whatsapp',
  'email':    'email',
}

const WHEY_PROTEIN: Record<string, string> = {
  'Yes, I already use it': 'yes_using',
  'Open to trying it':     'open_to_trying',
  'No, prefer food-only':  'no_food_only',
}

const PLAN_TYPE: Record<string, number> = {
  '1 Week':   1,
  '1 Month':  2,
  '3 Months': 3,
}

// ── Helpers ──────────────────────────────────────────────────

function lookup(map: Record<string, string>, val: string) {
  return map[val] ?? val
}

function lookupArr(map: Record<string, string>, arr: string[]) {
  return arr.map(v => map[v] ?? v).filter(Boolean)
}

function omitEmpty(val: unknown) {
  if (val === '' || val === null || val === undefined) return undefined
  if (Array.isArray(val) && val.length === 0) return undefined
  return val
}

// ── Per-step mappers (step-by-step API) ──────────────────────

export function mapStep1ToPayload(d: FormData) {
  const p: Record<string, unknown> = {}
  const s = (k: string, v: unknown) => { const val = omitEmpty(v); if (val !== undefined) p[k] = val }

  s('full_name',   d.fullName)
  s('age',         d.age ? Number(d.age) : undefined)
  s('gender',      lookup(GENDER, String(d.gender ?? '')))
  s('dob',         d.dob)
  s('height_unit', lookup(HEIGHT_UNIT, String(d.heightUnit ?? '')))
  s('height',      d.height ? Number(d.height) : undefined)
  s('weight_unit', lookup(WEIGHT_UNIT, String(d.weightUnit ?? '')))
  s('weight',      d.weight ? Number(d.weight) : undefined)
  s('goals',       lookupArr(GOALS, (d.goals as string[]) ?? []))
  s('plan_type',   d.planType ? PLAN_TYPE[String(d.planType)] : undefined)
  s('email',       d.email)
  s('whatsapp',    d.whatsapp
    ? `+91${String(d.whatsapp).replace(/^\+91/, '')}`
    : undefined)
  return p
}

export function mapStep2ToPayload(d: FormData) {
  const p: Record<string, unknown> = {}
  const s = (k: string, v: unknown) => { const val = omitEmpty(v); if (val !== undefined) p[k] = val }

  s('activity_level',    lookup(ACTIVITY,     String(d.activityLevel ?? '')))
  s('work_type',         lookup(WORK_TYPE,    String(d.workType      ?? '')))
  s('workout_type',      lookup(WORKOUT_TYPE, String(d.workoutType   ?? '')))
  s('breakfast_time',    d.breakfastTime)
  s('lunch_time',        d.lunchTime)
  s('evening_snack_time',d.eveningSnackTime)
  s('dinner_time',       d.dinnerTime)
  return p
}

export function mapStep3ToPayload(d: FormData) {
  const p: Record<string, unknown> = {}
  const s = (k: string, v: unknown) => { const val = omitEmpty(v); if (val !== undefined) p[k] = val }

  s('diet_type',          lookup(DIET_TYPE, String(d.dietType ?? '')))
  s('cuisine_preference', (d.cuisinePreference as string[] | undefined)?.length
    ? (d.cuisinePreference as string[]).map((v: string) => lookup(CUISINE, v))
    : undefined)
  s('food_allergies',  d.foodAllergies
    ? [lookup(ALLERGIES, String(d.foodAllergies))]
    : undefined)
  s('foods_dislike',   d.foodsDislike)
  s('favorite_foods',  d.favoriteFoods)
  s('whey_protein',    d.wheyProtein ? lookup(WHEY_PROTEIN, String(d.wheyProtein)) : undefined)
  return p
}

export function mapStep4ToPayload(d: FormData) {
  const p: Record<string, unknown> = {}
  const s = (k: string, v: unknown) => { const val = omitEmpty(v); if (val !== undefined) p[k] = val }

  s('medical_conditions', (d.medicalConditions as string[] ?? [])
    .filter(v => v !== 'Other')
    .map(v => v.toLowerCase().replace(/[\s\/]+/g, '_')))
  s('other_condition',  d.otherCondition)
  s('on_medication',    lookup(ON_MEDICATION, String(d.onMedication   ?? '')))
  s('medications',      d.medications)
  s('digestive_health', lookup(DIGESTIVE,     String(d.digestiveHealth ?? '')))
  s('smoke_alcohol',    lookup(SMOKE_ALCOHOL, String(d.smokeAlcohol   ?? '')))
  s('health_notes',     d.healthNotes)
  return p
}

export function mapStep5ToPayload(d: FormData) {
  const p: Record<string, unknown> = {}
  const s = (k: string, v: unknown) => { const val = omitEmpty(v); if (val !== undefined) p[k] = val }

  s('plan_type',       d.planType ? PLAN_TYPE[String(d.planType)] : undefined)
  s('contact_name',    d.contactName)
  s('delivery_method', lookupArr(DELIVERY_METHOD, (d.deliveryMethod as string[]) ?? []))
  s('city',            d.city)
  s('state',           d.state)
  s('state_code',      d.stateCode)
  s('final_notes',     d.finalNotes)
  return p
}

// ── Main mapper (kept for backward compatibility) ─────────────

export function mapFormToPayload(d: FormData) {
  const payload: Record<string, unknown> = {}

  const set = (key: string, val: unknown) => {
    const v = omitEmpty(val)
    if (v !== undefined) payload[key] = v
  }

  // ── Plan ──
  set('plan_type', d.planType ? PLAN_TYPE[String(d.planType)] : undefined)

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
  set('activity_level',    lookup(ACTIVITY,     String(d.activityLevel ?? '')))
  set('work_type',         lookup(WORK_TYPE,    String(d.workType      ?? '')))
  set('workout_type',      lookup(WORKOUT_TYPE, String(d.workoutType   ?? '')))
  set('breakfast_time',    d.breakfastTime)
  set('lunch_time',        d.lunchTime)
  set('evening_snack_time',d.eveningSnackTime)
  set('dinner_time',       d.dinnerTime)

  // ── Step 3: Food Preferences ──
  set('diet_type',          lookup(DIET_TYPE, String(d.dietType ?? '')))
  set('cuisine_preference', (d.cuisinePreference as string[] | undefined)?.length
    ? (d.cuisinePreference as string[]).map((v: string) => lookup(CUISINE, v))
    : undefined)
  set('food_allergies',  d.foodAllergies
    ? [lookup(ALLERGIES, String(d.foodAllergies))]
    : undefined)
  set('foods_dislike',   d.foodsDislike)
  set('favorite_foods',  d.favoriteFoods)
  set('whey_protein',    d.wheyProtein ? lookup(WHEY_PROTEIN, String(d.wheyProtein)) : undefined)

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
