import apiClient from './client'
import ENDPOINTS from './endpoints'
import type { DietPlanStatus, DietPlanSummary } from './dietitianDietPlan'

export type ManualDraftBody = {
  // required
  full_name: string
  // optional contact
  email?: string
  whatsapp?: string
  // demographics
  age?: number
  gender?: string
  dob?: string
  height?: string
  height_unit?: 'cm' | 'ft_in'
  weight?: number
  weight_unit?: 'kg' | 'lbs'
  // lifestyle
  goals?: string[]
  activity_level?: string
  work_type?: string
  workout_type?: string
  // meal timings
  breakfast_time?: string
  lunch_time?: string
  evening_snack_time?: string
  dinner_time?: string
  // diet
  diet_type?: string
  cuisine_preference?: string[]
  food_allergies?: string[]
  foods_dislike?: string
  favorite_foods?: string
  whey_protein?: string
  // health
  medical_conditions?: string[]
  other_condition?: string
  on_medication?: string
  medications?: string
  digestive_health?: string
  smoke_alcohol?: string
  health_notes?: string
  // location
  city?: string
  state?: string
}

export type ManualDraftResult = {
  plan_id: number
  form_id: number
  status: DietPlanStatus
  cost: number
  note?: string
}

type CreateRes = { success: boolean; message?: string; data: ManualDraftResult }

type ListRes = {
  success: boolean
  message?: string
  data: {
    plans: DietPlanSummary[]
    pagination: { total: number; page: number; limit: number; pages: number }
  }
}

export type ListManualPlansParams = {
  status?: DietPlanStatus
  page?: number
  limit?: number
}

const manualDietPlanApi = {
  async create(body: ManualDraftBody): Promise<ManualDraftResult> {
    const res = await apiClient.apiPost<CreateRes>(ENDPOINTS.manualDietPlan.create, body)
    return res.data
  },

  async list(params?: ListManualPlansParams): Promise<{ plans: DietPlanSummary[]; total: number }> {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.page)   q.set('page',   String(params.page))
    if (params?.limit)  q.set('limit',  String(params.limit))
    const qs = q.toString()
    const res = await apiClient.apiGet<ListRes>(
      `${ENDPOINTS.manualDietPlan.list}${qs ? '?' + qs : ''}`
    )
    return {
      plans: Array.isArray(res.data?.plans) ? res.data.plans : [],
      total: res.data?.pagination?.total ?? 0,
    }
  },
}

export default manualDietPlanApi
