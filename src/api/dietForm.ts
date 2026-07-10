import apiClient from './client'
import ENDPOINTS from './endpoints'

export type DietFormResponse = {
  success: true
  message: string
  data: Record<string, unknown>
}

export type DietFormCreateResponse = {
  success: true
  message: string
  data: { id: number }
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
  plan_status: 'generating' | 'completed' | 'sent' | 'failed' | null
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
  /* Step 1: POST /diet-form — create draft, returns form_id */
  create: (payload: Record<string, unknown>) =>
    apiClient.apiPost<DietFormCreateResponse>(ENDPOINTS.dietForm.create, payload),

  /* Steps 2–4: PUT /diet-form/:id — partial save */
  update: (formId: number, payload: Record<string, unknown>) =>
    apiClient.apiPut<DietFormResponse>(`${ENDPOINTS.dietForm.update}/${formId}`, payload),

  /* Step 5 final: POST /diet-form/:id/submit — triggers plan generation */
  submitForm: (formId: number) =>
    apiClient.apiPost<DietFormResponse>(`${ENDPOINTS.dietForm.submit}/${formId}/submit`),

  myAll: () =>
    apiClient.apiGet<MyDietChartsResponse>(ENDPOINTS.dietForm.myAll),
}

export default dietFormApi
