import apiClient from './client'
import ENDPOINTS from './endpoints'
import { mapFormToPayload } from './dietFormMapper'

export type DietFormResponse = {
  success: true
  message: string
  data: Record<string, unknown>
}

export type MyDietChart = {
  id: number
  full_name: string
  goals: string[]
  plan_type: number
  diet_type: string
  city: string
  state: string
  payment_status?: string
  created_at: string
  plan_id: number | null
  plan_status: 'generating' | 'completed' | 'failed' | null
  plan_pdf_url: string | null
  plan_generated: boolean
  [key: string]: unknown
}

export type MyDietChartsResponse = {
  success: true
  message: string
  data: {
    total: number
    forms: MyDietChart[]
  }
}

const dietFormApi = {
  submit: (formData: Record<string, unknown>) =>
    apiClient.apiPost<DietFormResponse>(
      ENDPOINTS.dietForm.submit,
      mapFormToPayload(formData),
    ),

  myAll: () =>
    apiClient.apiGet<MyDietChartsResponse>(ENDPOINTS.dietForm.myAll),
}

export default dietFormApi
