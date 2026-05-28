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
  'cm':   'cm',
  'ft/in':'ft_in',
}

const WEIGHT_UNIT: Record<string, string> = {
  'kg':  'kg',
  'lbs': 'lbs',
}

const BODY_TYPE: Record<string, string> = {
  'Slim':       'slim',
  'Average':    'average',
  'Overweight': 'overweight',
  'Obese':      'obese',
  'Athletic':   'athletic',
}

const GOALS: Record<string, string> = {
  'Weight Loss':          'weight_loss',
  'Fat Loss':             'fat_loss',
  'Muscle Gain':          'muscle_gain',
  'PCOS Support':         'pcos_support',
  'Diabetes Management':  'diabetes_management',
  'Thyroid Support':      'thyroid_support',
  'Healthy Lifestyle':    'healthy_lifestyle',
}

const ACTIVITY: Record<string, string> = {
  'Sedentary (little or no exercise)': 'sedentary',
  'Lightly Active (1–3 days/week)':    'lightly_active',
  'Moderately Active':                 'moderately_active',
  'Very Active (6–7 days/week)':       'very_active',
  'Super Active (athlete)':            'super_active',
}

const SLEEP: Record<string, string> = {
  'Less than 5 hours': 'less_than_5',
  '5 – 6 hours':       '5_6',
  '6 – 7 hours':       '6_7',
  '7 – 8 hours':       '7_8',
  'More than 8 hours': 'more_than_8',
}

const WATER: Record<string, string> = {
  'Less than 1 liter': 'less_than_1l',
  '1 – 2 liters':      '1_2l',
  '2 – 3 liters':      '2_3l',
  '3 – 4 liters':      '3_4l',
  'More than 4 liters':'more_than_4l',
}

const WORK_TYPE: Record<string, string> = {
  'Desk Job':     'desk_job',
  'Standing Job': 'standing_job',
  'Physical Job': 'physical_job',
}

const WORKOUT_FREQ: Record<string, string> = {
  'Never':                 'never',
  '1 time per week':       '1x',
  '2 – 3 times per week':  '2_3x',
  '4 – 5 times per week':  '4_5x',
  'Daily':                 'daily',
}

const WORKOUT_TYPE: Record<string, string> = {
  'None':                  'none',
  'Gym / Strength Training':'gym',
  'Yoga / Meditation':     'yoga',
  'Running / Cardio':      'running',
  'Sports':                'sports',
  'Mixed':                 'mixed',
}

const DAILY_STEPS: Record<string, string> = {
  '< 2,000':        'less_2k',
  '2,000 – 5,000':  '2k_5k',
  '5,000 – 8,000':  '5k_8k',
  '8,000 – 12,000': '8k_12k',
  '> 12,000':       'more_12k',
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
  'None':           'none',
  'Gluten':         'gluten',
  'Dairy / Lactose':'dairy_lactose',
  'Nuts':           'nuts',
  'Soy':            'soy',
  'Eggs':           'eggs',
}

