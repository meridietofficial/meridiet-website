import apiClient from './client'
import ENDPOINTS from './endpoints'

export type SubscriptionStatus = {
  has_subscription: boolean
  months_total: number
  months_generated: number
  months_remaining: number
  per_month_amount: number
}

export type SubscriptionStatusResponse = {
  success: true
  data: SubscriptionStatus
}

export type RedeemMonthResponse = {
  success: true
  message: string
  data: {
    form: Record<string, unknown>
    months_used: number
    months_remaining: number
  }
}

const dietPlanApi = {
  subscriptionStatus: () =>
    apiClient.apiGet<SubscriptionStatusResponse>(ENDPOINTS.dietPlan.subscriptionStatus),

  // formData should already be in backend format (from myAll or mapFormToPayload)
  redeemMonth: (formData: Record<string, unknown>) =>
    apiClient.apiPost<RedeemMonthResponse>(ENDPOINTS.dietPlan.redeemMonth, formData),
}

export default dietPlanApi
