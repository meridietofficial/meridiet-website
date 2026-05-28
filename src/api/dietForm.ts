import apiClient from './client'
import ENDPOINTS from './endpoints'
import { mapFormToPayload } from './dietFormMapper'

export type DietFormResponse = {
  success: true
  message: string
  data: Record<string, unknown>
}

const dietFormApi = {
  submit: (formData: Record<string, unknown>) =>
    apiClient.apiPost<DietFormResponse>(
      ENDPOINTS.dietForm.submit,
      mapFormToPayload(formData),
    ),
}

export default dietFormApi