const INTOLERANCES: Record<string, string> = {
  'None':           'none',
  'Gluten':         'gluten',
  'Dairy / Lactose':'lactose',
  'Nuts':           'nuts',
  'Soy':            'soy',
  'Eggs':           'eggs',
  'Other':          'other',
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

const BUDGET: Record<string, string> = {
  'Under ₹500 / month':      'under_500',
  '₹500 – ₹1,000 / month':   '500_1k',
  '₹1,000 – ₹2,000 / month': '1k_2k',
  '₹2,000 – ₹3,000 / month': '2k_3k',
  'Above ₹3,000 / month':    'above_3k',
}

const MEAL_PREF: Record<string, string> = {
  'Home Cooked (Fresh Meals)':      'home_cooked',
  'Meal Prep / Batch Cooking':      'meal_prep',
  'Ready to Eat (Healthy Options)': 'ready_to_eat',
  'Food Delivery Apps':             'food_delivery',
}

const PREP_TIME: Record<string, string> = {
  'Less than 30 minutes': 'less_30min',
  '30 – 60 minutes':      '30_60min',
  '1 – 2 hours':          '1_2hrs',
  'More than 2 hours':    'more_2hrs',
}

const GROCERY: Record<string, string> = {
  'Online (Instamart, BigBasket, etc.)': 'online',
  'Local market / sabzi mandi':          'local_market',
  'Both':                                'both',
}

const COOKING_SUPPORT: Record<string, string> = {
  'I cook myself':        'self',
  'Someone helps me':     'someone_helps',
  'Full-time house help': 'full_time_help',
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

  // Step 1
  set('full_name',   d.fullName)
  set('age',         d.age ? Number(d.age) : undefined)
  set('gender',      lookup(GENDER,      String(d.gender ?? '')))
  set('dob',         d.dob)
  set('height_unit', lookup(HEIGHT_UNIT, String(d.heightUnit ?? '')))
  set('height',      d.height)
  set('weight_unit', lookup(WEIGHT_UNIT, String(d.weightUnit ?? '')))
  set('weight',      d.weight ? Number(d.weight) : undefined)
  set('body_type',   d.bodyType ? lookup(BODY_TYPE, String(d.bodyType)) : undefined)
  set('basic_notes', d.basicNotes)

  // Step 2
  set('goals', lookupArr(GOALS, (d.goals as string[]) ?? []))

  // Step 3
  set('activity_level',   lookup(ACTIVITY,     String(d.activityLevel    ?? '')))
  set('sleep_duration',   lookup(SLEEP,         String(d.sleepDuration    ?? '')))
  set('water_intake',     lookup(WATER,         String(d.waterIntake      ?? '')))
  set('work_type',        lookup(WORK_TYPE,     String(d.workType         ?? '')))
  set('workout_frequency',lookup(WORKOUT_FREQ,  String(d.workoutFrequency ?? '')))
  set('workout_type',     d.workoutType ? lookup(WORKOUT_TYPE,  String(d.workoutType)) : undefined)
  set('daily_steps',      d.dailySteps  ? lookup(DAILY_STEPS,  String(d.dailySteps))  : undefined)

  // Step 4
  set('diet_type',         lookup(DIET_TYPE, String(d.dietType ?? '')))
  set('cuisine_preference',d.cuisinePreference ? [lookup(CUISINE, String(d.cuisinePreference))] : undefined)
  set('preferred_meals',   d.preferredMeals
    ? (d.preferredMeals as string[]).map(v => PREFERRED_MEALS[v] ?? v)
    : undefined)
  set('food_allergies',    d.foodAllergies && d.foodAllergies !== ''
    ? [lookup(ALLERGIES, String(d.foodAllergies))]
    : undefined)
  set('foods_dislike',     d.foodsDislike)
  set('favorite_foods',    d.favoriteFoods)
  set('breakfast_time',    toHHMM(String(d.breakfastTime   ?? '')))
  set('mid_morning_time',  toHHMM(String(d.midMorningTime  ?? '')))
  set('lunch_time',        toHHMM(String(d.lunchTime       ?? '')))
  set('evening_snack_time',toHHMM(String(d.eveningSnackTime ?? '')))
  set('dinner_time',       toHHMM(String(d.dinnerTime      ?? '')))

  // Step 5
  set('medical_conditions', d.medicalConditions
    ? (d.medicalConditions as string[]).filter(v => v !== 'Other').map(v => v.toLowerCase().replace(/[\s\/]+/g, '_'))
    : undefined)
  set('other_condition',   d.otherCondition)
  set('on_medication',     lookup(ON_MEDICATION, String(d.onMedication ?? '')))
  set('medications',       d.medications)
  set('food_intolerances', lookupArr(INTOLERANCES, (d.foodIntolerances as string[]) ?? []))
  set('other_intolerance', d.otherIntolerance)
  set('digestive_health',  lookup(DIGESTIVE,     String(d.digestiveHealth ?? '')))
  set('smoke_alcohol',     lookup(SMOKE_ALCOHOL, String(d.smokeAlcohol    ?? '')))
  set('health_notes',      d.healthNotes)

  // Step 6
  set('budget',            lookup(BUDGET,          String(d.budget           ?? '')))
  set('meal_preference',   d.mealPreference
    ? (d.mealPreference as string[]).map(v => MEAL_PREF[v] ?? v)
    : undefined)
  set('prep_time',         lookup(PREP_TIME,        String(d.prepTime         ?? '')))
  set('grocery_shopping',  lookup(GROCERY,          String(d.groceryShopping  ?? '')))
  set('cooking_support',   lookup(COOKING_SUPPORT,  String(d.cookingSupport   ?? '')))
  set('other_preferences', d.otherPreferences)

  // Step 7
  set('contact_name',      d.contactName)
  set('whatsapp',          d.whatsapp ? `+91${String(d.whatsapp).replace(/^\+91/, '')}` : undefined)
  set('email',             d.email)
  set('delivery_method',   d.deliveryMethod)
  set('city',              d.city)
  set('state',             d.state)
  set('final_notes',       d.finalNotes)

  return payload
}
