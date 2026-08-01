import apiClient from './client'
import ENDPOINTS from './endpoints'

export type DietPlanStatus = 'draft' | 'generating' | 'completed' | 'sent' | 'failed' | 'archived'

/* ── Actual API types (matching the real response shape) ── */

export type DietFoodItem = {
  food: string
  quantity?: string
  kcal?: number
  protein_g?: number
}

export type MealTiming = {
  breakfast?: string
  lunch?: string
  snack?: string
  dinner?: string
}

export type SmartSwap = {
  instead_of: string
  choose: string
}

export type DietDay = {
  day: number                  // 1–7 (number, not a string)
  breakfast?: DietFoodItem[]
  lunch?: DietFoodItem[]
  snack?: DietFoodItem[]
  dinner?: DietFoodItem[]
  meal_timing?: MealTiming
  total_kcal?: number
  total_protein_g?: number
  total_fiber_g?: number
  water_liters?: number
}

export type DietWeek = {
  week: number
  title?: string
  description?: string
  focus?: string[]
  what_to_expect?: string
  days: DietDay[]
  weekly_notes?: string[]
  smart_swaps?: SmartSwap[]
}

export type RecipeMacros = {
  carbs_g?: number
  protein_g?: number
  fat_g?: number
  fiber_g?: number
}

export type FeaturedRecipe = {
  name: string
  cook_time?: string
  servings?: number
  calories?: number
  ingredients?: string[]
  steps?: string[]
  macros?: RecipeMacros
}

export type PlanContent = {
  weeks?: DietWeek[]
  general_tips?: string[]
  featured_recipes?: FeaturedRecipe[]
  notes?: string
  client_name?: string
  calorie_range?: string
  protein_target_g?: number
  carbs_target_g?: number
  fat_target_g?: number
  primary_goal?: string
  hydration_guide?: string
  plan_duration?: string
  diet_type?: string
}

export type SendPlanResult = {
  plan_id: number
  sent_email: boolean
  sent_whatsapp: boolean
  delivery_to: { email?: string; whatsapp?: string }
}

export type HealthFormData = {
  dob?: string
  age?: number
  gender?: string
  height?: string
  height_unit?: 'cm' | 'ft_in'
  weight?: number
  weight_unit?: 'kg' | 'lbs'
  goals?: string[]
  activity_level?: string
  work_type?: string
  workout_type?: string
  diet_type?: string
  cuisine_preference?: string[]
  food_allergies?: string[]
  foods_dislike?: string
  favorite_foods?: string
  medical_conditions?: string[]
  other_condition?: string | null
  on_medication?: string
  medications?: string | null
  digestive_health?: string
  smoke_alcohol?: string
  health_notes?: string
  plan_type?: number
}

export type CreateDraftBody = HealthFormData & { appointment_id: number }
export type UpdateDraftBody = HealthFormData & {
  // Extra fields for manual plans (ignored by appointment-linked plan updates)
  full_name?: string
  email?: string
  whatsapp?: string
  breakfast_time?: string
  lunch_time?: string
  evening_snack_time?: string
  dinner_time?: string
  city?: string
  state?: string
  whey_protein?: string
}

export type DietPlanSummary = {
  id: number
  form_id: number
  appointment_id?: number
  user_id?: number | null
  client_name: string
  appointment_date?: string
  slot?: string
  status: DietPlanStatus
  pdf_url?: string | null
  sent_at?: string | null
  created_at?: string
  updated_at?: string
  // Flat form snapshot fields (prefixed form_)
  form_age?: number
  form_gender?: string
  form_height?: string
  form_height_unit?: string
  form_weight?: number
  form_weight_unit?: string
  form_goals?: string[]
  form_activity_level?: string
  form_diet_type?: string
  form_medical_conditions?: string[]
  form_plan_type?: number
}

