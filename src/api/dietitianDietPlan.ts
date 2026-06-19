import apiClient from './client'
import ENDPOINTS from './endpoints'

export type DietPlanStatus = 'draft' | 'generating' | 'completed' | 'failed' | 'archived'

export type DietMealItem = {
  label: string
  items: string[]
  calories?: number
}

export type DietWeekDay = {
  day: string
  meals: DietMealItem[]
}

export type DietWeek = {
  week: number
  days: DietWeekDay[]
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
  other_condition?: string
  on_medication?: string
  medications?: string
  digestive_health?: string
  smoke_alcohol?: string
  health_notes?: string
  plan_type?: number
}

export type CreateDraftBody = HealthFormData & { appointment_id: number }

export type UpdateDraftBody = HealthFormData

export type DietPlanSummary = {
  id: number
  form_id: number
  appointment_id?: number
  client_name: string
  appointment_date?: string
  slot?: string
  status: DietPlanStatus
  pdf_url?: string | null
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
  form_data?: HealthFormData
  weeks?: DietWeek[]
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
type SingleRes      = { success: boolean; data: DietPlanDetail }
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
    // Handle both { data: DietPlanDetail } and { data: { plan: DietPlanDetail } }
    const detail: DietPlanDetail = res.data?.plan ?? res.data
    // Normalize status to lowercase to handle API case variations (e.g. 'Draft' → 'draft')
    if (detail && typeof detail.status === 'string') {
      detail.status = detail.status.toLowerCase() as DietPlanStatus
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
    return detail
  },

  async generatePlan(id: number): Promise<void> {
    await apiClient.apiPost<{ success: boolean }>(
      `${ENDPOINTS.dietitianDietPlan.single}/${id}/generate`,
      {}
    )
  },

}

export default dietitianDietPlanApi