export type DietPlanDetail = DietPlanSummary & {
  // AI-generated content (null when draft/generating/failed)
  weeks?: DietWeek[] | null
  general_tips?: string[] | null
  featured_recipes?: FeaturedRecipe[] | null
  notes?: string | null
  calorie_range?: string | null
  protein_target_g?: number | null
  carbs_target_g?: number | null
  fat_target_g?: number | null
  primary_goal?: string | null
  hydration_guide?: string | null
  diet_type?: string | null
  plan_duration?: string | null
  bmi?: number | null
  bmi_category?: string | null
  bmr?: number | null
  tdee?: number | null
  // The health form — API returns this as 'form', kept here for use
  form?: HealthFormData
  form_data?: HealthFormData  // alias for backward compat
}

export type ListPlansParams = {
  status?: DietPlanStatus
  page?: number
  limit?: number
}

export type CreateDraftResult = {
  plan_id: number
  form_id: number
  status: DietPlanStatus
}

type ListRes        = { success: boolean; data: { plans: DietPlanSummary[] } }
type CreateDraftRes = { success: boolean; message?: string; data: CreateDraftResult }

const dietitianDietPlanApi = {
  async list(params?: ListPlansParams): Promise<{ data: DietPlanSummary[] }> {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
    const qs = q.toString()
    const res = await apiClient.apiGet<ListRes>(
      `${ENDPOINTS.dietitianDietPlan.list}${qs ? '?' + qs : ''}`
    )
    return { data: Array.isArray(res.data?.plans) ? res.data.plans : [] }
  },

  async get(id: number): Promise<DietPlanDetail> {
    const res = await apiClient.apiGet<any>(`${ENDPOINTS.dietitianDietPlan.single}/${id}`)
    const detail: DietPlanDetail = res.data?.plan ?? res.data
    if (detail && typeof detail.status === 'string') {
      detail.status = detail.status.toLowerCase() as DietPlanStatus
    }
    // API returns 'form' field; alias it to form_data for components that read form_data
    if (detail && !detail.form_data && detail.form) {
      detail.form_data = detail.form
    }
    return detail
  },

  async saveDraft(body: CreateDraftBody): Promise<CreateDraftResult> {
    const res = await apiClient.apiPost<CreateDraftRes>(ENDPOINTS.dietitianDietPlan.list, body)
    return res.data
  },

  async update(id: number, body: UpdateDraftBody): Promise<DietPlanDetail> {
    const res = await apiClient.apiPut<any>(`${ENDPOINTS.dietitianDietPlan.single}/${id}`, body)
    const detail: DietPlanDetail = res.data?.plan ?? res.data
    if (detail && typeof detail.status === 'string') {
      detail.status = detail.status.toLowerCase() as DietPlanStatus
    }
    if (detail && !detail.form_data && detail.form) {
      detail.form_data = detail.form
    }
    return detail
  },

  async generatePlan(id: number): Promise<{ deducted_from: 'plan_credits' | 'earnings' | null; deducted_amount: number | null }> {
    const res = await apiClient.apiPost<{
      success: boolean
      message?: string
      data?: { deducted_from?: 'plan_credits' | 'earnings' | null; deducted_amount?: number | null }
    }>(
      `${ENDPOINTS.dietitianDietPlan.single}/${id}/generate`,
      {}
    )
    return {
      deducted_from:  res.data?.deducted_from  ?? null,
      deducted_amount: res.data?.deducted_amount ?? null,
    }
  },

  async updateContent(id: number, body: PlanContent): Promise<void> {
    await apiClient.apiPut<{ message: string }>(
      `${ENDPOINTS.dietitianDietPlan.single}/${id}/content`,
      body
    )
  },

  async sendPlan(id: number): Promise<SendPlanResult> {
    const res = await apiClient.apiPost<any>(
      `${ENDPOINTS.dietitianDietPlan.single}/${id}/send`,
      {}
    )
    return res.data ?? res
  },
}

export default dietitianDietPlanApi
